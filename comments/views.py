from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from .serializers import CommentSerializer
from django.shortcuts import render, get_object_or_404
from .models import Comment, ModerationSetting
from .instagram_service import InstagramService

def get_settings():
    settings, created = ModerationSetting.objects.get_or_create(id=1)
    return settings

def dashboard(request):
    return render(request, "comments/dashboard.html")

class RecentComments(ListAPIView):
    serializer_class = CommentSerializer

    def get_queryset(self):
        return Comment.objects.order_by("-created_at")[:10]

class DeleteComment(APIView):
    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, id=comment_id)
        comment.delete()
        return Response({"message": "Comment deleted successfully"})

class DeleteInstagramComment(APIView):
    def post(self, request):
        comment_id = request.data.get('comment_id')
        instagram_id = request.data.get('instagram_id')
        
        if not instagram_id:
            return Response({"success": False, "error": "Instagram ID required"})
        
        # Delete from Instagram
        instagram_service = InstagramService()
        result = instagram_service.delete_instagram_comment(instagram_id)
        
        # If successful, also delete from local database
        if result.get('success'):
            try:
                comment = Comment.objects.get(id=comment_id)
                comment.delete()
            except Comment.DoesNotExist:
                pass
        
        return Response(result)

class ClearAllComments(APIView):
    def post(self, request):
        count = Comment.objects.count()
        Comment.objects.all().delete()
        return Response({"message": f"Deleted {count} comments"})

class ModerationSettingsAPI(APIView):
    def get(self, request):
        settings = get_settings()
        return Response({
            "toxicity_threshold": settings.toxicity_threshold,
            "keywords": settings.keywords
        })

    def post(self, request):
        settings = get_settings()
        settings.toxicity_threshold = request.data.get(
            "toxicity_threshold", settings.toxicity_threshold
        )
        settings.keywords = request.data.get(
            "keywords", settings.keywords
        )
        settings.save()

        return Response({"message": "Settings updated"})

class ScanInstagramPost(APIView):
    def post(self, request):
        post_id = request.data.get('post_id', '')
        
        if not post_id:
            return Response({"error": "post_id is required"}, status=400)
        
        instagram_service = InstagramService()
        results = instagram_service.scan_instagram_comments(post_id)
        
        return Response({
            "message": f"Scanned {len(results)} comments",
            "results": results
        })

class ScanComment(APIView):
    def get(self, request):
        return Response({
            "message": "Send a POST request with 'comment_text' to scan."
        })

    def post(self, request):
        comment_text = request.data.get('comment_text', '').lower()

        settings = get_settings()
        keywords = settings.keyword_list()
        threshold = settings.toxicity_threshold

        keyword_match = any(word in comment_text for word in keywords)
        
        toxic_words = ["kill", "destroy", "hate", "die", "stupid", "idiot"]
        toxicity_score = 0.9 if any(word in comment_text for word in toxic_words) else 0.1

        if keyword_match:
            decision = "delete"
            reason = "keyword"
        elif toxicity_score >= threshold:
            decision = "delete"
            reason = "ai"
        else:
            decision = "keep"
            reason = "clean"

        Comment.objects.create(
            comment_text=comment_text,
            toxicity_score=toxicity_score,
            decision=decision,
            reason=reason
        )

        return Response({
            "toxicity_score": toxicity_score,
            "decision": decision,
            "reason": reason
        })