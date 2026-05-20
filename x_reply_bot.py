import time
import random
import argparse
import tweepy

def setup_client(access_token=None, access_token_secret=None):
    print("Authenticating with X (Twitter) API...")
    
    import os
    
    # Use environment variables instead of hardcoded keys to prevent security leaks
    consumer_key = os.getenv("TWITTER_CONSUMER_KEY", "")
    consumer_secret = os.getenv("TWITTER_CONSUMER_SECRET", "")
    
    if not access_token:
        access_token = os.getenv("TWITTER_ACCESS_TOKEN", "")
    if not access_token_secret:
        access_token_secret = os.getenv("TWITTER_ACCESS_TOKEN_SECRET", "")
    
    client = tweepy.Client(
        consumer_key=consumer_key,
        consumer_secret=consumer_secret,
        access_token=access_token,
        access_token_secret=access_token_secret
    )
    return client

def extract_tweet_id(url_or_id):
    """
    Extracts the tweet ID from a full X/Twitter URL or just returns the ID if passed directly.
    Example URL: https://x.com/username/status/1234567890
    """
    if url_or_id.isdigit():
        return url_or_id
    
    # Split by '/' and get the last part, ignoring any query parameters like ?s=20
    parts = url_or_id.split('/')
    if 'status' in parts:
        status_index = parts.index('status')
        tweet_id_part = parts[status_index + 1]
        # Remove query params if any (e.g. 123456?s=20)
        return tweet_id_part.split('?')[0]
    
    return None

def auto_reply(client, tweet_targets, replies):
    for target in tweet_targets:
        tweet_id = extract_tweet_id(target)
        if not tweet_id:
            print(f"Could not extract Tweet ID from: {target}")
            continue
            
        try:
            print(f"\nProcessing Tweet ID: {tweet_id}")
            # Select a random reply from the provided list
            reply_text = random.choice(replies)
            
            print(f"Attempting to post reply: '{reply_text}'")
            
            # Post the reply using X API v2
            response = client.create_tweet(
                text=reply_text, 
                in_reply_to_tweet_id=tweet_id
            )
            
            print(f"Successfully replied! New Tweet ID: {response.data['id']}")
            
            # Sleep to prevent rate-limiting by X (Free tier has strict limits)
            sleep_time = random.uniform(5, 15)
            print(f"Sleeping for {sleep_time:.2f} seconds before next action...")
            time.sleep(sleep_time)
            
        except tweepy.errors.TweepyException as e:
            print(f"X API Error on {tweet_id}: {e}")
        except Exception as e:
            print(f"Unexpected error on {tweet_id}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="X (Twitter) Auto-Reply Bot")
    
    parser.add_argument("--access-token", required=False, help="X API Access Token")
    parser.add_argument("--access-token-secret", required=False, help="X API Access Token Secret")
    
    parser.add_argument("--targets", nargs="+", required=True, help="List of X post URLs or Tweet IDs to reply to")
    parser.add_argument("--replies", nargs="+", required=True, help="List of replies to choose from (randomly selected)")
    
    args = parser.parse_args()
    
    client = setup_client(
        access_token=args.access_token, 
        access_token_secret=args.access_token_secret
    )
    
    auto_reply(client, args.targets, args.replies)
