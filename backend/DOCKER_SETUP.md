# Docker Compose Setup Guide

## Prerequisites
- Docker and Docker Compose installed on your system
- Git (to clone the repository)

## Quick Start

### 1. Build and Start Services
\`\`\`bash
docker-compose up -d
\`\`\`

This will:
- Create and start PostgreSQL database
- Build and start Django backend
- Start pgAdmin for database management

### 2. Access Services

**Django API**: http://localhost:8000
**pgAdmin**: http://localhost:5050

### 3. View Database Tables in pgAdmin

1. Open http://localhost:5050 in your browser
2. Login with:
   - Email: `admin@example.com`
   - Password: `admin`

3. Add a new server:
   - Right-click "Servers" → "Create" → "Server"
   - **General Tab:**
     - Name: `invest_db`
   - **Connection Tab:**
     - Host name/address: `db`
     - Port: `5432`
     - Username: `postgres`
     - Password: `12345`
   - Click "Save"

4. Navigate to:
   - Servers → invest_db → Databases → invest_traker → Schemas → public → Tables
   - Here you can see all tables:
     - `accounts_customuser`
     - `accounts_inspection`
     - `accounts_newinspection`
     - And other Django tables

### 4. Run Django Commands

\`\`\`bash
# Create superuser
docker-compose exec web python manage.py createsuperuser

# Run migrations
docker-compose exec web python manage.py migrate

# Collect static files
docker-compose exec web python manage.py collectstatic --noinput

# Access Django shell
docker-compose exec web python manage.py shell
\`\`\`

### 5. Stop Services
\`\`\`bash
docker-compose down
\`\`\`

### 6. Stop and Remove All Data
\`\`\`bash
docker-compose down -v
\`\`\`

## Environment Variables

Copy `.env.example` to `.env` and modify as needed:
\`\`\`bash
cp .env.example .env
\`\`\`

## Troubleshooting

### Database Connection Issues
\`\`\`bash
# Check if database is running
docker-compose ps

# View logs
docker-compose logs db
docker-compose logs web
\`\`\`

### Port Already in Use
Change ports in `docker-compose.yml`:
- Django: Change `8000:8000` to `8001:8000`
- PostgreSQL: Change `5432:5432` to `5433:5432`
- pgAdmin: Change `5050:80` to `5051:80`

### Rebuild Services
\`\`\`bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
\`\`\`

## Database Backup

\`\`\`bash
# Backup database
docker-compose exec db pg_dump -U postgres invest_traker > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres invest_traker < backup.sql
