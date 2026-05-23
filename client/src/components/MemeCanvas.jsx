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
  const [fontSize, setFontSize] = useState(80)
  const [sharing, setSharing] = useState(false)
  const [textColor, setTextColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('transparent')

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

  const handleTouchStart = (id, e) => {
    const touch = e.touches[0]
    setDragging({ id, startX: touch.clientX, startY: touch.clientY, startPos: positions[id] || { x: 0, y: 0 } })
  }

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return
    setPositions(prev => ({ ...prev, [dragging.id]: { x: e.clientX - dragging.startX + dragging.startPos.x, y: e.clientY - dragging.startY + dragging.startPos.y } }))
  }, [dragging])

  const handleMouseUp = () => setDragging(null)

  const handleTouchMove = useCallback((e) => {
    if (!dragging) return
    e.preventDefault()
    const touch = e.touches[0]
    setPositions(prev => ({ ...prev, [dragging.id]: { x: touch.clientX - dragging.startX + dragging.startPos.x, y: touch.clientY - dragging.startY + dragging.startPos.y } }))
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
    await onShare?.({ image, texts, templateId, positions, textColor, bgColor })
    setSharing(false)
  }

  return (
    <div className="w-full max-w-5xl mx-auto fade-in">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Canvas */}
        <div className="flex-shrink-0">
          <div ref={canvasRef} className="relative rounded-2xl overflow-hidden bg-black shadow-2xl w-full max-w-[350px] lg:w-[350px] aspect-square mx-auto">
            <img src={image} alt="" className="w-full h-full object-cover" />
            {template.textPositions.map((pos) => {
              const offset = positions[pos.id] || { x: 0, y: 0 }
              const scaledFontSize = Math.min((pos.fontSize * fontSize) / 100, 32)
              return (
                <div
                  key={pos.id}
                  onMouseDown={(e) => handleMouseDown(pos.id, e)}
                  onTouchStart={(e) => handleTouchStart(pos.id, e)}
                  className="absolute cursor-move select-none px-2"
                  style={{
                    top: `calc(${Math.min(Math.max(pos.y, 5), 80)}% + ${offset.y}px)`,
                    left: `calc(50% + ${offset.x}px)`,
                    transform: 'translateX(-50%)',
                    maxWidth: '88%',
                    textAlign: 'center'
                  }}
                >
                  <p className="break-words" style={{
                    fontFamily: pos.fontFamily,
                    fontSize: `${scaledFontSize}px`,
                    color: textColor,
                    backgroundColor: bgColor !== 'transparent' ? bgColor : undefined,
                    padding: bgColor !== 'transparent' ? '3px 8px' : undefined,
                    borderRadius: bgColor !== 'transparent' ? '4px' : undefined,
                    WebkitTextStroke: pos.strokeWidth > 0 ? `${Math.min(pos.strokeWidth, 2)}px ${pos.stroke}` : undefined,
                    textShadow: '1px 1px 3px rgba(0,0,0,0.9), -1px -1px 3px rgba(0,0,0,0.9)',
                    lineHeight: 1.3,
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word'
                  }}>
                    {texts[pos.id] || ''}
                  </p>
                </div>
              )
            })}
          </div>
          {/* Export buttons below image */}
          <div className="flex gap-2 mt-3 max-w-[350px] mx-auto">
            <button onClick={exportPNG} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors">
              <Download className="w-3.5 h-3.5" /> PNG
            </button>
            <button onClick={copyToClipboard} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 dark:bg-dark-700 text-xs font-semibold hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors">
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
            <button onClick={handleShare} disabled={sharing} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600 transition-colors disabled:opacity-60">
              {sharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />} Share
            </button>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Text editing */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Type className="w-4 h-4 text-primary-500" /> Edit Text</h3>
            <div className="space-y-2">
              {template.textPositions.map(pos => (
                <div key={pos.id}>
                  <label className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">{pos.id}</label>
                  <textarea
                    value={texts[pos.id] || ''}
                    onChange={(e) => handleTextChange(pos.id, e.target.value)}
                    className="w-full mt-0.5 p-2.5 rounded-lg border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-sm resize-vertical focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all min-h-[60px]"
                    placeholder={`Enter ${pos.id} text...`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Style */}
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-dark-700">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Palette className="w-4 h-4 text-primary-500" /> Style</h3>
            <div className="space-y-3">
              {/* Templates */}
              <div>
                <label className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Template</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => setTemplateId(t.id)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${templateId === t.id ? 'bg-primary-500 text-white' : 'bg-white dark:bg-dark-700 hover:bg-primary-50 dark:hover:bg-dark-800 text-gray-600 dark:text-gray-400'}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <div className="flex justify-between">
                  <label className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Size</label>
                  <span className="text-[11px] text-gray-400">{fontSize}%</span>
                </div>
                <input type="range" min={40} max={120} value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full mt-1" />
              </div>

              {/* Colors */}
              <div>
                <label className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Text Color</label>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-7 h-7 rounded-full p-[2px] bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500">
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-full h-full rounded-full border-0 cursor-pointer" />
                  </div>
                  {['#ffffff', '#000000', '#ff0000', '#ffff00', '#00bfff'].map(c => (
                    <button key={c} onClick={() => setTextColor(c)} className={`w-6 h-6 rounded-full border-[3px] transition-all ${textColor === c ? 'border-primary-500 scale-125 ring-2 ring-primary-300' : 'border-gray-200 dark:border-dark-700 hover:scale-110'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">Background Box</label>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-7 h-7 rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
                    <input type="color" value={bgColor === 'transparent' ? '#000000' : bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-full rounded-full border-0 cursor-pointer" />
                  </div>
                  <button onClick={() => setBgColor('transparent')} className={`w-6 h-6 rounded-full border-[3px] transition-all bg-gradient-to-br from-gray-200 to-gray-400 dark:from-dark-700 dark:to-dark-800 ${bgColor === 'transparent' ? 'border-primary-500 scale-125 ring-2 ring-primary-300' : 'border-gray-200 dark:border-dark-700 hover:scale-110'}`} title="None" />
                  {['#000000cc', '#ffffffcc', '#000000', '#ffffff'].map(c => (
                    <button key={c} onClick={() => setBgColor(c)} className={`w-6 h-6 rounded-full border-[3px] transition-all ${bgColor === c ? 'border-primary-500 scale-125 ring-2 ring-primary-300' : 'border-gray-200 dark:border-dark-700 hover:scale-110'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
