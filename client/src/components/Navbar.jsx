import { Link } from 'react-router-dom'
import { Sun, Moon, Sparkles, Trophy } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

export default function Navbar() {
  const { dark, toggle } = useTheme()
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-dark-900/80 border-b border-gray-200 dark:border-dark-700">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Sparkles className="w-6 h-6 text-primary-500" />
          <span className="bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">MemeForge</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/wall" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
            <Trophy className="w-4 h-4 text-yellow-500" /> Wall
          </Link>
          <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
            {dark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>
        </div>
      </div>
    </nav>
  )
}
