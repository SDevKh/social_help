from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from social_help.comments.models import Subscription
from unittest.mock import Mock, patch

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

    @patch("social_help.comments.views.stripe.checkout.Session.create")
    def test_create_checkout_session_returns_stripe_checkout_url(self, mock_create_session):
        mock_create_session.return_value = Mock(
            url="https://checkout.stripe.com/c/pay/cs_test_123",
            id="cs_test_123",
        )

        starter_response = self.client.post(
            "/api/create-checkout/",
            data={"tier": "starter"},
            content_type="application/json",
        )
        self.assertEqual(starter_response.status_code, 200)
        self.assertEqual(starter_response.json()["checkout_url"], "https://checkout.stripe.com/c/pay/cs_test_123")
        mock_create_session.assert_called_once()

        mock_create_session.reset_mock()
        pro_response = self.client.post(
            "/api/create-checkout/",
            data={"tier": "pro"},
            content_type="application/json",
        )
        self.assertEqual(pro_response.status_code, 200)
        self.assertEqual(pro_response.json()["checkout_url"], "https://checkout.stripe.com/c/pay/cs_test_123")
        mock_create_session.assert_called_once()

    @patch("social_help.comments.views.create_stripe_checkout_session")
    def test_signup_paid_plan_redirects_to_stripe_checkout(self, mock_create_session):
        mock_create_session.return_value = Mock(url="https://checkout.stripe.com/c/pay/cs_test_456")

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
        self.assertEqual(response.url, "https://checkout.stripe.com/c/pay/cs_test_456")
        mock_create_session.assert_called_once()

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
        
        # Should redirect to landing page on successful signup if no plan is specified
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")
        
        # Verify user and user profile were created
        user = User.objects.get(username="newuser")
        self.assertEqual(user.first_name, "New User")
        self.assertEqual(user.email, "newuser@example.com")
        
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.role, "creator")
        self.assertEqual(profile.instagram_handle, "@newuser")

    def test_dashboard_redirects_non_subscriber_to_landing(self):
        user = User.objects.create_user(username="freeuser", password="password123")
        self.client.login(username="freeuser", password="password123")
        
        response = self.client.get("/dashboard/")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")

    def test_moderation_api_blocks_non_subscriber(self):
        user = User.objects.create_user(username="freeuser2", password="password123")
        self.client.login(username="freeuser2", password="password123")
        
        response = self.client.get("/api/settings/")
        self.assertEqual(response.status_code, 403)

    def test_dashboard_accessible_to_subscriber(self):
        user = User.objects.create_user(username="paiduser", password="password123")
        self.client.login(username="paiduser", password="password123")
        
        # Activate subscription
        Subscription.objects.update_or_create(user=user, defaults={'tier': 'starter', 'is_active': True})
        
        response = self.client.get("/dashboard/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Comment Moderation")

    def test_moderation_api_accessible_to_subscriber(self):
        user = User.objects.create_user(username="paiduser2", password="password123")
        self.client.login(username="paiduser2", password="password123")
        
        # Activate subscription
        Subscription.objects.update_or_create(user=user, defaults={'tier': 'pro', 'is_active': True})
        
        response = self.client.get("/api/settings/")
        self.assertEqual(response.status_code, 200)


