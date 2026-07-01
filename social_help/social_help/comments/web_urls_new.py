from django.urls import path
from django.contrib.auth import views as auth_views
from django.shortcuts import render, redirect
from django.views.decorators.http import require_http_methods

# Landing page view
@require_http_methods(["GET"])
def landing(request):
    """Landing page for unauthenticated users"""
    if request.user.is_authenticated:
        return redirect("/dashboard/")
    return render(request, "landing.html")

# Import other views
from .views import (
    dashboard,
    signup,
    instagram_oauth_login,
    instagram_oauth_callback,
    instagram_connect_direct,
    privacy_policy,
    terms_of_service,
    contact,
)

urlpatterns = [
    # Landing page
    path("", landing),
    
    # Auth
    path("dashboard/", dashboard),
    path("signup/", signup),
    path("login/", auth_views.LoginView.as_view(template_name="registration/login.html")),
    path("logout/", auth_views.LogoutView.as_view(next_page="/login/")),
    
    # Instagram Login OAuth
    path("instagram/connect/", instagram_oauth_login),
    path("instagram/callback/", instagram_oauth_callback),
    
    # Direct Token Entry
    path("instagram/connect-direct/", instagram_connect_direct),
    
    # Legal & Contact
    path("privacy-policy/", privacy_policy),
    path("terms-of-service/", terms_of_service),
    path("terms/", terms_of_service),
    path("contact/", contact),
]
