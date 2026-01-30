#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, r'C:\Users\deves\OneDrive\Desktop\New folder\social_help\social_help')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_help.settings')
django.setup()

from comments.instagram_service import InstagramService

service = InstagramService()
print("=" * 60)
print("Testing get_business_account_id:")
account_id = service.get_business_account_id()
print(f"Business Account ID: {account_id}")

print("\n" + "=" * 60)
print("Testing find_media_id_by_shortcode:")
shortcode = "DSmlxuYkqUn"
media_id = service.find_media_id_by_shortcode(shortcode)
print(f"Found Media ID: {media_id}")

if media_id:
    print("\n" + "=" * 60)
    print(f"Testing get comments with media ID {media_id}:")
    comments = service.get_post_comments(media_id)
    print(f"Got {len(comments)} comments")
    for comment in comments[:3]:
        print(f"  - {comment.get('username', 'Unknown')}: {comment.get('text', '')[:50]}")
