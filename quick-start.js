const fs = require("fs")
const path = require("path")

console.log("🚀 SmartWaste KE Quick Start Setup\n")

// Create necessary directories
const dirs = ["src", "src/database", "src/routes", "src/middleware", "src/services", "scripts"]
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`📁 Created directory: ${dir}`)
  }
})

// Create .env file
if (!fs.existsSync(".env")) {
  const envContent = `# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartwaste_ke

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-${Date.now()}

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
`

  fs.writeFileSync(".env", envContent)
  console.log("✅ Created .env file")
}

// Create .env.local file
if (!fs.existsSync(".env.local")) {
  const envLocalContent = `# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001/api
`

  fs.writeFileSync(".env.local", envLocalContent)
  console.log("✅ Created .env.local file")
}

console.log("\n🎉 Quick setup complete!")
console.log("\nNext steps:")
console.log("1. Install dependencies: npm install")
console.log("2. Start the app: node start-app.js")
console.log("\nOr run: npm run setup && node start-app.js")
