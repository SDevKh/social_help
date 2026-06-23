from django.contrib import admin
from .models import BlogPost

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "author", "date", "featured", "is_published")
    list_filter = ("category", "featured", "is_published", "date")
    search_fields = ("title", "excerpt", "content_html")
    prepopulated_fields = {"slug": ("title",)}

