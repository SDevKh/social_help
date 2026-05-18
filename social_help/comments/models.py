from django.db import models
from django.contrib.auth.models import User
class Comment(models.Model):
    DECISION_CHOICES = [
        ("delete", "Delete"),
        ("keep", "Keep"),
    ]

    REASON_CHOICES = [
        ("keyword", "Keyword Match"),
        ("ai", "AI Score"),
        ("clean", "Clean"),
        ("toxic_word", "Toxic Word"),
        ("positive", "Positive"),
        ("spam_keyword", "Spam Keyword"),
        ("hf_ai", "HF AI"),
    ]

    SENTIMENT_CHOICES = [
        ("positive", "Positive"),
        ("negative", "Negative"),
        ("neutral", "Neutral"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    comment_text = models.TextField()
    toxicity_score = models.FloatField()
    decision = models.CharField(max_length=10, choices=DECISION_CHOICES)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    instagram_id = models.CharField(max_length=100, blank=True, null=True)
    sentiment = models.CharField(max_length=10, choices=SENTIMENT_CHOICES, default="neutral")
    sarcasm_detected = models.BooleanField(default=False)
    sarcasm_confidence = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.decision.upper()} - {self.reason}"

class ModerationSetting(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    toxicity_threshold = models.FloatField(default=0.7)
    keywords = models.TextField(
        help_text="Comma separated keywords",
        default="stupid,idiot,scam,fake,hate"
    )
    enable_sarcasm_detection = models.BooleanField(default=True, help_text="Enable AI sarcasm detection")
    sarcasm_threshold = models.FloatField(default=0.5, help_text="Confidence threshold for sarcasm flagging (0.0 - 1.0)")

    def keyword_list(self):
        return [k.strip().lower() for k in self.keywords.split(",")]

    def __str__(self):
        return "Moderation Settings"

class InstagramAccount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    page_id = models.CharField(max_length=100, blank=True, null=True)
    ig_business_id = models.CharField(max_length=100)
    page_access_token = models.TextField()
    connected_at = models.DateTimeField(auto_now_add=True)
    auth_method = models.CharField(
        max_length=20,
        choices=[
            ("instagram_oauth", "Instagram OAuth"),
            ("facebook_oauth", "Facebook OAuth"),
            ("direct_token", "Direct Token")
        ],
        default="instagram_oauth"
    )

    def __str__(self):
        return f"{self.user.username} - {self.ig_business_id}"