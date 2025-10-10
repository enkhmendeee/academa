# Fly.io Deployment Guide

## Prerequisites
1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Login to Fly.io: `fly auth login`
3. Set up your environment variables

## Environment Variables Setup

Set these environment variables in Fly.io:

```bash
# Database (Supabase PostgreSQL)
fly secrets set DATABASE_URL="your-postgresql-connection-string"
fly secrets set DIRECT_URL="your-direct-connection-string"

# JWT Secret
fly secrets set JWT_SECRET="your-jwt-secret-key"

# Server Configuration
fly secrets set NODE_ENV="production"
```

## Deployment Commands

1. **Initial deployment:**
   ```bash
   fly deploy
   ```

2. **Check app status:**
   ```bash
   fly status
   ```

3. **View logs:**
   ```bash
   fly logs
   ```

4. **Open app in browser:**
   ```bash
   fly open
   ```

## Database Migrations

Migrations will run automatically during deployment via the `release_command` in `fly.toml`.

To run migrations manually:
```bash
fly ssh console
npx prisma migrate deploy
```

## Troubleshooting

1. **Check app logs:** `fly logs`
2. **SSH into container:** `fly ssh console`
3. **Check environment variables:** `fly ssh console -c "env"`
4. **Restart app:** `fly apps restart academaa`
