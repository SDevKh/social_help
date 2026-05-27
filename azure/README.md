# Azure deployment for social_help (Django)

This folder contains starter Azure artifacts to deploy this Django app to **Azure App Service (Linux)** using **Gunicorn**.

## What’s included
- `bicep/main.bicep` + `bicep/parameters.json` – creates App Service plan + Web App
- `appservice/appsettings.example.env` – example environment variables
- `github-actions/azure-webapp-deploy.yml` – CI/CD workflow to deploy code

## Deploy with Azure CLI (Bicep)
1) Install Azure CLI and login:
```bash
az login
```
2) Set these variables (edit as needed):
- subscriptionId
- resourceGroupName
- location
- webAppName

3) Create RG + deploy:
```bash
az deployment group create \
  --resource-group <resourceGroupName> \
  --template-file ./bicep/main.bicep \
  --parameters ./bicep/parameters.json \
  --parameters webAppName=<webAppName>
```

Note: the included `parameters.json` uses placeholders; you must fill in values.

## Configure app settings
After provisioning, set the Web App configuration App Settings:
- `SECRET_KEY`
- `DEBUG` ("false" recommended for production)
- `ALLOWED_HOSTS`
- `DATABASE_URL` (optional; if omitted it falls back to SQLite)
- Instagram / Facebook / Stripe / PayPal secrets

Example values are in:
- `appservice/appsettings.example.env`

## Deploy application code
Recommended options:
1) GitHub Actions workflow (see `github-actions/azure-webapp-deploy.yml`)
2) Manual zip deploy / publish from Visual Studio Code

The workflow expects standard Azure authentication secrets in GitHub:
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_WEBAPP_NAME`
- `AZURE_RESOURCE_GROUP`

## Gunicorn entrypoint
This project already runs Gunicorn via `social_help/start.sh`:
- runs migrations
- starts `gunicorn social_help.wsgi:application`

These deployment artifacts set an App Service startup command consistent with that.

