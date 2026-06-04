import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const envVars = {
    ZAI_BASE_URL: process.env.ZAI_BASE_URL || 'not-set',
    ZAI_API_KEY: process.env.ZAI_API_KEY ? 'set' : 'not-set',
    ZAI_CHAT_ID: process.env.ZAI_CHAT_ID ? 'set' : 'not-set',
    ZAI_TOKEN: process.env.ZAI_TOKEN ? 'set' : 'not-set',
    ZAI_USER_ID: process.env.ZAI_USER_ID ? 'set' : 'not-set',
  }

  let connectionTest = 'not-tested'
  let rawResponse = ''
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(`${process.env.ZAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ZAI_API_KEY}`,
        'X-Z-AI-From': 'Z',
        'X-Chat-Id': process.env.ZAI_CHAT_ID || '',
        'X-Token': process.env.ZAI_TOKEN || '',
        'X-User-Id': process.env.ZAI_USER_ID || '',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Say hi' }],
        thinking: { type: 'disabled' }
      }),
      signal: controller.signal
    })
    clearTimeout(timeout)

    rawResponse = await response.text()

    if (response.ok) {
      try {
        const data = JSON.parse(rawResponse)
        connectionTest = `OK - content: "${data.choices?.[0]?.message?.content || data.msg || 'no-content'}" | keys: ${Object.keys(data).join(',')}`
      } catch {
        connectionTest = `OK but not JSON: ${rawResponse.substring(0, 200)}`
      }
    } else {
      connectionTest = `FAIL ${response.status}: ${rawResponse.substring(0, 200)}`
    }
  } catch (error: any) {
    connectionTest = `ERROR: ${error.message || 'unknown'}`
  }

  return NextResponse.json({ envVars, connectionTest, rawResponse: rawResponse.substring(0, 500) })
}
