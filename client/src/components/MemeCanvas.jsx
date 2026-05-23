import { useRef, useState, useEffect, useCallback } from 'react'
import { Download, Copy, Share2, Type, Palette, Loader2 } from 'lucide-react'
import { getTemplate, templates } from '../utils/templates'
import { useToast } from '../hooks/useToast'
import html2canvas from 'html2canvas'

export default function MemeCanvas({ image, suggestion, onShare }) {
  const toast = useToast()
  const canvasRef = useRef(null)
  const [texts, setTexts] = useState(suggestion?.texts || {})
  const [templateId, setTemplateId] = useState(suggestion?.templateId || 'classic-top-bottom')
  const [dragging, setDragging] = useState(null)
  const [positions, setPositions] = useState({})
  const [fontSize, setFontSize] = useState(100) // percentage scale
  const [sharing, setSharing] = useState(false)

  const template = getTemplate(templateId)

  useEffect(() => {
    if (suggestion?.texts) setTexts(suggestion.texts)
    if (suggestion?.templateId) setTemplateId(suggestion.templateId)
  }, [suggestion])

  const handleTextChange = (id, value) => setTexts(prev => ({ ...prev, [id]: value }))

  const handleMouseDown = (id, e) => {
    e.preventDefault()
    setDragging({ id, startX: e.clientX, startY: e.clientY, startPos: positions[id] || { x: 0, y: 0 } })
  }

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return
    const dx = e.clientX - dragging.startX
    const dy = e.clientY - dragging.startY
    setPositions(prev => ({ ...prev, [dragging.id]: { x: dragging.startPos.x + dx, y: dragging.startPos.y + dy } }))
  }, [dragging])

  const handleMouseUp = () => setDragging(null)

  const handleTouchMove = useCallback((e) => {
    if (!dragging) return
    e.preventDefault()
    const touch = e.touches[0]
    const dx = touch.clientX - dragging.startX
    const dy = touch.clientY - dragging.startY
    setPositions(prev => ({ ...prev, [dragging.id]: { x: dragging.startPos.x + dx, y: dragging.startPos.y + dy } }))
  }, [dragging])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [dragging, handleMouseMove, handleTouchMove])

  const exportPNG = async () => {
    const canvas = await html2canvas(canvasRef.current, { useCORS: true, scale: 2 })
    const link = document.createElement('a')
    link.download = 'meme.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    toast('Meme downloaded as PNG!')
  }

  const copyToClipboard = async () => {
    const canvas = await html2canvas(canvasRef.current, { useCORS: true, scale: 2 })
    canvas.toBlob(blob => {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      toast('Copied to clipboard!')
    })
  }

  const handleShare = async () => {
    setSharing(true)
    await onShare?.({ image, texts, templateId })
    setSharing(false)
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 fade-in">
      {/* Canvas */}
      <div className="flex-1">
        <div ref={canvasRef} className="relative aspect-square rounded-2xl overflow-hidden bg-black shadow-2xl mx-auto max-w-lg">
          <img src={image} alt="" className="w-full h-full object-cover" />
          {template.textPositions.map((pos) => {
            const offset = positions[pos.id] || { x: 0, y: 0 }
            return (
              <div
                key={pos.id}
                onMouseDown={(e) => handleMouseDown(pos.id, e)}
                onTouchStart={(e) => handleMouseDown(pos.id, e.touches[0])}
                className="absolute cursor-move select-none px-2"
                style={{
                  top: pos.y < 50 ? `${pos.y}%` : undefined,
                  bottom: pos.y >= 50 ? `${100 - pos.y}%` : undefined,
                  left: '50%',
                  transform: `translate(calc(-50% + ${offset.x}px), ${offset.y}px)`,
                  maxWidth: `${pos.maxWidth || 90}%`,
                  textAlign: pos.align
                }}
              >
                <p style={{
                  fontFamily: pos.fontFamily,
                  fontSize: `${(pos.fontSize * fontSize) / 100}px`,
                  color: pos.color,
                  WebkitTextStroke: pos.strokeWidth > 0 ? `${pos.strokeWidth}px ${pos.stroke}` : undefined,
                  textShadow: pos.strokeWidth > 0 ? '2px 2px 4px rgba(0,0,0,0.8)' : undefined,
                  lineHeight: 1.2,
                  wordWrap: 'break-word'
                }}>
                  {texts[pos.id] || ''}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="lg:w-80 space-y-4">
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-800 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Type className="w-4 h-4" /> Edit Text</h3>
          {template.textPositions.map(pos => (
            <div key={pos.id}>
              <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{pos.id}</label>
              <textarea
                value={texts[pos.id] || ''}
                onChange={(e) => handleTextChange(pos.id, e.target.value)}
                className="w-full mt-1 p-2 rounded-xl border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-sm resize-none"
                rows={2}
              />
            </div>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-800 space-y-3">
          <h3 className="font-semibold flex items-center gap-2"><Palette className="w-4 h-4" /> Template</h3>
          <div className="grid grid-cols-3 gap-2">
            {templates.map(t => (
              <button key={t.id} onClick={() => setTemplateId(t.id)} className={`p-2 rounded-xl text-xs font-medium transition-all ${templateId === t.id ? 'bg-primary-500 text-white' : 'bg-white dark:bg-dark-700 hover:bg-primary-50 dark:hover:bg-dark-800'}`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-800 space-y-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Font Size</label>
          <input type="range" min={50} max={150} value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full" />
        </div>

        <div className="flex gap-2">
          <button onClick={exportPNG} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors">
            <Download className="w-4 h-4" /> PNG
          </button>
          <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-200 dark:bg-dark-700 font-semibold hover:bg-gray-300 dark:hover:bg-dark-800 transition-colors">
            <Copy className="w-4 h-4" /> Copy
          </button>
          <button onClick={handleShare} disabled={sharing} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-colors disabled:opacity-60">
            {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} {sharing ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}
