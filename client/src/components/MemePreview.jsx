import { getTemplate } from '../utils/templates'

export default function MemePreview({ suggestions, image, onSelect, loading }) {
  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto">
        <div className="text-center mb-4">
          <p className="text-lg font-semibold animate-pulse">✨ AI is cooking your memes...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Analyzing your photo and generating ideas</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-200 dark:bg-dark-700">
                {image && <img src={image} alt="" className="w-full h-full object-cover opacity-40" />}
                <div className="absolute inset-0 shimmer" />
                <div className="absolute inset-x-4 top-[8%] h-5 rounded-full bg-white/30 shimmer" style={{ animationDelay: `${i * 150}ms` }} />
                <div className="absolute inset-x-4 bottom-[8%] h-5 rounded-full bg-white/30 shimmer" style={{ animationDelay: `${i * 150 + 75}ms` }} />
              </div>
              <div className="h-4 w-16 mx-auto rounded-full bg-gray-200 dark:bg-dark-700 shimmer" style={{ animationDelay: `${i * 100}ms` }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!suggestions?.length) return null

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center slide-up">Pick your meme</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 stagger">
        {suggestions.map((s, i) => {
          const template = getTemplate(s.templateId)
          return (
            <button key={i} onClick={() => onSelect(s, i)} className="group text-left">
              <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-primary-500 transition-all group-hover:scale-[1.02] shadow-lg group-hover:shadow-xl">
                <img src={image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                {template.textPositions.map((pos) => (
                  <div key={pos.id} className="absolute left-0 right-0 px-3 text-center" style={{ top: pos.y < 50 ? `${Math.max(pos.y, 3)}%` : undefined, bottom: pos.y >= 50 ? `${100 - pos.y}%` : undefined }}>
                    <p className="text-white font-bold text-sm md:text-base drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ fontFamily: pos.fontFamily, WebkitTextStroke: pos.strokeWidth > 0 ? `1px ${pos.stroke}` : undefined }}>
                      {s.texts?.[pos.id] || ''}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 text-center">{template.name}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
