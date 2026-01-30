#!/usr/bin/env python
import os
import sys
import django
import json

# Add the project directory to the path
sys.path.insert(0, r'C:\Users\deves\OneDrive\Desktop\New folder\social_help\social_help')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_help.settings')
django.setup()

from comments.instagram_service import InstagramService

service = InstagramService()

print("=" * 70)
print("TEST 1: Scanning with shortcode (full flow)")
print("=" * 70)
url = "https://www.instagram.com/reel/DSmlxuYkqUn/?utm_source=ig_web_copy_link"
results = service.scan_instagram_comments(url)
print(f"\n✓ Scan complete!")
print(f"  - Total results: {len(results)}")
print(f"  - Comment text: {results[0].get('comment_text', 'N/A')[:60] if results else 'No results'}")
print(f"  - Toxicity score: {results[0].get('toxicity_score', 'N/A') if results else 'N/A'}")
print(f"  - Decision: {results[0].get('decision', 'N/A') if results else 'N/A'}")
