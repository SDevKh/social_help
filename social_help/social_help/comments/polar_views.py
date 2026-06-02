import json
import logging
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

        # Create Checkout Session using Polar API
        # Using requests directly instead of polar-sdk for simplicity if SDK is not yet stable/configured,
        # but the standard way via HTTP is:
        import requests
        
        url = "https://api.polar.sh/v1/checkouts/custom/"
        
        headers = {
            "Authorization": f"Bearer {settings.POLAR_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "product_id": product_id,
            "success_url": f"{settings.DOMAIN_URL}/dashboard/?payment=success",
            "metadata": {
                "user_id": str(request.user.id),
                "tier": tier
            }
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
            return JsonResponse({"checkout_url": data.get("url")})
        except requests.exceptions.RequestException as e:
            logger.error(f"Polar Checkout Error: {e}")
            return JsonResponse({"error": "Failed to create Polar checkout session"}, status=500)


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
                    
                    # Reliable way: Check product_id first
                    product_id = data.get("product_id")
                    if product_id == "9486b5ad-a9fc-4a2e-a805-e8dd4ec547d6":
                        tier = "pro"
                    elif product_id == "296f1492-5a03-4f09-ae08-c9e02b27a14a":
                        tier = "starter"
                    else:
                        tier = metadata.get("tier", "starter")
                        
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
