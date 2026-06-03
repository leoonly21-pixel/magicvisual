import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { userId, amount, currency, plan, billingCycle, method } = await req.json()

    const payment = await db.payment.create({
      data: {
        userId,
        amount,
        currency: currency || "USDT",
        plan,
        billingCycle,
        method: method || "crypto",
        status: "PENDING",
      }
    })

    return NextResponse.json(payment)
  } catch {
    return NextResponse.json({ error: "Error creating payment" }, { status: 500 })
  }
}
