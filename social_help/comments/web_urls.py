from django.urls import path
from django.contrib.auth import views as auth_views
from .views import (
    landing,
    dashboard,
    signup,
    logout_view,
    instagram_disconnect,
    facebook_oauth_login,
    facebook_oauth_callback,
    instagram_connect_direct,
    privacy_policy,
    terms_of_service,
)

urlpatterns = [
    path("", landing),
    path("dashboard/", dashboard),
    path("signup/", signup),
    path("login/", auth_views.LoginView.as_view(template_name="registration/login.html")),
    path("logout/", logout_view),
    path("instagram/disconnect/", instagram_disconnect),
    path("instagram/connect/", facebook_oauth_login),
    path("instagram/callback/", facebook_oauth_callback),
    path("instagram/connect-direct/", instagram_connect_direct),
    path("privacy-policy/", privacy_policy),
    path("terms-of-service/", terms_of_service),
]

