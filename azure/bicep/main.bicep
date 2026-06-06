targetScope = 'resourceGroup'

@description('Name of the Web App')
param webAppName string

@description('Location for all resources')
param location string = resourceGroup().location

@description('App Service Plan SKU')
param appServicePlanSkuName string = 'B1'

@description('App Service plan OS')
param osType string = 'Linux'

@description('Python version to set as an app setting')
param pythonVersion string = '3.12'

@description('Enable HTTPS only')
param httpsOnly bool = true

var sku = {
  name: appServicePlanSkuName
  tier: appServicePlanSkuName == 'F1' ? 'Free' : 'Basic'
}

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${webAppName}-plan'
  location: location
  sku: {
    name: appServicePlanSkuName
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource web 'Microsoft.Web/sites@2023-12-01' = {
  name: webAppName
  location: location
  kind: 'app,linux,container'
  properties: {
    httpsOnly: httpsOnly
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'PYTHON|${pythonVersion}'
      ftpsState: 'Disabled'
    }
  }
}

// Default app settings placeholders.
// You must update secrets and production values after deployment.
resource webAppConfig 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: web
  name: 'appsettings'
  properties: {
    // Django
    'DJANGO_SETTINGS_MODULE': 'social_help.settings'
    'PYTHON_VERSION': pythonVersion
    'DEBUG': 'false'
    'ALLOWED_HOSTS': ''
    'SECRET_KEY': ''

    // Database
    // If you set DATABASE_URL, settings.py uses dj_database_url.
    // Leaving empty will fall back to sqlite.
    'DATABASE_URL': ''

    // Static
    'STATIC_ROOT': ''

    // Instagram / Stripe / PayPal (fill after deployment)
    'INSTAGRAM_APP_ID': ''
    'INSTAGRAM_APP_SECRET': ''
    'INSTAGRAM_PAGE_ID': ''
    'INSTAGRAM_BUSINESS_ACCOUNT_ID': ''
    'INSTAGRAM_ACCESS_TOKEN': ''
    'INSTAGRAM_PAGE_ACCESS_TOKEN': ''
    'INSTAGRAM_REDIRECT_URI': ''

    // Facebook OAuth
    'FACEBOOK_APP_ID': ''
    'FACEBOOK_APP_SECRET': ''
    'FACEBOOK_OAUTH_REDIRECT_URI': ''

    'STRIPE_PUBLIC_KEY': ''
    'STRIPE_SECRET_KEY': ''
    'STRIPE_WEBHOOK_SECRET': ''

    // Polar
    'POLAR_ACCESS_TOKEN': ''
    'POLAR_ORGANIZATION_ID': ''
    'POLAR_WEBHOOK_SECRET': ''
    'POLAR_API_BASE_URL': 'https://api.polar.sh/v1'

    'PAYPAL_CLIENT_ID': ''
    'PAYPAL_CLIENT_SECRET': ''
    'PAYPAL_MODE': 'sandbox'
    'DOMAIN_URL': ''

    // Django CSRF
    'CSRF_TRUSTED_ORIGINS': ''

    // Make sure startup uses our gunicorn + migrate script.
    // App Service uses the STARTUP_COMMAND app setting on Linux.
    'WEBSITE_RUN_FROM_PACKAGE': '0'
  }
}

// Startup command for Linux App Service
// We prefer to use the repository's existing script.
resource webStartup 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: web
  name: 'config'
  properties: {
    // Keep as a setting in case platform expects it here.
  }
}

