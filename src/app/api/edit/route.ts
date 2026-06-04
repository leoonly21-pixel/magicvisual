import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execFileAsync = promisify(execFile)

// Allow up to 120 seconds for AI processing
export const maxDuration = 120
export const dynamic = 'force-dynamic'

// ─── Background Description Map ────────────────────────────────────
const BACKGROUND_PROMPTS: Record<string, string> = {
  v1: 'a breathtaking romantic sunset with golden and pink hues filling the sky, warm orange light casting long soft shadows, the sun low on the horizon over a calm ocean, dreamy atmospheric haze, cinematic golden hour lighting',
  v2: 'a lush romantic garden filled with blooming roses, peonies and lavender, dappled sunlight filtering through green canopy, stone pathway with moss, fairy lights twinkling, enchanting and serene atmosphere',
  v3: 'dreamy soft bokeh background with warm golden and pink circular light orbs floating, shallow depth of field, creamy blurred lights, gentle and romantic atmosphere, professional portrait lighting with soft warm glow',
  v4: 'an elegant luxurious interior with marble floors, crystal chandelier casting prismatic light, cream and gold decor, large windows with sheer white curtains, sophisticated and refined atmosphere, soft ambient lighting',
  v5: 'a pristine tropical beach with turquoise crystal clear water, powdery white sand, palm trees swaying gently, bright sunny day with scattered fluffy clouds, paradise atmosphere, natural sunlight reflecting off water',
  v6: 'a magical cherry blossom scene with pink sakura petals falling gently, Japanese garden bridge over a koi pond, soft pink and white flowers everywhere, ethereal and dreamy atmosphere, diffused soft light',
  vs1: 'a vibrant neon-lit city street at night, colorful LED signs reflecting on wet rain-slicked pavement, cyberpunk aesthetic, deep blue and purple ambient light mixing with neon pink and cyan, urban and dynamic atmosphere',
  vs2: 'a professional photography studio with clean white backdrop, softbox lighting setup creating perfect even illumination, umbrella reflectors, professional and polished atmosphere, magazine-quality studio lighting',
  vs3: 'a trendy urban loft with exposed red brick walls, large industrial steel-frame windows, polished concrete floors, modern art on walls, hip and contemporary atmosphere',
  vs4: 'a luxurious rooftop terrace at night with panoramic city skyline view, ambient warm string lights overhead, sophisticated nightlife atmosphere',
  vs5: 'a modern art gallery with pristine white walls, dramatic spot lighting, polished concrete floors, minimalist and cultured atmosphere, museum-quality lighting design',
  vs6: 'a futuristic cyberpunk environment with holographic displays, neon blue and magenta lights, metallic chrome surfaces, rain-slicked streets reflecting neon, volumetric fog and light rays',
  f1: 'a dark atmospheric stone dungeon with iron chains hanging from walls, flickering torchlight casting long dramatic shadows, ominous and intense atmosphere, low-key chiaroscuro lighting',
  f2: 'a dramatic red-lit room with deep crimson velvet walls, heavy velvet drapes, candlelight reflecting off red surfaces, passionate and intense atmosphere, dramatic red ambient lighting',
  f3: 'a dark industrial space with leather and brushed metal elements, heavy chains hanging from ceiling, dramatic overhead spotlighting creating deep shadows, edgy and powerful atmosphere',
  f4: 'a mysterious room illuminated only by dozens of tall candles, dancing shadows on dark textured walls, warm amber glow contrasting with deep velvety shadows, Rembrandt-style lighting',
  f5: 'a luxurious room with deep purple velvet walls, ornate gold-framed mirrors, dim ambient purple and gold lighting, opulent and mysterious atmosphere, moody atmospheric lighting',
  f6: 'a gothic cathedral interior with tall arched stained glass windows, colored light filtering through creating rainbow patterns on stone floor, dramatic and imposing atmosphere, volumetric light beams'
}

const BRANCH_STYLES: Record<string, string> = {
  vanilla: 'elegant, romantic, soft warm lighting, golden hour glow, shallow depth of field, dreamy bokeh, sophisticated and refined, Vogue editorial style',
  versatil: 'modern, dynamic, cinematic lighting, dramatic shadows and highlights, high fashion editorial, sharp details, professional studio quality, GQ magazine style',
  fetish: 'dark, mysterious, dramatic chiaroscuro lighting, deep shadows with accent colored lights, intense and powerful mood, high contrast, avant-garde editorial style'
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
  const scenarioDesc = customScenario ? customScenario : ''
  const outfitDesc = customOutfit ? `Wearing ${customOutfit}.` : ''
  const backgroundSection = bgDesc || scenarioDesc || 'neutral professional studio background'

  return `Hyperrealistic professional photograph of ${personDescription}. ${outfitDesc} Standing in ${backgroundSection}. Photography style: ${styleDesc}. Shot with Canon EOS R5 Mark II, 85mm f/1.2 L lens at f/1.4, natural lighting with professional reflectors. Ultra-high resolution, 8K UHD, photorealistic skin texture with visible pores and fine hair, natural skin tones with subtle subsurface scattering, studio-quality post-processing, magazine cover quality, sharp focus on eyes, cinematic color grading, professional retouching. No artificial smoothing, no plastic skin, no over-processed look. Raw, authentic, hyperrealistic photography.`
}

// ─── POST Handler ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image, branch, backgroundId, customScenario, customOutfit } = body

    if (!image) return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    if (!branch) return NextResponse.json({ error: 'No branch selected' }, { status: 400 })
    if (!backgroundId && !customScenario) return NextResponse.json({ error: 'No background or scenario selected' }, { status: 400 })

    const tmpDir = '/tmp/magicvisual'
    await fs.mkdir(tmpDir, { recursive: true })
    const timestamp = Date.now()

    // Step 1: Save input image to a temp file for the vision CLI
    console.log('[Edit] Step 1: Saving input image...')
    const inputPath = `${tmpDir}/input-${timestamp}.jpg`
    let base64Data = image
    if (image.startsWith('data:')) {
      base64Data = image.split(',')[1]
    }
    await fs.writeFile(inputPath, Buffer.from(base64Data, 'base64'))

    // Step 2: Analyze image with z-ai vision CLI
    console.log('[Edit] Step 2: Analyzing image with Vision AI...')
    const visionOutputPath = `${tmpDir}/vision-${timestamp}.json`
    let personDescription = 'a beautiful woman'

    try {
      await execFileAsync('z-ai', [
        'vision',
        '-p', 'Describe the person in this photo in precise physical detail for an AI recreation. Focus on: physical appearance (age range, body type, skin tone), face (eye color, hair color and style, distinctive features), pose (body position, angle), current outfit (clothing, colors, style), and expression. Write as a single concise paragraph.',
        '-i', inputPath,
        '-o', visionOutputPath
      ], { timeout: 60000 })

      const visionResult = JSON.parse(await fs.readFile(visionOutputPath, 'utf-8'))
      personDescription = visionResult.choices?.[0]?.message?.content?.trim() || personDescription
    } catch (visionError: any) {
      console.error('[Edit] Vision CLI error, using default description:', visionError.message?.substring(0, 100))
      // Fallback: try with a data URL approach
    }

    console.log('[Edit] Person description:', personDescription.substring(0, 100) + '...')

    // Step 3: Build prompt
    const editPrompt = buildEditPrompt({ personDescription, branch, backgroundId, customScenario, customOutfit })
    console.log('[Edit] Step 3: Prompt built:', editPrompt.substring(0, 150) + '...')

    // Step 4: Generate image with z-ai-generate CLI
    console.log('[Edit] Step 4: Generating hyperrealistic image...')
    const outputPath = `${tmpDir}/output-${timestamp}.png`

    await execFileAsync('z-ai-generate', [
      '-p', editPrompt,
      '-o', outputPath,
      '-s', '768x1344'
    ], { timeout: 120000 })

    console.log('[Edit] Image generated!')

    // Step 5: Read and return the generated image
    const generatedBuffer = await fs.readFile(outputPath)
    const resultBase64 = generatedBuffer.toString('base64')
    const resultImage = `data:image/png;base64,${resultBase64}`

    // Cleanup
    try {
      await fs.unlink(inputPath)
      await fs.unlink(outputPath)
      await fs.unlink(visionOutputPath)
    } catch {}

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
