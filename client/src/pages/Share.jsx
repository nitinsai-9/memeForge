import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Link2, Plus, Repeat2 } from 'lucide-react'
import Reactions from '../components/Reactions'
import { getTemplate } from '../utils/templates'

const API = import.meta.env.VITE_API_URL || ''

export default function Share() {
  const { id } = useParams()
  const navigate = useNavigate()
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
      <div className="flex items-center justify-between mb-4">
        <Link to="/" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors">
          <Plus className="w-4 h-4" /> Create new
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/', { state: { remixImage: meme.image } })} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors">
            <Repeat2 className="w-4 h-4" /> Remix
          </button>
          <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors">
            {copied ? '✓ Copied!' : <><Link2 className="w-4 h-4" /> Copy link</>}
          </button>
        </div>
      </div>

      <div className="relative aspect-square rounded-2xl overflow-hidden bg-black shadow-2xl mb-6">
        <img src={meme.image} alt="" className="w-full h-full object-cover" />
        {template.textPositions.map(pos => (
          <div key={pos.id} className="absolute left-0 right-0 px-4 text-center" style={{ top: pos.y < 50 ? `${pos.y}%` : undefined, bottom: pos.y >= 50 ? `${100 - pos.y}%` : undefined }}>
            <p style={{ fontFamily: pos.fontFamily, fontSize: `${pos.fontSize}px`, color: pos.color, WebkitTextStroke: pos.strokeWidth > 0 ? `${pos.strokeWidth}px ${pos.stroke}` : undefined, textShadow: '2px 2px 4px rgba(0,0,0,0.8)', lineHeight: 1.2 }}>
              {meme.texts?.[pos.id] || ''}
            </p>
          </div>
        ))}
      </div>
      <Reactions memeId={id} />
    </main>
  )
}
