from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from social_help.comments.models import Subscription, InstagramAccount, Comment
from unittest.mock import Mock, patch
import base64

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
        
        # Should redirect to dashboard page on successful signup if no plan is specified
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/dashboard/")
        
        # Verify user and user profile were created
        user = User.objects.get(username="newuser")
        self.assertEqual(user.first_name, "New User")
        self.assertEqual(user.email, "newuser@example.com")
        
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.role, "creator")
        self.assertEqual(profile.instagram_handle, "@newuser")

    def test_dashboard_redirects_inactive_subscriber_to_landing(self):
        user = User.objects.create_user(username="freeuser", password="password123")
        self.client.login(username="freeuser", password="password123")
        
        # Set subscription to inactive
        sub = Subscription.objects.update_or_create(user=user, defaults={'tier': 'free', 'is_active': False})[0]
        
        response = self.client.get("/dashboard/")
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/")

    def test_moderation_api_blocks_inactive_subscriber(self):
        user = User.objects.create_user(username="freeuser2", password="password123")
        self.client.login(username="freeuser2", password="password123")
        
        # Set subscription to inactive
        Subscription.objects.update_or_create(user=user, defaults={'tier': 'free', 'is_active': False})
        
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


class TieredModerationAndGroqTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="moderator_user", password="password123")
        self.client.login(username="moderator_user", password="password123")
        Subscription.objects.update_or_create(user=self.user, defaults={'tier': 'starter', 'is_active': True})
        InstagramAccount.objects.create(
            user=self.user,
            ig_business_id="test_ig_business_id",
            page_access_token="fake_token"
        )

    @patch("social_help.comments.instagram_service.InstagramService.analyze_toxicity_hf")
    def test_scan_comment_toxicity_ranges(self, mock_hf_toxicity):
        from social_help.comments.instagram_service import InstagramService
        service = InstagramService()

        # 1. Clean comment (toxicity < lower bound) -> Keep
        mock_hf_toxicity.return_value = 0.2
        result = service.scan_comment("Hello! This is a lovely comment.", user=self.user)
        self.assertEqual(result["decision"], "keep")
        self.assertEqual(result["reason"], "hf_ai_clean")

        # 2. Toxic comment (toxicity >= upper bound) -> Delete
        mock_hf_toxicity.return_value = 0.9
        result = service.scan_comment("This is bad, incredibly negative and mean.", user=self.user)
        self.assertEqual(result["decision"], "delete")
        self.assertEqual(result["reason"], "hf_ai_high_toxicity")

        # 3. Uncertain/Borderline comment (within margin) -> Review
        # Default toxicity threshold is 0.7. Margin is 0.15. Range for review is [0.55, 0.85]
        mock_hf_toxicity.return_value = 0.7
        result = service.scan_comment("Interesting update, I hope it doesn't break.", user=self.user)
        self.assertEqual(result["decision"], "review")
        self.assertEqual(result["reason"], "hf_ai_uncertain")

    @patch("social_help.comments.instagram_service.InstagramService.resolve_comment_with_groq")
    def test_resolve_comment_with_groq_api(self, mock_groq):
        mock_groq.return_value = ("delete", "groq_llm: toxic comment resolved")

        comment = Comment.objects.create(
            user=self.user,
            comment_text="Borderline comment",
            toxicity_score=0.7,
            decision="review",
            reason="hf_ai_uncertain"
        )

        response = self.client.post(f"/api/comments/{comment.id}/resolve-groq/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["decision"], "delete")

        # Verify database is updated
        comment.refresh_from_db()
        self.assertEqual(comment.decision, "delete")
        self.assertEqual(comment.reason, "groq_llm: toxic comment resolved")

    @patch("social_help.comments.instagram_service.InstagramService.resolve_comment_with_groq")
    def test_resolve_all_uncertain_comments(self, mock_groq):
        mock_groq.return_value = ("keep", "groq_llm: clean comment resolved")

        Comment.objects.create(
            user=self.user,
            comment_text="Borderline comment 1",
            toxicity_score=0.68,
            decision="review",
            reason="hf_ai_uncertain"
        )
        Comment.objects.create(
            user=self.user,
            comment_text="Borderline comment 2",
            toxicity_score=0.72,
            decision="review",
            reason="hf_ai_uncertain"
        )

        response = self.client.post("/api/comments/resolve-groq-all/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["resolved_count"], 2)

        # Verify both are kept in the database
        comments = Comment.objects.filter(user=self.user)
        for c in comments:
            self.assertEqual(c.decision, "keep")
            self.assertEqual(c.reason, "groq_llm: clean comment resolved")

    def test_scan_comment_promotional_spam(self):
        from social_help.comments.instagram_service import InstagramService
        service = InstagramService()
        
        result = service.scan_comment("dm me to get the website", user=self.user)
        self.assertEqual(result["decision"], "delete")
        self.assertEqual(result["reason"], "spam_keyword")
        self.assertEqual(result["sentiment"], "neutral")

    def test_sarcastic_backhanded_compliment_is_detected(self):
        from social_help.comments.instagram_service import InstagramService
        service = InstagramService()

        result = service._sarcasm_heuristic_fallback(
            "Wow... groundbreaking content. Truly the cure for insomnia. "
            "Thanks for reminding me why the scroll button exists."
        )

        self.assertTrue(result["detected"])
        self.assertGreaterEqual(result["confidence"], 0.75)

    @patch("social_help.comments.instagram_service.InstagramService.analyze_toxicity_hf")
    @patch("social_help.comments.instagram_service.InstagramService.detect_sarcasm")
    def test_scan_comment_deletes_high_confidence_sarcasm_when_hf_is_clean(self, mock_sarcasm, mock_hf_toxicity):
        from social_help.comments.instagram_service import InstagramService
        service = InstagramService()
        mock_hf_toxicity.return_value = 0.05
        mock_sarcasm.return_value = {"detected": True, "confidence": 0.95}

        result = service.scan_comment(
            "Wow... groundbreaking content. Truly the cure for insomnia. "
            "Thanks for reminding me why the scroll button exists.",
            user=self.user,
        )

        self.assertEqual(result["decision"], "delete")
        self.assertEqual(result["reason"], "vader_ai_high_toxicity")
        self.assertTrue(result["sarcasm_detected"])
        self.assertGreaterEqual(result["toxicity_score"], 0.85)


class AdminLoginProtectionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="adminuser", password="password123")
        Subscription.objects.update_or_create(user=self.user, defaults={'tier': 'pro', 'is_active': True})

    @override_settings(
        ADMIN_BASIC_AUTH_USERNAME='testadmin',
        ADMIN_BASIC_AUTH_PASSWORD='supersecretpassword',
        ALLOWED_ADMIN_IPS=[]
    )
    def test_restricted_paths_without_credentials(self):
        response = self.client.get('/admin/login/')
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response['WWW-Authenticate'], 'Basic realm="Restricted Area"')

        response = self.client.get('/admin/')
        self.assertEqual(response.status_code, 401)

        response = self.client.get('/dashboard/')
        self.assertEqual(response.status_code, 401)

    @override_settings(
        ADMIN_BASIC_AUTH_USERNAME='testadmin',
        ADMIN_BASIC_AUTH_PASSWORD='supersecretpassword',
        ALLOWED_ADMIN_IPS=[]
    )
    def test_restricted_paths_with_incorrect_credentials(self):
        auth_headers = {
            'HTTP_AUTHORIZATION': 'Basic ' + base64.b64encode(b'wronguser:wrongpass').decode('utf-8')
        }
        response = self.client.get('/admin/login/', **auth_headers)
        self.assertEqual(response.status_code, 401)

        response = self.client.get('/dashboard/', **auth_headers)
        self.assertEqual(response.status_code, 401)

    @override_settings(
        ADMIN_BASIC_AUTH_USERNAME='testadmin',
        ADMIN_BASIC_AUTH_PASSWORD='supersecretpassword',
        ALLOWED_ADMIN_IPS=[]
    )
    def test_restricted_paths_with_correct_credentials(self):
        auth_headers = {
            'HTTP_AUTHORIZATION': 'Basic ' + base64.b64encode(b'testadmin:supersecretpassword').decode('utf-8')
        }
        response = self.client.get('/admin/login/', **auth_headers)
        self.assertEqual(response.status_code, 200)

        response = self.client.get('/dashboard/', **auth_headers)
        self.assertEqual(response.status_code, 302)

    @override_settings(
        ADMIN_BASIC_AUTH_USERNAME='testadmin',
        ADMIN_BASIC_AUTH_PASSWORD='supersecretpassword',
        ALLOWED_ADMIN_IPS=['1.2.3.4']
    )
    def test_restricted_paths_with_allowed_ip(self):
        response = self.client.get('/admin/login/', HTTP_X_FORWARDED_FOR='1.2.3.4')
        self.assertEqual(response.status_code, 200)

        response = self.client.get('/dashboard/', HTTP_X_FORWARDED_FOR='1.2.3.4')
        self.assertEqual(response.status_code, 302)

    @override_settings(
        ADMIN_BASIC_AUTH_USERNAME='testadmin',
        ADMIN_BASIC_AUTH_PASSWORD='supersecretpassword',
        ALLOWED_ADMIN_IPS=[]
    )
    def test_authenticated_session_bypasses_basic_auth(self):
        self.client.force_login(self.user)
        response = self.client.get('/dashboard/')
        self.assertEqual(response.status_code, 200)

    def test_other_endpoints_unaffected(self):
        response = self.client.get('/signup/')
        self.assertEqual(response.status_code, 200)



