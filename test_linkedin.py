#!/usr/bin/env python
import os
import sys
import django
import requests

# Add the project directory to the path
sys.path.insert(0, r'C:\Users\deves\OneDrive\Desktop\sicial_help\social_help\social_help')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_help.settings')
try:
    django.setup()
except Exception as e:
    print(f"Failed to setup Django: {e}")
    sys.exit(1)

from django.conf import settings

print("=" * 60)
print("LINKEDIN AUTOMATION DIAGNOSTIC CHECK")
print("=" * 60)

# Check Settings
token = getattr(settings, 'LINKEDIN_ACCESS_TOKEN', '')
author_id = getattr(settings, 'LINKEDIN_AUTHOR_ID', '')

print(f"LINKEDIN_ACCESS_TOKEN: {'[SET]' if token else '[MISSING]'}")
print(f"LINKEDIN_AUTHOR_ID: {author_id if author_id else '[MISSING]'}")
print("-" * 60)

if not token or not author_id:
    print("[ERROR] LinkedIn credentials are not configured in your settings or .env file.")
    print("Please add the following to your .env file:")
    print("  LINKEDIN_ACCESS_TOKEN=your_access_token_here")
    print("  LINKEDIN_AUTHOR_ID=your_author_id_here (e.g. urn:li:person:XXXX or urn:li:organization:XXXX)")
    sys.exit(1)

# Check API Connectivity
print("Testing connectivity to LinkedIn API...")
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "X-Restli-Protocol-Version": "2.0.0"
}

# 1. Verify token by requesting the member profile /me
me_url = "https://api.linkedin.com/v2/me"
try:
    response = requests.get(me_url, headers=headers, timeout=10)
    print(f"Profile API Response Status: {response.status_code}")

    if response.status_code == 200:
        profile = response.json()
        name = f"{profile.get('localizedFirstName', '')} {profile.get('localizedLastName', '')}".strip()
        profile_id = profile.get('id', '')
        print(f"[OK] Success! Connected to LinkedIn as member: {name} (ID: {profile_id})")
        
        expected_urn = f"urn:li:person:{profile_id}"
        if author_id != expected_urn:
            print(f"\n[WARNING] Configured LINKEDIN_AUTHOR_ID ({author_id}) does not match profile URN ({expected_urn}).")
            print("If you are publishing to a Person account, they should match.")
            print("If you are publishing to an Organization/Page, ignore this warning.")
    else:
        print(f"[ERROR] Could not verify token with /v2/me API. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        print("\nTrying alternative Userinfo API (/v2/userinfo)...")
        userinfo_url = "https://api.linkedin.com/v2/userinfo"
        res_userinfo = requests.get(userinfo_url, headers=headers, timeout=10)
        if res_userinfo.status_code == 200:
            ui = res_userinfo.json()
            profile_id = ui.get('sub', '')
            print(f"[OK] Success! Connected to LinkedIn via /userinfo: {ui.get('name')} (ID: {profile_id})")
            
            expected_urn = f"urn:li:person:{profile_id}"
            if author_id != expected_urn:
                print(f"\n[WARNING] Configured LINKEDIN_AUTHOR_ID ({author_id}) does not match profile URN ({expected_urn}).")
                print("If you are publishing to a Person account, they should match.")
                print(f"To fix this, update LINKEDIN_AUTHOR_ID in your .env file to: {expected_urn}")
                print("If you are publishing to an Organization/Page, ignore this warning.")
        else:
            print(f"[ERROR] Alternate check failed: {res_userinfo.status_code} - {res_userinfo.text}")
except Exception as e:
    print(f"[ERROR] Network/Connection error: {e}")

print("=" * 60)
