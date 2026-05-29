from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from social_help.comments.models import Subscription

class GumroadPaymentTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.client.login(username="testuser", password="password123")

    def test_create_checkout_session_free_tier(self):
        response = self.client.post(
            "/api/create-checkout/",
            data={"tier": "free"},
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success"))
        
        # Verify user subscription activated to free tier
        sub = Subscription.objects.get(user=self.user)
        self.assertEqual(sub.tier, "free")

    def test_gumroad_webhook_sale_creator_tier(self):
        # Send POST request to Gumroad webhook simulating a purchase of the Creator plan
        payload = {
            "sale_id": "gum_sale_123",
            "product_name": "SocialFuse Creator Plan",
            "permalink": "creator_plan",
            "email": "testuser@example.com",
            "custom_fields": {
                "user_id": str(self.user.id)
            }
        }
        
        response = self.client.post(
            "/api/gumroad/webhook/",
            data=payload,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success"))
        
        # Verify the user subscription was upgraded to starter (Creator plan)
        sub = Subscription.objects.get(user=self.user)
        self.assertEqual(sub.tier, "starter")
        self.assertTrue(sub.is_active)
        self.assertEqual(sub.paypal_order_id, "gum_sale_123")
        self.assertEqual(sub.payment_provider, "gumroad")

    def test_gumroad_webhook_sale_agency_tier_flat_fields(self):
        # Send POST request to Gumroad webhook with flat keys (e.g. form-urlencoded style keys)
        # simulating a purchase of the Agency plan (pro tier)
        payload = {
            "subscription_id": "gum_sub_456",
            "product_name": "SocialFuse Agency Plan",
            "permalink": "agency_plan",
            "email": "testuser@example.com",
            "custom_fields[user_id]": str(self.user.id)
        }
        
        response = self.client.post(
            "/api/gumroad/webhook/",
            data=payload,
            content_type="application/json"
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success"))
        
        # Verify the user subscription was upgraded to pro (Agency plan)
        sub = Subscription.objects.get(user=self.user)
        self.assertEqual(sub.tier, "pro")
        self.assertTrue(sub.is_active)
        self.assertEqual(sub.paypal_order_id, "gum_sub_456")
        self.assertEqual(sub.payment_provider, "gumroad")

    @override_settings(
        DOMAIN_URL="https://example.com",
        GUMROAD_CREATOR_PLAN_URL="https://socialfuse.gumroad.com/l/creator_plan",
        GUMROAD_REDIRECT_URL="https://example.com/dashboard/?payment=success",
    )
    def test_signup_paid_plan_redirects_to_gumroad_with_dashboard_return_url(self):
        form_data = {
            "username": "newpaiduser",
            "first_name": "Paid User",
            "email": "newpaiduser@example.com",
            "role": "creator",
            "instagram_handle": "@newpaiduser",
            "company_name": "",
            "password1": "mypassword123",
            "password2": "mypassword123",
            "plan": "starter",
        }

        response = self.client.post("/signup/?plan=starter", data=form_data)

        self.assertEqual(response.status_code, 302)
        self.assertIn("https://socialfuse.gumroad.com/l/creator_plan", response.url)
        self.assertIn("success_url=https%3A%2F%2Fexample.com%2Fdashboard%2F%3Fpayment%3Dsuccess", response.url)
        self.assertIn("return_url=https%3A%2F%2Fexample.com%2Fdashboard%2F%3Fpayment%3Dsuccess", response.url)
        self.assertIn("redirect_url=https%3A%2F%2Fexample.com%2Fdashboard%2F%3Fpayment%3Dsuccess", response.url)

class UserProfileAndSignupTests(TestCase):
    def test_signup_creates_profile(self):
        from social_help.comments.models import UserProfile
        from django.contrib.auth.models import User
        
        form_data = {
            "username": "newuser",
            "first_name": "New User",
            "email": "newuser@example.com",
            "role": "creator",
            "instagram_handle": "@newuser",
            "company_name": "",
            "password1": "mypassword123",
            "password2": "mypassword123",
        }
        
        response = self.client.post("/signup/", data=form_data)
        
        # Should redirect to pricing on successful signup if no plan is specified
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/pricing/")
        
        # Verify user and user profile were created
        user = User.objects.get(username="newuser")
        self.assertEqual(user.first_name, "New User")
        self.assertEqual(user.email, "newuser@example.com")
        
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.role, "creator")
        self.assertEqual(profile.instagram_handle, "@newuser")
