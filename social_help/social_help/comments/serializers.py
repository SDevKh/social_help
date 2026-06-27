from rest_framework import serializers
from .models import Comment, BlogPost

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = "__all__"

class BlogPostSerializer(serializers.ModelSerializer):
    image_file = serializers.SerializerMethodField()
    image_src = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = "__all__"

    def get_image_file(self, obj):
        """Return the full URL for uploaded image files."""
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        return None

    def get_image_src(self, obj):
        """Return the best available image source: uploaded file URL or external URL."""
        if obj.image_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_file.url)
            return obj.image_file.url
        if obj.image_url:
            return obj.image_url
        return None
