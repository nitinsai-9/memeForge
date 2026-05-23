import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import PhotoUpload from '../components/PhotoUpload'
import MemePreview from '../components/MemePreview'
import MemeCanvas from '../components/MemeCanvas'
import { compressImage } from '../utils/compress'

const API = import.meta.env.VITE_API_URL || ''

export default function Home() {
  const [image, setImage] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('upload') // upload | suggest | edit
  const navigate = useNavigate()
  const location = useLocation()

  // Handle remix from shared meme
  useEffect(() => {
    if (location.state?.remixImage) {
      handleUpload(location.state.remixImage)
      window.history.replaceState({}, '')
    }
  }, [])

  const handleUpload = async (dataUrl) => {
    setImage(dataUrl)
    setStep('suggest')
    setLoading(true)
    setError(null)
    try {
      const compressed = await compressImage(dataUrl)
      const { data } = await axios.post(`${API}/api/meme/suggest`, { image: compressed })
      setSuggestions(data.suggestions)
    } catch (err) {
      console.error(err)
      const msg = err.response?.status === 429 ? 'AI is rate-limited. Please wait a moment and try again.' : err.response?.status === 401 ? 'API key issue. Check server configuration.' : 'Something went wrong generating memes. Please try again.'
      setError(msg)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const retry = () => { if (image) handleUpload(image) }

  const handleSelect = (suggestion) => {
    setSelected(suggestion)
    setStep('edit')
  }

  const handleFeelingLucky = () => {
    if (!suggestions.length) return
    const random = suggestions[Math.floor(Math.random() * suggestions.length)]
    setSelected(random)
    setStep('edit')
  }

  const handleShare = async (memeData) => {
    try {
      const { data } = await axios.post(`${API}/api/meme/share`, memeData)
      navigate(`/meme/${data.id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const reset = () => { setImage(null); setSuggestions([]); setSelected(null); setStep('upload') }

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-16">
      {/* Hero */}
      {step === 'upload' && (
        <div className="text-center mb-12 fade-in relative">
          {/* Floating emojis background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {['😂', '🔥', '💀', '🤡', '❤️', '✨'].map((emoji, i) => (
              <span key={i} className="absolute text-2xl sm:text-3xl opacity-20 float-emoji" style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%`, animationDelay: `${i * 0.5}s` }}>{emoji}</span>
            ))}
          </div>

          <div className="inline-block px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-semibold mb-6 slide-up">
            ✨ Powered by AI Vision
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4 slide-up" style={{ animationDelay: '100ms' }}>
            <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">AI Meme Maker</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto px-2 slide-up" style={{ animationDelay: '200ms' }}>
            Upload a photo. Get 6 AI-generated meme ideas. Edit, export, share — watch reactions roll in live.
          </p>

          {/* Flow steps */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 slide-up" style={{ animationDelay: '400ms' }}>
            {['📤 Upload', '✨ AI Suggests', '🎨 Edit', '🔗 Share', '🤣 React'].map((item, i) => (
              <span key={item} className="flex items-center gap-1">
                <span className="text-xs text-gray-400 dark:text-gray-500">{item}</span>
                {i < 4 && <span className="text-gray-300 dark:text-gray-600 text-xs">→</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Upload */}
      {step === 'upload' && (
        <>
          <PhotoUpload onUpload={handleUpload} />
        </>
      )}

      {/* Steps indicator */}
      {step !== 'upload' && (
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex gap-1">
            {['upload', 'suggest', 'edit'].map((s, i) => (
              <div key={s} className={`w-8 h-1 rounded-full ${['upload', 'suggest', 'edit'].indexOf(step) >= i ? 'bg-primary-500' : 'bg-gray-200 dark:bg-dark-700'}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={reset} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors">
              ← Start over
            </button>
            {step === 'edit' && (
              <button onClick={() => setStep('suggest')} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-colors">
                ← Back to suggestions
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {step === 'suggest' && (
        <>
          {error ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <span className="text-3xl">😵</span>
              </div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Oops!</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <button onClick={retry} className="px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors">
                  Try again
                </button>
                <button onClick={() => { setStep('upload'); setError(null) }} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-700 text-sm font-medium hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors">
                  Upload different photo
                </button>
              </div>
            </div>
          ) : (
            <>
              <MemePreview suggestions={suggestions} image={image} onSelect={handleSelect} loading={loading} />
              {!loading && suggestions.length > 0 && (
                <div className="flex justify-center mt-6">
                  <button onClick={handleFeelingLucky} className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    🎰 I'm feeling lucky
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
      {step === 'edit' && <MemeCanvas image={image} suggestion={selected} onShare={handleShare} />}
    </main>
  )
}
