from django.urls import path
from .views import (
    RecentComments,
    ModerationSettingsAPI,
    ScanInstagramPost,
    DeleteComment,
    DeleteInstagramComment,
    ClearAllComments,
    PayPalCheckout,
    PayPalExecute,
    CreateCheckoutSession,
    StripeWebhook,
    GumroadWebhook,
)

urlpatterns = [
    path("scan-instagram/", ScanInstagramPost.as_view()),
    path("comments/", RecentComments.as_view()),
    path("comments/clear/", ClearAllComments.as_view()),
    path("comments/<int:comment_id>/", DeleteComment.as_view()),
    path("delete-instagram-comment/", DeleteInstagramComment.as_view()),
    path("settings/", ModerationSettingsAPI.as_view()),
    path("paypal/checkout/", PayPalCheckout.as_view()),
    path("paypal/execute/", PayPalExecute.as_view()),
    path("create-checkout/", CreateCheckoutSession.as_view()),
    path("stripe/webhook/", StripeWebhook.as_view()),
    path("gumroad/webhook/", GumroadWebhook.as_view()),
]
