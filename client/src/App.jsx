import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import { ToastProvider } from './hooks/useToast'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Share from './pages/Share'
import Wall from './pages/Wall'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-white dark:bg-dark-900 transition-colors">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editor/:id?" element={<Editor />} />
            <Route path="/meme/:id" element={<Share />} />
            <Route path="/wall" element={<Wall />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}
