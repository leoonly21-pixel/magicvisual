import { NextResponse } from "next/server"

export async function GET() {
  const regions = ["us-east-1", "us-west-2", "eu-west-1", "sa-east-1", "ap-southeast-1", "eu-central-1", "ap-northeast-1", "us-east-2", "ca-central-1"]
  
  const results: Record<string, string> = {}
  
  for (const region of regions) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`https://aws-0-${region}.pooler.supabase.com:5432`, {
        signal: controller.signal
      }).catch(() => null)
      clearTimeout(timeout)
      results[region] = response ? `HTTP ${response.status}` : "connection_failed"
    } catch (err: any) {
      results[region] = err.message?.slice(0, 50) || "unknown_error"
    }
  }
  
  return NextResponse.json({ results })
}
