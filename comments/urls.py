from django.urls import path
from .views import (
    ScanComment,
    RecentComments,
    ModerationSettingsAPI,
    ScanInstagramPost,
    DeleteComment,
    DeleteInstagramComment,
    ClearAllComments,
    dashboard,
)

urlpatterns = [
    path("scan-comment/", ScanComment.as_view()),
    path("scan-instagram/", ScanInstagramPost.as_view()),
    path("comments/", RecentComments.as_view()),
    path("comments/<int:comment_id>/", DeleteComment.as_view()),
    path("comments/clear/", ClearAllComments.as_view()),
    path("delete-instagram-comment/", DeleteInstagramComment.as_view()),
    path("settings/", ModerationSettingsAPI.as_view()),
    path("dashboard/", dashboard),
]