from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated, BasePermission

from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout
from django.contrib.auth.forms import UserCreationForm
from django.conf import settings
from django.core.cache import cache
from django.utils import timezone

from .serializers import CommentSerializer
from .models import Comment, ModerationSetting, InstagramAccount, Subscription
from .instagram_service import InstagramService
from .forms import SignUpForm

import secrets
import os
import requests
import logging
import hmac
import hashlib
from datetime import timedelta
from django.views.decorators.csrf import csrf_exempt
import stripe

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

PAYPAL_PLAN_CONFIG = {
    "starter": {
        "label": "SocialFuse Creator Plan",
        "amount": "15.00",
    },
    "pro": {
        "label": "SocialFuse Agency Plan",
        "amount": "49.00",
    },
}

GUMROAD_PRODUCT_TIER_MAP = {
    "starter": "starter",
    "pro": "pro",
    "creator": "starter",
    "agency": "pro",
    "creator_plan": "starter",
    "agency_plan": "pro",
}


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


def get_subscription(user):
    if not user or not user.is_authenticated:
        return None
    sub, _ = Subscription.objects.get_or_create(user=user, defaults={'tier': 'free'})
    return sub


def get_paypal_api_base():
    if settings.PAYPAL_MODE == "live":
        return "https://api-m.paypal.com"
    return "https://api-m.sandbox.paypal.com"


def get_paypal_access_token():
    if not settings.PAYPAL_CLIENT_ID or not settings.PAYPAL_CLIENT_SECRET:
        raise ValueError("PayPal client ID and secret are not configured.")

    response = requests.post(
        f"{get_paypal_api_base()}/v1/oauth2/token",
        data={"grant_type": "client_credentials"},
        auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
        headers={"Accept": "application/json", "Accept-Language": "en_US"},
        timeout=20,
    )
    response.raise_for_status()
    return response.json()["access_token"]


def paypal_headers():
    return {
        "Authorization": f"Bearer {get_paypal_access_token()}",
        "Content-Type": "application/json",
    }


def get_requested_paid_tier(request):
    tier = request.data.get("tier", "starter")
    if tier not in PAYPAL_PLAN_CONFIG:
        raise ValueError("Choose either the Creator or Agency plan.")
    return tier


def activate_subscription(user, tier, provider="", order_id=None, capture_id=None):
    sub = get_subscription(user)
    sub.tier = tier
    sub.is_active = True
    sub.payment_provider = provider
    sub.paypal_order_id = order_id
    sub.paypal_capture_id = capture_id
    sub.comments_processed_this_month = 0
    sub.current_period_end = timezone.now() + timedelta(days=30)
    sub.save()
    return sub


# -------------------------------------------------------------------
# Auth / Dashboard
# -------------------------------------------------------------------

@login_required
def dashboard(request):
    if not request.user.is_superuser and not request.user.is_staff:
        sub = get_subscription(request.user)
        if not sub or sub.tier == 'free' or not sub.is_active:
            return redirect('/pricing/?reason=subscription_required')
    account = InstagramAccount.objects.filter(user=request.user).first()
    sub = get_subscription(request.user)
    return render(request, "comments/dashboard.html", {
        "account": account,
        "subscription": sub,
    })


def signup(request):
    plan = request.GET.get("plan")
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            
            plan_post = request.POST.get("plan") or request.GET.get("plan")
            if plan_post in ["starter", "pro"]:
                gumroad_base = getattr(settings, "GUMROAD_CREATOR_PLAN_URL" if plan_post == "starter" else "GUMROAD_AGENCY_PLAN_URL")
                import urllib.parse
                email_param = urllib.parse.quote(user.email)
                user_id_param = urllib.parse.quote(str(user.id))
                checkout_url = f"{gumroad_base}?email={email_param}&custom_fields[user_id]={user_id_param}"
                return redirect(checkout_url)
                
            return redirect("/pricing/")
    else:
        form = SignUpForm()
    return render(request, "registration/signup.html", {"form": form, "plan": plan})


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

    facebook_app_id = (settings.FACEBOOK_APP_ID or "").strip()
    facebook_redirect_uri = (settings.FACEBOOK_OAUTH_REDIRECT_URI or settings.INSTAGRAM_REDIRECT_URI or "").strip()

    if not facebook_app_id.isdigit() or not facebook_redirect_uri:
        return render(request, "comments/connect_error.html", {
            "error": "Facebook OAuth is not configured correctly. Please set FACEBOOK_APP_ID and FACEBOOK_OAUTH_REDIRECT_URI."
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
        f"?client_id={facebook_app_id}"
        f"&redirect_uri={facebook_redirect_uri}"
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
    logger.warning("Using App ID: %s", settings.FACEBOOK_APP_ID)
    logger.warning("Using Redirect URI: %s", settings.FACEBOOK_OAUTH_REDIRECT_URI)
    
    token_res = requests.get(
        "https://graph.facebook.com/v20.0/oauth/access_token",
        params={
            "client_id": settings.FACEBOOK_APP_ID,
            "client_secret": settings.FACEBOOK_APP_SECRET,
            "redirect_uri": settings.FACEBOOK_OAUTH_REDIRECT_URI,
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

class HasActivePaidSubscription(BasePermission):
    message = "You must have an active paid subscription to access this feature."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        sub = get_subscription(request.user)
        return sub is not None and sub.tier in ['starter', 'pro'] and sub.is_active


class RecentComments(ListAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, HasActivePaidSubscription]

    def get_queryset(self):
        return Comment.objects.filter(
            user=self.request.user
        ).order_by("-created_at")[:10]


class DeleteComment(APIView):
    permission_classes = [IsAuthenticated, HasActivePaidSubscription]

    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id, user=request.user)
        comment.delete()
        return Response({"message": "Comment deleted successfully"})


class DeleteInstagramComment(APIView):
    permission_classes = [IsAuthenticated, HasActivePaidSubscription]

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
    permission_classes = [IsAuthenticated, HasActivePaidSubscription]

    def post(self, request):
        count = Comment.objects.filter(user=request.user).count()
        Comment.objects.filter(user=request.user).delete()
        return Response({"message": f"Deleted {count} comments"})


class ModerationSettingsAPI(APIView):
    permission_classes = [IsAuthenticated, HasActivePaidSubscription]

    def get(self, request):
        s = get_settings(request.user)
        return Response({
            "toxicity_threshold": s.toxicity_threshold,
            "keywords": s.keywords,
            "enable_sarcasm_detection": getattr(s, "enable_sarcasm_detection", True),
            "sarcasm_threshold": getattr(s, "sarcasm_threshold", 0.5),
        })

    def post(self, request):
        s = get_settings(request.user)
        s.toxicity_threshold = request.data.get(
            "toxicity_threshold", s.toxicity_threshold
        )
        s.keywords = request.data.get("keywords", s.keywords)
        s.enable_sarcasm_detection = request.data.get(
            "enable_sarcasm_detection", getattr(s, "enable_sarcasm_detection", True)
        )
        s.sarcasm_threshold = request.data.get(
            "sarcasm_threshold", getattr(s, "sarcasm_threshold", 0.5)
        )
        s.save()
        return Response({"message": "Settings updated"})


class ScanInstagramPost(APIView):
    permission_classes = [IsAuthenticated, HasActivePaidSubscription]

    def post(self, request):
        post_id = request.data.get("post_id")
        if not post_id:
            return Response({"error": "post_id required"}, status=400)

        sub = get_subscription(request.user)
        if sub and not sub.can_process_more():
            return Response({
                "error": f"Monthly limit reached ({sub.comments_processed_this_month} / {sub.max_comments()} comments). Please upgrade your plan.",
                "limit_reached": True
            }, status=403)

        account = InstagramAccount.objects.filter(user=request.user).first()
        if not account:
            return Response({"error": "No Instagram account connected"}, status=400)

        service = InstagramService(account=account)
        results = service.scan_instagram_comments(post_id, user=request.user)

        if isinstance(results, dict) and "error" in results:
            return Response({"error": results["error"]}, status=400)

        if sub and results:
            sub.comments_processed_this_month += len(results)
            sub.save()

        return Response({
            "message": f"Scanned {len(results)} comments (Used this month: {sub.comments_processed_this_month} / {sub.max_comments()})",
            "results": results,
            "used": sub.comments_processed_this_month,
            "max": sub.max_comments(),
        })


# -------------------------------------------------------------------
# Landing Page
# -------------------------------------------------------------------

def landing(request):
    """Landing page for unauthenticated users, redirect dashboard for authenticated."""
    if request.user.is_authenticated:
        return redirect("/dashboard/")
    return render(request, "index.html")

def react_frontend(request):
    """Serve React frontend for SPA routes without redirecting authenticated users."""
    return render(request, "index.html")

def privacy_policy(request):
    """Serve the static Privacy Policy page required by Meta App Review."""
    return render(request, "comments/privacy_policy.html")

def terms_of_service(request):
    """Serve the static Terms of Service page required by Meta App Review."""
    return render(request, "comments/terms_of_service.html")

def contact(request):
    """Serve the static Contact page required by Meta App Review."""
    if request.method == "POST":
        # Handle simple form submission securely if needed (just return a success page for now)
        return render(request, "comments/contact.html", {"success": True})
    return render(request, "comments/contact.html")


def pricing_page(request):
    """SaaS pricing plans page."""
    sub = None
    if request.user.is_authenticated:
        sub = get_subscription(request.user)
    return render(request, "comments/pricing.html", {
        "subscription": sub,
        "gumroad_creator_url": getattr(settings, "GUMROAD_CREATOR_PLAN_URL", "https://gumroad.com/l/creator_plan"),
        "gumroad_agency_url": getattr(settings, "GUMROAD_AGENCY_PLAN_URL", "https://gumroad.com/l/agency_plan"),
    })


class CreateCheckoutSession(APIView):
    """Create a Stripe Checkout Session for subscription upgrade."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            tier = request.data.get("tier", "starter")
            if tier == "free":
                activate_subscription(request.user, "free")
                return Response({
                    "success": True,
                    "message": "Free plan activated.",
                    "redirect_url": "/dashboard/",
                })

            if tier not in PAYPAL_PLAN_CONFIG:
                return Response({"error": "Choose either the Creator or Agency plan."}, status=400)

            plan = PAYPAL_PLAN_CONFIG[tier]
            
            # Create Stripe Checkout Session
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card', 'link'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'product_data': {
                                'name': plan['label'],
                            },
                            'unit_amount': int(float(plan['amount']) * 100),
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                client_reference_id=str(request.user.id),
                metadata={
                    'tier': tier,
                },
                success_url=settings.DOMAIN_URL + '/dashboard/?payment=success',
                cancel_url=settings.DOMAIN_URL + '/pricing/?payment=cancelled',
            )

            return Response({
                "checkout_url": checkout_session.url,
                "session_id": checkout_session.id
            })
        except Exception as exc:
            logger.exception("Stripe checkout session creation failed")
            return Response({"error": str(exc)}, status=400)


class StripeWebhook(APIView):
    """Handle Stripe webhooks"""
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        event = None

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError as e:
            return Response(status=400)
        except stripe.error.SignatureVerificationError as e:
            return Response(status=400)

        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            user_id = session.get('client_reference_id')
            tier = session.get('metadata', {}).get('tier', 'starter')
            
            if user_id:
                try:
                    from django.contrib.auth.models import User
                    user = User.objects.get(id=user_id)
                    activate_subscription(user, tier, provider="stripe")
                    
                    sub = get_subscription(user)
                    sub.stripe_customer_id = session.get('customer')
                    sub.stripe_subscription_id = session.get('subscription')
                    sub.save()
                except User.DoesNotExist:
                    logger.error(f"User with ID {user_id} not found during Stripe webhook processing.")

        return Response(status=200)

class PayPalCheckout(APIView):
    """Create a PayPal checkout order and return the buyer approval URL."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if request.data.get("tier") == "free":
                activate_subscription(request.user, "free")
                return Response({
                    "success": True,
                    "message": "Free plan activated.",
                    "redirect_url": "/dashboard/",
                })

            tier = get_requested_paid_tier(request)
            plan = PAYPAL_PLAN_CONFIG[tier]
            payload = {
                "intent": "CAPTURE",
                "purchase_units": [
                    {
                        "reference_id": f"user-{request.user.id}-{tier}",
                        "custom_id": f"{request.user.id}:{tier}",
                        "description": f"Monthly {plan['label']}",
                        "amount": {
                            "currency_code": "USD",
                            "value": plan["amount"],
                            "breakdown": {
                                "item_total": {
                                    "currency_code": "USD",
                                    "value": plan["amount"],
                                }
                            },
                        },
                        "items": [
                            {
                                "name": plan["label"],
                                "unit_amount": {
                                    "currency_code": "USD",
                                    "value": plan["amount"],
                                },
                                "quantity": "1",
                                "category": "DIGITAL_GOODS",
                            }
                        ],
                    }
                ],
                "application_context": {
                    "brand_name": "SocialFuse",
                    "landing_page": "LOGIN",
                    "shipping_preference": "NO_SHIPPING",
                    "user_action": "PAY_NOW",
                    "return_url": request.build_absolute_uri("/api/paypal/execute/"),
                    "cancel_url": request.build_absolute_uri("/pricing/?payment=cancelled"),
                },
            }

            response = requests.post(
                f"{get_paypal_api_base()}/v2/checkout/orders",
                json=payload,
                headers=paypal_headers(),
                timeout=20,
            )
            response.raise_for_status()
            order = response.json()
            approval_url = next(
                (link["href"] for link in order.get("links", []) if link.get("rel") == "approve"),
                None,
            )
            if not approval_url:
                return Response({"error": "PayPal did not return an approval URL."}, status=400)

            pending_tiers = request.session.get("paypal_pending_tiers", {})
            pending_tiers[order["id"]] = tier
            request.session["paypal_pending_tiers"] = pending_tiers
            request.session.modified = True

            return Response({
                "checkout_url": approval_url,
                "approval_url": approval_url,
                "order_id": order["id"],
            })
        except requests.HTTPError as exc:
            error = exc.response.text if exc.response is not None else str(exc)
            logger.exception("PayPal order creation failed")
            return Response({"error": f"PayPal order creation failed: {error}"}, status=400)
        except ValueError as exc:
            return Response({"error": str(exc)}, status=400)
        except Exception as exc:
            logger.exception("Checkout failed")
            return Response({"error": str(exc)}, status=400)

class PayPalExecute(APIView):
    """Capture an approved PayPal order and activate the selected plan."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        order_id = request.GET.get("token") or request.GET.get("order_id")
        if not order_id:
            messages.error(request, "PayPal did not return an order token.")
            return redirect("/pricing/?payment=failed")

        try:
            response = requests.post(
                f"{get_paypal_api_base()}/v2/checkout/orders/{order_id}/capture",
                headers=paypal_headers(),
                timeout=20,
            )
            response.raise_for_status()
            capture_data = response.json()
            if capture_data.get("status") != "COMPLETED":
                messages.error(request, "PayPal payment was not completed.")
                return redirect("/pricing/?payment=failed")

            pending_tiers = request.session.get("paypal_pending_tiers", {})
            tier = pending_tiers.pop(order_id, None)
            request.session["paypal_pending_tiers"] = pending_tiers
            request.session.modified = True

            purchase_unit = capture_data.get("purchase_units", [{}])[0]
            custom_id = purchase_unit.get("custom_id")
            if not tier and custom_id and ":" in custom_id:
                _, tier = custom_id.split(":", 1)
            if tier not in PAYPAL_PLAN_CONFIG:
                tier = "starter"

            captures = purchase_unit.get("payments", {}).get("captures", [])
            capture_id = captures[0].get("id") if captures else None
            activate_subscription(
                request.user,
                tier,
                provider="paypal",
                order_id=order_id,
                capture_id=capture_id,
            )
            messages.success(request, "Payment successful. Your plan is active.")
            return redirect("/dashboard/?payment=success")
        except requests.HTTPError as exc:
            error = exc.response.text if exc.response is not None else str(exc)
            logger.exception("PayPal capture failed")
            messages.error(request, f"PayPal capture failed: {error}")
            return redirect("/pricing/?payment=failed")
        except Exception as exc:
            logger.exception("PayPal payment finalization failed")
            messages.error(request, str(exc))
            return redirect("/pricing/?payment=failed")

# Placeholder for PayPal IPN / webhook handling if needed.
# Currently no PayPal webhook is configured.Response(status=200)

def creators_page(request):
    return render(request, "comments/creators.html")

def brands_page(request):
    return render(request, "comments/brands.html")


def pwa_manifest(request):
    """Root-level PWA manifest used by browsers and the Android store wrapper."""
    return JsonResponse({
        "name": "SocialFuse",
        "short_name": "SocialFuse",
        "description": "AI-powered Instagram comment moderation for creators and brands.",
        "id": "https://social-fuse.app/",
        "start_url": "/login/?source=pwa",
        "scope": "/",
        "display": "standalone",
        "display_override": ["window-controls-overlay", "standalone", "browser"],
        "orientation": "portrait",
        "background_color": "#faf9f6",
        "theme_color": "#e91e63",
        "categories": ["business", "productivity", "social"],
        "icons": [
            {
                "src": "/static/comments/socialfuse-app-icon.svg",
                "sizes": "any",
                "type": "image/svg+xml",
                "purpose": "any maskable"
            }
        ],
        "shortcuts": [
            {
                "name": "Dashboard",
                "short_name": "Dashboard",
                "url": "/dashboard/",
                "description": "Open your moderation dashboard"
            },
            {
                "name": "Pricing",
                "short_name": "Pricing",
                "url": "/pricing/",
                "description": "View SocialFuse plans"
            }
        ]
    })


def service_worker(request):
    """Small service worker that keeps the app installable without caching private pages."""
    content = """
const STATIC_CACHE = 'socialfuse-static-v1';
const STATIC_ASSETS = [
  '/static/comments/socialfuse-logo.png',
  '/static/comments/socialfuse-app-icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin || event.request.method !== 'GET') {
    return;
  }

  if (requestUrl.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
"""
    return HttpResponse(content.strip(), content_type="application/javascript")


def android_asset_links(request):
    """Digital Asset Links for Android Trusted Web Activity verification."""
    package_name = os.getenv("ANDROID_TWA_PACKAGE_NAME", "app.socialfuse.twa")
    fingerprint = os.getenv("ANDROID_CERT_SHA256", "")
    statements = []
    if fingerprint:
        statements.append({
            "relation": ["delegate_permission/common.handle_all_urls"],
            "target": {
                "namespace": "android_app",
                "package_name": package_name,
                "sha256_cert_fingerprints": [fingerprint],
            },
        })
    return JsonResponse(statements, safe=False)


class GumroadWebhook(APIView):
    """Handle Gumroad payment notifications (pings) to activate subscriptions."""
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        logger.warning(f"Gumroad webhook payload: {request.data}")
        
        # Extract user_id from custom fields
        custom_fields = request.data.get("custom_fields", {})
        user_id = None
        if isinstance(custom_fields, dict):
            user_id = custom_fields.get("user_id")
        
        if not user_id:
            user_id = request.data.get("custom_fields[user_id]")
            
        email = request.data.get("email")
            
        if not user_id and not email:
            logger.error("Gumroad webhook missing user_id custom field and email.")
            return Response({"error": "user_id or email is required"}, status=400)

        # Map product to subscription tier
        product_name = request.data.get("product_name", "").lower()
        permalink = request.data.get("permalink", "").lower()
        
        tier = "starter" # Default fallback
        for key, val in GUMROAD_PRODUCT_TIER_MAP.items():
            if key in product_name or key in permalink:
                tier = val
                break

        try:
            from django.contrib.auth.models import User
            if user_id:
                user = User.objects.get(id=user_id)
            else:
                user = User.objects.get(email=email)
            
            # Activate the subscription in the database
            activate_subscription(
                user=user,
                tier=tier,
                provider="gumroad",
                order_id=request.data.get("sale_id") or request.data.get("subscription_id")
            )
            
            logger.warning(f"Successfully activated subscription tier '{tier}' for user '{user.username}' via Gumroad webhook.")
            return Response({"success": True})
        except User.DoesNotExist:
            lookup_val = user_id if user_id else email
            logger.error(f"User with ID/Email '{lookup_val}' not found during Gumroad webhook processing.")
            return Response({"error": "User not found"}, status=404)
        except Exception as exc:
            logger.exception("Error processing Gumroad webhook")
            return Response({"error": str(exc)}, status=500)
