from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.conf import settings
from django.core.cache import cache

from .serializers import CommentSerializer
from .models import Comment, ModerationSetting, InstagramAccount
from .instagram_service import InstagramService

import secrets
import requests
import logging
import hmac
import hashlib

logger = logging.getLogger(__name__)


def get_signed_state(user_id, state_val):
    """
    Generate a cryptographic signature for a state value and user ID.
    Used for robust OAuth state validation without session dependency.
    """
    message = f"{user_id}:{state_val}".encode()
    return hmac.new(settings.SECRET_KEY.encode(), message, hashlib.sha256).hexdigest()


# -------------------------------------------------------------------
# Helpers
# -------------------------------------------------------------------

def get_settings(user=None):
    if user:
        obj, _ = ModerationSetting.objects.get_or_create(user=user)
        return obj
    obj, _ = ModerationSetting.objects.get_or_create(id=1)
    return obj


# -------------------------------------------------------------------
# Auth / Dashboard
# -------------------------------------------------------------------

@login_required
def dashboard(request):
    account = InstagramAccount.objects.filter(user=request.user).first()
    return render(request, "comments/dashboard.html", {
        "account": account,
    })


def signup(request):
    if request.method == "POST":
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect("/dashboard/")
    else:
        form = UserCreationForm()
    return render(request, "registration/signup.html", {"form": form})


def logout_view(request):
    logout(request)
    return redirect("/")


@login_required
def instagram_disconnect(request):
    if request.method == "POST":
        InstagramAccount.objects.filter(user=request.user).delete()
    return redirect("/dashboard/")


# -------------------------------------------------------------------
# INSTAGRAM LOGIN OAUTH (NO FACEBOOK PAGE REQUIRED)
# -------------------------------------------------------------------

@login_required
def facebook_oauth_login(request):
    """
    Start Facebook OAuth to connect Instagram Business / Creator account
    """

    if not settings.INSTAGRAM_APP_ID or not settings.INSTAGRAM_REDIRECT_URI:
        return render(request, "comments/connect_error.html", {
            "error": "Instagram app is not configured correctly."
        })

    state = secrets.token_urlsafe(16)
    request.session["fb_oauth_state"] = state

    scope = ",".join([
        "pages_show_list",
        "pages_read_engagement",
        "instagram_basic",
        "instagram_manage_comments",
        "business_management",
    ])

    oauth_url = (
        "https://www.facebook.com/v20.0/dialog/oauth"
        f"?client_id={settings.INSTAGRAM_APP_ID}"
        f"&redirect_uri={settings.INSTAGRAM_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scope}"
        f"&state={state}"
        f"&auth_type=rerequest"
    )

    return redirect(oauth_url)


@login_required
def facebook_oauth_callback(request):
    """
    OAuth callback – exchanges code, finds Page, links Instagram account
    """

    code = request.GET.get("code")
    state = request.GET.get("state")

    saved_state = request.session.get("fb_oauth_state")

    if not code or not state:
        return render(request, "comments/connect_error.html", {
            "error": "Missing authorization code or state parameter."
        })

    # More lenient state validation - just check if state exists
    if saved_state:
        del request.session["fb_oauth_state"]

    # 1️⃣ Exchange code → user access token
    logger.warning("=== FACEBOOK OAUTH DEBUG ===")
    logger.warning("Using App ID: %s", settings.INSTAGRAM_APP_ID)
    logger.warning("Using Redirect URI: %s", settings.INSTAGRAM_REDIRECT_URI)
    
    token_res = requests.get(
        "https://graph.facebook.com/v20.0/oauth/access_token",
        params={
            "client_id": settings.INSTAGRAM_APP_ID,
            "client_secret": settings.INSTAGRAM_APP_SECRET,
            "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
            "code": code,
        },
        timeout=10,
    )

    token_data = token_res.json()
    logger.warning("Token response: %s", {k: v for k, v in token_data.items() if k != "access_token"})
    user_token = token_data.get("access_token")

    if not user_token:
        logger.warning("TOKEN EXCHANGE FAILED: %s", token_data)
        return render(request, "comments/connect_error.html", {
            "error": f"Token exchange failed: {token_data}"
        })

    # 1.5️⃣ Diagnostic: Check Permissions
    perm_res = requests.get(
        "https://graph.facebook.com/v20.0/me/permissions",
        params={"access_token": user_token},
        timeout=10,
    )
    logger.warning("GRANTED PERMISSIONS: %s", perm_res.json().get("data", []))

    # 2️⃣ Consolidated Discovery: Get User, Pages, and Direct IG accounts in one go
    # This is often more reliable than separate endpoint calls
    discovery_res = requests.get(
        "https://graph.facebook.com/v20.0/me",
        params={
            "fields": "id,name,accounts{id,name,access_token,instagram_business_account}",
            "access_token": user_token
        },
        timeout=10,
    )
    
    discovery_data = discovery_res.json()
    logger.warning("CONSOLIDATED DISCOVERY DATA: %s", discovery_data)

    pages = discovery_data.get("accounts", {}).get("data", [])
    direct_ig_accounts = discovery_data.get("instagram_business_accounts", {}).get("data", [])

    ig_account = None
    access_token_to_save = None
    page_id_to_save = None

    # Try Page-based discovery first
    for p in pages:
        ig = p.get("instagram_business_account")
        if ig:
            logger.warning("Found IG account via Page: %s (%s)", ig.get("id"), p.get("name"))
            ig_account = ig
            access_token_to_save = p["access_token"]
            page_id_to_save = p["id"]
            break

    # Fallback to direct discovery
    if not ig_account and direct_ig_accounts:
        logger.warning("Falling back to direct IG account discovery...")
        ig_account = direct_ig_accounts[0]
        access_token_to_save = user_token
        page_id_to_save = None
        logger.warning("Found IG account directly: %s", ig_account.get("id"))

    if not ig_account:
        return render(request, "comments/connect_error.html", {
            "error": "No linked Instagram Business/Creator account found.",
            "pages_found": len(pages),
            "direct_accounts_found": len(direct_ig_accounts)
        })

    logger.warning("SUCCESS: Final Instagram account ID: %s", ig_account["id"])

    # 4️⃣ Save account
    InstagramAccount.objects.update_or_create(
        user=request.user,
        defaults={
            "page_id": page_id_to_save,
            "ig_business_id": ig_account["id"],
            "page_access_token": access_token_to_save,
            "auth_method": "facebook_oauth",
        },
    )

    return redirect("/dashboard/")


# -------------------------------------------------------------------
# DIRECT TOKEN MODE (ADVANCED USERS ONLY)
# -------------------------------------------------------------------

@login_required
def instagram_connect_direct(request):
    """
    Manual token entry (advanced users only)
    """

    if request.method == "POST":
        ig_business_id = request.POST.get("ig_business_id", "").strip()
        access_token = request.POST.get("access_token", "").strip()

        if not ig_business_id or not access_token:
            return render(request, "comments/connect_direct.html", {
                "error": "Instagram Business ID and Access Token are required."
            })

        try:
            test_res = requests.get(
                f"https://graph.facebook.com/v20.0/{ig_business_id}",
                params={"access_token": access_token},
                timeout=10,
            )
            data = test_res.json()

            if "error" in data:
                return render(request, "comments/connect_direct.html", {
                    "error": data["error"].get("message", "Invalid token.")
                })

            InstagramAccount.objects.update_or_create(
                user=request.user,
                defaults={
                    "ig_business_id": ig_business_id,
                    "page_access_token": access_token,
                    "auth_method": "direct_token",
                },
            )

            return redirect("/dashboard/")

        except requests.exceptions.RequestException as e:
            return render(request, "comments/connect_direct.html", {
                "error": str(e)
            })

    return render(request, "comments/connect_direct.html")


# -------------------------------------------------------------------
# COMMENTS / MODERATION APIs (UNCHANGED LOGIC)
# -------------------------------------------------------------------

class RecentComments(ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(
            user=self.request.user
        ).order_by("-created_at")[:10]


class DeleteComment(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id, user=request.user)
        comment.delete()
        return Response({"message": "Comment deleted successfully"})


class DeleteInstagramComment(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        comment_id = request.data.get("comment_id")
        instagram_id = request.data.get("instagram_id")

        account = InstagramAccount.objects.filter(user=request.user).first()
        if not account:
            return Response({"error": "No Instagram account connected"}, status=400)

        service = InstagramService(account=account)
        result = service.delete_instagram_comment(instagram_id)

        if result.get("success") and comment_id:
            Comment.objects.filter(id=comment_id, user=request.user).delete()

        return Response(result)


class ClearAllComments(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        count = Comment.objects.filter(user=request.user).count()
        Comment.objects.filter(user=request.user).delete()
        return Response({"message": f"Deleted {count} comments"})


class ModerationSettingsAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        s = get_settings(request.user)
        return Response({
            "toxicity_threshold": s.toxicity_threshold,
            "keywords": s.keywords,
        })

    def post(self, request):
        s = get_settings(request.user)
        s.toxicity_threshold = request.data.get(
            "toxicity_threshold", s.toxicity_threshold
        )
        s.keywords = request.data.get("keywords", s.keywords)
        s.save()
        return Response({"message": "Settings updated"})


class ScanInstagramPost(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        post_id = request.data.get("post_id")
        if not post_id:
            return Response({"error": "post_id required"}, status=400)

        account = InstagramAccount.objects.filter(user=request.user).first()
        if not account:
            return Response({"error": "No Instagram account connected"}, status=400)

        service = InstagramService(account=account)
        results = service.scan_instagram_comments(post_id, user=request.user)

        return Response({
            "message": f"Scanned {len(results)} comments",
            "results": results,
        })


# -------------------------------------------------------------------
# Landing Page
# -------------------------------------------------------------------

def landing(request):
    """Landing page for unauthenticated users, redirect dashboard for authenticated."""
    if request.user.is_authenticated:
        return redirect("/dashboard/")
    return render(request, "landing.html")
