from django.apps import AppConfig


class CommentsConfig(AppConfig):
    name = 'social_help.comments'

    def ready(self):
        from .scanner import start_background_scanner
        start_background_scanner()
