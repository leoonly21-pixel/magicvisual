import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const payments = await db.payment.findMany({
      include: { user: { select: { email: true, name: true } } },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(payments)
  } catch {
    return NextResponse.json({ error: "Error fetching payments" }, { status: 500 })
  }
}
