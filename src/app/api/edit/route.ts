import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Allow up to 120 seconds for AI processing
export const maxDuration = 120
export const dynamic = 'force-dynamic'

// ─── Initialize ZAI SDK ──────────────────────────────────────────
// Cache the ZAI instance for reuse across requests (serverless cold start)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let zaiInstance: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getZAI(): Promise<any> {
  if (zaiInstance) return zaiInstance

  try {
    // Try normal SDK initialization (works where .z-ai-config exists)
    zaiInstance = await ZAI.create()
    console.log('[Edit] ZAI initialized from .z-ai-config')
    return zaiInstance
  } catch {
    // Fallback: construct directly from env vars (for Vercel serverless)
    console.log('[Edit] .z-ai-config not found, constructing from env vars')
    const config = {
      baseUrl: process.env.ZAI_BASE_URL || 'https://internal-api.z.ai/v1',
      apiKey: process.env.ZAI_API_KEY || 'Z.ai',
      chatId: process.env.ZAI_CHAT_ID || '',
      userId: process.env.ZAI_USER_ID || '',
      token: process.env.ZAI_TOKEN || '',
    }

    if (!config.chatId || !config.token) {
      throw new Error(
        'ZAI_CHAT_ID and ZAI_TOKEN environment variables are required. ' +
        'Please configure them in your Vercel project settings.'
      )
    }

    // @ts-ignore - constructor is private in types but works at runtime
    zaiInstance = new ZAI(config)
    console.log('[Edit] ZAI initialized from env vars')
    return zaiInstance
  }
}

// ─── Extract raw base64 from data URL ────────────────────────────
// The frontend sends images as data URLs: "data:image/jpeg;base64,/9j/4AAQ..."
// The Vision API requires raw base64 (no prefix).
// The Image Edit API requires full data URLs.
function extractBase64(dataUrl: string): string {
  const match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/)
  if (match) return match[1]
  // Already raw base64
  return dataUrl
}

// ─── Background Prompts ────────────────────────────────────────────
const BACKGROUND_PROMPTS: Record<string, string> = {
  v1: 'a breathtaking romantic sunset with golden and pink hues filling the sky, warm orange light casting long soft shadows, the sun low on the horizon over a calm ocean, dreamy atmospheric haze, cinematic golden hour lighting',
  v2: 'a lush romantic garden filled with blooming roses, peonies and lavender, dappled sunlight filtering through green canopy, fairy lights twinkling, enchanting and serene atmosphere',
  v3: 'dreamy soft bokeh background with warm golden and pink circular light orbs, shallow depth of field, gentle and romantic atmosphere, professional portrait lighting',
  v4: 'an elegant luxurious interior with marble floors, crystal chandelier, cream and gold decor, sophisticated and refined atmosphere, soft ambient lighting',
  v5: 'a pristine tropical beach with turquoise water, white sand, palm trees, paradise atmosphere, natural sunlight',
  v6: 'a magical cherry blossom scene with pink sakura petals falling, ethereal and dreamy atmosphere, diffused soft light',
  vs1: 'a vibrant neon-lit city street at night, cyberpunk aesthetic, deep blue and purple ambient light mixing with neon pink and cyan',
  vs2: 'a professional photography studio with clean white backdrop, softbox lighting, magazine-quality studio lighting',
  vs3: 'a trendy urban loft with exposed red brick walls, industrial windows, contemporary atmosphere',
  vs4: 'a luxurious rooftop terrace at night with city skyline view, sophisticated nightlife atmosphere',
  vs5: 'a modern art gallery with pristine white walls, dramatic spot lighting, museum-quality lighting',
  vs6: 'a futuristic cyberpunk environment with holographic displays, neon lights, volumetric fog',
  f1: 'a dark atmospheric stone dungeon with iron chains, flickering torchlight, low-key chiaroscuro lighting',
  f2: 'a dramatic red-lit room with deep crimson velvet walls, intense atmosphere, dramatic red ambient lighting',
  f3: 'a dark industrial space with leather and metal, heavy chains, edgy and powerful atmosphere',
  f4: 'a mysterious room illuminated by dozens of candles, warm amber glow, Rembrandt-style lighting',
  f5: 'a luxurious room with deep purple velvet walls, dim ambient purple and gold lighting, moody atmosphere',
  f6: 'a gothic cathedral interior with stained glass windows, volumetric light beams, dramatic atmosphere'
}

const BRANCH_STYLES: Record<string, string> = {
  vanilla: 'elegant, romantic, soft warm lighting, golden hour glow, shallow depth of field, dreamy bokeh, sophisticated, Vogue editorial style',
  versatil: 'modern, dynamic, cinematic lighting, dramatic shadows and highlights, high fashion editorial, GQ magazine style',
  fetish: 'dark, mysterious, dramatic chiaroscuro lighting, deep shadows with accent colored lights, high contrast, avant-garde editorial style'
}

function buildEditPrompt(params: {
  personDescription: string
  branch: string
  backgroundId: string | null
  customScenario: string
  customOutfit: string
}): string {
  const { personDescription, branch, backgroundId, customScenario, customOutfit } = params
  const styleDesc = BRANCH_STYLES[branch] || BRANCH_STYLES.vanilla
  const bgDesc = backgroundId ? (BACKGROUND_PROMPTS[backgroundId] || '') : ''
  const outfitDesc = customOutfit ? `Wearing ${customOutfit}.` : ''
  const backgroundSection = bgDesc || customScenario || 'neutral professional studio background'

  return `Hyperrealistic professional photograph of ${personDescription}. ${outfitDesc} Standing in ${backgroundSection}. Photography style: ${styleDesc}. Shot with Canon EOS R5 Mark II, 85mm f/1.2 L lens at f/1.4. Ultra-high resolution, 8K UHD, photorealistic skin texture, natural skin tones, studio-quality post-processing, magazine cover quality, sharp focus on eyes, cinematic color grading. No artificial smoothing. Raw, authentic, hyperrealistic photography.`
}

// ─── Download image from URL and convert to base64 data URL ───────
async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl)
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`)
  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  return `data:image/png;base64,${base64}`
}

// ─── Call image edit API with correct format ──────────────────────
// The SDK's edit() method sends `image` as a string, but the API
// expects `images: [{ url: ... }]`. So we do a manual fetch.
async function callImageEditAPI(
  zai: any,
  prompt: string,
  imageDataUrl: string,
  size: string
): Promise<string> {
  const { baseUrl, apiKey, chatId, userId, token } = zai.config

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'X-Z-AI-From': 'Z',
  }
  if (chatId) headers['X-Chat-Id'] = chatId
  if (userId) headers['X-User-Id'] = userId
  if (token) headers['X-Token'] = token

  console.log('[Edit] Calling image edit API...')
  const response = await fetch(`${baseUrl}/images/generations/edit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt,
      images: [{ url: imageDataUrl }],
      size
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('[Edit] Image edit API error:', errText.substring(0, 300))
    throw new Error(`Image generation failed (${response.status}): ${errText.substring(0, 100)}`)
  }

  const data = await response.json()

  // The API returns either base64 or a URL
  if (data.data?.[0]?.base64) {
    return `data:image/png;base64,${data.data[0].base64}`
  } else if (data.data?.[0]?.url) {
    console.log('[Edit] Downloading result from URL...')
    return await downloadImageAsBase64(data.data[0].url)
  }

  throw new Error('No image data in response from AI')
}

// ─── POST Handler ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image, branch, backgroundId, customScenario, customOutfit } = body

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }
    if (!branch) {
      return NextResponse.json({ error: 'No branch selected' }, { status: 400 })
    }
    if (!backgroundId && !customScenario) {
      return NextResponse.json({ error: 'No background or scenario selected' }, { status: 400 })
    }

    // Initialize Z AI SDK
    console.log('[Edit] Initializing Z AI SDK...')
    const zai = await getZAI()

    // ── Step 1: Analyze image with Vision API ─────────────────
    // IMPORTANT: The Vision API requires raw base64 (not data URLs).
    // Extract the raw base64 from the data URL prefix.
    console.log('[Edit] Step 1: Analyzing image with Vision...')
    const rawBase64 = extractBase64(image)

    let personDescription = 'a beautiful person'

    try {
      const visionResponse = await zai.chat.completions.createVision({
        model: 'glm-4v-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional photographer. Describe the person in this photo in precise physical detail for an AI recreation. Focus on: physical appearance (age range, body type, skin tone), face (eye color, hair, features), pose, outfit, and expression. One concise paragraph.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe the person in this photo for AI recreation.' },
              { type: 'image_url', image_url: { url: rawBase64 } }
            ]
          }
        ],
        thinking: { type: 'disabled' }
      })

      personDescription =
        visionResponse.choices?.[0]?.message?.content?.trim() || 'a beautiful person'
      console.log('[Edit] Person description:', personDescription.substring(0, 100) + '...')
    } catch (visionError: any) {
      // Vision analysis is nice-to-have; if it fails, continue with a generic description
      console.warn('[Edit] Vision analysis failed (continuing without it):', visionError?.message?.substring(0, 150))
    }

    // ── Step 2: Build prompt ───────────────────────────────────
    const editPrompt = buildEditPrompt({
      personDescription,
      branch,
      backgroundId,
      customScenario,
      customOutfit
    })
    console.log('[Edit] Step 2: Prompt built, length:', editPrompt.length)

    // ── Step 3: Generate edited image ──────────────────────────
    // Use manual fetch with correct `images: [{ url }]` format
    // The Image Edit API accepts data URLs directly.
    console.log('[Edit] Step 3: Generating hyperrealistic image...')

    const resultImage = await callImageEditAPI(zai, editPrompt, image, '768x1344')

    console.log('[Edit] Success! Image generated.')

    return NextResponse.json({
      resultImage,
      prompt: editPrompt,
      personDescription,
      success: true
    })

  } catch (error: any) {
    console.error('[Edit] Error:', error?.message || error)
    console.error('[Edit] Stack:', error?.stack?.substring(0, 300))

    return NextResponse.json(
      { error: error?.message || 'Error processing image' },
      { status: 500 }
    )
  }
}
