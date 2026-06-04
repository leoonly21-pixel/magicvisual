import { NextResponse } from "next/server"

export async function GET() {
  const projectId = "cmzhmqozbkdjucpjaaqb"
  // Try both with and without period
  const passwords = ["Leoolga1125", "Leoolga1125."]
  const regions = ["us-east-1", "us-west-2", "eu-west-1", "sa-east-1", "ap-southeast-1"]
  
  const results: Record<string, string> = {}
  
  const { PrismaClient } = await import("@prisma/client")
  
  for (const password of passwords) {
    // Test direct connection
    try {
      const directUrl = `postgresql://postgres:${encodeURIComponent(password)}@db.${projectId}.supabase.co:5432/postgres?sslmode=require`
      const prisma = new PrismaClient({ datasourceUrl: directUrl })
      await prisma.$queryRaw`SELECT 1 as test`
      results[`direct-pw${password.length}`] = "SUCCESS"
      await prisma.$disconnect()
    } catch (err: any) {
      results[`direct-pw${password.length}`] = err.message?.slice(0, 150) || "failed"
    }

    // Test pooler connections
    for (const region of regions) {
      try {
        const poolerUrl = `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`
        const prisma = new PrismaClient({ datasourceUrl: poolerUrl })
        await prisma.$queryRaw`SELECT 1 as test`
        results[`pooler6543-${region}-pw${password.length}`] = "SUCCESS"
        await prisma.$disconnect()
      } catch (err: any) {
        results[`pooler6543-${region}-pw${password.length}`] = err.message?.slice(0, 150) || "failed"
      }
    }

    // Test session mode pooler (port 5432)
    for (const region of regions) {
      try {
        const sessionUrl = `postgresql://postgres.${projectId}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:5432/postgres?sslmode=require`
        const prisma = new PrismaClient({ datasourceUrl: sessionUrl })
        await prisma.$queryRaw`SELECT 1 as test`
        results[`pooler5432-${region}-pw${password.length}`] = "SUCCESS"
        await prisma.$disconnect()
      } catch (err: any) {
        results[`pooler5432-${region}-pw${password.length}`] = err.message?.slice(0, 150) || "failed"
      }
    }
  }
  
  return NextResponse.json({ results })
}
