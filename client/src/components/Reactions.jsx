import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const REACTIONS = ['😂', '💀', '🔥', '❤️', '😭', '🤡']

export default function Reactions({ memeId, isCreator }) {
  const [counts, setCounts] = useState({})
  const [socket, setSocket] = useState(null)
  const [reacted, setReacted] = useState(new Set())

  useEffect(() => {
    if (!memeId) return
    const s = io(import.meta.env.VITE_API_URL || '', { path: '/socket.io' })
    s.emit('join', memeId)
    s.on('reactions', (data) => setCounts(data))
    s.on('reaction-update', (data) => setCounts(data))
    setSocket(s)
    return () => s.disconnect()
  }, [memeId])

  const react = (emoji) => {
    if (reacted.has(emoji)) return
    setReacted(prev => new Set([...prev, emoji]))
    socket?.emit('react', { memeId, emoji })
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center stagger">
      {REACTIONS.map(emoji => (
        <button
          key={emoji}
          onClick={() => react(emoji)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-lg transition-all ${reacted.has(emoji) ? 'bg-primary-100 dark:bg-primary-500/20 scale-110' : 'bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-800 hover:scale-105'}`}
        >
          {emoji}
          {counts[emoji] > 0 && <span className="text-sm font-bold">{counts[emoji]}</span>}
        </button>
      ))}
      {isCreator && (
        <div className="w-full text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
          {Object.values(counts).reduce((a, b) => a + b, 0)} total reactions
        </div>
      )}
    </div>
  )
}
