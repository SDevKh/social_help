from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from social_help.comments.models import Subscription, InstagramAccount, Comment, AutoReplyRule, ScheduledPost, ModerationSetting
from unittest.mock import Mock, patch
import base64
import json

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

    @patch("social_help.comments.instagram_service.InstagramService.analyze_hinglish_and_keywords_with_groq")
    def test_scan_comment_hinglish_ai_spam(self, mock_groq_hinglish):
        from social_help.comments.instagram_service import InstagramService
        service = InstagramService()
        
        mock_groq_hinglish.return_value = {
            "is_spam_or_toxic": True,
            "matched_keyword": "cheap",
            "reason": "Matches Hinglish translation of key: cheap"
        }
        
        from social_help.comments.models import ModerationSetting
        setting, _ = ModerationSetting.objects.get_or_create(user=self.user)
        setting.keywords = "cheap,free,collab"
        setting.save()
        
        with self.settings(GROQ_API_KEY="dummy_key"):
            result = service.scan_comment("Main saste mai krdunga", user=self.user)
            
        self.assertEqual(result["decision"], "delete")
        self.assertTrue(result["reason"].startswith("groq_hinglish:"))
        self.assertIn("Matches Hinglish translation of key: cheap", result["reason"])

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


from social_help.comments.instagram_service import InstagramTokenExpiredException

class InstagramScanTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="scantestuser", password="password123")
        self.client.login(username="scantestuser", password="password123")
        Subscription.objects.create(user=self.user, tier="starter", is_active=True)
        InstagramAccount.objects.create(
            user=self.user,
            ig_business_id="12345",
            page_access_token="expired_token",
            auth_method="direct_token"
        )

    @patch("social_help.comments.instagram_service.InstagramService.scan_instagram_comments")
    def test_scan_instagram_token_expired(self, mock_scan):
        mock_scan.side_effect = InstagramTokenExpiredException(
            "Instagram access token has expired or is invalid: Session has expired"
        )
        response = self.client.post(
            "/api/scan-instagram/",
            data={"post_id": "test_post_id"},
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.json().get("error"),
            "Instagram access token has expired or is invalid: Session has expired"
        )

    @patch("social_help.comments.scanner.scan_account_posts")
    def test_scan_recent_posts_success(self, mock_scan_posts):
        mock_scan_posts.return_value = [
            {"id": "post1", "permalink": "https://ig.com/p/post1", "scanned_at": "2026-06-24 12:00:00", "new_comments": 2, "total_comments": 10}
        ]
        response = self.client.post("/api/scan-recent/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("Successfully synced and scanned comments", response.json().get("message"))
        self.assertEqual(response.json().get("total_scanned"), 2)

    def test_scan_status_api(self):
        from django.core.cache import cache
        user_id = self.user.id
        cache.set(f"last_scan_time_{user_id}", "12:00:00 PM", timeout=3600)
        cache.set(f"recent_scanned_posts_{user_id}", [{"id": "post1", "permalink": "https://ig.com/p/post1", "scanned_at": "2026-06-24 12:00:00", "new_comments": 2, "total_comments": 10}], timeout=3600)
        
        response = self.client.get("/api/scan-status/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("last_scan_time"), "12:00:00 PM")
        self.assertEqual(len(response.json().get("recent_posts")), 1)

    @patch("social_help.comments.instagram_service.InstagramService.fetch_comments")
    @patch("social_help.comments.instagram_service.InstagramService.api_get")
    def test_scan_account_posts_only_targets_user_posts(self, mock_api_get, mock_fetch_comments):
        from social_help.comments.scanner import scan_account_posts
        from django.core.cache import cache

        # Ensure cache is empty
        cache.clear()
        
        account = InstagramAccount.objects.filter(user=self.user).first()
        
        # 1. No rules / no tracked posts -> should not scan anything
        mock_fetch_comments.return_value = []
        result = scan_account_posts(account)
        self.assertEqual(result, [])
        mock_fetch_comments.assert_not_called()

        # 2. Add an AutoReplyRule targeting '12345'
        AutoReplyRule.objects.create(
            user=self.user,
            trigger_keyword="promo",
            reply_text="check it out",
            instagram_post_id="12345"
        )

        mock_api_get.return_value = {"permalink": "https://ig.com/p/12345"}
        mock_fetch_comments.return_value = [{"id": "comment_1", "text": "promo word", "username": "other", "timestamp": "2026-06-24T12:00:00Z"}]
        
        result = scan_account_posts(account)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "12345")
        mock_fetch_comments.assert_called_once_with("12345")


class AutoReplyRuleTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="ruleuser", password="password123")
        self.client.login(username="ruleuser", password="password123")
        Subscription.objects.create(user=self.user, tier="pro", is_active=True)

    def test_create_single_rule_success(self):
        response = self.client.post(
            "/api/autoreply/",
            data={
                "trigger_keyword": "promo",
                "reply_text": "Check it out: http://promo",
                "reply_type": "public",
                "instagram_post_id": "postA"
            },
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["instagram_post_id"], "postA")
        
        # Verify db
        from social_help.comments.models import AutoReplyRule
        self.assertTrue(AutoReplyRule.objects.filter(user=self.user, trigger_keyword="promo").exists())

    def test_create_global_rule_disabled(self):
        response = self.client.post(
            "/api/autoreply/",
            data={
                "trigger_keyword": "global",
                "reply_text": "No post ID here",
                "reply_type": "public",
                "instagram_post_id": ""
            },
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Instagram post ID or URL is required", response.json()["error"])

    def test_create_multiple_rules_same_link(self):
        response = self.client.post(
            "/api/autoreply/",
            data={
                "trigger_keyword": "multi",
                "reply_type": "dm",
                "entries": [
                    {"instagram_post_id": "post1", "reply_text": "Same Link"},
                    {"instagram_post_id": "post2", "reply_text": "Same Link"}
                ]
            },
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.json()["rules"]), 2)
        
        from social_help.comments.models import AutoReplyRule
        self.assertEqual(AutoReplyRule.objects.filter(user=self.user, trigger_keyword="multi").count(), 2)

    def test_create_multiple_rules_separate_links(self):
        response = self.client.post(
            "/api/autoreply/",
            data={
                "trigger_keyword": "multi-sep",
                "reply_type": "public",
                "entries": [
                    {"instagram_post_id": "post1", "reply_text": "Link 1"},
                    {"instagram_post_id": "post2", "reply_text": "Link 2"}
                ]
            },
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        
        from social_help.comments.models import AutoReplyRule
        rule1 = AutoReplyRule.objects.get(user=self.user, trigger_keyword="multi-sep", instagram_post_id="post1")
        rule2 = AutoReplyRule.objects.get(user=self.user, trigger_keyword="multi-sep", instagram_post_id="post2")
        self.assertEqual(rule1.reply_text, "Link 1")
        self.assertEqual(rule2.reply_text, "Link 2")


class AIContentGeneratorTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="contentuser", password="password123")
        self.client.login(username="contentuser", password="password123")
        Subscription.objects.create(user=self.user, tier="pro", is_active=True)

    def test_generate_ideas_fallback_success(self):
        response = self.client.post("/api/generate-content-ideas/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("analysis", data)
        self.assertEqual(len(data["ideas"]), 3)
        first_idea = data["ideas"][0]
        self.assertIn("title", first_idea)
        self.assertIn("hook", first_idea)
        self.assertIn("caption", first_idea)
        self.assertIn("hashtags", first_idea)

    @patch("requests.post")
    @override_settings(GROQ_API_KEY="test_groq_key", NVIDIA_API_KEY="")
    def test_generate_ideas_groq_success(self, mock_post):
        mock_response = Mock()
        mock_response.ok = True
        mock_response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": '{"analysis": "Groq analysis", "ideas": [{"title": "G1", "hook": "H1", "caption": "C1", "hashtags": ["T1"]}]}'
                    }
                }
            ]
        }
        mock_post.return_value = mock_response

        response = self.client.post("/api/generate-content-ideas/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["analysis"], "Groq analysis")
        self.assertEqual(data["ideas"][0]["title"], "G1")

    @patch("requests.post")
    @override_settings(GROQ_API_KEY="", NVIDIA_API_KEY="test_nvidia_key")
    def test_generate_ideas_nvidia_success(self, mock_post):
        mock_response = Mock()
        mock_response.ok = True
        mock_response.json.return_value = {
            "choices": [
                {
                    "message": {
                        "content": '{"analysis": "Nvidia analysis", "ideas": [{"title": "N1", "hook": "H1", "caption": "C1", "hashtags": ["T1"]}]}'
                    }
                }
            ]
        }
        mock_post.return_value = mock_response

        response = self.client.post("/api/generate-content-ideas/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["analysis"], "Nvidia analysis")
        self.assertEqual(data["ideas"][0]["title"], "N1")


class InstagramPrivateReplyTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="replytestuser", password="password123")
        self.account = InstagramAccount.objects.create(
            user=self.user,
            ig_business_id="ig_biz_12345",
            page_id="fb_page_999",
            page_access_token="test_token",
            auth_method="direct_token"
        )

    @patch("requests.post")
    def test_send_private_reply_success(self, mock_post):
        mock_response = Mock()
        mock_response.json.return_value = {"message_id": "mid.123"}
        mock_post.return_value = mock_response

        from social_help.comments.instagram_service import InstagramService
        service = InstagramService(account=self.account)
        res = service.send_private_reply("comment_abc", "Hello there!")

        self.assertTrue(res["success"])
        self.assertEqual(res["id"], "mid.123")

        # Verify requests.post was called with the correct URL using ig_business_id
        mock_post.assert_called_once()
        args, kwargs = mock_post.call_args
        self.assertEqual(args[0], "https://graph.facebook.com/v20.0/ig_biz_12345/messages")
        self.assertEqual(kwargs["params"]["access_token"], "test_token")
        self.assertEqual(kwargs["json"]["recipient"]["comment_id"], "comment_abc")
        self.assertEqual(kwargs["json"]["message"]["text"], "Hello there!")

    @patch("requests.post")
    def test_send_private_reply_error(self, mock_post):
        mock_response = Mock()
        mock_response.json.return_value = {"error": {"message": "Invalid parameter"}}
        mock_post.return_value = mock_response

        from social_help.comments.instagram_service import InstagramService
        service = InstagramService(account=self.account)
        res = service.send_private_reply("comment_abc", "Hello there!")

        self.assertFalse(res["success"])
        self.assertEqual(res["error"], "Invalid parameter")

    def test_scan_comment_trigger_keyword_bypass(self):
        from social_help.comments.instagram_service import InstagramService
        # Create an AutoReplyRule
        AutoReplyRule.objects.create(
            user=self.user,
            trigger_keyword="link",
            reply_text="Here is the link: http://example.com",
            reply_type="dm"
        )
        
        service = InstagramService(account=self.account)
        res = service.scan_comment("Link!!!", user=self.user)
        self.assertEqual(res["decision"], "keep")
        self.assertEqual(res["reason"], "matches_trigger_keyword")


class RecentInstagramMediaAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.client.login(username="testuser", password="password123")
        self.subscription = Subscription.objects.create(user=self.user, tier="starter", is_active=True)

    def test_unauthenticated_request_rejected(self):
        self.client.logout()
        response = self.client.get("/api/instagram/media/")
        # DRF returns 403 Forbidden for unauthenticated request when IsAuthenticated is checked
        self.assertEqual(response.status_code, 403)

    def test_authenticated_no_instagram_account(self):
        response = self.client.get("/api/instagram/media/")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json().get("error"), "No Instagram account connected")

    @patch("social_help.comments.instagram_service.InstagramService.get_recent_media")
    def test_authenticated_with_instagram_account(self, mock_get_recent_media):
        InstagramAccount.objects.create(
            user=self.user,
            ig_business_id="12345",
            page_access_token="fake_token"
        )
        mock_get_recent_media.return_value = [
            {"id": "post1", "caption": "Hello world", "media_type": "IMAGE", "permalink": "https://instagram.com/p/1"}
        ]
        response = self.client.get("/api/instagram/media/")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json().get("success"))
        self.assertEqual(len(response.json().get("media")), 1)
        self.assertEqual(response.json().get("media")[0]["id"], "post1")


from datetime import timedelta

class ScheduledPostTests(TestCase):
    def setUp(self):
        # Create users
        self.user = User.objects.create_user(username="creator1", password="password123")
        self.other_user = User.objects.create_user(username="creator2", password="password123")
        
        # Authenticate self.client with user
        self.client.login(username="creator1", password="password123")

        # Setup mocks for real publishing to avoid hitting actual APIs
        from unittest.mock import patch
        self.patcher_ig = patch('social_help.comments.views.publish_to_instagram', return_value="mock_ig_123")
        self.patcher_fb = patch('social_help.comments.views.publish_to_facebook', return_value="mock_fb_123")
        self.patcher_tw = patch('social_help.comments.views.publish_to_twitter', return_value="mock_tw_123")
        self.patcher_li = patch('social_help.comments.views.publish_to_linkedin', return_value="mock_li_123")
        self.patcher_rd = patch('social_help.comments.views.publish_to_reddit', return_value="mock_rd_123")
        
        self.mock_ig = self.patcher_ig.start()
        self.mock_fb = self.patcher_fb.start()
        self.mock_tw = self.patcher_tw.start()
        self.mock_li = self.patcher_li.start()
        self.mock_rd = self.patcher_rd.start()

    def tearDown(self):
        self.patcher_ig.stop()
        self.patcher_fb.stop()
        self.patcher_tw.stop()
        self.patcher_li.stop()
        self.patcher_rd.stop()

    def test_scheduled_post_model_creation(self):
        post = ScheduledPost.objects.create(
            user=self.user,
            title="My First Post",
            content="Hello world",
            post_to_twitter=True,
            status="draft"
        )
        self.assertEqual(str(post), "creator1 - My First Post (draft)")
        self.assertEqual(post.post_to_twitter, True)
        self.assertEqual(post.post_to_reddit, False)

    def test_list_scheduled_posts(self):
        # Create posts for both users
        ScheduledPost.objects.create(user=self.user, title="Post 1", status="draft")
        ScheduledPost.objects.create(user=self.other_user, title="Other Post", status="draft")
        
        response = self.client.get("/api/posts/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["title"], "Post 1")

    def test_create_scheduled_post_via_api(self):
        payload = {
            "title": "New Post via API",
            "content": "Checking DRF setup",
            "post_to_reddit": True,
            "post_to_linkedin": True,
            "status": "scheduled",
            "scheduled_at": "2026-07-14T10:00:00Z"
        }
        response = self.client.post(
            "/api/posts/",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["title"], "New Post via API")
        self.assertEqual(data["post_to_reddit"], True)
        self.assertEqual(data["post_to_linkedin"], True)
        self.assertEqual(data["status"], "scheduled")
        
        # Verify saved in db
        db_post = ScheduledPost.objects.get(pk=data["id"])
        self.assertEqual(db_post.user, self.user)

    def test_retrieve_scheduled_post_via_api(self):
        post = ScheduledPost.objects.create(user=self.user, title="Retrieve Me", status="draft")
        response = self.client.get(f"/api/posts/{post.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "Retrieve Me")

    def test_update_scheduled_post_via_api(self):
        post = ScheduledPost.objects.create(user=self.user, title="Old Title", status="draft")
        payload = {
            "title": "New Title"
        }
        response = self.client.put(
            f"/api/posts/{post.id}/",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "New Title")
        post.refresh_from_db()
        self.assertEqual(post.title, "New Title")

    def test_delete_scheduled_post_via_api(self):
        post = ScheduledPost.objects.create(user=self.user, title="Delete Me", status="draft")
        response = self.client.delete(f"/api/posts/{post.id}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(ScheduledPost.objects.filter(pk=post.id).exists())

    def test_publish_scheduled_post_immediately_via_api(self):
        post = ScheduledPost.objects.create(
            user=self.user,
            title="Instant Post",
            content="Publishing right now",
            post_to_twitter=True,
            post_to_instagram=True,
            status="scheduled"
        )
        response = self.client.post(f"/api/posts/{post.id}/publish/")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["status"], "published")
        self.assertIsNotNone(data["published_at"])
        self.assertIn("twitter", data["external_ids"])
        self.assertIn("instagram", data["external_ids"])

    def test_publish_immediately_with_simulate_fail(self):
        post = ScheduledPost.objects.create(
            user=self.user,
            title="Failing Post",
            content="This post will simulate_fail on publish",
            post_to_twitter=True,
            status="scheduled"
        )
        response = self.client.post(f"/api/posts/{post.id}/publish/")
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data["status"], "failed")
        self.assertIn("Simulated API Timeout error", data["error_message"])

    def test_process_scheduled_posts_management_command(self):
        from django.core.management import call_command
        from django.utils import timezone
        
        # Create scheduled post in the past
        past_time = timezone.now() - timedelta(minutes=10)
        post_due = ScheduledPost.objects.create(
            user=self.user,
            title="Due Post",
            content="Must publish",
            post_to_reddit=True,
            scheduled_at=past_time,
            status="scheduled"
        )
        
        # Create scheduled post in the future (should not process)
        future_time = timezone.now() + timedelta(hours=1)
        post_future = ScheduledPost.objects.create(
            user=self.user,
            title="Future Post",
            content="Wait",
            post_to_reddit=True,
            scheduled_at=future_time,
            status="scheduled"
        )
        
        # Call management command
        call_command("process_scheduled_posts")
        
        # Refresh from db
        post_due.refresh_from_db()
        post_future.refresh_from_db()
        
        self.assertEqual(post_due.status, "published")
        self.assertIsNotNone(post_due.published_at)
        self.assertEqual(post_future.status, "scheduled")
        self.assertIsNone(post_future.published_at)


class LiveModeTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="moderator1", password="password123")
        self.client.login(username="moderator1", password="password123")
        # Ensure subscription is active so paid check passes
        Subscription.objects.get_or_create(user=self.user, tier="pro", is_active=True)

    def test_settings_api_live_mode_default(self):
        response = self.client.get("/api/settings/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["live_mode"], True)

    def test_settings_api_update_live_mode(self):
        # Update live_mode to False
        payload = {
            "toxicity_threshold": 0.6,
            "keywords": "spam,toxic",
            "enable_sarcasm_detection": False,
            "sarcasm_threshold": 0.4,
            "live_mode": False
        }
        response = self.client.post(
            "/api/settings/",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify database update
        setting = ModerationSetting.objects.get(user=self.user)
        self.assertEqual(setting.live_mode, False)
        
        # Verify get API returns correct value
        get_response = self.client.get("/api/settings/")
        self.assertEqual(get_response.json()["live_mode"], False)

    @patch("social_help.comments.scanner.InstagramService")
    def test_scanner_respects_live_mode(self, mock_instagram_service_class):
        account = InstagramAccount.objects.create(
            user=self.user,
            ig_business_id="ig_123",
            page_access_token="fake_token"
        )
        
        # Setup settings with live_mode = False
        setting, _ = ModerationSetting.objects.get_or_create(user=self.user)
        setting.live_mode = False
        setting.save()
        
        from social_help.comments.scanner import scan_account_posts
        
        # Call scanner and assert it returns empty list immediately
        results = scan_account_posts(account)
        self.assertEqual(results, [])
        mock_instagram_service_class.assert_not_called()
        
        # Set live_mode = True and assert it initiates the scan (calls InstagramService)
        setting.live_mode = True
        setting.save()
        
        # We need mock get_recent_media or similar to not fail
        mock_service_instance = mock_instagram_service_class.return_value
        mock_service_instance.extract_shortcode.return_value = None
        
        scan_account_posts(account)
        mock_instagram_service_class.assert_called_once_with(account=account)


from unittest import mock
from social_help.comments.models import InstagramAccount, ScheduledPost

class SocialMediaPublishingAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="testapiuser", password="password123")
        self.account = InstagramAccount.objects.create(
            user=self.user,
            ig_business_id="17841450633263795",
            page_id="103993782799387",
            page_access_token="fake_token"
        )
        self.post = ScheduledPost.objects.create(
            user=self.user,
            title="API Post",
            content="Hello from test",
            media_url="http://example.com/image.jpg"
        )

    @mock.patch('requests.post')
    def test_publish_to_instagram_success(self, mock_post):
        mock_res1 = mock.Mock()
        mock_res1.json.return_value = {"id": "container_123"}
        mock_res2 = mock.Mock()
        mock_res2.json.return_value = {"id": "media_published_id"}
        mock_post.side_effect = [mock_res1, mock_res2]

        from social_help.comments.views import publish_to_instagram
        post_id = publish_to_instagram(self.post, self.account, self.post.media_url)
        self.assertEqual(post_id, "media_published_id")
        self.assertEqual(mock_post.call_count, 2)

    @mock.patch('requests.post')
    def test_publish_to_facebook_success(self, mock_post):
        mock_res = mock.Mock()
        mock_res.json.return_value = {"id": "fb_post_id"}
        mock_post.return_value = mock_res

        from social_help.comments.views import publish_to_facebook
        post_id = publish_to_facebook(self.post, self.account, self.post.media_url)
        self.assertEqual(post_id, "fb_post_id")
        mock_post.assert_called_once()

    @mock.patch('tweepy.Client')
    def test_publish_to_twitter_success(self, mock_tweepy_client):
        mock_client_instance = mock_tweepy_client.return_value
        mock_response = mock.Mock()
        mock_response.data = {"id": "tweet_123"}
        mock_client_instance.create_tweet.return_value = mock_response

        with self.settings(TWITTER_API_KEY="key", TWITTER_ACCESS_TOKEN="token"):
            from social_help.comments.views import publish_to_twitter
            post_id = publish_to_twitter(self.post)
            self.assertEqual(post_id, "tweet_123")

    @mock.patch('requests.post')
    def test_publish_to_linkedin_success(self, mock_post):
        mock_res = mock.Mock()
        mock_res.status_code = 201
        mock_res.json.return_value = {"id": "linkedin_share_urn"}
        mock_post.return_value = mock_res

        with self.settings(LINKEDIN_ACCESS_TOKEN="token", LINKEDIN_AUTHOR_ID="urn:li:person:123"):
            from social_help.comments.views import publish_to_linkedin
            post_id = publish_to_linkedin(self.post, self.post.media_url)
            self.assertEqual(post_id, "linkedin_share_urn")

    @mock.patch('requests.post')
    def test_publish_to_linkedin_user_account_success(self, mock_post):
        mock_res = mock.Mock()
        mock_res.status_code = 201
        mock_res.json.return_value = {"id": "user_linkedin_share_urn"}
        mock_post.return_value = mock_res

        from social_help.comments.models import LinkedInAccount
        LinkedInAccount.objects.create(
            user=self.user,
            access_token="user_token",
            author_id="urn:li:person:user_id",
            profile_name="User Name"
        )

        from social_help.comments.views import publish_to_linkedin
        post_id = publish_to_linkedin(self.post, self.post.media_url)
        self.assertEqual(post_id, "user_linkedin_share_urn")

        called_args, called_kwargs = mock_post.call_args
        self.assertIn("Authorization", called_kwargs["headers"])
        self.assertEqual(called_kwargs["headers"]["Authorization"], "Bearer user_token")
        self.assertEqual(called_kwargs["json"]["author"], "urn:li:person:user_id")

    @mock.patch('requests.post')
    def test_publish_to_reddit_success(self, mock_post):
        mock_token_res = mock.Mock()
        mock_token_res.status_code = 200
        mock_token_res.json.return_value = {"access_token": "reddit_token"}
        mock_submit_res = mock.Mock()
        mock_submit_res.status_code = 200
        mock_submit_res.json.return_value = {"json": {"data": {"name": "reddit_name"}}}
        mock_post.side_effect = [mock_token_res, mock_submit_res]

        with self.settings(
            REDDIT_CLIENT_ID="id",
            REDDIT_CLIENT_SECRET="secret",
            REDDIT_USERNAME="user",
            REDDIT_PASSWORD="password",
            REDDIT_USER_AGENT="agent",
            REDDIT_SUBREDDIT="sub"
        ):
            from social_help.comments.views import publish_to_reddit
            post_id = publish_to_reddit(self.post, self.post.media_url)
            self.assertEqual(post_id, "reddit_name")

    @mock.patch('requests.post')
    def test_publish_to_reddit_user_account_success(self, mock_post):
        from .models import RedditAccount
        reddit_acc = RedditAccount.objects.create(
            user=self.user,
            access_token="old_token",
            refresh_token="refresh_val",
            reddit_username="reddit_test_user",
            subreddit="custom_subreddit"
        )

        mock_refresh_res = mock.Mock()
        mock_refresh_res.status_code = 200
        mock_refresh_res.json.return_value = {"access_token": "new_refreshed_token"}
        
        mock_submit_res = mock.Mock()
        mock_submit_res.status_code = 200
        mock_submit_res.json.return_value = {"json": {"data": {"name": "reddit_post_name"}}}
        
        mock_post.side_effect = [mock_refresh_res, mock_submit_res]

        with self.settings(
            REDDIT_CLIENT_ID="reddit_id",
            REDDIT_CLIENT_SECRET="reddit_secret",
            REDDIT_USER_AGENT="agent"
        ):
            from social_help.comments.views import publish_to_reddit
            post_id = publish_to_reddit(self.post, self.post.media_url)
            self.assertEqual(post_id, "reddit_post_name")

            reddit_acc.refresh_from_db()
            self.assertEqual(reddit_acc.access_token, "new_refreshed_token")

            called_args, called_kwargs = mock_post.call_args
            self.assertEqual(called_kwargs["headers"]["Authorization"], "bearer new_refreshed_token")
            self.assertEqual(called_kwargs["data"]["sr"], "custom_subreddit")
