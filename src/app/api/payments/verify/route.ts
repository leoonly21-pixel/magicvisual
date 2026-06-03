import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { paymentId, txHash } = await req.json()

    const payment = await db.payment.update({
      where: { id: paymentId },
      data: { txHash }
    })

    return NextResponse.json(payment)
  } catch {
    return NextResponse.json({ error: "Error verifying payment" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { paymentId, status } = await req.json()

    const payment = await db.payment.findUnique({ where: { id: paymentId } })
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const updated = await db.payment.update({
      where: { id: paymentId },
      data: { status }
    })

    if (status === "APPROVED") {
      await db.user.update({
        where: { id: payment.userId },
        data: {
          plan: payment.plan,
          billingCycle: payment.billingCycle,
          photosLimit: payment.plan === "premium" ? 999 : 50,
        }
      })
    }

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: "Error updating payment" }, { status: 500 })
  }
}
