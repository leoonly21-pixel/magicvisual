import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

// Setup endpoint - creates tables and seeds admin user
// Call once after deployment: POST /api/setup
export async function POST(req: Request) {
  try {
    const { secret } = await req.json()
    
    // Verify authorization
    if (secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = new PrismaClient()
    
    // Push schema by creating a test query
    try {
      // Try to query the User table to see if schema exists
      await prisma.user.findFirst()
    } catch {
      // Schema doesn't exist yet - need to run prisma db push
      // We can't run CLI commands from serverless, but we can 
      // create tables using raw SQL
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "name" TEXT,
          "password" TEXT NOT NULL,
          "isAdmin" BOOLEAN NOT NULL DEFAULT false,
          "plan" TEXT NOT NULL DEFAULT 'free',
          "photosUsed" INTEGER NOT NULL DEFAULT 0,
          "photosLimit" INTEGER NOT NULL DEFAULT 3,
          "billingCycle" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "User_email_key" UNIQUE ("email")
        );
      `)
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Payment" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "currency" TEXT NOT NULL,
          "plan" TEXT NOT NULL,
          "billingCycle" TEXT NOT NULL,
          "method" TEXT NOT NULL,
          "txHash" TEXT,
          "status" TEXT NOT NULL DEFAULT 'PENDING',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
        );
      `)
      
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "Payment" 
        ADD CONSTRAINT "Payment_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      `)
    }

    // Seed admin user
    const hashedPassword = await bcrypt.hash("MagicAdmin2024!", 10)
    
    const admin = await prisma.user.upsert({
      where: { email: "admin@magicvisual.com" },
      update: {},
      create: {
        id: "admin_" + Date.now(),
        email: "admin@magicvisual.com",
        name: "Admin",
        password: hashedPassword,
        isAdmin: true,
        plan: "premium",
        photosLimit: 999,
      }
    })

    await prisma.$disconnect()

    return NextResponse.json({ 
      success: true,
      message: "Database setup complete!",
      adminEmail: "admin@magicvisual.com",
      adminId: admin.id
    })
  } catch (error: any) {
    console.error("Setup error:", error)
    return NextResponse.json({ 
      error: "Setup failed", 
      details: error.message 
    }, { status: 500 })
  }
}
