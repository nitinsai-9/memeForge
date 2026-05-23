import mongoose from 'mongoose'

const memeSchema = new mongoose.Schema({
  image: { type: String, required: true },
  texts: { type: Map, of: String, default: {} },
  templateId: { type: String, default: 'classic-top-bottom' },
  positions: { type: Map, of: Object, default: {} },
  textColor: { type: String, default: '#ffffff' },
  bgColor: { type: String, default: 'transparent' },
  reactions: { type: Map, of: Number, default: {} },
  createdAt: { type: Date, default: Date.now }
})

export default mongoose.model('Meme', memeSchema)
