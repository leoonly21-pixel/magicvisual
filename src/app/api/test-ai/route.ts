import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, string> = {}

  // Test 1: Check env vars
  results['ZAI_BASE_URL'] = process.env.ZAI_BASE_URL || 'not-set'
  results['ZAI_API_KEY_set'] = process.env.ZAI_API_KEY ? 'yes' : 'no'

  // Test 2: Try internal API
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch('https://internal-api.z.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer Z.ai',
        'X-Z-AI-From': 'Z',
        'X-Chat-Id': process.env.ZAI_CHAT_ID || '',
        'X-Token': process.env.ZAI_TOKEN || '',
        'X-User-Id': process.env.ZAI_USER_ID || '',
      },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], thinking: { type: 'disabled' } }),
      signal: controller.signal
    })
    clearTimeout(timeout)
    const text = await resp.text()
    results['internal_api'] = `${resp.status}: ${text.substring(0, 100)}`
  } catch (e: any) {
    results['internal_api'] = `ERROR: ${e.message?.substring(0, 100) || 'unknown'}`
  }

  // Test 3: Try public API
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    const resp = await fetch('https://api.z.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer Z.ai',
        'X-Z-AI-From': 'Z',
        'X-Chat-Id': process.env.ZAI_CHAT_ID || '',
        'X-Token': process.env.ZAI_TOKEN || '',
        'X-User-Id': process.env.ZAI_USER_ID || '',
      },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hi' }], thinking: { type: 'disabled' } }),
      signal: controller.signal
    })
    clearTimeout(timeout)
    const text = await resp.text()
    results['public_api'] = `${resp.status}: ${text.substring(0, 100)}`
  } catch (e: any) {
    results['public_api'] = `ERROR: ${e.message?.substring(0, 100) || 'unknown'}`
  }

  // Test 4: Try to read .z-ai-config file
  try {
    const fs = await import('fs/promises')
    const configStr = await fs.readFile('.z-ai-config', 'utf-8')
    const config = JSON.parse(configStr)
    results['config_file'] = `Found - baseUrl: ${config.baseUrl}`
  } catch (e: any) {
    results['config_file'] = `Not found: ${e.message?.substring(0, 50)}`
  }

  return NextResponse.json(results)
}
