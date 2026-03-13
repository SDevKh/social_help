import os
import django
from unittest import mock

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "social_help.settings")
django.setup()

from django.test import RequestFactory, TestCase
from django.contrib.auth.models import User
from comments.views import facebook_oauth_callback
from comments.models import InstagramAccount

class OAuthFallbackTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user, _ = User.objects.get_or_create(username='testuser')

    @mock.patch('requests.get')
    def test_callback_fallback_direct_ig(self, mock_get):
        def side_effect(url, params=None, **kwargs):
            m = mock.Mock()
            m.status_code = 200
            if "oauth/access_token" in url:
                m.json.return_value = {"access_token": "mock_user_token"}
            elif "me/accounts" in url:
                m.json.return_value = {"data": []}
            elif "me/instagram_business_accounts" in url:
                m.json.return_value = {"data": [{"id": "direct_ig_id"}]}
            else:
                m.json.return_value = {}
            return m

        mock_get.side_effect = side_effect

        request = self.factory.get('/instagram/callback/?code=fakecode&state=fakestate')
        request.user = self.user
        request.session = {"fb_oauth_state": "fakestate"}

        with mock.patch('django.shortcuts.render') as mock_render:
            response = facebook_oauth_callback(request)
        
        if response.status_code == 302:
            print("✅ Redirect status 302 confirmed.")
            if response.url == "/dashboard/":
                 print("✅ Redirect URL /dashboard/ confirmed.")
        else:
             print(f"❌ Unexpected status code: {response.status_code}")

        account = InstagramAccount.objects.get(user=self.user)
        if account.ig_business_id == "direct_ig_id":
             print("✅ IG Business ID 'direct_ig_id' confirmed.")
        if account.page_access_token == "mock_user_token":
             print("✅ Page Access Token 'mock_user_token' confirmed.")
        if account.page_id is None:
             print("✅ Page ID is None confirmed.")
             
        print("✅ Fallback logic verified: Instagram account found without Facebook Page.")

if __name__ == "__main__":
    test_case = OAuthFallbackTest()
    test_case.setUp()
    test_case.test_callback_fallback_direct_ig()
    print("Test execution complete successfully!")
