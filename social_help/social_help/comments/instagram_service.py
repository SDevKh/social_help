import re
import random
import requests
from django.conf import settings
from django.core.cache import cache
from .models import Comment, ModerationSetting, AutoReplyRule
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

class InstagramTokenExpiredException(Exception):
    """Exception raised when the Instagram access token has expired or is invalid."""
    pass


class InstagramService:
    def __init__(self, account=None):
        self.account = account
        if account:
            self.page_token = account.page_access_token
            self.ig_business_id = account.ig_business_id
            self.page_id = getattr(account, "page_id", "")
            auth_method = getattr(account, "auth_method", "")
        else:
            self.page_token = getattr(settings, "INSTAGRAM_PAGE_ACCESS_TOKEN", "")
            self.ig_business_id = getattr(settings, "INSTAGRAM_BUSINESS_ACCOUNT_ID", "")
            self.page_id = getattr(settings, "INSTAGRAM_PAGE_ID", "")
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
        is_token_expired = False
        expired_msg = ""
        try:
            res = requests.get(url, params=params, timeout=10)
            if "application/json" not in res.headers.get("Content-Type", ""):
                print(f"[ERROR] Non-JSON response ({res.status_code}): {res.text[:200]}")
                return None
            data = res.json()
            if "error" in data:
                err_msg = data["error"].get("message", "")
                err_code = data["error"].get("code")
                err_type = data["error"].get("type")
                
                # Check for token expiration / invalidation
                if err_code == 190 or err_type == "OAuthException" or "access token" in err_msg.lower() or "session has expired" in err_msg.lower():
                    is_token_expired = True
                    expired_msg = err_msg
                else:
                    print("[ERROR] Meta API Error:", err_msg)
                    return None
            else:
                return data
        except Exception as e:
            print("[ERROR] API Request Failed:", e)
            return None

        if is_token_expired:
            raise InstagramTokenExpiredException(f"Instagram access token has expired or is invalid: {expired_msg}")
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
            return {"error": "No Instagram Business account linked or token expired. Please connect your account."}

        shortcode = self.extract_shortcode(post_input)
        media_id = shortcode if shortcode.isdigit() else self.get_media_id(shortcode)

        if not media_id:
            print("[WARN] Media ID not found for shortcode:", shortcode)
            return {"error": "We could not find this post. Please verify the link is correct and belongs to your connected Instagram account."}

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
        words_cleaned = set(re.findall(r"\b\w+\b", text_lower))

        # Common sarcastic phrases and patterns
        sarcastic_phrases = [
            "yeah right", "sure", "obviously", "clearly", "totally",
            "definitely", "absolutely", "of course", "no way",
            "great job", "well done", "nice one", "brilliant",
            "oh really", "really", "wow", "amazing", "fantastic",
            "love it", "so good", "best ever", "perfect",
            "what a genius", "good job ruining", "as if", "so excited for nothing",
            "not upto the mark", "not up to the mark", "groundbreaking content",
            "cure for insomnia", "thanks for reminding me", "scroll button exists",
        ]

        # Sarcastic indicators (often paired with negative context)
        sarcastic_indicators = [
            "not", "never", "always", "everyone", "nobody",
            "obviously", "clearly", "surely", "definitely", "should",
            "thanks", "thank you", "wow", "truly", "really"
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
                score += 0.4

        # Check for sarcastic indicators near negative words
        negative_words = [
            "bad", "worst", "terrible", "awful", "hate", "stupid", "idiot",
            "fail", "wrong", "exist", "exists", "world", "ruin", "garbage",
            "trash", "boring", "bored", "insomnia", "sleep", "snooze", "dull",
            "pointless", "useless", "waste", "annoying", "reminding", "scroll",
            "button"
        ]
        for indicator in sarcastic_indicators:
            for neg in negative_words:
                if indicator in text_lower and neg in text_lower:
                    score += 0.35

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
                score += 0.25

        unicode_sarcastic_emojis = [
            "\U0001f644", "\U0001f612", "\U0001f60f", "\U0001f921",
            "\U0001f480", "\U0001f602", "\U0001f923", "\U0001f44f",
            "\U0001f44d"
        ]
        for emoji in unicode_sarcastic_emojis:
            if emoji in text:
                score += 0.25

        # Contrast detection: positive words near negative words
        positive_words = [
            "love", "great", "amazing", "awesome", "perfect", "best", "good",
            "nice", "wow", "groundbreaking", "brilliant", "genius", "thanks",
            "thank", "truly", "cure"
        ]
        has_positive = any(w in words_cleaned or w in text_lower for w in positive_words)
        has_negative = any(w in words_cleaned or w in text_lower for w in negative_words)
        if has_positive and has_negative:
            score += 0.35

        backhanded_compliment_patterns = [
            r"\b(wow|amazing|great|brilliant|groundbreaking|genius)\b.{0,90}\b(insomnia|sleep|snooze|boring|dull|waste|trash|scroll)\b",
            r"\b(thanks|thank you)\b.{0,90}\b(reminding|scroll|exist|exists|boring|waste)\b",
            r"\b(cure for|solution for)\b.{0,40}\b(insomnia|sleep)\b",
        ]
        if any(re.search(pattern, text_lower) for pattern in backhanded_compliment_patterns):
            score += 0.55

        confidence = min(score, 1.0)
        return {"detected": confidence > 0.5, "confidence": round(confidence, 2)}

    def analyze_with_vader(self, text, enable_sarcasm=True, sarcasm_threshold=0.5):
        try:
            analyzer = SentimentIntensityAnalyzer()
            vs = analyzer.polarity_scores(text)
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
                sarcasm_detected = (sarcasm_confidence > 0.0) and (sarcasm_confidence >= sarcasm_threshold)

            toxicity_score = vs['neg'] 
            if sentiment == "negative":
                toxicity_score = max(toxicity_score, 0.4)
                
            if sarcasm_detected:
                toxicity_score += 0.45
                if sarcasm_confidence >= 0.75:
                    toxicity_score = max(toxicity_score, 0.85)

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

    def analyze_toxicity_hf(self, text):
        """
        Call Hugging Face Inference API for toxicity classification (unitary/toxic-bert).
        Returns a score between 0.0 and 1.0, or None if the request fails.
        """
        if not text or not text.strip():
            return 0.0

        hf_key = getattr(settings, "HUGGINGFACE_API_KEY", "")
        headers = {}
        if hf_key:
            headers["Authorization"] = f"Bearer {hf_key}"

        api_url = "https://api-inference.huggingface.co/models/unitary/toxic-bert"
        payload = {"inputs": text}

        try:
            res = requests.post(api_url, headers=headers, json=payload, timeout=8)
            if res.ok:
                data = res.json()
                if isinstance(data, list) and len(data) > 0:
                    first_item = data[0]
                    if isinstance(first_item, list):
                        for item in first_item:
                            if item.get("label") == "toxic":
                                return round(item.get("score", 0.0), 2)
                        scores = [item.get("score", 0.0) for item in first_item if item.get("label") not in ("non-toxic", "clean", "neutral")]
                        if scores:
                            return round(max(scores), 2)
                    elif isinstance(first_item, dict):
                        if "score" in first_item:
                            return round(first_item.get("score", 0.0), 2)
            else:
                if res.status_code == 503:
                    print("[WARN] HF Toxicity API model is loading...")
        except Exception as e:
            print(f"[WARN] HF Toxicity API request failed: {e}")

        return None

    def resolve_comment_with_groq(self, text):
        """
        Resolve an uncertain comment using Groq LLM (llama-3.1-8b-instant).
        Returns a tuple: (decision, reason)
        """
        groq_key = getattr(settings, "GROQ_API_KEY", "")
        if not groq_key:
            print("[WARN] GROQ_API_KEY not configured. Falling back to local heuristics.")
            return self._resolve_comment_groq_fallback(text)

        api_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an expert Instagram comment moderation AI. "
                        "Determine if the comment should be kept or deleted. "
                        "Keep positive, neutral, standard user feedback, constructiveness, and friendly banter. "
                        "Delete profanity, harassment, spam, severe toxicity, and insults. "
                        "Respond ONLY in valid JSON format with keys: 'decision' (must be either 'keep' or 'delete') "
                        "and 'reason' (a brief explanation of your decision)."
                    )
                },
                {
                    "role": "user",
                    "content": f"Analyze this comment:\n\"{text}\""
                }
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.0,
            "max_tokens": 100,
        }

        try:
            res = requests.post(api_url, headers=headers, json=payload, timeout=10)
            if res.ok:
                resp_data = res.json()
                content = resp_data["choices"][0]["message"]["content"]
                import json
                result = json.loads(content)
                decision = result.get("decision", "keep").strip().lower()
                reason = result.get("reason", "Groq LLM analysis")
                if decision not in ("keep", "delete"):
                    decision = "keep"
                return decision, f"groq_llm: {reason}"
            else:
                print(f"[ERROR] Groq API returned error {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[ERROR] Groq API call failed: {e}")

        return self._resolve_comment_groq_fallback(text)

    def _resolve_comment_groq_fallback(self, text):
        """
        Fallback heuristic resolution when Groq is unavailable.
        """
        analysis = self.analyze_with_vader(text, enable_sarcasm=True)
        if analysis and analysis.get("decision") == "delete":
            return "delete", "fallback_vader_delete"
        return "keep", "fallback_vader_keep"

    def is_likely_hinglish_or_hindi(self, text):
        """
        Detects if text contains Devanagari (Hindi script) or common Hinglish
        transliterated words and patterns.
        """
        # Devanagari script range for Hindi
        if re.search(r'[\u0900-\u097F]', text):
            return True

        # Common Hinglish stopwords, pronouns, and verbs
        hinglish_markers = {
            "main", "nhi", "nahi", "hai", "ko", "se", "me", "mein", "pe", "bhi", "toh",
            "aur", "ek", "kya", "kyu", "kyon", "aise", "tum", "aap", "rha", "raha",
            "rahi", "kr", "kro", "karo", "de", "do", "dena", "le", "lo", "sasta",
            "saste", "krdunga", "kardunga", "kam", "daam", "paisey", "paise", "rupay",
            "rupye", "yaar", "bhai", "kuch", "bohot", "bahut", "wala", "wali", "wale",
            "hoga", "hogi", "kar", "ki", "ka"
        }
        words = set(re.findall(r'\b\w+\b', text.lower()))
        return not words.isdisjoint(hinglish_markers)

    def analyze_hinglish_and_keywords_with_groq(self, text, keywords):
        """
        Uses Groq LLM to check if a comment (especially in Hindi/Hinglish)
        contains toxic content or matches custom keywords/themes semantically.
        """
        groq_key = getattr(settings, "GROQ_API_KEY", "")
        if not groq_key:
            return None

        keywords_list = [k.strip() for k in keywords if k.strip()]

        api_url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json",
        }

        prompt = (
            "You are an expert multilingual social media comment moderation AI. "
            "Analyze the given comment which may be in English, Hindi, or Hinglish "
            "(Hindi written in the Latin/English alphabet, e.g. 'saste me', 'krdunga', 'nhi').\n\n"
        )
        if keywords_list:
            prompt += f"Blocked Keywords/Themes: {', '.join(keywords_list)}\n\n"

        prompt += (
            "Tasks:\n"
            "1. Detect if the comment contains or refers to any of the blocked keywords/themes "
            "directly or semantically, including their Hinglish/Hindi translations or transliterations.\n"
            "2. Detect if the comment is promotional/spam (e.g., offering cheap services like 'saste me krdunga', "
            "hijacking comments, self-promotion, asking to DM, or link-sharing) or highly toxic (abusive/harassment/hate speech) in Hindi or Hinglish.\n\n"
            "Respond ONLY with a valid JSON object containing these keys:\n"
            "- 'is_spam_or_toxic': boolean (true if it matches any blocked keywords/themes or is promotional/spam/toxic in Hinglish/Hindi)\n"
            "- 'matched_keyword': string or null (the matched keyword, or category like 'spam' / 'toxicity')\n"
            "- 'reason': string (a short, clear explanation in English, e.g., 'Matches Hinglish translation of key: cheap' or 'Promotional Hinglish spam')"
        )

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Analyze this comment:\n\"{text}\""}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.0,
            "max_tokens": 150,
        }

        try:
            res = requests.post(api_url, headers=headers, json=payload, timeout=10)
            if res.ok:
                import json
                resp_data = res.json()
                content = resp_data["choices"][0]["message"]["content"]
                return json.loads(content)
            else:
                print(f"[ERROR] Groq Hinglish API returned error {res.status_code}: {res.text}")
        except Exception as e:
            print(f"[ERROR] Groq Hinglish API call failed: {e}")

        return None

    def scan_comment(self, text, user=None):
        if user:
            settings_obj = ModerationSetting.objects.filter(user=user).first() or ModerationSetting.objects.create(user=user)
        else:
            settings_obj = ModerationSetting.objects.first() or ModerationSetting.objects.create()

        threshold = getattr(settings_obj, "toxicity_threshold", 0.6)
        enable_sarcasm = getattr(settings_obj, "enable_sarcasm_detection", True)
        sarcasm_threshold = getattr(settings_obj, "sarcasm_threshold", 0.5)

        text_lower = text.lower().strip()

        # 1. Custom Keywords (Highest Priority)
        for keyword in settings_obj.keyword_list():
            keyword = keyword.strip().lower()
            if keyword and keyword in text_lower:
                return {
                    "toxicity_score": 0.95, 
                    "decision": "delete", 
                    "reason": "spam_keyword", 
                    "sentiment": "negative", 
                    "sarcasm_detected": False, 
                    "sarcasm_confidence": 0.0
                }

        # 2. Comprehensive English & Hindi/Hinglish Profanity Lexicon
        toxic_words = [
            "hate", "idiot", "stupid", "scam", "fake", "kill", "die", "garbage", 
            "terrible", "shit", "fuck", "fucker", "fucking", "bitch", "asshole", 
            "bastard", "cunt", "slut", "whore", "motherfucker", "dick", "pussy", 
            "hell", "disgusting", "trash", "loser", "moron", "retard", "scum",
            "randi", "raand", "bhenchod", "bc", "madarchod", "mc", "chutiya", 
            "bhosdike", "bsdk", "bhosdi", "saala", "saale", "kutta", "kutte", 
            "kamina", "kaminey", "haramkhor", "gandu", "suar", "tatti", "hijra", 
            "kamine", "lodu", "lode", "laude", "bhadwa", "mutthal", "chinal"
        ]
        words_cleaned = set(re.findall(r'\b\w+\b', text_lower))
        if any(tw in words_cleaned for tw in toxic_words) or any(tw in text_lower.split() for tw in toxic_words):
            return {
                "toxicity_score": 0.95, 
                "decision": "delete", 
                "reason": "toxic_word", 
                "sentiment": "negative", 
                "sarcasm_detected": False, 
                "sarcasm_confidence": 0.0
            }

        # 3. Severe Toxic Phrases & Death Wishes
        severe_phrases = [
            "not upto the mark", "not up to the mark", "should not exist", 
            "should not exists", "kill yourself", "go to hell", "burn in hell", 
            "waste of life", "waste of space", "wish you were dead", "rot in hell",
            "worst ever", "utter garbage", "complete trash", "never exist"
        ]
        if any(phrase in text_lower for phrase in severe_phrases):
            return {
                "toxicity_score": 0.90, 
                "decision": "delete", 
                "reason": "toxic_phrase", 
                "sentiment": "negative", 
                "sarcasm_detected": False, 
                "sarcasm_confidence": 0.0
            }

        # 4. Promotional/Spam Phrases (e.g. "dm me to get the website", "check link in bio")
        promo_phrases = [
            "dm me to get", "dm me to", "dm me for", "dm us for", "dm for details",
            "dm to collab", "dm us to collab", "dm for collab", "check link in bio",
            "link in bio", "check my bio", "click the link", "get the website",
            "visit my website", "promo code", "discount code", "use code", "buy now",
            "visit my page", "check out my page", "check out my profile",
            "follow me for", "free guide", "free ebook", "check link",
            "send me a message", "message me to get", "dm me", "dm us", "in bio", "mai saste mai kardunga"
        ]
        if any(phrase in text_lower for phrase in promo_phrases):
            try:
                analyzer = SentimentIntensityAnalyzer()
                vs = analyzer.polarity_scores(text)
                compound = vs['compound']
                if compound <= -0.05:
                    sentiment = "negative"
                elif compound >= 0.05:
                    sentiment = "positive"
                else:
                    sentiment = "neutral"
            except Exception:
                sentiment = "neutral"
            return {
                "toxicity_score": 0.85, 
                "decision": "delete", 
                "reason": "spam_keyword", 
                "sentiment": sentiment, 
                "sarcasm_detected": False, 
                "sarcasm_confidence": 0.0
            }

        # 4b. AI Hinglish and Keyword Semantic check using Groq
        groq_key = getattr(settings, "GROQ_API_KEY", "")
        if groq_key:
            is_hinglish = self.is_likely_hinglish_or_hindi(text)
            has_keywords = any(k.strip() for k in settings_obj.keyword_list())
            if is_hinglish or has_keywords:
                groq_result = self.analyze_hinglish_and_keywords_with_groq(text, settings_obj.keyword_list())
                if groq_result and groq_result.get("is_spam_or_toxic"):
                    matched_kw = groq_result.get("matched_keyword")
                    reason = groq_result.get("reason", "Hinglish AI detected spam/toxicity")
                    return {
                        "toxicity_score": 0.95,
                        "decision": "delete",
                        "reason": f"groq_hinglish: {reason}",
                        "sentiment": "negative",
                        "sarcasm_detected": False,
                        "sarcasm_confidence": 0.0
                    }

        # 5. Hugging Face Toxicity Model & Fallback
        score = self.analyze_toxicity_hf(text)
        
        # Run local VADER/sarcasm anyway to keep metadata enriched
        vader_analysis = self.analyze_with_vader(text, enable_sarcasm=enable_sarcasm, sarcasm_threshold=sarcasm_threshold)
        sentiment = vader_analysis["sentiment"] if vader_analysis else "neutral"
        sarcasm_detected = vader_analysis["sarcasm_detected"] if vader_analysis else False
        sarcasm_confidence = vader_analysis["sarcasm_confidence"] if vader_analysis else 0.0

        if score is None:
            score = vader_analysis["toxicity_score"] if vader_analysis else 0.5
            source = "vader_ai"
        else:
            source = "hf_ai"

        if vader_analysis and vader_analysis.get("sarcasm_detected"):
            vader_score = vader_analysis.get("toxicity_score", 0.0)
            if vader_score >= threshold:
                score = max(score, vader_score)
                source = "vader_ai"

        # Determine decision based on threshold and margin
        margin = 0.15
        lower_bound = max(0.0, threshold - margin)
        upper_bound = min(1.0, threshold + margin)

        if score >= upper_bound:
            decision = "delete"
            reason = f"{source}_high_toxicity"
        elif score < lower_bound:
            decision = "keep"
            reason = f"{source}_clean"
        else:
            decision = "review"
            reason = f"{source}_uncertain"

        return {
            "toxicity_score": round(score, 2),
            "decision": decision,
            "reason": reason,
            "sentiment": sentiment,
            "sarcasm_detected": sarcasm_detected,
            "sarcasm_confidence": sarcasm_confidence,
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

    def reply_to_comment(self, comment_id, message):
        if not comment_id or not message:
            return {"success": False, "error": "comment_id and message are required"}
        url = f"{self.base_url}/{comment_id}/replies"
        params = {
            "message": message,
            "access_token": self.page_token
        }
        try:
            res = requests.post(url, data=params, timeout=10)
            data = res.json()
            if "error" in data:
                print(f"[ERROR] Failed to reply to Instagram comment {comment_id}: {data['error']['message']}")
                return {"success": False, "error": data["error"]["message"]}
            print(f"[INFO] Successfully replied to Instagram comment {comment_id}")
            return {"success": True, "id": data.get("id")}
        except Exception as e:
            print(f"[ERROR] Reply request failed: {e}")
            return {"success": False, "error": str(e)}

    def resolve_page_id(self, account=None):
        if not self.page_token or not self.ig_business_id:
            return None
        
        # Query Facebook Pages linked to this access token
        url = "me/accounts"
        data = self.api_get(url)
        if not data or "data" not in data:
            return None
            
        for page in data["data"]:
            page_id = page.get("id")
            page_token = page.get("access_token")
            # Query if this Page owns the Instagram Business Account
            check_url = f"{page_id}"
            check_data = self.api_get(check_url, params={"fields": "instagram_business_account"})
            if check_data and "instagram_business_account" in check_data:
                ig_id = check_data["instagram_business_account"].get("id")
                if ig_id == self.ig_business_id:
                    self.page_id = page_id
                    # Update database if account model is provided
                    if account:
                        account.page_id = page_id
                        if account.auth_method == "direct_token":
                            account.page_access_token = page_token
                            self.page_token = page_token
                            self.access_token = page_token
                        account.save()
                    return page_id
        return None

    def send_private_reply(self, comment_id, message):
        if not getattr(self, "page_id", ""):
            # Try to resolve the Page ID dynamically and update database
            resolved_page_id = self.resolve_page_id(account=getattr(self, "account", None))
            if not resolved_page_id:
                print("[ERROR] Page ID is not configured and could not be resolved. Cannot send private reply (DM).")
                return {"success": False, "error": "Facebook Page ID not configured."}
        if not comment_id or not message:
            return {"success": False, "error": "comment_id and message are required"}
        
        url = f"https://graph.facebook.com/v20.0/{self.ig_business_id}/messages"
        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "access_token": self.page_token
        }
        payload = {
            "recipient": {
                "comment_id": comment_id
            },
            "message": {
                "text": message
            }
        }
        try:
            res = requests.post(url, params=params, json=payload, headers=headers, timeout=10)
            data = res.json()
            if "error" in data:
                print(f"[ERROR] Failed to send DM reply to comment {comment_id}: {data['error']['message']}")
                return {"success": False, "error": data["error"]["message"]}
            print(f"[INFO] Successfully sent private reply (DM) to comment {comment_id}")
            return {"success": True, "id": data.get("message_id")}
        except Exception as e:
            print(f"[ERROR] Send DM reply request failed: {e}")
            return {"success": False, "error": str(e)}

    def get_instagram_username(self):
        if not hasattr(self, "_instagram_username"):
            self._instagram_username = None
            if self.page_token and self.ig_business_id:
                cache_key = f"ig_username_{self.ig_business_id}"
                cached = cache.get(cache_key)
                if cached:
                    self._instagram_username = cached
                else:
                    data = self.api_get(f"{self.ig_business_id}", {"fields": "username"})
                    if data and "username" in data:
                        username = data["username"]
                        self._instagram_username = username
                        cache.set(cache_key, username, timeout=86400)
        return self._instagram_username

    def scan_instagram_comments(self, post_url, user=None, prefetched_comments=None):
        comments = prefetched_comments if prefetched_comments is not None else self.fetch_comments(post_url)
        if isinstance(comments, dict) and "error" in comments:
            return comments

        results = []

        auto_reply_rules = []
        if user:
            auto_reply_rules = list(AutoReplyRule.objects.filter(user=user))

        for comment in comments:
            comment_text = comment.get("text") or comment.get("message", "")
            if not comment_text:
                continue

            comment_id = comment.get("id")
            if comment_id and Comment.objects.filter(instagram_id=comment_id).exists():
                print(f"[INFO] Skipping already processed comment: {comment_id}")
                continue

            # Skip comments made by the owner themselves
            comment_username = comment.get("username", "")
            owner_username = self.get_instagram_username()
            if comment_username and owner_username and comment_username.lower() == owner_username.lower():
                print(f"[INFO] Skipping owner's own comment: {comment_username}")
                continue

            analysis = self.scan_comment(comment_text, user=user)

            replied = False
            reply_id = None
            reply_type_sent = None
            if auto_reply_rules and analysis["decision"] != "delete":
                comment_text_lower = comment_text.lower()
                current_shortcode = self.extract_shortcode(post_url)
                current_media_id = current_shortcode if current_shortcode.isdigit() else self.get_media_id(current_shortcode)

                for rule in auto_reply_rules:
                    rule_post_id = getattr(rule, "instagram_post_id", None)
                    if rule_post_id and rule_post_id.strip():
                        target_post = rule_post_id.strip()
                        target_shortcode = self.extract_shortcode(target_post)
                        if target_shortcode not in (current_shortcode, current_media_id):
                            continue

                    trigger = rule.trigger_keyword.strip().lower()
                    if trigger and (re.search(rf"\b{re.escape(trigger)}\b", comment_text_lower) or trigger in comment_text_lower):
                        rule_type = getattr(rule, "reply_type", "public")
                        if rule_type == "dm":
                            reply_res = self.send_private_reply(comment["id"], rule.reply_text)
                        else:
                            reply_res = self.reply_to_comment(comment["id"], rule.reply_text)
                        if reply_res.get("success"):
                            replied = True
                            reply_id = reply_res.get("id")
                            reply_type_sent = rule_type
                            break

            results.append({
                "instagram_id": comment["id"],
                "username": comment.get("username", ""),
                "timestamp": comment.get("timestamp", ""),
                "comment_text": comment_text,
                "deleted": False,
                "replied": replied,
                "reply_id": reply_id,
                "reply_type": reply_type_sent,
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
