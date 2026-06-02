import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "social_help.settings")
django.setup()

from django.contrib.auth.models import User
from social_help.comments.models import Subscription, UserProfile

print("=== Users & Subscriptions ===")
for user in User.objects.all():
    profile = getattr(user, 'profile', None)
    sub = getattr(user, 'subscription', None)
    print(f"User: {user.username} | Email: {user.email}")
    if profile:
        print(f"  Profile: role={profile.role}, handle={profile.instagram_handle}")
    if sub:
        print(f"  Subscription: tier={sub.tier}, active={sub.is_active}, comments={sub.comments_processed_this_month}, provider={sub.payment_provider}, polar_sub_id={sub.polar_subscription_id}")
    else:
        print("  Subscription: None")
