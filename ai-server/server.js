const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Load AI config
let aiConfig = null
function loadConfig() {
  const paths = [
    '/etc/.z-ai-config',
    path.join(process.cwd(), '.z-ai-config'),
    path.join(__dirname, '..', '.z-ai-config'),
  ]
  for (const p of paths) {
    try {
      const config = JSON.parse(fs.readFileSync(p, 'utf-8'))
      if (config.baseUrl && config.apiKey) {
        console.log('✅ Config loaded from:', p)
        return config
      }
    } catch {}
  }
  return {
    baseUrl: process.env.ZAI_BASE_URL || 'https://internal-api.z.ai/v1',
    apiKey: process.env.ZAI_API_KEY || 'Z.ai',
    chatId: process.env.ZAI_CHAT_ID || '',
    userId: process.env.ZAI_USER_ID || '',
    token: process.env.ZAI_TOKEN || '',
  }
}

aiConfig = loadConfig()

function getHeaders() {
  const h = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${aiConfig.apiKey}`,
    'X-Z-AI-From': 'Z',
  }
  if (aiConfig.chatId) h['X-Chat-Id'] = aiConfig.chatId
  if (aiConfig.userId) h['X-User-Id'] = aiConfig.userId
  if (aiConfig.token) h['X-Token'] = aiConfig.token
  return h
}

// Background prompts
const BG = {
  v1: 'breathtaking romantic sunset with golden and pink hues, cinematic golden hour lighting',
  v2: 'lush romantic garden with roses, dappled sunlight, fairy lights',
  v3: 'dreamy soft bokeh with warm golden light orbs, professional portrait lighting',
  v4: 'elegant luxurious interior with marble floors, crystal chandelier, soft ambient lighting',
  v5: 'pristine tropical beach with turquoise water, white sand, paradise',
  v6: 'magical cherry blossom scene, ethereal dreamy atmosphere',
  vs1: 'neon-lit city street at night, cyberpunk aesthetic, neon pink and cyan',
  vs2: 'professional photography studio with white backdrop, softbox lighting',
  vs3: 'trendy urban loft with exposed brick, contemporary atmosphere',
  vs4: 'luxurious rooftop terrace at night with city skyline',
  vs5: 'modern art gallery with white walls, dramatic spot lighting',
  vs6: 'futuristic cyberpunk environment with holographic displays',
  f1: 'dark atmospheric dungeon with iron chains, chiaroscuro lighting',
  f2: 'dramatic red-lit room with crimson velvet, intense atmosphere',
  f3: 'dark industrial space with leather and metal, edgy atmosphere',
  f4: 'mysterious room with dozens of candles, Rembrandt-style lighting',
  f5: 'luxurious room with purple velvet, moody atmospheric lighting',
  f6: 'gothic cathedral with stained glass, volumetric light beams'
}

const STYLES = {
  vanilla: 'elegant, romantic, soft warm lighting, golden hour, Vogue editorial',
  versatil: 'modern, dynamic, cinematic lighting, high fashion, GQ magazine',
  fetish: 'dark, mysterious, chiaroscuro lighting, high contrast, avant-garde'
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', config: { baseUrl: aiConfig.baseUrl, hasApiKey: !!aiConfig.apiKey } })
})

// Edit endpoint
app.post('/edit', async (req, res) => {
  try {
    const { image, branch, backgroundId, customScenario, customOutfit } = req.body

    if (!image) return res.status(400).json({ error: 'No image provided' })
    if (!branch) return res.status(400).json({ error: 'No branch selected' })
    if (!backgroundId && !customScenario) return res.status(400).json({ error: 'No background or scenario selected' })

    const headers = getHeaders()

    // Step 1: Vision analysis
    console.log('[Edit] Analyzing image...')
    const vResp = await fetch(`${aiConfig.baseUrl}/chat/completions/vision`, {
      method: 'POST', headers,
      body: JSON.stringify({
        messages: [{
          role: 'system',
          content: 'Describe the person in this photo in physical detail for an AI recreation. Age, body type, skin tone, face, hair, pose, outfit, expression. One paragraph.'
        }, {
          role: 'user',
          content: [
            { type: 'text', text: 'Describe this person for AI recreation.' },
            { type: 'image_url', image_url: { url: image } }
          ]
        }],
        temperature: 0.3, max_tokens: 400, thinking: { type: 'disabled' }
      })
    })

    if (!vResp.ok) {
      const err = await vResp.text()
      console.error('[Edit] Vision error:', err)
      throw new Error(`Vision failed (${vResp.status})`)
    }

    const vData = await vResp.json()
    const person = vData.choices?.[0]?.message?.content?.trim() || 'a beautiful woman'
    console.log('[Edit] Person:', person.substring(0, 80))

    // Step 2: Build prompt
    const style = STYLES[branch] || STYLES.vanilla
    const bg = backgroundId ? (BG[backgroundId] || '') : ''
    const outfit = customOutfit ? `Wearing ${customOutfit}.` : ''
    const background = bg || customScenario || 'professional studio background'
    const prompt = `Hyperrealistic professional photograph of ${person}. ${outfit} Standing in ${background}. Style: ${style}. Canon EOS R5, 85mm f/1.2 lens. 8K UHD, photorealistic skin texture, natural skin tones, magazine cover quality, cinematic color grading. No artificial smoothing. Hyperrealistic.`
    console.log('[Edit] Prompt:', prompt.substring(0, 100))

    // Step 3: Generate image
    console.log('[Edit] Generating image...')
    const iResp = await fetch(`${aiConfig.baseUrl}/images/generations`, {
      method: 'POST', headers,
      body: JSON.stringify({ prompt, size: '768x1344' })
    })

    if (!iResp.ok) {
      const err = await iResp.text()
      console.error('[Edit] Image gen error:', err)
      throw new Error(`Image gen failed (${iResp.status})`)
    }

    const iData = await iResp.json()

    let resultImage = null
    if (iData.data?.[0]?.base64) {
      resultImage = `data:image/png;base64,${iData.data[0].base64}`
    } else if (iData.data?.[0]?.url) {
      console.log('[Edit] Downloading from URL...')
      const dlResp = await fetch(iData.data[0].url)
      const buf = Buffer.from(await dlResp.arrayBuffer())
      resultImage = `data:image/png;base64,${buf.toString('base64')}`
    }

    if (!resultImage) throw new Error('No image received')
    console.log('[Edit] Success!')

    res.json({ resultImage, prompt, personDescription: person, success: true })

  } catch (error) {
    console.error('[Edit] Error:', error)
    res.status(500).json({ error: error.message || 'Error' })
  }
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI Server running on http://0.0.0.0:${PORT}`)
  console.log(`📡 API base: ${aiConfig.baseUrl}`)
})
