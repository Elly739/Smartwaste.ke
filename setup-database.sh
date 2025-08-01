#!/bin/bash

# If you don't have PostgreSQL installed, you can use a cloud database
# For local development, install PostgreSQL:

# On macOS:
# brew install postgresql
# brew services start postgresql

# On Ubuntu/Debian:
# sudo apt update
# sudo apt install postgresql postgresql-contrib

# Create database
createdb smartwaste_ke

# Run migrations and seed data
node src/database/migrate.js
node src/database/seed.js
node scripts/setup-demo-data.js
