#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, r'C:\Users\deves\OneDrive\Desktop\New folder\social_help\social_help')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_help.settings')
django.setup()

from comments.instagram_service import InstagramService
import requests

service = InstagramService()
print("=" * 60)
print("Testing shortcode extraction:")
url = "https://www.instagram.com/reel/DSmlxuYkqUn/?utm_source=ig_web_copy_link"
shortcode = service.extract_shortcode_from_url(url)
print(f"Extracted shortcode: {shortcode}")

print("\n" + "=" * 60)
print("Testing media ID resolution:")
media_id = service.get_media_id_from_shortcode(shortcode)
print(f"Media ID: {media_id}")

print("\n" + "=" * 60)
print("Testing Comments API with numeric media ID:")

comments_url = f"https://graph.facebook.com/v24.0/{media_id}/comments"
params = {
    'fields': 'id,text,username,timestamp,like_count',
    'access_token': service.access_token
}

response = requests.get(comments_url, params=params, timeout=5)
print(f"Comments API status: {response.status_code}")

if response.status_code == 200:
    data = response.json()
    print(f"Got {len(data.get('data', []))} comments!")
    for comment in data.get('data', [])[:3]:
        print(f"  - {comment['username']}: {comment['text'][:50]}")
else:
    print(f"Error response: {response.text[:500]}")
