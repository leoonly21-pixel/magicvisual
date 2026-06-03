import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("MagicAdmin2024!", 10)

  await prisma.user.upsert({
    where: { email: "admin@magicvisual.com" },
    update: {},
    create: {
      email: "admin@magicvisual.com",
      name: "Admin",
      password: hashedPassword,
      isAdmin: true,
      plan: "premium",
      photosLimit: 999,
    }
  })

  console.log("Admin user created: admin@magicvisual.com / MagicAdmin2024!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
