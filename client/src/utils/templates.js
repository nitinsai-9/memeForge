// 6+ reusable meme template recipes
export const templates = [
  {
    id: 'classic-top-bottom',
    name: 'Classic',
    description: 'Top and bottom text, Impact style',
    textPositions: [
      { id: 'top', x: 50, y: 8, fontSize: 48, fontFamily: 'Impact', color: '#ffffff', stroke: '#000000', strokeWidth: 3, align: 'center', maxWidth: 90 },
      { id: 'bottom', x: 50, y: 88, fontSize: 48, fontFamily: 'Impact', color: '#ffffff', stroke: '#000000', strokeWidth: 3, align: 'center', maxWidth: 90 }
    ],
    imageStyle: { fit: 'cover', borderRadius: 0 }
  },
  {
    id: 'modern-caption',
    name: 'Caption',
    description: 'White bar on top with caption',
    textPositions: [
      { id: 'caption', x: 50, y: -15, fontSize: 28, fontFamily: 'Inter', color: '#000000', stroke: 'none', strokeWidth: 0, align: 'center', maxWidth: 90, background: '#ffffff', padding: 20 }
    ],
    imageStyle: { fit: 'contain', borderRadius: 0, marginTop: 80 }
  },
  {
    id: 'demotivational',
    name: 'Demotivational',
    description: 'Black border with title and subtitle',
    textPositions: [
      { id: 'title', x: 50, y: 10, fontSize: 36, fontFamily: 'Times New Roman', color: '#ffffff', stroke: 'none', strokeWidth: 0, align: 'center', maxWidth: 80 },
      { id: 'subtitle', x: 50, y: 78, fontSize: 18, fontFamily: 'Times New Roman', color: '#cccccc', stroke: 'none', strokeWidth: 0, align: 'center', maxWidth: 80 }
    ],
    imageStyle: { fit: 'contain', borderRadius: 0, border: '3px solid #333', background: '#000000', padding: 40 }
  },
  {
    id: 'twitter-post',
    name: 'Tweet',
    description: 'Fake tweet style with image below',
    textPositions: [
      { id: 'tweet', x: 50, y: -18, fontSize: 22, fontFamily: 'Inter', color: '#0f1419', stroke: 'none', strokeWidth: 0, align: 'left', maxWidth: 85, background: '#ffffff', padding: 24 }
    ],
    imageStyle: { fit: 'cover', borderRadius: 12, marginTop: 90 }
  },
  {
    id: 'expanding-brain',
    name: 'Reaction',
    description: 'Side-by-side text and image reaction',
    textPositions: [
      { id: 'setup', x: 25, y: 50, fontSize: 24, fontFamily: 'Inter', color: '#ffffff', stroke: '#000000', strokeWidth: 1, align: 'center', maxWidth: 45 }
    ],
    imageStyle: { fit: 'cover', borderRadius: 0, position: 'right' }
  },
  {
    id: 'nobody',
    name: 'Nobody:',
    description: 'Nobody: ... Me: [image]',
    textPositions: [
      { id: 'nobody', x: 50, y: 8, fontSize: 24, fontFamily: 'Inter', color: '#ffffff', stroke: '#000000', strokeWidth: 1, align: 'left', maxWidth: 90 },
      { id: 'me', x: 50, y: 22, fontSize: 24, fontFamily: 'Inter', color: '#ffffff', stroke: '#000000', strokeWidth: 1, align: 'left', maxWidth: 90 }
    ],
    imageStyle: { fit: 'cover', borderRadius: 8, marginTop: 100 }
  },
  {
    id: 'drake',
    name: 'This/That',
    description: 'Reject one thing, prefer another',
    textPositions: [
      { id: 'reject', x: 50, y: 25, fontSize: 28, fontFamily: 'Inter', color: '#000000', stroke: 'none', strokeWidth: 0, align: 'center', maxWidth: 45 },
      { id: 'prefer', x: 50, y: 75, fontSize: 28, fontFamily: 'Inter', color: '#000000', stroke: 'none', strokeWidth: 0, align: 'center', maxWidth: 45 }
    ],
    imageStyle: { fit: 'cover', borderRadius: 0, split: 'horizontal' }
  }
]

export function getTemplate(id) {
  return templates.find(t => t.id === id) || templates[0]
}
