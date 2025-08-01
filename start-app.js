const { spawn } = require("child_process")
const path = require("path")

console.log("🚀 Starting SmartWaste KE Application...\n")

// Function to run a command and stream output
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    })

    child.on("close", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with code ${code}`))
      }
    })

    child.on("error", (error) => {
      reject(error)
    })
  })
}

async function startApplication() {
  try {
    console.log("📦 Installing dependencies...")
    await runCommand("npm", ["install"])
    console.log("✅ Dependencies installed\n")

    console.log("🗄️  Setting up database...")
    try {
      await runCommand("npm", ["run", "db:setup"])
      console.log("✅ Database setup complete\n")
    } catch (error) {
      console.log("⚠️  Database setup failed. Continuing anyway...\n")
    }

    console.log("🚀 Starting both backend and frontend...")
    console.log("Backend will run on: http://localhost:3001")
    console.log("Frontend will run on: http://localhost:3000\n")

    console.log("Demo accounts:")
    console.log("- User: john@example.com / demo123")
    console.log("- Admin: admin@smartwaste.ke / admin123\n")

    // Start both backend and frontend concurrently
    const backend = spawn("node", ["src/server.js"], { stdio: "inherit" })

    // Wait a moment for backend to start
    setTimeout(() => {
      const frontend = spawn("npm", ["run", "dev"], { stdio: "inherit" })

      frontend.on("error", (error) => {
        console.error("Frontend error:", error)
      })
    }, 3000)

    backend.on("error", (error) => {
      console.error("Backend error:", error)
    })

    // Handle process termination
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down...")
      backend.kill()
      process.exit(0)
    })
  } catch (error) {
    console.error("❌ Error starting application:", error.message)
    process.exit(1)
  }
}

startApplication()
