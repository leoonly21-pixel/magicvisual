import { NextRequest, NextResponse } from 'next/server'

// Allow up to 60 seconds for AI processing
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// ─── AI Config from Environment ────────────────────────────────────
const AI_BASE_URL = process.env.ZAI_BASE_URL || 'https://internal-api.z.ai/v1'
const AI_API_KEY = process.env.ZAI_API_KEY || 'Z.ai'
const AI_CHAT_ID = process.env.ZAI_CHAT_ID || ''
const AI_USER_ID = process.env.ZAI_USER_ID || ''
const AI_TOKEN = process.env.ZAI_TOKEN || ''

function getAIHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${AI_API_KEY}`,
    'X-Z-AI-From': 'Z',
  }
  if (AI_CHAT_ID) headers['X-Chat-Id'] = AI_CHAT_ID
  if (AI_USER_ID) headers['X-User-Id'] = AI_USER_ID
  if (AI_TOKEN) headers['X-Token'] = AI_TOKEN
  return headers
}

// ─── Background Description Map ────────────────────────────────────
const BACKGROUND_PROMPTS: Record<string, string> = {
  // Vanilla
  v1: 'a breathtaking romantic sunset with golden and pink hues filling the sky, warm orange light casting long soft shadows, the sun low on the horizon over a calm ocean, dreamy atmospheric haze, cinematic golden hour lighting',
  v2: 'a lush romantic garden filled with blooming roses, peonies and lavender, dappled sunlight filtering through green canopy, stone pathway with moss, fairy lights twinkling, enchanting and serene atmosphere',
  v3: 'dreamy soft bokeh background with warm golden and pink circular light orbs floating, shallow depth of field, creamy blurred lights, gentle and romantic atmosphere, professional portrait lighting with soft warm glow',
  v4: 'an elegant luxurious interior with marble floors, crystal chandelier casting prismatic light, cream and gold decor, large windows with sheer white curtains, sophisticated and refined atmosphere, soft ambient lighting',
  v5: 'a pristine tropical beach with turquoise crystal clear water, powdery white sand, palm trees swaying gently, bright sunny day with scattered fluffy clouds, paradise atmosphere, natural sunlight reflecting off water',
  v6: 'a magical cherry blossom scene with pink sakura petals falling gently, Japanese garden bridge over a koi pond, soft pink and white flowers everywhere, ethereal and dreamy atmosphere, diffused soft light',

  // Versatil
  vs1: 'a vibrant neon-lit city street at night, colorful LED signs in Japanese and English reflecting on wet rain-slicked pavement, cyberpunk aesthetic, deep blue and purple ambient light mixing with neon pink and cyan, urban and dynamic atmosphere',
  vs2: 'a professional photography studio with clean white backdrop, softbox lighting setup creating perfect even illumination, umbrella reflectors, professional and polished atmosphere, magazine-quality studio lighting',
  vs3: 'a trendy urban loft with exposed red brick walls, large industrial steel-frame windows, polished concrete floors, modern art on walls, hip and contemporary atmosphere, natural light streaming through windows',
  vs4: 'a luxurious rooftop terrace at night with panoramic city skyline view, ambient warm string lights overhead, sleek cocktail bar, warm and cool light contrast creating dramatic mood, sophisticated nightlife atmosphere',
  vs5: 'a modern art gallery with pristine white walls, dramatic spot lighting illuminating contemporary artwork, polished concrete floors, minimalist and cultured atmosphere, museum-quality lighting design',
  vs6: 'a futuristic cyberpunk environment with holographic displays, neon blue and magenta lights, metallic chrome surfaces, rain-slicked streets reflecting neon, high-tech dystopian atmosphere, volumetric fog and light rays',

  // Fetish
  f1: 'a dark atmospheric stone dungeon with iron chains hanging from walls, flickering torchlight casting long dramatic shadows, rough textured stone walls, ominous and intense atmosphere, low-key chiaroscuro lighting',
  f2: 'a dramatic red-lit room with deep crimson velvet walls, heavy velvet drapes, candlelight reflecting off red surfaces creating blood-red highlights, passionate and intense atmosphere, dramatic red ambient lighting',
  f3: 'a dark industrial space with leather and brushed metal elements, heavy chains hanging from ceiling, dramatic overhead spotlighting creating deep shadows, edgy and powerful atmosphere, hard directional lighting',
  f4: 'a mysterious room illuminated only by dozens of tall candles, dancing shadows on dark textured walls, warm amber glow contrasting with deep velvety shadows, atmospheric and seductive, Rembrandt-style lighting',
  f5: 'a luxurious room with deep purple velvet walls, ornate gold-framed mirrors, dim ambient purple and gold lighting, opulent and mysterious atmosphere, rich fabrics and textures, moody atmospheric lighting',
  f6: 'a gothic cathedral interior with tall arched stained glass windows, colored light filtering through creating rainbow patterns on stone floor, massive stone pillars, dramatic and imposing atmosphere, volumetric light beams'
}

// ─── Branch Style Prompts ──────────────────────────────────────────
const BRANCH_STYLES: Record<string, string> = {
  vanilla: 'elegant, romantic, soft warm lighting, golden hour glow, shallow depth of field, dreamy bokeh, sophisticated and refined, Vogue editorial style',
  versatil: 'modern, dynamic, cinematic lighting, dramatic shadows and highlights, high fashion editorial, sharp details, professional studio quality, GQ magazine style',
  fetish: 'dark, mysterious, dramatic chiaroscuro lighting, deep shadows with accent colored lights, intense and powerful mood, high contrast, avant-garde editorial style'
}

// ─── Build the Editing Prompt ──────────────────────────────────────
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
  const scenarioDesc = customScenario ? customScenario : ''
  const outfitDesc = customOutfit ? `Wearing ${customOutfit}.` : ''

  const backgroundSection = bgDesc || scenarioDesc || 'neutral professional studio background'

  const prompt = `Hyperrealistic professional photograph of ${personDescription}. ${outfitDesc} Standing in ${backgroundSection}. Photography style: ${styleDesc}. Shot with Canon EOS R5 Mark II, 85mm f/1.2 L lens at f/1.4, natural lighting with professional reflectors. Ultra-high resolution, 8K UHD, photorealistic skin texture with visible pores and fine hair, natural skin tones with subtle subsurface scattering, studio-quality post-processing, magazine cover quality, sharp focus on eyes, cinematic color grading, professional retouching. No artificial smoothing, no plastic skin, no over-processed look. Raw, authentic, hyperrealistic photography.`

  return prompt
}

// ─── Download image as base64 ──────────────────────────────────────
async function downloadImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl)
  if (!response.ok) throw new Error(`Failed to download image: ${response.status}`)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString('base64')
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

    // ── Step 1: Analyze the image with Vision API ─────────────────
    console.log('[Edit] Step 1: Analyzing image with Vision AI...')

    const visionUrl = `${AI_BASE_URL}/chat/completions/vision`
    const visionBody = {
      messages: [
        {
          role: 'system',
          content: `You are a professional photographer analyzing a photo for an AI re-creation. Describe the person in precise physical detail that an AI image generator needs to create a similar-looking person. Focus on:
- Physical appearance: approximate age range, body type, height estimate, skin tone, ethnicity features
- Face: face shape, eye color, hair color and style, distinctive facial features, expression
- Pose: body position, angle, posture, hand placement
- Current outfit: clothing description, colors, style
- Current setting: brief description of where they are

Be specific but concise. Write as a single paragraph. Do NOT mention you are analyzing a photo. Just describe the person as if describing them for a painting.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Describe the person in this photo in detail for an AI recreation. Focus on their physical appearance, face, body type, pose, current outfit, and expression.'
            },
            {
              type: 'image_url',
              image_url: { url: image }
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
      thinking: { type: 'disabled' }
    }

    const visionResponse = await fetch(visionUrl, {
      method: 'POST',
      headers: getAIHeaders(),
      body: JSON.stringify(visionBody)
    })

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text()
      console.error('[Edit] Vision API error:', errorText)
      throw new Error(`Vision analysis failed: ${visionResponse.status}`)
    }

    const visionData = await visionResponse.json()
    const personDescription = visionData.choices?.[0]?.message?.content?.trim() || 'a beautiful woman'

    console.log('[Edit] Person description:', personDescription.substring(0, 100) + '...')

    // ── Step 2: Build the hyperrealistic prompt ────────────────────
    console.log('[Edit] Step 2: Building prompt...')

    const editPrompt = buildEditPrompt({
      personDescription,
      branch,
      backgroundId,
      customScenario,
      customOutfit
    })

    console.log('[Edit] Generated prompt:', editPrompt.substring(0, 150) + '...')

    // ── Step 3: Generate the hyperrealistic image ──────────────────
    console.log('[Edit] Step 3: Generating image...')

    const imageGenUrl = `${AI_BASE_URL}/images/generations`
    const imageGenBody = {
      prompt: editPrompt,
      size: '768x1344'
    }

    const imageGenResponse = await fetch(imageGenUrl, {
      method: 'POST',
      headers: getAIHeaders(),
      body: JSON.stringify(imageGenBody)
    })

    if (!imageGenResponse.ok) {
      const errorText = await imageGenResponse.text()
      console.error('[Edit] Image gen error:', errorText)
      throw new Error(`Image generation failed: ${imageGenResponse.status}`)
    }

    const imageGenData = await imageGenResponse.json()

    // Process result - SDK converts URLs to base64, we do the same
    let resultImage: string | null = null

    if (imageGenData.data?.[0]?.base64) {
      resultImage = `data:image/png;base64,${imageGenData.data[0].base64}`
    } else if (imageGenData.data?.[0]?.url) {
      // Download URL and convert to base64
      console.log('[Edit] Downloading generated image from URL...')
      const base64 = await downloadImageAsBase64(imageGenData.data[0].url)
      resultImage = `data:image/png;base64,${base64}`
    }

    if (!resultImage) {
      throw new Error('No image data received from AI service')
    }

    console.log('[Edit] Image generated successfully!')

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
