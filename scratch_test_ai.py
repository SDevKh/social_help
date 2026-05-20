import os
import sys

# Setup Django environment
sys.path.append(r"c:\Users\deves\OneDrive\Desktop\sicial_help\social_help\social_help")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "social_help.settings")

import django
django.setup()

from comments.instagram_service import InstagramService

service = InstagramService()

test_comments = [
    "I absolutely love this product!",
    "This is the worst thing I have ever bought, garbage.",
    "Oh brilliant, another update that breaks everything.",
    "This is okay, nothing special."
]

for text in test_comments:
    print(f"\nAnalyzing: '{text}'")
    # analyze_with_vader does both sentiment and sarcasm check
    result = service.analyze_with_vader(text, enable_sarcasm=True)
    print("Result:", result)
