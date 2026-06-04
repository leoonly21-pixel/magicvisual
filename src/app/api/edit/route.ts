import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Allow up to 120 seconds for AI processing
export const maxDuration = 120
export const dynamic = 'force-dynamic'

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

function buildEditPrompt(params: { personDescription: string; branch: string; backgroundId: string | null; customScenario: string; customOutfit: string }): string {
  const { personDescription, branch, backgroundId, customScenario, customOutfit } = params
  const styleDesc = BRANCH_STYLES[branch] || BRANCH_STYLES.vanilla
  const bgDesc = backgroundId ? (BACKGROUND_PROMPTS[backgroundId] || '') : ''
  const outfitDesc = customOutfit ? `Wearing ${customOutfit}.` : ''
  const backgroundSection = bgDesc || customScenario || 'neutral professional studio background'

  return `Hyperrealistic professional photograph of ${personDescription}. ${outfitDesc} Standing in ${backgroundSection}. Photography style: ${styleDesc}. Shot with Canon EOS R5 Mark II, 85mm f/1.2 L lens at f/1.4. Ultra-high resolution, 8K UHD, photorealistic skin texture, natural skin tones, studio-quality post-processing, magazine cover quality, sharp focus on eyes, cinematic color grading. No artificial smoothing. Raw, authentic, hyperrealistic photography.`
}

// ─── POST Handler ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image, branch, backgroundId, customScenario, customOutfit } = body

    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    if (!branch) return NextResponse.json({ error: 'No branch selected' }, { status: 400 })
    if (!backgroundId && !customScenario) return NextResponse.json({ error: 'No background or scenario selected' }, { status: 400 })

    // Initialize Z AI SDK
    console.log('[Edit] Initializing Z AI SDK...')
    const zai = await ZAI.create()

    // ── Step 1: Analyze image with Vision API ─────────────────
    console.log('[Edit] Step 1: Analyzing image with Vision...')
    const visionResponse = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional photographer. Describe the person in this photo in precise physical detail for an AI recreation. Focus on: physical appearance (age range, body type, skin tone), face (eye color, hair, features), pose, outfit, and expression. One concise paragraph.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe the person in this photo for AI recreation.' },
            { type: 'image_url', image_url: { url: image } }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    })

    const personDescription = visionResponse.choices?.[0]?.message?.content?.trim() || 'a beautiful woman'
    console.log('[Edit] Person description:', personDescription.substring(0, 80) + '...')

    // ── Step 2: Build prompt ───────────────────────────────────
    const editPrompt = buildEditPrompt({ personDescription, branch, backgroundId, customScenario, customOutfit })
    console.log('[Edit] Step 2: Prompt built, length:', editPrompt.length)

    // ── Step 3: Generate image ─────────────────────────────────
    console.log('[Edit] Step 3: Generating hyperrealistic image...')
    const imageGenResponse = await zai.images.generations.create({
      prompt: editPrompt,
      size: '768x1344'
    })

    const base64Image = imageGenResponse.data?.[0]?.base64
    if (!base64Image) {
      throw new Error('No image data received from AI generation')
    }

    const resultImage = `data:image/png;base64,${base64Image}`
    console.log('[Edit] Success! Image generated.')

    return NextResponse.json({
      resultImage,
      prompt: editPrompt,
      personDescription,
      success: true
    })

  } catch (error: any) {
    console.error('[Edit] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error processing image' },
      { status: 500 }
    )
  }
}
