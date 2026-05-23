import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, Camera, Clipboard, Image } from 'lucide-react'

export default function PhotoUpload({ onUpload }) {
  const [dragOver, setDragOver] = useState(false)
  const [webcamStream, setWebcamStream] = useState(null)
  const videoRef = useRef(null)
  const fileRef = useRef(null)

  const handleFile = useCallback((file) => {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => onUpload(e.target.result, file)
    reader.readAsDataURL(file)
  }, [onUpload])

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }
  const handlePaste = useCallback((e) => { const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/')); if (item) handleFile(item.getAsFile()) }, [handleFile])

  useEffect(() => { document.addEventListener('paste', handlePaste); return () => document.removeEventListener('paste', handlePaste) }, [handlePaste])

  const startWebcam = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
    setWebcamStream(stream)
    if (videoRef.current) videoRef.current.srcObject = stream
  }

  const captureWebcam = () => {
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    webcamStream.getTracks().forEach(t => t.stop())
    setWebcamStream(null)
    onUpload(canvas.toDataURL('image/png'), null)
  }

  return (
    <div className="w-full max-w-2xl mx-auto slide-up">
      {webcamStream ? (
        <div className="relative rounded-2xl overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl" />
          <button onClick={captureWebcam} className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-primary-500 text-white rounded-full font-semibold hover:bg-primary-600 transition-colors">
            📸 Capture
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 scale-[1.02]' : 'border-gray-300 dark:border-dark-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-dark-800'}`}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-500/20 flex items-center justify-center">
              <Image className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <p className="text-lg font-semibold">Drop your photo here</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or click to browse • paste from clipboard</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-dark-700 font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-dark-700 font-mono text-[10px]">V</kbd> to paste from clipboard
              </p>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-center gap-3 mt-4">
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors text-sm font-medium">
          <Upload className="w-4 h-4" /> Upload
        </button>
        <button onClick={startWebcam} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors text-sm font-medium">
          <Camera className="w-4 h-4" /> Webcam
        </button>
        <button onClick={() => navigator.clipboard.read()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-800 transition-colors text-sm font-medium">
          <Clipboard className="w-4 h-4" /> Paste
        </button>
      </div>
    </div>
  )
}
