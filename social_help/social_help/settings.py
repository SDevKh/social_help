from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

try:
    from dotenv import load_dotenv

    load_dotenv(BASE_DIR.parent / ".env")
    load_dotenv(BASE_DIR / ".env", override=True)
except ImportError:
    pass

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-w#vq%^4p^b3dl4@6rlxu0wo4ilwk=g@o@q6qha^th!o50g9&)l')

DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = ['social-help.onrender.com', 'localhost', '127.0.0.1', 'socialhelp.ai', 'socialhelpapp.com', 'getsocialhelp.com', '.vercel.app', 'socialfuse.azurewebsites.net', '.azurewebsites.net', 'socialfuse-eybzczb3e8gcg0c2.southeastasia-01.azurewebsites.net', '.southeastasia-01.azurewebsites.net', '169.254.129.4']

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
        'DIRS': [],
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
    'default': dj_database_url.config(
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

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
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

FACEBOOK_APP_ID = "YOUR_WORKING_APP_ID_HERE" 
FACEBOOK_APP_SECRET = "YOUR_WORKING_APP_SECRET_HERE" 
FACEBOOK_OAUTH_REDIRECT_URI = os.getenv("FACEBOOK_OAUTH_REDIRECT_URI", INSTAGRAM_REDIRECT_URI)

LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/dashboard/'
LOGOUT_REDIRECT_URL = '/'

SESSION_COOKIE_SAMESITE = 'Lax'

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
GUMROAD_CREATOR_PLAN_URL = os.getenv("GUMROAD_CREATOR_PLAN_URL", "https://gumroad.com/l/creator_plan")
GUMROAD_AGENCY_PLAN_URL = os.getenv("GUMROAD_AGENCY_PLAN_URL", "https://gumroad.com/l/agency_plan")
