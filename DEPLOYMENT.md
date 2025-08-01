# 🚀 Deploying SmartWaste KE to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Database**: Set up a PostgreSQL database (recommended: [Neon](https://neon.tech))
3. **GitHub Repository**: Push your code to GitHub

## Step-by-Step Deployment

### 1. Set Up Database (Neon - Recommended)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://username:password@host/database`)

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `JWT_SECRET`: A secure random string (generate one at [randomkeygen.com](https://randomkeygen.com))
   - `NODE_ENV`: `production`
5. Click "Deploy"

#### Option B: Using Vercel CLI

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
\`\`\`

### 3. Set Environment Variables

In your Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

\`\`\`env
DATABASE_URL=postgresql://username:password@host/database
JWT_SECRET=your-super-secure-jwt-secret-key
NODE_ENV=production
\`\`\`

### 4. Set Up Database Tables

After deployment, you need to create the database tables. You can do this by:

1. **Option A**: Run the migration script locally with your production database URL
2. **Option B**: Use a database management tool like pgAdmin or the Neon console

### 5. Seed Demo Data (Optional)

To add demo users and data, you can run the seeding scripts with your production database.

## Database Setup SQL

If you need to manually create tables, here's the essential SQL:

\`\`\`sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  points INTEGER DEFAULT 0,
  total_waste_recycled DECIMAL(10,2) DEFAULT 0,
  level VARCHAR(50) DEFAULT 'Eco Beginner',
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pickup requests table
CREATE TABLE pickup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Plastic', 'Organic', 'E-waste')),
  status VARCHAR(20) DEFAULT 'Pending',
  weight DECIMAL(10,2),
  points_earned INTEGER DEFAULT 0,
  location_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  points_required INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- User achievements table
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- Rewards table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  points_cost INTEGER NOT NULL,
  value_kes DECIMAL(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT -1
);

-- Insert demo achievements
INSERT INTO achievements (name, description, icon) VALUES
('Welcome Aboard', 'Joined SmartWaste KE', 'star'),
('First Pickup', 'Completed first pickup', 'recycle'),
('Eco Warrior', 'Earned 500 points', 'leaf');

-- Insert demo rewards
INSERT INTO rewards (name, description, category, points_cost, value_kes) VALUES
('Safaricom Airtime', 'KES 100 airtime credit', 'Airtime', 500, 100),
('KFC Voucher', 'KES 500 food voucher', 'Food', 1200, 500);
\`\`\`

## Testing Your Deployment

1. Visit your Vercel URL
2. Try creating a new account
3. Test the login functionality
4. Create a pickup request
5. Check that all features work

## Troubleshooting

### Common Issues:

1. **Database Connection Error**: Check your `DATABASE_URL` environment variable
2. **JWT Errors**: Ensure `JWT_SECRET` is set
3. **CORS Issues**: The API routes include CORS headers for cross-origin requests
4. **Build Errors**: Check the Vercel build logs for specific error messages

### Getting Help:

- Check Vercel deployment logs
- Verify environment variables are set correctly
- Ensure your database is accessible from Vercel's servers

## Production Considerations

1. **Security**: Use strong JWT secrets and secure database credentials
2. **Monitoring**: Set up error tracking (Sentry, LogRocket, etc.)
3. **Analytics**: Add analytics tracking for user behavior
4. **Performance**: Monitor API response times and optimize queries
5. **Backup**: Set up regular database backups

Your SmartWaste KE application should now be live on Vercel! 🎉
