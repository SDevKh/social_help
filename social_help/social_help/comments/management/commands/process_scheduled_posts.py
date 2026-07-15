from django.core.management.base import BaseCommand
from django.utils import timezone
from social_help.comments.models import ScheduledPost
from social_help.comments.views import simulate_publish_post

class Command(BaseCommand):
    help = "Processes and publishes scheduled posts that are due."

    def handle(self, *args, **options):
        now = timezone.now()
        # Query all scheduled posts whose scheduled_at time is in the past (or present)
        # and whose status is 'scheduled'
        posts_to_publish = ScheduledPost.objects.filter(
            status="scheduled",
            scheduled_at__lte=now
        )
        
        count = posts_to_publish.count()
        self.stdout.write(f"Found {count} scheduled post(s) due for publication at {now}.")

        for post in posts_to_publish:
            self.stdout.write(f"Processing post ID {post.id} (Creator: {post.user.username})...")
            try:
                simulate_publish_post(post)
                # Refetch post to see final status
                post.refresh_from_db()
                if post.status == "published":
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Successfully published post {post.id}. External IDs: {post.external_ids}"
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.ERROR(
                            f"Failed to publish post {post.id}. Error: {post.error_message}"
                        )
                    )
            except Exception as e:
                post.status = "failed"
                post.error_message = str(e)
                post.save()
                self.stdout.write(
                    self.style.ERROR(
                        f"Exception raised while publishing post {post.id}: {e}"
                    )
                )

        self.stdout.write("Finished processing scheduled posts.")
