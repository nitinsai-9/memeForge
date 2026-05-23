import { Router } from 'express'
import OpenAI from 'openai'
import Meme from '../models/Meme.js'

const router = Router()

// Simple rate limiter: max 180 requests per IP per minute
const rateLimitMap = new Map()
function rateLimit(req, res, next) {
  const ip = req.ip
  const now = Date.now()
  const window = 60000
  const max = 180
  const hits = rateLimitMap.get(ip) || []
  const recent = hits.filter(t => now - t < window)
  if (recent.length >= max) return res.status(429).json({ error: 'Too many requests. Please wait a moment.' })
  recent.push(now)
  rateLimitMap.set(ip, recent)
  next()
}

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173',
    'X-OpenRouter-Title': 'MemeForge'
  }
})

// POST /api/meme/suggest - Get AI meme suggestions
router.post('/suggest', rateLimit, async (req, res) => {
  try {
    const { image } = req.body
    if (!image) return res.status(400).json({ error: 'Image required' })

    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.0-flash-001',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `You are a meme expert. Look at this image and generate exactly 7 different meme suggestions. Each should use a different template format and be genuinely funny, specific to what's in the image.

Return ONLY valid JSON in this exact format:
{
  "suggestions": [
    { "templateId": "classic-top-bottom", "texts": { "top": "...", "bottom": "..." } },
    { "templateId": "modern-caption", "texts": { "caption": "..." } },
    { "templateId": "demotivational", "texts": { "title": "...", "subtitle": "..." } },
    { "templateId": "twitter-post", "texts": { "tweet": "..." } },
    { "templateId": "expanding-brain", "texts": { "setup": "..." } },
    { "templateId": "nobody", "texts": { "nobody": "Nobody:", "me": "Me: ..." } },
    { "templateId": "drake", "texts": { "reject": "...", "prefer": "..." } }
  ]
}

Template IDs available: classic-top-bottom, modern-caption, demotivational, twitter-post, expanding-brain, nobody, drake.
Text keys per template:
- classic-top-bottom: top, bottom
- modern-caption: caption
- demotivational: title, subtitle
- twitter-post: tweet
- expanding-brain: setup
- nobody: nobody, me
- drake: reject, prefer

Make each suggestion sharp, funny, and specific to the image content. Use internet humor, gen-z style, relatable situations.` },
          { type: 'image_url', image_url: { url: image } }
        ]
      }],
      max_tokens: 1000,
      temperature: 1
    })

    const content = response.choices[0].message.content
    const json = JSON.parse(content.replace(/```json?\n?/g, '').replace(/```/g, '').trim())
    res.json(json)
  } catch (err) {
    console.error('Suggest error:', err)
    res.status(500).json({ error: 'Failed to generate suggestions' })
  }
})

// GET /api/meme/wall/today - Get today's top memes ranked by reactions
router.get('/wall/today', async (req, res) => {
  try {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const memes = await Meme.find({ createdAt: { $gte: startOfDay } }).sort({ createdAt: -1 }).limit(50)
    const ranked = memes.map(m => ({
      _id: m._id,
      image: m.image,
      texts: Object.fromEntries(m.texts),
      templateId: m.templateId,
      reactions: Object.fromEntries(m.reactions),
      totalReactions: [...m.reactions.values()].reduce((a, b) => a + b, 0),
      createdAt: m.createdAt
    })).sort((a, b) => b.totalReactions - a.totalReactions)
    res.json(ranked)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wall' })
  }
})

// POST /api/meme/share - Save meme for sharing
router.post('/share', async (req, res) => {
  try {
    const { image, texts, templateId, positions, textColor, bgColor } = req.body
    const meme = await Meme.create({ image, texts, templateId, positions, textColor, bgColor })
    const io = req.app.get('io')
    if (io) io.to('wall').emit('wall-new-meme', { _id: meme._id, image, texts: Object.fromEntries(meme.texts), templateId, reactions: {}, totalReactions: 0, createdAt: meme.createdAt })
    res.json({ id: meme._id, url: `/meme/${meme._id}` })
  } catch (err) {
    console.error('Share error:', err)
    res.status(500).json({ error: 'Failed to share meme' })
  }
})

// GET /api/meme/:id - Get shared meme
router.get('/:id', async (req, res) => {
  try {
    const meme = await Meme.findById(req.params.id)
    if (!meme) return res.status(404).json({ error: 'Meme not found' })
    res.json({
      image: meme.image,
      texts: Object.fromEntries(meme.texts),
      templateId: meme.templateId,
      positions: meme.positions ? Object.fromEntries(meme.positions) : {},
      textColor: meme.textColor || '#ffffff',
      bgColor: meme.bgColor || 'transparent',
      reactions: Object.fromEntries(meme.reactions),
      createdAt: meme.createdAt
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch meme' })
  }
})

export default router
