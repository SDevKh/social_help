import json
import logging
import requests
from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Subscription

logger = logging.getLogger(__name__)

class PolarCheckoutURL(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tier = request.data.get("tier")
        if not tier:
            return JsonResponse({"error": "Tier is required"}, status=400)

        # Map tiers to Polar Product IDs.
        # Ensure to update these with actual Polar Product IDs from your dashboard.
        POLAR_PRODUCTS = {
            "starter": "296f1492-5a03-4f09-ae08-c9e02b27a14a",
            "pro": "9486b5ad-a9fc-4a2e-a805-e8dd4ec547d6"
        }
        
        product_id = POLAR_PRODUCTS.get(tier)
        if not product_id:
            return JsonResponse({"error": "Invalid tier"}, status=400)

        base_url = getattr(settings, "POLAR_API_BASE_URL", "https://api.polar.sh/v1").rstrip("/")
        url = f"{base_url}/checkouts/"
        
        headers = {
            "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        
        from .views import get_signed_state
        sig = get_signed_state(request.user.id, tier)
        
        payload = {
            "products": [product_id],
            "success_url": f"{settings.DOMAIN_URL}/dashboard/?payment=success&tier={tier}&sig={sig}",
            "return_url": f"{settings.DOMAIN_URL}/pricing/",
            "metadata": {
                "user_id": str(request.user.id),
                "tier": tier
            }
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            if not response.ok:
                try:
                    error_detail = response.json()
                except ValueError:
                    error_detail = response.text

                logger.error(
                    "Polar checkout failed: status=%s body=%s",
                    response.status_code,
                    error_detail,
                )
                return JsonResponse(
                    {
                        "error": "Failed to create Polar checkout session",
                        "detail": error_detail,
                    },
                    status=response.status_code,
                )

            data = response.json()
            checkout_url = data.get("url")
            if not checkout_url:
                logger.error("Polar checkout response missing url: %s", data)
                return JsonResponse(
                    {"error": "Failed to create Polar checkout session"},
                    status=502,
                )

            return JsonResponse({"checkout_url": checkout_url})
        except requests.exceptions.RequestException as e:
            logger.exception("Polar checkout request failed")
            return JsonResponse(
                {"error": "Failed to create Polar checkout session"},
                status=502,
            )


class PolarWebhookAPI(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Verification of webhook signature should be done here in production using settings.POLAR_WEBHOOK_SECRET
        
        payload = request.data
        event_type = payload.get("type")
        data = payload.get("data", {})
        
        metadata = data.get("metadata", {})
        user_id = metadata.get("user_id")
        
        if event_type == "subscription.created" or event_type == "subscription.updated":
            if user_id:
                try:
                    sub = Subscription.objects.get(user_id=user_id)
                    
                    # Reliable way: Use metadata since it's set securely by our backend
                    tier = metadata.get("tier")
                    if not tier:
                        product_id = data.get("product_id")
                        if product_id == "9486b5ad-a9fc-4a2e-a805-e8dd4ec547d6":
                            tier = "pro"
                        elif product_id == "296f1492-5a03-4f09-ae08-c9e02b27a14a":
                            tier = "starter"
                        else:
                            tier = "starter"
                        
                    sub.tier = tier
                    sub.is_active = data.get("status") in ["active", "trialing"]
                    sub.payment_provider = "polar"
                    sub.polar_subscription_id = data.get("id")
                    sub.polar_customer_id = data.get("customer_id")
                    sub.save()
                except Subscription.DoesNotExist:
                    pass
        elif event_type == "subscription.revoked":
            if user_id:
                try:
                    sub = Subscription.objects.get(user_id=user_id)
                    sub.tier = "free"
                    sub.is_active = False
                    sub.save()
                except Subscription.DoesNotExist:
                    pass
                    
        return JsonResponse({"status": "received"})
