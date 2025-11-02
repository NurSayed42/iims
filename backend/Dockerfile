# FROM python:3.10-slim

# WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     postgresql-client \
#     netcat-openbsd \
#     && rm -rf /var/lib/apt/lists/*

# # Copy requirements
# COPY requirements.txt .

# # Install Python dependencies
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy project
# COPY . .

# # Expose port
# EXPOSE 8000

# # Run migrations and start server
# CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]





FROM python:3.10-slim

# Install dependencies including PostgreSQL client properly
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make the script executable
RUN chmod +x /app/wait-for-db.sh

CMD ["sh", "-c", "/app/wait-for-db.sh db 5432 postgres && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]





