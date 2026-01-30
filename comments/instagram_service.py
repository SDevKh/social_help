import requests
import random
from django.conf import settings
from django.core.cache import cache
from .models import Comment, ModerationSetting


class InstagramService:
    def __init__(self):
        self.page_token = getattr(settings, "INSTAGRAM_PAGE_ACCESS_TOKEN", "")
        self.ig_business_id = getattr(settings, "INSTAGRAM_BUSINESS_ACCOUNT_ID", "")
        self.base_url = "https://graph.facebook.com/v19.0"

    # ============================
    # CORE API REQUEST HANDLER
    # ============================

    def api_get(self, endpoint, params=None):
        if params is None:
            params = {}

        params["access_token"] = self.page_token
        url = f"{self.base_url}/{endpoint}"

        try:
            res = requests.get(url, params=params, timeout=10)
            data = res.json()

            if "error" in data:
                print("❌ Meta API Error:", data["error"]["message"])
                return None

            return data
        except Exception as e:
            print("❌ API Request Failed:", e)
            return None

    # ============================
    # SHORTCODE EXTRACTION
    # ============================

    def extract_shortcode(self, input_value):
        import re

        if input_value.isdigit():
            return input_value

        pattern = r"(?:https?://)?(?:www\.)?instagram\.com/(?:p|reel|tv)/([a-zA-Z0-9_-]+)"
        match = re.search(pattern, input_value)

        if match:
            shortcode = match.group(1)
            print(f"✅ Extracted shortcode: {shortcode}")
            return shortcode

        print(f"⚠️ Using raw shortcode: {input_value}")
        return input_value

    # ============================
    # MEDIA ID RESOLUTION (WITH CACHE)
    # ============================

    def get_media_id(self, shortcode):
        cache_key = f"ig_media_{shortcode}"
        cached = cache.get(cache_key)

        if cached:
            print(f"⚡ Media ID from cache: {cached}")
            return cached

        print("🔍 Searching media for shortcode...")

        endpoint = f"{self.ig_business_id}/media"
        params = {"fields": "id,permalink", "limit": 50}

        while True:
            data = self.api_get(endpoint, params)
            if not data:
                return None

            media_list = data.get("data", [])
            print(f"📦 Checking {len(media_list)} posts...")

            for media in media_list:
                if shortcode in media.get("permalink", ""):
                    media_id = media["id"]
                    print(f"🎯 Found Media ID: {media_id}")

                    cache.set(cache_key, media_id, timeout=3600)  # 1 hour cache
                    return media_id

            paging = data.get("paging", {})
            next_url = paging.get("next")

            if not next_url:
                break

            endpoint = next_url.replace(self.base_url + "/", "")
            params = None

        print("❌ Media not found")
        return None

    # ============================
    # FETCH ALL COMMENTS (PAGINATION)
    # ============================

    def fetch_comments(self, post_input):
        print("\n==============================")
        print("📥 Fetching Instagram Comments")

        if not self.page_token or not self.ig_business_id:
            print("❌ Missing token or IG Business ID")
            return self.get_demo_comments(post_input)

        shortcode = self.extract_shortcode(post_input)

        media_id = shortcode if shortcode.isdigit() else self.get_media_id(shortcode)

        if not media_id:
            print("⚠️ Media ID not found, using demo comments")
            return self.get_demo_comments(post_input)

        all_comments = []
        endpoint = f"{media_id}/comments"
        params = {"fields": "id,text,username,timestamp,like_count", "limit": 50}

        while True:
            data = self.api_get(endpoint, params)
            if not data:
                break

            comments = data.get("data", [])
            all_comments.extend(comments)

            paging = data.get("paging", {})
            next_url = paging.get("next")

            if not next_url:
                break

            endpoint = next_url.replace(self.base_url + "/", "")
            params = None

        print(f"✅ Total real comments fetched: {len(all_comments)}")
        return all_comments

    # ============================
    # DEMO COMMENTS
    # ============================

    def get_demo_comments(self, post_id):
        demo_comments = [
            {"id": f"{post_id}_1", "text": "Amazing post!", "username": "user1", "timestamp": "2024-01-01T10:00:00Z"},
            {"id": f"{post_id}_2", "text": "This is stupid", "username": "user2", "timestamp": "2024-01-01T10:05:00Z"},
            {"id": f"{post_id}_3", "text": "Love it ❤️", "username": "user3", "timestamp": "2024-01-01T10:10:00Z"},
            {"id": f"{post_id}_4", "text": "Fake content", "username": "user4", "timestamp": "2024-01-01T10:15:00Z"},
        ]
        return random.sample(demo_comments, random.randint(2, 4))

    # ============================
    # MODERATION ENGINE (UPGRADED)
    # ============================

    def scan_comment(self, text):
        settings_obj = ModerationSetting.objects.first() or ModerationSetting.objects.create()
        text_lower = text.lower().strip()

        # 1️⃣ HARD TOXIC WORDS (always delete)
        toxic_words = [
            "hate", "idiot", "stupid", "scam", "fake", "kill", "die",
            "garbage", "terrible", "shit", "fuck", "bitch", "asshole"
        ]

        if any(word in text_lower for word in toxic_words):
            return {"toxicity_score": 0.95, "decision": "delete", "reason": "toxic_word"}

        # 2️⃣ POSITIVE WORDS (always keep)
        positive_words = [
            "good", "nice", "great", "awesome", "love", "amazing", "wow", "cool", "beautiful"
        ]

        if any(word in text_lower for word in positive_words):
            return {"toxicity_score": 0.05, "decision": "keep", "reason": "positive"}

        # 3️⃣ SPAM KEYWORDS (from DB)
        spam_keywords = settings_obj.keyword_list()

        for keyword in spam_keywords:
            keyword = keyword.strip().lower()

            # 🚨 prevent accidental blocking of positive words
            if keyword in positive_words:
                continue

            if keyword and keyword in text_lower:
                return {"toxicity_score": 0.9, "decision": "delete", "reason": "spam_keyword"}

        # 4️⃣ AI SCORING (soft negativity)
        score = 0.1
        soft_negative = ["bad", "worst", "poor", "ugly", "boring"]

        if any(word in text_lower for word in soft_negative):
            score = 0.4

        threshold = settings_obj.toxicity_threshold or 0.6
        decision = "delete" if score >= threshold else "keep"

        return {"toxicity_score": round(score, 2), "decision": decision, "reason": "ai"}


    def delete_comment(self, comment_id):
        url = f"https://graph.facebook.com/v19.0/{comment_id}"

        res = requests.delete(url, params={
            "access_token": self.page_token
        })

        print("DELETE STATUS:", res.status_code)
        print("DELETE RESPONSE:", res.text)

        return res.status_code == 200

    def scan_instagram_comments(self, post_url):
        comments = self.fetch_comments(post_url)
        results = []
    
        for comment in comments:
            analysis = self.scan_comment(comment["text"])
    
            # 🔥 AUTO DELETE LOGIC
            if analysis["decision"] == "delete":
                deleted = self.delete_comment(comment["id"])
            else:
                deleted = False
    
            results.append({
                "instagram_id": comment["id"],
                "username": comment["username"],
                "timestamp": comment["timestamp"],
                "comment_text": comment["text"],
                "deleted": deleted,
                **analysis
            })
    
            Comment.objects.create(
                comment_text=comment["text"],
                toxicity_score=analysis["toxicity_score"],
                decision=analysis["decision"],
                reason=analysis["reason"],
                instagram_id=comment["id"]
            )
    
        return results
    
    