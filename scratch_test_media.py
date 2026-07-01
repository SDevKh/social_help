import os
import sys
import django

# Add the project directory to the path
sys.path.insert(0, r'C:\Users\deves\OneDrive\Desktop\sicial_help\social_help\social_help')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'social_help.settings')
django.setup()

from social_help.comments.instagram_service import InstagramService

service = InstagramService()
print("=" * 60)
print(f"Business ID: {service.ig_business_id}")
print(f"Page Token: {service.page_token[:20]}...")

endpoint = f"{service.ig_business_id}/media"
params = {
    "fields": "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp",
    "limit": 5
}
data = service.api_get(endpoint, params)
print("\nAPI Response:")
print(data)
