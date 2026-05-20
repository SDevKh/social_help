import time
import random
import argparse

def login(username, password):
    print(f"Logging in as {username}...")
    cl = Client()
    cl.login(username, password)
    print("Login successful!")
    return cl

def auto_comment(cl, post_urls, comments):
    for url in post_urls:
        try:
            print(f"\nProcessing post: {url}")
            media_pk = cl.media_pk_from_url(url)
            
            comment_text = random.choice(comments)
            
            print(f"Attempting to post comment: '{comment_text}'")
            comment = cl.media_comment(media_pk, comment_text)
            
            print(f"Successfully commented! Comment ID: {comment.pk}")
            
            sleep_time = random.uniform(10, 20)
            print(f"Sleeping for {sleep_time:.2f} seconds before next action to avoid rate limits...")
            time.sleep(sleep_time)
            
        except Exception as e:
            print(f"Failed to comment on {url}. Error: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Instagram Auto-Comment Bot")
    parser.add_argument("-u", "--username", required=True, help="Instagram username")
    parser.add_argument("-p", "--password", required=True, help="Instagram password")
    parser.add_argument("--urls", nargs="+", required=True, help="List of Instagram post URLs to comment on")
    parser.add_argument("--comments", nargs="+", required=True, help="List of comments to choose from (randomly selected)")
    
    args = parser.parse_args()
    
    cl = login(args.username, args.password)
    auto_comment(cl, args.urls, args.comments)
