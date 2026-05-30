from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent
IS_CLOUD = bool(os.getenv("RENDER") or os.getenv("RENDER_EXTERNAL_HOSTNAME") or os.getenv("WEBSITE_SITE_NAME"))

try:
    from dotenv import load_dotenv

    load_dotenv(BASE_DIR.parent / ".env", override=True)
    load_dotenv(BASE_DIR / ".env", override=True)
except ImportError:
    pass

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-w#vq%^4p^b3dl4@6rlxu0wo4ilwk=g@o@q6qha^th!o50g9&)l')

DEBUG = os.getenv("DEBUG", "False" if IS_CLOUD else "True").lower() == "true"

allowed_hosts = os.getenv("ALLOWED_HOSTS", "")
if allowed_hosts:
    ALLOWED_HOSTS = [host.strip() for host in allowed_hosts.split(",") if host.strip()]
elif IS_CLOUD:
    ALLOWED_HOSTS = [".onrender.com", ".azurewebsites.net"]
    render_host = os.getenv("RENDER_EXTERNAL_HOSTNAME")
    azure_site_name = os.getenv("WEBSITE_SITE_NAME")
    if render_host:
        ALLOWED_HOSTS.append(render_host)
    if azure_site_name:
        ALLOWED_HOSTS.append(f"{azure_site_name}.azurewebsites.net")
else:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1", "[::1]"]

csrf_trusted_origins = os.getenv("CSRF_TRUSTED_ORIGINS", "")
if csrf_trusted_origins:
    CSRF_TRUSTED_ORIGINS = [
        origin.strip() for origin in csrf_trusted_origins.split(",") if origin.strip()
    ]
elif IS_CLOUD:
    CSRF_TRUSTED_ORIGINS = ["https://*.onrender.com", "https://*.azurewebsites.net"]
    render_host = os.getenv("RENDER_EXTERNAL_HOSTNAME")
    azure_site_name = os.getenv("WEBSITE_SITE_NAME")
    if render_host:
        CSRF_TRUSTED_ORIGINS.append(f"https://{render_host}")
    if azure_site_name:
        CSRF_TRUSTED_ORIGINS.append(f"https://{azure_site_name}.azurewebsites.net")

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'social_help.comments',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'social_help.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'frontend' / 'dist'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'social_help.wsgi.application'


DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        conn_health_checks=True,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    BASE_DIR / 'frontend' / 'dist',
]
if DEBUG:
    STATICFILES_STORAGE_BACKEND = 'django.contrib.staticfiles.storage.StaticFilesStorage'
else:
    STATICFILES_STORAGE_BACKEND = 'whitenoise.storage.CompressedStaticFilesStorage'

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": STATICFILES_STORAGE_BACKEND,
    },
}


INSTAGRAM_PAGE_ID = os.getenv("INSTAGRAM_PAGE_ID", "")
INSTAGRAM_BUSINESS_ACCOUNT_ID = os.getenv("INSTAGRAM_BUSINESS_ACCOUNT_ID", "")
INSTAGRAM_ACCESS_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
INSTAGRAM_PAGE_ACCESS_TOKEN  = os.getenv("INSTAGRAM_PAGE_ACCESS_TOKEN", "")

INSTAGRAM_APP_ID = os.getenv("INSTAGRAM_APP_ID", "")
INSTAGRAM_APP_SECRET = os.getenv("INSTAGRAM_APP_SECRET", "")
INSTAGRAM_REDIRECT_URI = os.getenv("INSTAGRAM_REDIRECT_URI", "http://localhost:8000/instagram/callback/")
INSTAGRAM_OAUTH_REDIRECT_URI = os.getenv("INSTAGRAM_OAUTH_REDIRECT_URI", "http://localhost:8000/instagram/oauth/callback/")

FACEBOOK_APP_ID = os.getenv("FACEBOOK_APP_ID", "")
FACEBOOK_APP_SECRET = os.getenv("FACEBOOK_APP_SECRET", "")
FACEBOOK_OAUTH_REDIRECT_URI = os.getenv("FACEBOOK_OAUTH_REDIRECT_URI", INSTAGRAM_REDIRECT_URI)

LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/dashboard/'
LOGOUT_REDIRECT_URL = '/'

SESSION_COOKIE_SAMESITE = 'Lax'

if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# PayPal Settings
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_MODE = os.getenv("PAYPAL_MODE", "sandbox")  # or "live"
DOMAIN_URL = os.getenv("DOMAIN_URL", "http://localhost:8000")

# Stripe Settings
STRIPE_PUBLIC_KEY = os.getenv("STRIPE_PUBLIC_KEY", "")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# Gumroad Settings
GUMROAD_CREATOR_PLAN_URL = os.getenv("GUMROAD_CREATOR_PLAN_URL", "https://socialfuse.gumroad.com/l/kokch")
GUMROAD_AGENCY_PLAN_URL = os.getenv("GUMROAD_AGENCY_PLAN_URL", "https://socialfuse.gumroad.com/l/bjlpkj")
GUMROAD_REDIRECT_URL = os.getenv("GUMROAD_REDIRECT_URL", f"{DOMAIN_URL}/dashboard/?payment=success")
GUMROAD_WEBHOOK_SECRET = os.getenv("GUMROAD_WEBHOOK_SECRET", "replace-with-secure-value")
