import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import { Trophy, Flame, Clock } from 'lucide-react'
import { getTemplate } from '../utils/templates'

const API = import.meta.env.VITE_API_URL || ''
const REACTIONS_EMOJI = ['😂', '💀', '🔥', '❤️', '😭', '🤡']

export default function Wall() {
  const [memes, setMemes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Meme Wall - MemeForge'
    axios.get(`${API}/api/meme/wall/today`).then(({ data }) => setMemes(data)).finally(() => setLoading(false))

    const socket = io(API || undefined, { path: '/socket.io' })
    socket.emit('join-wall')

    socket.on('wall-new-meme', (meme) => {
      setMemes(prev => [meme, ...prev])
    })

    socket.on('wall-reaction-update', ({ memeId, reactions, totalReactions }) => {
      setMemes(prev => prev.map(m => m._id === memeId ? { ...m, reactions, totalReactions } : m).sort((a, b) => b.totalReactions - a.totalReactions))
    })

    return () => socket.disconnect()
  }, [])

  if (loading) return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-gray-100 dark:bg-dark-700 animate-pulse" />)}
      </div>
    </div>
  )

  return (
    <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 md:py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-black flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">Meme Wall</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-1">
          <Flame className="w-4 h-4" /> Today's top memes, ranked live
        </p>
      </div>

      {memes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400">No memes yet today 😢</p>
          <Link to="/" className="inline-block mt-4 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors">Be the first →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {memes.map((meme, i) => (
            <MemeCard key={meme._id} meme={meme} rank={i + 1} />
          ))}
        </div>
      )}
    </main>
  )
}

function MemeCard({ meme, rank }) {
  const template = getTemplate(meme.templateId)

  return (
    <Link to={`/meme/${meme._id}`} className="group relative rounded-2xl overflow-hidden bg-black shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02]">
      {/* Rank badge */}
      {rank <= 3 && (
        <div className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rank === 1 ? 'bg-yellow-400 text-yellow-900' : rank === 2 ? 'bg-gray-300 text-gray-700' : 'bg-orange-400 text-orange-900'}`}>
          {rank}
        </div>
      )}

      {/* Meme image with text overlay */}
      <div className="relative aspect-square">
        <img src={meme.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/10" />
        {template.textPositions.map(pos => (
          <div key={pos.id} className="absolute left-0 right-0 px-3 text-center" style={{ top: pos.y < 50 ? `${Math.max(pos.y, 3)}%` : undefined, bottom: pos.y >= 50 ? `${100 - pos.y}%` : undefined }}>
            <p className="text-white font-bold text-xs sm:text-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]" style={{ fontFamily: pos.fontFamily, WebkitTextStroke: pos.strokeWidth > 0 ? '1px #000' : undefined }}>
              {meme.texts?.[pos.id] || ''}
            </p>
          </div>
        ))}
      </div>

      {/* Reactions bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-1.5 flex-wrap">
          {REACTIONS_EMOJI.map(emoji => {
            const count = meme.reactions?.[emoji]
            if (!count) return null
            return <span key={emoji} className="text-xs bg-white/20 backdrop-blur-sm rounded-full px-1.5 py-0.5">{emoji}{count}</span>
          })}
          {meme.totalReactions > 0 && (
            <span className="ml-auto text-xs text-white/70 font-medium">{meme.totalReactions} 🔥</span>
          )}
        </div>
      </div>

      {/* Time ago */}
      <div className="absolute top-3 right-3 text-xs text-white/70 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {timeAgo(meme.createdAt)}
      </div>
    </Link>
  )
}

function timeAgo(date) {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h`
}
