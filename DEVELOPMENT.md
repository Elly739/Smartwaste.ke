# SmartWaste.ke Development Guide

This guide covers development practices, architecture patterns, and best practices for contributing to SmartWaste.ke.

## Architecture Overview

SmartWaste.ke is a full-stack JavaScript application with clear separation of concerns:

```
Client (React + Vite)  ←→  Server (Express.js)  ←→  Database (SQLite)
   Port 5173              Port 4000              ./data/smartwaste.sqlite
```

### Backend Architecture

The server is built with Express.js and follows a modular structure:

- **Entry Point**: `src/index.js` - Initializes server and database
- **App Configuration**: `src/app.js` - Express middleware and route setup
- **Routes**: `src/routes/` - API endpoint handlers
- **Data Layer**: `src/data/` - Database initialization and queries
- **Utilities**: `src/utils/` - Helper functions (password hashing, etc.)

### Frontend Architecture

The client is built with React and Vite:

- **Entry Point**: `src/main.jsx` - React app initialization
- **Main App**: `src/App.jsx` - Top-level component
- **Services**: `src/services/` - API communication functions
- **Components**: `src/components/` - Reusable React components

## Code Style and Standards

### JavaScript/Node.js Standards

- Use ES6+ features (const/let, arrow functions, async/await)
- Follow consistent naming: `camelCase` for variables/functions, `PascalCase` for classes/components
- Use meaningful variable names that describe intent
- Add comments for complex logic
- Keep functions focused on a single responsibility

### Express.js Patterns

#### Route Handlers

```javascript
// Good: Clear, single responsibility
router.post('/api/dispose', async (req, res, next) => {
  try {
    const disposal = await submitDisposal(req.body);
    res.json(disposal);
  } catch (error) {
    next(error);
  }
});

// Bad: Mixed concerns, no error handling
router.post('/api/dispose', (req, res) => {
  submitDisposal(req.body).then(res.json);
});
```

#### Middleware

```javascript
// Good: Clear, reusable middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} - ${Date.now() - start}ms`);
  });
  next();
});
```

#### Error Handling

Always use `try/catch` or `.catch()` and pass errors to Express error handler:

```javascript
// Good
router.post('/route', async (req, res, next) => {
  try {
    const result = await someAsyncFunction();
    res.json(result);
  } catch (error) {
    next(error); // Pass to global error handler
  }
});

// Bad
router.post('/route', async (req, res) => {
  const result = await someAsyncFunction(); // No error handling
  res.json(result);
});
```

### React Component Patterns

#### Functional Components

Always use functional components with hooks:

```javascript
// Good
function WasteForm() {
  const [formData, setFormData] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitDisposal(formData);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}

// Avoid: Class components
class WasteForm extends React.Component {
  // ...
}
```

#### Custom Hooks

Extract reusable logic into custom hooks:

```javascript
// Good: Reusable hook
function useDisposalData() {
  const [disposals, setDisposals] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetchDisposals().then(setDisposals).finally(() => setLoading(false));
  }, []);
  
  return { disposals, loading };
}

// Usage in multiple components
function DashboardPage() {
  const { disposals, loading } = useDisposalData();
  return loading ? <Loading /> : <DisposalList data={disposals} />;
}
```

## API Development

### Adding a New Route

1. Create a new route handler in `src/routes/newRoutes.js`:

```javascript
import express from 'express';
import { getNewData, createNewData } from '../data/queries.js';

const router = express.Router();

router.get('/new', async (req, res, next) => {
  try {
    const data = await getNewData();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/new', async (req, res, next) => {
  try {
    const newData = await createNewData(req.body);
    res.status(201).json(newData);
  } catch (error) {
    next(error);
  }
});

export default router;
```

2. Register the route in `src/app.js`:

```javascript
import newRoutes from './routes/newRoutes.js';

app.use('/api/new', newRoutes);
```

3. Add database queries in `src/data/queries.js` (create if needed):

```javascript
export async function getNewData() {
  return all('SELECT * FROM new_table');
}

export async function createNewData(data) {
  const id = randomUUID();
  await run(
    'INSERT INTO new_table (id, field) VALUES (?, ?)',
    [id, data.field]
  );
  return { id, ...data };
}
```

4. Add client service in `src/services/api.js`:

```javascript
export async function fetchNewData() {
  return apiRequest('/api/new');
}

export async function createNewData(data) {
  return apiRequest('/api/new', {
    method: 'POST',
    body: data
  });
}
```

### Request/Response Format

- Always return JSON responses
- Use appropriate HTTP status codes:
  - `200` - Success
  - `201` - Created
  - `400` - Bad Request
  - `401` - Unauthorized
  - `404` - Not Found
  - `500` - Server Error

#### Standard Response Format

Success:
```json
{
  "id": "uuid",
  "field": "value",
  "created_at": "2024-01-01T00:00:00Z"
}
```

Error:
```json
{
  "message": "Human-readable error message"
}
```

## Database Operations

### Adding a Table

Edit `src/data/database.js` and add to `initializeDatabase()`:

```javascript
await run(`
  CREATE TABLE IF NOT EXISTS new_table (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    field TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);
```

### Querying the Database

Use the provided query functions (`run`, `get`, `all`):

```javascript
import { run, get, all } from './database.js';

// Insert
await run(
  'INSERT INTO users (id, email) VALUES (?, ?)',
  [userId, email]
);

// Query single row
const user = await get(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// Query multiple rows
const users = await all(
  'SELECT * FROM users WHERE role = ?',
  ['admin']
);

// Update
await run(
  'UPDATE users SET name = ? WHERE id = ?',
  [name, userId]
);

// Delete
await run(
  'DELETE FROM users WHERE id = ?',
  [userId]
);
```

## Testing

### Manual Testing

1. Use Postman or curl to test API endpoints
2. Use browser DevTools to test client functionality
3. Check console logs for debugging info

### Example curl Commands

```bash
# Register user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","name":"User"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Submit disposal
curl -X POST http://localhost:4000/api/dispose \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"bin_id":"bin123","waste_type":"plastic","points_earned":10}'
```

## Debugging

### Server Debugging

Enable debug logging:

```bash
LOG_LEVEL=debug npm run server
```

Add console logs for debugging:

```javascript
console.log('[v0] Debugging info:', { variable1, variable2 });
```

### Client Debugging

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Use React DevTools extension for component inspection
4. Check Network tab for API requests

### Common Issues

**API not responding**: Check that server is running on correct port
**CORS errors**: Verify `CORS_ORIGIN` environment variable matches client URL
**Database errors**: Check database path exists and is writable
**Module not found**: Ensure dependencies are installed with `npm install`

## Deployment Considerations

### Environment Variables

Before deploying, create `.env` files with production values:

- Change `NODE_ENV` to `production`
- Update API URLs for production domains
- Use strong admin passwords
- Set appropriate log levels

### Database Migration

When deploying to production:

1. Back up existing SQLite database
2. Consider migrating to PostgreSQL (Neon)
3. Ensure database backups are automated
4. Update connection strings

### Security Checklist

- Change default admin credentials
- Enable HTTPS in production
- Validate all user inputs
- Use environment variables for secrets
- Regularly update dependencies

## Performance Tips

### Server

- Use database indices for frequent queries
- Implement caching for static data
- Optimize query patterns
- Monitor response times with logging

### Client

- Lazy load components with React.lazy
- Optimize images and assets
- Use React.memo for expensive renders
- Minimize bundle size

## Resources

- Express.js Docs: https://expressjs.com/
- React Docs: https://react.dev/
- Vite Docs: https://vitejs.dev/
- SQLite Docs: https://www.sqlite.org/docs.html
- JavaScript ES6+: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
