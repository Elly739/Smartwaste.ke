# SmartWaste.ke Database Guide

This document covers database schema, operations, and migration strategies for SmartWaste.ke.

## Current Database Schema

SmartWaste.ke uses SQLite for development with the following tables:

### Users Table

Stores user account information and authentication credentials.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL
);
```

**Fields:**
- `id`: UUID primary key
- `name`: User's full name
- `email`: Unique email address for login
- `password`: Hashed password (bcrypt)
- `role`: User role (`user` or `admin`)
- `created_at`: Account creation timestamp (ISO 8601)

**Indexes:** Email is unique and indexed for fast lookups

### Sessions Table

Tracks user authentication sessions.

```sql
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `token`: Session token (primary key)
- `user_id`: Reference to user
- `created_at`: Session creation timestamp

**Constraints:** Deletes sessions when user is deleted

### Disposal Events Table

Records waste disposal activities.

```sql
CREATE TABLE disposal_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  bin_id TEXT NOT NULL,
  waste_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: UUID primary key
- `user_id`: Reference to user
- `user_name`: User's name at time of disposal (denormalized for records)
- `bin_id`: ID of waste bin used
- `waste_type`: Category of waste (plastic, metal, paper, etc.)
- `points_earned`: Reward points for this disposal
- `created_at`: Disposal timestamp

**Constraints:** Deletes disposal events when user is deleted

## Database Operations

### Connection

The database is initialized in `server/src/data/database.js`:

```javascript
import { run, get, all } from './data/database.js';

// Execute SQL with parameters (prevents SQL injection)
await run(sql, [param1, param2]);

// Get single row
const row = await get(sql, [param1]);

// Get multiple rows
const rows = await all(sql, [param1]);
```

### Common Queries

#### Create User

```javascript
import { randomUUID } from 'node:crypto';
import { hashPassword } from '../utils/passwords.js';
import { run } from './database.js';

const userId = randomUUID();
await run(
  `INSERT INTO users (id, name, email, password, role, created_at)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [
    userId,
    'John Doe',
    'john@example.com',
    hashPassword('securePassword123'),
    'user',
    new Date().toISOString()
  ]
);
```

#### Get User by Email

```javascript
const user = await get(
  'SELECT id, name, email, role FROM users WHERE email = ?',
  ['john@example.com']
);
```

#### Record Disposal Event

```javascript
const eventId = randomUUID();
await run(
  `INSERT INTO disposal_events 
   (id, user_id, user_name, bin_id, waste_type, points_earned, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    eventId,
    userId,
    userName,
    binId,
    'plastic',
    10,
    new Date().toISOString()
  ]
);
```

#### Get User's Disposal History

```javascript
const disposals = await all(
  `SELECT id, user_name, bin_id, waste_type, points_earned, created_at
   FROM disposal_events
   WHERE user_id = ?
   ORDER BY created_at DESC`,
  [userId]
);
```

#### Get Admin Statistics

```javascript
const overview = await get(
  `SELECT 
     COUNT(DISTINCT user_id) as total_users,
     COUNT(*) as total_disposals,
     SUM(points_earned) as total_points
   FROM disposal_events`
);
```

## Adding New Tables

To add a new table to the schema:

1. **Edit** `server/src/data/database.js`:

```javascript
export async function initializeDatabase() {
  await run("PRAGMA foreign_keys = ON");

  // Existing tables...

  // Add new table
  await run(`
    CREATE TABLE IF NOT EXISTS new_feature (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      field1 TEXT NOT NULL,
      field2 INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await seedPrivateAdmin();
}
```

2. **Create query functions** in `server/src/data/queries.js`:

```javascript
import { run, get, all } from './database.js';
import { randomUUID } from 'node:crypto';

export async function createNewFeature(userId, data) {
  const id = randomUUID();
  await run(
    `INSERT INTO new_feature (id, user_id, field1, field2, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, userId, data.field1, data.field2, new Date().toISOString()]
  );
  return { id, userId, ...data };
}

export async function getNewFeature(id) {
  return get('SELECT * FROM new_feature WHERE id = ?', [id]);
}

export async function getUserNewFeatures(userId) {
  return all(
    'SELECT * FROM new_feature WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
}
```

3. **Add API routes** in `server/src/routes/newRoutes.js`:

```javascript
import express from 'express';
import { createNewFeature, getUserNewFeatures } from '../data/queries.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const feature = await createNewFeature(req.user.id, req.body);
    res.status(201).json(feature);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const features = await getUserNewFeatures(req.user.id);
    res.json(features);
  } catch (error) {
    next(error);
  }
});

export default router;
```

## Migration from SQLite to PostgreSQL

For production, consider migrating from SQLite to PostgreSQL (using Neon):

### Step 1: Set Up PostgreSQL Connection

Install PostgreSQL driver:

```bash
npm --prefix server install pg
```

Create new connection module `server/src/data/postgres.js`:

```javascript
import pg from 'pg';

const pool = new pg.Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
});

export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows;
}

export async function queryOne(text, params = []) {
  const result = await pool.query(text, params);
  return result.rows[0] || null;
}

export async function execute(text, params = []) {
  return pool.query(text, params);
}

export async function close() {
  await pool.end();
}
```

### Step 2: Update Environment Variables

```env
# PostgreSQL Configuration (Neon example)
DATABASE_URL=postgresql://user:password@host:5432/database

# Or individual variables
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=your-host.neon.tech
DB_PORT=5432
DB_NAME=smartwaste
```

### Step 3: Update Database Initialization

Replace SQLite initialization with PostgreSQL:

```javascript
import { execute, query } from './postgres.js';

export async function initializeDatabase() {
  // Create tables (PostgreSQL syntax)
  await execute(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Similar for other tables...
  
  await seedPrivateAdmin();
}
```

### Step 4: Update Query Functions

Modify query functions to use PostgreSQL:

```javascript
export async function createUser(name, email, password) {
  const result = await execute(
    `INSERT INTO users (name, email, password, role, created_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id, name, email, role, created_at`,
    [name, email, password, 'user']
  );
  return result.rows[0];
}
```

### Step 5: Data Migration

Export SQLite data and import to PostgreSQL:

```javascript
// Export from SQLite
const users = await all('SELECT * FROM users');
const disposals = await all('SELECT * FROM disposal_events');

// Insert into PostgreSQL
for (const user of users) {
  await execute(
    `INSERT INTO users (id, name, email, password, role, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [user.id, user.name, user.email, user.password, user.role, user.created_at]
  );
}
```

## Database Backups

### SQLite Backups

```bash
# Backup before major changes
cp data/smartwaste.sqlite data/smartwaste.sqlite.backup

# Restore if needed
cp data/smartwaste.sqlite.backup data/smartwaste.sqlite
```

### PostgreSQL Backups

```bash
# Full database backup
pg_dump -U user -h host database_name > backup.sql

# Restore backup
psql -U user -h host database_name < backup.sql
```

## Best Practices

1. **Always use parameterized queries** to prevent SQL injection:
   ```javascript
   // Good
   await run('SELECT * FROM users WHERE email = ?', [email]);
   
   // Bad - SQL injection risk
   await run(`SELECT * FROM users WHERE email = '${email}'`);
   ```

2. **Use transactions for multiple operations**:
   ```javascript
   await run('BEGIN TRANSACTION');
   try {
     await run(...);
     await run(...);
     await run('COMMIT');
   } catch (error) {
     await run('ROLLBACK');
     throw error;
   }
   ```

3. **Denormalize carefully** - The `user_name` field in disposal_events is denormalized to preserve historical data

4. **Use appropriate data types**:
   - Text for strings
   - Integer for counts
   - Timestamps for dates (ISO 8601 format in SQLite)

5. **Index frequently queried columns**:
   ```sql
   CREATE INDEX idx_disposal_events_user_id ON disposal_events(user_id);
   CREATE INDEX idx_disposal_events_created_at ON disposal_events(created_at);
   ```

6. **Clean up old data** periodically:
   ```sql
   DELETE FROM sessions WHERE created_at < datetime('now', '-30 days');
   ```

## Troubleshooting

### Database Locked Error

SQLite files can become locked with concurrent access:

```bash
# Close all connections and restart server
rm -f data/smartwaste.sqlite-wal
npm run server
```

### Foreign Key Constraint Failed

Ensure PRAGMA is enabled in database initialization:

```javascript
await run("PRAGMA foreign_keys = ON");
```

### UUID Conflicts

When seeding data, ensure UUIDs are unique:

```javascript
import { randomUUID } from 'node:crypto';

const id = randomUUID(); // Generates unique identifier
```
