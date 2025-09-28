#!/bin/bash

# Supabase connection details
DB_HOST="db.hagfscurfkqfsjkczjyi.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

echo "🚀 Creating storage buckets for job photos..."
echo "Please enter your Supabase database password when prompted."

# Run the SQL file
psql "postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME" -f create-job-photos-bucket.sql

if [ $? -eq 0 ]; then
    echo "✅ Storage buckets created successfully!"
    echo ""
    echo "Created buckets:"
    echo "  - job-photos (for tech submissions)"
    echo "  - customer-photos (for customer submissions)"
    echo "  - job-reports (for generated PDFs)"
else
    echo "❌ Failed to create storage buckets"
    exit 1
fi