import mongoose from 'mongoose'

const memeSchema = new mongoose.Schema({
  image: { type: String, required: true },
  texts: { type: Map, of: String, default: {} },
  templateId: { type: String, default: 'classic-top-bottom' },
  reactions: { type: Map, of: Number, default: {} },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Meme', memeSchema)
