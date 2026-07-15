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
    live_mode = models.BooleanField(default=True, help_text="Turn Live Mode On/Off for auto-reply and DMs")

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

class AutoReplyRule(models.Model):
    REPLY_TYPE_CHOICES = [
        ("public", "Public Comment"),
        ("dm", "Direct Message (DM)"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='auto_reply_rules')
    trigger_keyword = models.CharField(max_length=100, help_text="Keyword that triggers the auto-reply (case-insensitive)")
    reply_text = models.TextField(help_text="The message or link to reply with")
    reply_type = models.CharField(
        max_length=10,
        choices=REPLY_TYPE_CHOICES,
        default="public",
        help_text="Whether to reply publicly or send a private DM"
    )
    instagram_post_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Optional Instagram Post ID or Shortcode. If set, this rule will only trigger on comments of this post."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.trigger_keyword} -> {self.reply_text[:30]} ({self.reply_type})"

class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, help_text="URL-friendly short name (e.g. introducing-socialfuse)")
    excerpt = models.TextField(help_text="Short summary shown in the blog grid")
    content_html = models.TextField(help_text="Full HTML content of the post")
    category = models.CharField(max_length=100, default="All")
    author = models.CharField(max_length=100, default="SocialFuse Team")
    date = models.DateField(help_text="Publication date shown to users")
    read_time = models.CharField(max_length=50, default="5 min read")
    image = models.CharField(max_length=50, default="📝", help_text="Emoji character or icon name for post image")
    image_file = models.ImageField(upload_to="blog_images/", blank=True, null=True, help_text="Upload an image file for the blog post")
    image_url = models.URLField(max_length=500, blank=True, null=True, help_text="Or specify an external image URL")
    featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class ScheduledPost(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("scheduled", "Scheduled"),
        ("publishing", "Publishing"),
        ("published", "Published"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="scheduled_posts")
    title = models.CharField(max_length=255, blank=True, null=True, help_text="Title of the post (required for Reddit/Quora, optional for others)")
    content = models.TextField(blank=True, null=True, help_text="Main text or caption of the post")
    
    # Platform Selections
    post_to_reddit = models.BooleanField(default=False, help_text="Publish to Reddit")
    post_to_quora = models.BooleanField(default=False, help_text="Publish to Quora")
    post_to_linkedin = models.BooleanField(default=False, help_text="Publish to LinkedIn")
    post_to_instagram = models.BooleanField(default=False, help_text="Publish to Instagram")
    post_to_facebook = models.BooleanField(default=False, help_text="Publish to Facebook")
    post_to_twitter = models.BooleanField(default=False, help_text="Publish to Twitter/X")
    
    # Media Options
    media_url = models.URLField(max_length=1000, blank=True, null=True, help_text="External URL of media (image/video)")
    media_file = models.ImageField(upload_to="scheduled_posts/", blank=True, null=True, help_text="Uploaded media file")
    
    # Execution Tracking
    scheduled_at = models.DateTimeField(blank=True, null=True, help_text="Time when the post should be published. If null, it is treated as a draft.")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    published_at = models.DateTimeField(blank=True, null=True, help_text="Actual time when publication finished")
    
    # Platform logs and ids
    external_ids = models.JSONField(default=dict, blank=True, help_text="IDs of published posts on each platform, e.g. {'reddit': 't3_abc123'}")
    error_message = models.TextField(blank=True, null=True, help_text="Error message if the post publication failed")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_at", "-created_at"]

    def __str__(self):
        title_str = self.title or (self.content[:30] if self.content else "Untitled")
        return f"{self.user.username} - {title_str} ({self.status})"

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

