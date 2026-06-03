import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        isAdmin: true,
        photosUsed: true,
        photosLimit: true,
        billingCycle: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: "Error fetching users" }, { status: 500 })
  }
}
