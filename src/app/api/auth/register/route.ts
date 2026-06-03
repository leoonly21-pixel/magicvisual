import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: { email, password: hashedPassword, name: name || email.split("@")[0] }
    })

    return NextResponse.json({ id: user.id, email: user.email })
  } catch {
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
  }
}
