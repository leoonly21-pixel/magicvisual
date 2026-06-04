import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

// This endpoint seeds the admin user - should be called once after deployment
// Protected with NEXTAUTH_SECRET to prevent unauthorized seeding
export async function POST(req: Request) {
  try {
    const { secret } = await req.json()

    // Simple protection - require a secret key
    if (secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const hashedPassword = await bcrypt.hash("MagicAdmin2024!", 10)

    const admin = await db.user.upsert({
      where: { email: "admin@magicvisual.com" },
      update: {},
      create: {
        email: "admin@magicvisual.com",
        name: "Admin",
        password: hashedPassword,
        isAdmin: true,
        plan: "premium",
        photosLimit: 999,
      },
    })

    return NextResponse.json({
      message: "Admin user created successfully",
      email: "admin@magicvisual.com",
      id: admin.id,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json({ error: "Error seeding database" }, { status: 500 })
  }
}
