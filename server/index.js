import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import memeRoutes from './routes/meme.js'

const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Routes
app.use('/api/meme', memeRoutes)

// Socket.IO for live reactions
io.on('connection', (socket) => {
  socket.on('join', async (memeId) => {
    socket.join(memeId)
    try {
      const Meme = (await import('./models/Meme.js')).default
      const meme = await Meme.findById(memeId)
      if (meme) socket.emit('reactions', Object.fromEntries(meme.reactions))
    } catch (err) {}
  })
  socket.on('join-wall', () => socket.join('wall'))
  socket.on('react', async ({ memeId, emoji }) => {
    try {
      const Meme = (await import('./models/Meme.js')).default
      const meme = await Meme.findById(memeId)
      if (!meme) return
      meme.reactions.set(emoji, (meme.reactions.get(emoji) || 0) + 1)
      await meme.save()
      const reactions = Object.fromEntries(meme.reactions)
      io.to(memeId).emit('reaction-update', reactions)
      io.to('wall').emit('wall-reaction-update', { memeId, reactions, totalReactions: Object.values(reactions).reduce((a, b) => a + b, 0) })
    } catch (err) { console.error(err) }
  })
})

// Make io accessible to routes
app.set('io', io)

// Connect DB and start
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/memeforge'

mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected')
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}).catch(err => { console.error('DB connection failed:', err); process.exit(1) })
