# Gardenplace

## About

At this stage, Gardenplace is a personal exercise and demo masquerading as an app offering social media for gardeners.

## Frontend: Manual Testing

```bash
cd frontend
yarn
yarn run build --mode=development --env.development
cd dist
python3.8 -m http.server
```

## Frontend: Debugging in VS Code (launch.json)

```json
{
    "name": "Attach to Chrome",
    "type": "chrome",
    "request": "attach",
    "port": 9222,
    "url": "127.0.0.1",
    "webRoot": "${workspaceFolder}/frontend"
}
```

## Frontend: Production Build

```bash
cd frontend
yarn
yarn run build --mode=production --env.production
```

## AWS Deployment (Manual)

After manually killing the old server processes, adjust the following variables accordingly and create the deployment.
```bash
ARTIFACT_S3_BUCKET=codepipeline-us-east-2-478458351072
ARTIFACT_KEY=gardenplace/BuildArtif/wVK9PKg
aws deploy create-deployment --application-name gardenplace --deployment-group-name gardenplace-production --revision "revisionType=S3,s3Location={bucket="$ARTIFACT_S3_BUCKET",key="$ARTIFACT_KEY",bundleType=zip}" --ignore-application-stop-failures
```

## Renew Certificates (must run on ec2 instance hosting server)

```
certbot renew
```

## Install Certbot and Update Certificate

```
sudo wget -r --no-parent -A 'epel-release-*.rpm' http://dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/
sudo rpm -Uvh dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/epel-release-*.rpm
sudo yum-config-manager --enable epel*
sudo certbot certonly --standalone
```

