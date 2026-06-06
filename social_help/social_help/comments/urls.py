from django.urls import path
from .views import (
    RecentComments,
    ModerationSettingsAPI,
    ScanInstagramPost,
    DeleteComment,
    DeleteInstagramComment,
    ClearAllComments,
    CreateCheckoutSession,
    StripeWebhook,
    GumroadWebhook,
    SubscriptionStatus,
    GumroadCheckoutURL,
    ResolveCommentWithGroq,
    ResolveAllUncertainComments,
)
from .polar_views import PolarCheckoutURL, PolarWebhookAPI

urlpatterns = [
    path("scan-instagram/", ScanInstagramPost.as_view()),
    path("comments/", RecentComments.as_view()),
    path("comments/clear/", ClearAllComments.as_view()),
    path("comments/<int:comment_id>/", DeleteComment.as_view()),
    path("comments/<int:comment_id>/resolve-groq/", ResolveCommentWithGroq.as_view()),
    path("comments/resolve-groq-all/", ResolveAllUncertainComments.as_view()),
    path("delete-instagram-comment/", DeleteInstagramComment.as_view()),
    path("settings/", ModerationSettingsAPI.as_view()),
    path("create-checkout/", CreateCheckoutSession.as_view()),
    path("stripe/webhook/", StripeWebhook.as_view()),
    path("gumroad/webhook/", GumroadWebhook.as_view()),
    path("subscription/status/", SubscriptionStatus.as_view()),
    path("gumroad/checkout-url/", GumroadCheckoutURL.as_view()),
    path("polar/checkout/", PolarCheckoutURL.as_view()),
    path("polar/webhook/", PolarWebhookAPI.as_view()),
]
