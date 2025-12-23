# GitHub Actions Workflows

This directory contains GitHub Actions workflows for the Entoo2 Web application.

## Available Workflows

### 1. CI Workflow (`ci.yml`)

**Trigger:** Automatic on push/pull request to `main` branch

**Purpose:** Continuous Integration - runs tests, linting, and builds

**Jobs:**
- Tests, linting, and building (check existing ci.yml for details)

### 2. Deploy Workflow (`deploy.yml`)

**Trigger:** Manual (workflow_dispatch)

**Purpose:** Builds Docker image and deploys to Hetzner server

**Jobs:**
- Build and push Docker image to GitHub Container Registry (GHCR)
- SSH into Hetzner server
- Pull latest image
- Restart frontend service

## Setup Instructions

### Prerequisites

1. **GitHub Container Registry Access**
   - Go to Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"
   - Save changes

2. **Repository Secrets**

   Add these secrets in Settings → Secrets and variables → Actions:

   - `SSH_HOST`: Your Hetzner server IP address (e.g., `123.45.67.89`)
   - `SSH_USER`: SSH username (e.g., `root` or `deploy`)
   - `SSH_PRIVATE_KEY`: Private SSH key for authentication

### Generating SSH Key

```bash
# Generate a new SSH key pair
ssh-keygen -t ed25519 -C "github-actions-entoo2-web" -f ~/.ssh/github_deploy_web

# Display private key (copy to GitHub secret SSH_PRIVATE_KEY)
cat ~/.ssh/github_deploy_web

# Display public key (add to server's ~/.ssh/authorized_keys)
cat ~/.ssh/github_deploy_web.pub
```

**Note:** You can use the same SSH key for both API and Web repositories.

### Server Setup

Ensure your Hetzner server has:

1. Docker and Docker Compose installed
2. Deployment directory at `/opt/entoo2`
3. `docker-compose.prod.yml` file
4. `.env.production` file with all required variables
5. Public SSH key added to `~/.ssh/authorized_keys`

## Using the Deploy Workflow

### Manual Deployment

1. Go to the repository on GitHub
2. Click "Actions" tab
3. Select "Deploy to Hetzner" workflow
4. Click "Run workflow" button
5. Select environment (production/staging)
6. Click "Run workflow"

### What Happens During Deployment

1. **Build Phase**
   - Checks out code
   - Sets up Docker Buildx
   - Logs into GitHub Container Registry
   - Builds Docker image (includes npm install and SvelteKit build)
   - Pushes image to GHCR with tags:
     - `latest` (for main branch)
     - Branch name
     - Commit SHA

2. **Deploy Phase**
   - Connects to server via SSH
   - Navigates to `/opt/entoo2`
   - Pulls latest frontend image
   - Restarts frontend service with zero-downtime
   - Verifies service is running

3. **Cleanup Phase**
   - Removes SSH key from runner
   - Notifies deployment status

## Docker Image Tags

Images are tagged with multiple tags for flexibility:

- `ghcr.io/USERNAME/entoo2-web:latest` - Latest main branch build
- `ghcr.io/USERNAME/entoo2-web:main` - Main branch
- `ghcr.io/USERNAME/entoo2-web:main-abc123` - Commit SHA
- `ghcr.io/USERNAME/entoo2-web:v1.0.0` - Semantic version (if tagged)

## Troubleshooting

### Build Fails

**Issue:** npm install or build fails

**Solutions:**
- Check package.json for syntax errors
- Verify all dependencies are compatible
- Check build logs for specific errors
- Test build locally: `npm run build`

### Deployment Fails at SSH Step

**Issue:** Cannot connect to server

**Solutions:**
- Verify `SSH_HOST` secret is correct
- Verify `SSH_USER` secret is correct
- Verify `SSH_PRIVATE_KEY` is the full private key including headers
- Test SSH connection manually
- Check server firewall allows SSH (port 22)

### Image Pull Fails on Server

**Issue:** Cannot pull image from GHCR

**Solutions:**
- Ensure package is public, or login to GHCR on server
- Verify image exists in GitHub Packages
- Check network connectivity on server

### Frontend Shows Old Version

**Issue:** Deployed but browser shows old version

**Solutions:**
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache
- Check if service actually restarted: `docker ps`
- Verify correct image tag is running: `docker images | grep entoo2-web`

### Service Won't Start

**Issue:** Docker container fails to start

**Solutions:**
- Check logs: `docker compose -f docker-compose.prod.yml logs frontend`
- Verify environment variables in `.env.production`
- Ensure backend is running: `docker compose ps backend`
- Check disk space: `df -h`
- Verify build succeeded and image contains built files

## Environment Variables

The frontend uses these environment variables (set in `.env.production`):

- `PUBLIC_API_URL`: API endpoint (usually `/api/v1` with Traefik)
- `NODE_ENV`: Should be `production`

Build-time variables must be prefixed with `PUBLIC_` to be available in the browser.

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use `PUBLIC_` prefix only for non-sensitive vars
   - Keep API keys and secrets on backend only

2. **SSH Keys**
   - Use separate keys for different services
   - Rotate keys periodically
   - Use Ed25519 keys for better security

3. **Docker Images**
   - Keep images private if containing proprietary code
   - Use multi-stage builds (already implemented)
   - Scan for vulnerabilities regularly

4. **Client-Side Security**
   - Never expose sensitive data in client code
   - Use HTTPS only (enforced by Traefik)
   - Implement CSP headers if needed

## Monitoring Deployments

### View Deployment Logs

- Go to Actions → Select workflow run
- Click on job to see detailed logs
- Check "Deploy to Hetzner" step for SSH output

### Verify Deployment on Server

```bash
# SSH into server
ssh user@SERVER_IP

# Check running containers
docker ps

# View frontend logs
docker logs entoo2-frontend -f

# Check service health
docker compose -f docker-compose.prod.yml ps frontend

# Test frontend response
curl -I http://localhost:3000
```

### Test in Browser

1. Open `https://your-domain.com`
2. Check browser console for errors
3. Verify API calls work
4. Check Network tab for failed requests

## Rolling Back

If a deployment causes issues:

```bash
# SSH into server
ssh user@SERVER_IP

cd /opt/entoo2

# List available images
docker images | grep entoo2-web

# Update .env.production to use previous tag
nano .env.production
# Change IMAGE_TAG to previous version

# Restart with previous image
docker compose -f docker-compose.prod.yml up -d frontend
```

## Performance Optimization

The Docker build uses:

- **Multi-stage builds**: Smaller production image
- **Production dependencies only**: `npm install --omit=dev`
- **Pre-built assets**: SvelteKit build runs during image build
- **Node Alpine**: Smaller base image

## Coordinating API and Web Deployments

When deploying breaking changes:

1. Deploy backend first (new API)
2. Ensure backward compatibility if possible
3. Deploy frontend second (uses new API)
4. Monitor both services

For non-breaking changes, deploy in any order.

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Docker Documentation](https://docs.docker.com/)
- [GHCR Documentation](https://docs.github.com/en/packages)
- [Main Deployment Guide](../../../DEPLOYMENT.md)
