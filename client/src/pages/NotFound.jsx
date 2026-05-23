import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center fade-in">
      <span className="text-6xl">🫠</span>
      <h1 className="text-2xl font-bold mt-4">404 — Page not found</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">This meme doesn't exist. Yet.</p>
      <Link to="/" className="inline-block mt-6 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors">
        Make one →
      </Link>
    </main>
  )
}
