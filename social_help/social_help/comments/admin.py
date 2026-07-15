from django.contrib import admin
from .models import BlogPost, ScheduledPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "author", "date", "featured", "is_published")
    list_filter = ("category", "featured", "is_published", "date")
    search_fields = ("title", "excerpt", "content_html")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(ScheduledPost)
class ScheduledPostAdmin(admin.ModelAdmin):
    list_display = ("user", "title", "status", "scheduled_at", "published_at")
    list_filter = (
        "status",
        "scheduled_at",
        "post_to_reddit",
        "post_to_quora",
        "post_to_linkedin",
        "post_to_instagram",
        "post_to_facebook",
        "post_to_twitter",
    )
    search_fields = ("title", "content", "user__username")

