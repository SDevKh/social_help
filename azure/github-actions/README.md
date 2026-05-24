# GitHub Actions: Azure Web App deploy

This workflow deploys the repo as a zip to an Azure **App Service (Linux)** Web App.

## Required GitHub secrets
Create these repository secrets:
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET` (used implicitly by azure/login; add if needed by your auth setup)
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_RESOURCE_GROUP`
- `AZURE_WEBAPP_NAME`

## Notes
- The workflow zips the repo and deploys via `azure/webapps-deploy`.
- `.env` and database files are excluded.
- After deployment, Gunicorn should start using the App Service startup command.

