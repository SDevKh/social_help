import re
import random
import requests
from django.conf import settings
from django.core.cache import cache
from .models import Comment, ModerationSetting
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


class InstagramService:
    def __init__(self, account=None):
        if account:
            self.page_token = account.page_access_token
            self.ig_business_id = account.ig_business_id
            auth_method = getattr(account, "auth_method", "")
        else:
            self.page_token = getattr(settings, "INSTAGRAM_PAGE_ACCESS_TOKEN", "")
            self.ig_business_id = getattr(settings, "INSTAGRAM_BUSINESS_ACCOUNT_ID", "")
            auth_method = ""

        if auth_method == "instagram_login":
            self.base_url = "https://graph.instagram.com/v20.0"
        else:
            self.base_url = "https://graph.facebook.com/v20.0"

        self.access_token = self.page_token

    def api_get(self, endpoint, params=None):
        if params is None:
            params = {}
        params["access_token"] = self.page_token
        url = f"{self.base_url}/{endpoint}"
        try:
            res = requests.get(url, params=params, timeout=10)
            if "application/json" not in res.headers.get("Content-Type", ""):
                print(f"[ERROR] Non-JSON response ({res.status_code}): {res.text[:200]}")
                return None
            data = res.json()
            if "error" in data:
                print("[ERROR] Meta API Error:", data["error"]["message"])
                return None
            return data
        except Exception as e:
            print("[ERROR] API Request Failed:", e)
            return None

    def extract_shortcode(self, input_value):
        if input_value.isdigit():
            return input_value
        pattern = r"(?:https?://)?(?:www\.)?instagram\.com/(?:p|reel|tv)/([a-zA-Z0-9_-]+)"
        match = re.search(pattern, input_value)
        if match:
            shortcode = match.group(1)
            print(f"[INFO] Extracted shortcode: {shortcode}")
            return shortcode
        print(f"[WARN] Using raw shortcode: {input_value}")
        return input_value

    def extract_shortcode_from_url(self, url):
        return self.extract_shortcode(url)

    def get_media_id_from_shortcode(self, shortcode):
        return self.get_media_id(shortcode)

    def get_media_id(self, shortcode):
        cache_key = f"ig_media_{shortcode}"
        cached = cache.get(cache_key)
        if cached:
            print(f"[CACHE] Media ID from cache: {cached}")
            return cached

        print("[INFO] Searching media for shortcode...")
        endpoint = f"{self.ig_business_id}/media"
        params = {"fields": "id,permalink", "limit": 50}

        while True:
            data = self.api_get(endpoint, params)
            if not data:
                return None

            media_list = data.get("data", [])
            print(f"[INFO] Checking {len(media_list)} posts...")

            for media in media_list:
                if shortcode in media.get("permalink", ""):
                    media_id = media["id"]
                    print(f"[INFO] Found Media ID: {media_id}")
                    cache.set(cache_key, media_id, timeout=3600)
                    return media_id

            next_url = data.get("paging", {}).get("next")
            if not next_url:
                break
            endpoint = next_url.replace(self.base_url + "/", "")
            params = None

        print("[ERROR] Media not found")
        return None

    def fetch_comments(self, post_input):
        print("[INFO] Fetching Instagram Comments")

        if not self.page_token or not self.ig_business_id:
            print("[ERROR] Missing token or IG Business ID")
            return self.get_demo_comments(post_input)

        shortcode = self.extract_shortcode(post_input)
        media_id = shortcode if shortcode.isdigit() else self.get_media_id(shortcode)

        if not media_id:
            print("[WARN] Media ID not found, using demo comments")
            return self.get_demo_comments(post_input)

        all_comments = []
        endpoint = f"{media_id}/comments"
        params = {"fields": "id,text,username,timestamp,like_count", "limit": 50}

        while True:
            data = self.api_get(endpoint, params)
            if not data:
                break
            all_comments.extend(data.get("data", []))
            next_url = data.get("paging", {}).get("next")
            if not next_url:
                break
            endpoint = next_url.replace(self.base_url + "/", "")
            params = None

        print(f"[INFO] Total real comments fetched: {len(all_comments)}")
        return all_comments

    def get_demo_comments(self, post_id):
        demo_comments = [
            {"id": f"{post_id}_1", "text": "Amazing post!", "username": "user1", "timestamp": "2024-01-01T10:00:00Z"},
            {"id": f"{post_id}_2", "text": "This is stupid", "username": "user2", "timestamp": "2024-01-01T10:05:00Z"},
            {"id": f"{post_id}_3", "text": "Love it ❤️", "username": "user3", "timestamp": "2024-01-01T10:10:00Z"},
            {"id": f"{post_id}_4", "text": "Fake content", "username": "user4", "timestamp": "2024-01-01T10:15:00Z"},
        ]
        return random.sample(demo_comments, random.randint(2, 4))

    def detect_sarcasm(self, text):
        """
        Detect sarcasm using Hugging Face API with a local heuristic fallback.
        Returns: {"detected": bool, "confidence": float}
        """
        if not text or not text.strip():
            return {"detected": False, "confidence": 0.0}

        # Try Hugging Face API first
        try:
            headers = {"Content-Type": "application/json"}
            payload = {"inputs": text}
            sarcasm_resp = requests.post(
                "https://api-inference.huggingface.co/models/sail-sg/roberta-base-sarcasm-twitter",
                headers=headers, json=payload, timeout=10
            )
            if sarcasm_resp.ok and sarcasm_resp.json():
                result = sarcasm_resp.json()[0]
                if isinstance(result, list) and len(result) == 2:
                    confidence = result[1] / (result[0] + result[1])
                    return {"detected": confidence > 0.5, "confidence": round(confidence, 2)}
                elif isinstance(result, dict) and "score" in result:
                    confidence = result.get("score", 0.0)
                    return {"detected": confidence > 0.5, "confidence": round(confidence, 2)}
        except Exception as e:
            print(f"[WARN] HF sarcasm API failed, using fallback: {e}")

        # Local heuristic fallback
        return self._sarcasm_heuristic_fallback(text)

    def _sarcasm_heuristic_fallback(self, text):
        """
        Fallback sarcasm detection using keyword/phrase heuristics.
        """
        text_lower = text.lower().strip()

        # Common sarcastic phrases and patterns
        sarcastic_phrases = [
            "yeah right", "sure", "obviously", "clearly", "totally",
            "definitely", "absolutely", "of course", "no way",
            "great job", "well done", "nice one", "brilliant",
            "oh really", "really", "wow", "amazing", "fantastic",
            "love it", "so good", "best ever", "perfect",
        ]

        # Sarcastic indicators (often paired with negative context)
        sarcastic_indicators = [
            "not", "never", "always", "everyone", "nobody",
            "obviously", "clearly", "surely", "definitely",
        ]

        # Excessive punctuation often signals sarcasm
        excessive_punctuation = text.count("!") > 1 or text.count("?") > 1

        # ALL CAPS words can indicate sarcastic emphasis
        words = text.split()
        caps_words = [w for w in words if w.isupper() and len(w) > 1]
        caps_ratio = len(caps_words) / len(words) if words else 0

        score = 0.0

        # Check for direct sarcastic phrases
        for phrase in sarcastic_phrases:
            if phrase in text_lower:
                score += 0.25

        # Check for sarcastic indicators near negative words
        negative_words = ["bad", "worst", "terrible", "awful", "hate", "stupid", "idiot", "fail", "wrong"]
        for indicator in sarcastic_indicators:
            for neg in negative_words:
                if indicator in text_lower and neg in text_lower:
                    score += 0.3

        # Excessive punctuation boost
        if excessive_punctuation:
            score += 0.15

        # Caps ratio boost
        if caps_ratio > 0.3:
            score += 0.2

        # Emoji-based sarcasm signals
        sarcastic_emojis = ["🙄", "😒", "😏", "🤡", "💀", "😂", "🤣", "👏", "👍"]
        for emoji in sarcastic_emojis:
            if emoji in text:
                score += 0.2

        # Contrast detection: positive words near negative words
        positive_words = ["love", "great", "amazing", "awesome", "perfect", "best", "good", "nice"]
        has_positive = any(w in text_lower for w in positive_words)
        has_negative = any(w in text_lower for w in negative_words)
        if has_positive and has_negative:
            score += 0.25

        confidence = min(score, 1.0)
        return {"detected": confidence > 0.5, "confidence": round(confidence, 2)}

    def analyze_with_vader(self, text, enable_sarcasm=True, sarcasm_threshold=0.5):
        try:
            analyzer = SentimentIntensityAnalyzer()
            vs = analyzer.polarity_scores(text)
            
            # vs contains 'neg', 'neu', 'pos', 'compound'
            compound = vs['compound']
            
            if compound <= -0.05:
                sentiment = "negative"
            elif compound >= 0.05:
                sentiment = "positive"
            else:
                sentiment = "neutral"

            sarcasm_detected = False
            sarcasm_confidence = 0.0
            if enable_sarcasm:
                sarcasm_result = self.detect_sarcasm(text)
                sarcasm_confidence = sarcasm_result["confidence"]
                sarcasm_detected = sarcasm_confidence >= sarcasm_threshold

            # VADER's 'neg' score is exactly what we want for toxicity base
            toxicity_score = vs['neg'] 
            
            if sentiment == "negative":
                toxicity_score = max(toxicity_score, 0.4)
                
            if sarcasm_detected:
                toxicity_score += 0.3

            toxicity_score = min(toxicity_score, 1.0)

            return {
                "sentiment": sentiment,
                "sarcasm_detected": sarcasm_detected,
                "sarcasm_confidence": round(sarcasm_confidence, 2),
                "toxicity_score": round(toxicity_score, 2),
                "decision": "delete" if toxicity_score >= 0.6 else "keep",
                "reason": "vader_ai",
            }
        except Exception as e:
            print(f"[ERROR] Vader AI error: {e}")
            return None

    def scan_comment(self, text, user=None):
        if user:
            settings_obj = ModerationSetting.objects.filter(user=user).first() or ModerationSetting.objects.create(user=user)
        else:
            settings_obj = ModerationSetting.objects.first() or ModerationSetting.objects.create()

        enable_sarcasm = getattr(settings_obj, "enable_sarcasm_detection", True)
        sarcasm_threshold = getattr(settings_obj, "sarcasm_threshold", 0.5)

        analysis = self.analyze_with_vader(text, enable_sarcasm=enable_sarcasm, sarcasm_threshold=sarcasm_threshold)
        if analysis:
            return analysis

        text_lower = text.lower().strip()
        toxic_words = ["hate", "idiot", "stupid", "scam", "fake", "kill", "die", "garbage", "terrible", "shit", "fuck", "bitch", "asshole", "hell", "burn", "disgusting", "trash"]
        if any(word in text_lower for word in toxic_words):
            return {"toxicity_score": 0.95, "decision": "delete", "reason": "toxic_word", "sentiment": "negative", "sarcasm_detected": False, "sarcasm_confidence": 0.0}

        positive_words = ["good", "nice", "great", "awesome", "love", "amazing", "wow", "cool", "beautiful"]
        if any(word in text_lower for word in positive_words):
            return {"toxicity_score": 0.05, "decision": "keep", "reason": "positive", "sentiment": "positive", "sarcasm_detected": False, "sarcasm_confidence": 0.0}

        for keyword in settings_obj.keyword_list():
            keyword = keyword.strip().lower()
            if keyword in positive_words:
                continue
            if keyword and keyword in text_lower:
                return {"toxicity_score": 0.9, "decision": "delete", "reason": "spam_keyword", "sentiment": "negative", "sarcasm_detected": False, "sarcasm_confidence": 0.0}

        score = 0.7 if any(w in text_lower for w in ["bad", "worst", "poor", "ugly", "boring"]) else 0.1
        threshold = settings_obj.toxicity_threshold or 0.6
        return {
            "toxicity_score": round(score, 2),
            "decision": "delete" if score >= threshold else "keep",
            "reason": "ai",
            "sentiment": "neutral" if score < 0.3 else "negative",
            "sarcasm_detected": False,
            "sarcasm_confidence": 0.0,
        }

    def delete_comment(self, comment_id):
        res = requests.delete(
            f"https://graph.facebook.com/v19.0/{comment_id}",
            params={"access_token": self.page_token}
        )
        print("[INFO] DELETE STATUS:", res.status_code)
        return res.status_code == 200

    def delete_instagram_comment(self, instagram_id):
        try:
            success = self.delete_comment(instagram_id)
            if success:
                return {"success": True, "message": "Comment deleted on Instagram"}
            return {"success": False, "error": "Failed to delete comment on Instagram"}
        except Exception as exc:
            return {"success": False, "error": str(exc)}

    def scan_instagram_comments(self, post_url, user=None):
        comments = self.fetch_comments(post_url)
        results = []

        for comment in comments:
            comment_text = comment.get("text") or comment.get("message", "")
            if not comment_text:
                continue

            analysis = self.scan_comment(comment_text, user=user)

            results.append({
                "instagram_id": comment["id"],
                "username": comment.get("username", ""),
                "timestamp": comment.get("timestamp", ""),
                "comment_text": comment_text,
                "deleted": False,
                **analysis,
            })

            Comment.objects.create(
                user=user,
                comment_text=comment_text,
                toxicity_score=analysis["toxicity_score"],
                decision=analysis["decision"],
                reason=analysis["reason"],
                instagram_id=comment["id"],
                sentiment=analysis["sentiment"],
                sarcasm_detected=analysis["sarcasm_detected"],
                sarcasm_confidence=analysis["sarcasm_confidence"],
            )

        return results
