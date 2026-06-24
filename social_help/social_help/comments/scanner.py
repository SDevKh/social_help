import time
import threading
import logging
from django.conf import settings
from django.utils import timezone
from django.core.cache import cache
from django.db import close_old_connections
from .models import InstagramAccount, Subscription, AutoReplyRule
from .instagram_service import InstagramService, InstagramTokenExpiredException

logger = logging.getLogger(__name__)

def scan_account_posts(account):
    """
    Scan posts configured by the user (tracked posts and auto-reply targets),
    moderate new comments and auto-reply, then cache the status.
    """
    logger.info(f"Scanning posts for user {account.user.username}...")
    
    # Check subscription limit first
    sub, _ = Subscription.objects.get_or_create(user=account.user, defaults={'tier': 'free'})
    if sub and not sub.can_process_more():
        msg = f"Monthly limit reached ({sub.comments_processed_this_month} / {sub.max_comments()} comments). Please upgrade your plan."
        cache.set(f"last_scan_error_{account.user.id}", msg, timeout=86400)
        logger.warning(f"User {account.user.username} has reached subscription limit. Skipping scan.")
        return []

    service = InstagramService(account=account)
    
    # Gather posts the user gave to the system
    post_inputs = set()
    
    # 1. From AutoReplyRules
    rules = AutoReplyRule.objects.filter(user=account.user)
    for rule in rules:
        p_id = rule.instagram_post_id
        if p_id:
            post_inputs.add(p_id.strip())

    # 2. From manually scanned posts cached list
    cache_key_tracked = f"tracked_posts_{account.user.id}"
    manually_scanned = cache.get(cache_key_tracked) or []
    for p_id in manually_scanned:
        if p_id:
            post_inputs.add(p_id.strip())

    media_list = []
    for post_input in post_inputs:
        shortcode = service.extract_shortcode(post_input)
        if not shortcode:
            continue
        media_id = shortcode if shortcode.isdigit() else service.get_media_id(shortcode)
        if media_id:
            permalink = f"https://www.instagram.com/p/{shortcode}/"
            # Get latest permalink from API if possible, else use constructed one
            media_data = service.api_get(f"{media_id}", {"fields": "permalink"})
            if media_data and "permalink" in media_data:
                permalink = media_data["permalink"]
            media_list.append({"id": media_id, "permalink": permalink})

    if not media_list:
        logger.info(f"No targeted posts to scan for user {account.user.username}")
        # Cache empty list to avoid showing old scans
        cache_key_time = f"last_scan_time_{account.user.id}"
        cache_key_posts = f"recent_scanned_posts_{account.user.id}"
        cache.set(cache_key_time, timezone.now().strftime("%I:%M:%S %p"), timeout=86400)
        cache.set(cache_key_posts, [], timeout=86400)
        cache.delete(f"last_scan_error_{account.user.id}")
        return []

    recent_scanned = []
    total_new_comments = 0

    for media in media_list:
        media_id = media.get("id")
        permalink = media.get("permalink", "")
        if media_id:
            logger.info(f"Auto-scanning comments for media: {media_id}")
            
            # Fetch comments once
            comments_fetched = service.fetch_comments(media_id)
            total_comments = 0
            new_comments = 0
            
            if isinstance(comments_fetched, list):
                total_comments = len(comments_fetched)
                # Pass prefetched comments list to avoid duplicate API calls
                results = service.scan_instagram_comments(media_id, user=account.user, prefetched_comments=comments_fetched)
                if results and not isinstance(results, dict):
                    new_comments = len(results)
                    total_new_comments += new_comments
            elif isinstance(comments_fetched, dict) and "error" in comments_fetched:
                logger.warning(f"Error fetching comments for media {media_id}: {comments_fetched['error']}")
                continue
            
            recent_scanned.append({
                "id": media_id,
                "permalink": permalink,
                "scanned_at": timezone.now().strftime("%Y-%m-%d %H:%M:%S"),
                "new_comments": new_comments,
                "total_comments": total_comments
            })
    
    # Increment subscription count
    if total_new_comments > 0 and sub:
        sub.comments_processed_this_month += total_new_comments
        sub.save()

    # Cache results for this user
    cache_key_time = f"last_scan_time_{account.user.id}"
    cache_key_posts = f"recent_scanned_posts_{account.user.id}"
    cache.set(cache_key_time, timezone.now().strftime("%I:%M:%S %p"), timeout=86400)
    cache.set(cache_key_posts, recent_scanned, timeout=86400)
    cache.delete(f"last_scan_error_{account.user.id}") # Clear old error if successful
    logger.info(f"Successfully cached scan status for user {account.user.username}")
    return recent_scanned

def scan_all_accounts():
    """
    Fetch the last 5 posts for all connected Instagram accounts,
    scan their comments to automatically moderate and reply,
    and save stats to django cache.
    """
    logger.info("Starting background auto-scan of recent posts...")
    try:
        accounts = InstagramAccount.objects.all()
        for account in accounts:
            try:
                scan_account_posts(account)
            except InstagramTokenExpiredException as e:
                logger.error(f"Token expired/invalid for user {account.user.username}: {e}")
                cache.set(f"last_scan_error_{account.user.id}", str(e), timeout=86400)
            except Exception as e:
                logger.exception(f"Error scanning posts for user {account.user.username}: {e}")
                cache.set(f"last_scan_error_{account.user.id}", str(e), timeout=86400)
    except Exception as e:
        logger.exception(f"Error in scan_all_accounts: {e}")

def background_loop():
    # Wait for Django server startup to settle
    time.sleep(10)
    while True:
        try:
            close_old_connections()
            scan_all_accounts()
            close_old_connections()
        except Exception as e:
            logger.exception("Error in background loop execution")
        # Sleep for 60 seconds before next scan
        time.sleep(60)

def start_background_scanner():
    import os
    # Django auto-reloader spawns a child process. Start the thread in the main thread of the child process.
    if os.environ.get('RUN_MAIN') == 'true' or not settings.DEBUG:
        logger.info("Starting background scanner thread...")
        thread = threading.Thread(target=background_loop, daemon=True, name="InstagramAutoScanner")
        thread.start()
