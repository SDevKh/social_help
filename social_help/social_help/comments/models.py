from django.db import models
from django.contrib.auth.models import User
class Comment(models.Model):
    DECISION_CHOICES = [
        ("delete", "Delete"),
        ("keep", "Keep"),
        ("review", "Review"),
    ]

    REASON_CHOICES = [
        ("keyword", "Keyword Match"),
        ("ai", "AI Score"),
        ("clean", "Clean"),
        ("toxic_word", "Toxic Word"),
        ("toxic_phrase", "Toxic Phrase"),
        ("positive", "Positive"),
        ("spam_keyword", "Spam Keyword"),
        ("hf_ai", "HF Toxicity AI"),
        ("groq_ai", "Groq LLM"),
        ("hf_ai_high_toxicity", "HF High Toxicity"),
        ("hf_ai_clean", "HF Clean"),
        ("hf_ai_uncertain", "HF Uncertain"),
        ("vader_ai_high_toxicity", "Vader High Toxicity"),
        ("vader_ai_clean", "Vader Clean"),
        ("vader_ai_uncertain", "Vader Uncertain"),
        ("fallback_vader_delete", "Fallback Vader Delete"),
        ("fallback_vader_keep", "Fallback Vader Keep"),
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
    reason = models.CharField(max_length=255, choices=REASON_CHOICES)
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

class Subscription(models.Model):
    TIER_CHOICES = [
        ('free', 'Free Tier (50 comments/mo)'),
        ('starter', 'Starter ($15/mo - 5,000 comments)'),
        ('pro', 'Pro ($49/mo - Unlimited & Multi-Account)'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='free')
    stripe_customer_id = models.CharField(max_length=100, blank=True, null=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True, null=True)
    payment_provider = models.CharField(max_length=30, blank=True, default="")
    paypal_order_id = models.CharField(max_length=100, blank=True, null=True)
    paypal_capture_id = models.CharField(max_length=100, blank=True, null=True)
    polar_subscription_id = models.CharField(max_length=100, blank=True, null=True)
    polar_customer_id = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    comments_processed_this_month = models.IntegerField(default=0)
    current_period_end = models.DateTimeField(null=True, blank=True)

    def max_comments(self):
        if self.tier == 'pro':
            return "Unlimited"
        elif self.tier == 'starter':
            return 5000
        return 50

    def can_process_more(self):
        if self.tier == 'pro':
            return True
        elif self.tier == 'starter':
            return self.comments_processed_this_month < 5000
        return self.comments_processed_this_month < 50

    def __str__(self):
        return f"{self.user.username} - {self.tier.upper()} ({'Active' if self.is_active else 'Inactive'})"

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('creator', 'Creator (Individual)'),
        ('brand', 'Brand or Agency'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='creator')
    instagram_handle = models.CharField(max_length=100, blank=True, null=True, help_text="Your primary Instagram handle (e.g. @username)")
    company_name = models.CharField(max_length=100, blank=True, null=True, help_text="Company or Agency Name (optional)")

    def __str__(self):
        return f"{self.user.username}'s profile"

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    profile, created = UserProfile.objects.get_or_create(user=instance)
    profile.save()
