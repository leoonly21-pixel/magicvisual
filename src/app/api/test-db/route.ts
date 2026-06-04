import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

export async function GET() {
  const projectId = "cmzhmqozbkdjucpjaaqb"
  const password = "Leoolga1125"
  const regions = ["us-east-1", "us-west-2", "eu-west-1", "sa-east-1", "ap-southeast-1", "eu-central-1", "ap-northeast-1", "us-east-2", "ca-central-1"]
  
  const results: Record<string, string> = {}
  
  // Test direct connection first
  try {
    const directUrl = `postgresql://postgres:${password}@db.${projectId}.supabase.co:5432/postgres`
    process.env.DATABASE_URL = directUrl
    const prisma = new PrismaClient({
      datasourceUrl: directUrl
    })
    await prisma.$queryRaw`SELECT 1`
    results["direct"] = "SUCCESS"
    await prisma.$disconnect()
  } catch (err: any) {
    results["direct"] = err.message?.slice(0, 100) || "failed"
  }
  
  // Test pooler connections for each region
  for (const region of regions) {
    try {
      const poolerUrl = `postgresql://postgres.${projectId}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres`
      const prisma = new PrismaClient({
        datasourceUrl: poolerUrl
      })
      await prisma.$queryRaw`SELECT 1`
      results[`pooler-${region}`] = "SUCCESS"
      await prisma.$disconnect()
    } catch (err: any) {
      results[`pooler-${region}`] = err.message?.slice(0, 100) || "failed"
    }
  }
  
  // Test transaction mode pooler (port 6543)
  for (const region of regions) {
    try {
      const txUrl = `postgresql://postgres.${projectId}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres`
      const prisma = new PrismaClient({
        datasourceUrl: txUrl
      })
      await prisma.$queryRaw`SELECT 1`
      results[`tx-${region}`] = "SUCCESS"
      await prisma.$disconnect()
    } catch (err: any) {
      results[`tx-${region}`] = err.message?.slice(0, 100) || "failed"
    }
  }
  
  return NextResponse.json({ results })
}
