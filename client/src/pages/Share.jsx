import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Link2, Plus, Repeat2 } from 'lucide-react'
import Reactions from '../components/Reactions'
import { getTemplate } from '../utils/templates'

const API = import.meta.env.VITE_API_URL || ''

export default function Share() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [meme, setMeme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.title = 'Shared Meme - MemeForge'
    axios.get(`${API}/api/meme/${id}`).then(({ data }) => setMeme(data)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between mb-4">
        <div className="h-8 w-28 rounded-lg bg-gray-200 dark:bg-dark-700 shimmer" />
        <div className="h-8 w-24 rounded-lg bg-gray-200 dark:bg-dark-700 shimmer" style={{ animationDelay: '150ms' }} />
      </div>
      <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-dark-700 overflow-hidden relative mb-6">
        <div className="absolute inset-0 shimmer" />
      </div>
      <div className="flex justify-center gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-14 rounded-full bg-gray-200 dark:bg-dark-700 shimmer" style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    </main>
  )
  if (!meme) return <div className="text-center py-20 text-gray-500">Meme not found 😢</div>

  const template = getTemplate(meme.templateId)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Action bar */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 mb-4">
        {location.state?.fromEditor && (
          <button onClick={() => navigate('/', { state: { backToEditor: true, image: meme.image, suggestion: location.state?.suggestion, suggestions: location.state?.suggestions } })} className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors text-center">
            ← Back
          </button>
        )}
        <button onClick={() => navigate('/', { state: { remixImage: meme.image } })} className="px-3 py-2 text-xs font-medium rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors text-center">
          ♻️ Remix
        </button>
        <Link to="/" className="px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors text-center">
          + Create yours
        </Link>
        <button onClick={copyLink} className="sm:ml-auto px-3 py-2 text-xs font-medium rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors text-center">
          {copied ? '✓ Copied!' : '🔗 Copy link'}
        </button>
      </div>

      <div className="relative aspect-square rounded-2xl overflow-hidden bg-black shadow-2xl mb-6">
        <img src={meme.image} alt="" className="w-full h-full object-cover" />
        {template.textPositions.map(pos => {
          const offset = meme.positions?.[pos.id] || { x: 0, y: 0 }
          return (
            <div key={pos.id} className="absolute left-0 right-0 px-4 text-center" style={{ top: `${Math.min(Math.max(pos.y, 5), 90)}%`, left: '50%', transform: `translate(calc(-50% + ${offset.x || 0}px), ${offset.y || 0}px)`, maxWidth: `${pos.maxWidth || 90}%` }}>
              <p style={{ fontFamily: pos.fontFamily, fontSize: `clamp(16px, 4vw, ${pos.fontSize}px)`, color: meme.textColor || '#ffffff', backgroundColor: meme.bgColor && meme.bgColor !== 'transparent' ? meme.bgColor : undefined, padding: meme.bgColor && meme.bgColor !== 'transparent' ? '4px 10px' : undefined, borderRadius: meme.bgColor && meme.bgColor !== 'transparent' ? '6px' : undefined, WebkitTextStroke: pos.strokeWidth > 0 ? `${pos.strokeWidth}px ${pos.stroke}` : undefined, textShadow: '2px 2px 4px rgba(0,0,0,0.9)', lineHeight: 1.2 }}>
                {meme.texts?.[pos.id] || ''}
              </p>
            </div>
          )
        })}
      </div>
      <Reactions memeId={id} />
    </main>
  )
}
