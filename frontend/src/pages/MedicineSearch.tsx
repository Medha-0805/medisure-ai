import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

interface Medicine {
  id: string
  name: string
  composition: string
  uses: string
  side_effects: string
  manufacturer: string
  image_url: string
  excellent_review: number
  average_review: number
  poor_review: number
}

export default function MedicineSearch() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [query, setQuery] = useState('')
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<Medicine | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a medicine name')
      return
    }

    setLoading(true)
    setSearched(true)
    setSelected(null)
    try {
      const response = await api.get(`/medicines?q=${encodeURIComponent(query)}`)
      setMedicines(response.data.medicines || [])
      if (response.data.medicines?.length === 0) {
        toast('No medicines found', { icon: '🔍' })
      }
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const getReviewColor = (excellent: number) => {
    if (excellent >= 60) return 'text-green-400'
    if (excellent >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getReviewLabel = (excellent: number) => {
    if (excellent >= 60) return 'Highly Rated'
    if (excellent >= 40) return 'Average'
    return 'Low Rating'
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <nav className="glass fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold gradient-text">MediSure AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-sm text-gray-300 hover:text-white transition">← Dashboard</button>
          <span className="text-gray-400 text-sm">{user?.name}</span>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">
            💰 <span className="gradient-text">Medicine Search</span>
          </h1>
          <p className="text-gray-400 mb-8">Search from 11,000+ medicines — composition, uses, reviews and more</p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search medicine name (e.g. Augmentin, Paracetamol, Azithral...)"
              className="flex-1 bg-surface border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
            >
              {loading ? '⏳' : '🔍 Search'}
            </motion.button>
          </div>

          <div className="flex gap-2 mt-3 flex-wrap">
            {['Augmentin', 'Azithral', 'Crocin', 'Dolo', 'Metformin', 'Atorvastatin'].map((med) => (
              <button
                key={med}
                onClick={() => { setQuery(med); }}
                className="text-xs px-3 py-1 bg-surface border border-gray-700 rounded-full hover:border-primary hover:text-primary transition"
              >
                {med}
              </button>
            ))}
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3 animate-pulse">💊</div>
            <p className="text-gray-400">Searching 11,000+ medicines...</p>
          </div>
        )}

        {!loading && searched && medicines.length === 0 && (
          <div className="text-center py-12 glass rounded-2xl">
            <div className="text-5xl mb-3">😕</div>
            <p className="text-gray-400">No medicines found for "{query}"</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Results List */}
          {!loading && medicines.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">{medicines.length} results found</p>
              {medicines.map((med, index) => (
                <motion.div
                  key={med.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setSelected(med)}
                  className={`glass rounded-xl p-4 cursor-pointer transition border ${
                    selected?.id === med.id ? 'border-primary' : 'border-gray-700 hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">{med.name}</p>
                      <p className="text-xs text-gray-400 mt-1">{med.manufacturer}</p>
                      <p className="text-xs text-gray-500 mt-1 truncate">{med.composition}</p>
                    </div>
                    <div className="text-right ml-3">
                      <span className={`text-xs font-semibold ${getReviewColor(med.excellent_review)}`}>
                        ⭐ {med.excellent_review}%
                      </span>
                      <p className={`text-xs ${getReviewColor(med.excellent_review)}`}>
                        {getReviewLabel(med.excellent_review)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Detail Panel */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-2xl p-6 h-fit sticky top-24"
            >
              {selected.image_url && (
                <img
                  src={selected.image_url}
                  alt={selected.name}
                  className="w-32 h-32 object-contain mx-auto mb-4 rounded-xl bg-white p-2"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              )}

              <h2 className="text-xl font-bold mb-1">{selected.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{selected.manufacturer}</p>

              {/* Reviews */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-green-500/10 rounded-lg p-2 text-center">
                  <p className="text-green-400 font-bold">{selected.excellent_review}%</p>
                  <p className="text-xs text-gray-400">Excellent</p>
                </div>
                <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
                  <p className="text-yellow-400 font-bold">{selected.average_review}%</p>
                  <p className="text-xs text-gray-400">Average</p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-2 text-center">
                  <p className="text-red-400 font-bold">{selected.poor_review}%</p>
                  <p className="text-xs text-gray-400">Poor</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-xs text-primary font-semibold mb-1">🧪 Composition</p>
                  <p className="text-sm text-gray-300">{selected.composition}</p>
                </div>
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-xs text-green-400 font-semibold mb-1">✅ Uses</p>
                  <p className="text-sm text-gray-300">{selected.uses}</p>
                </div>
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-xs text-yellow-400 font-semibold mb-1">⚠️ Side Effects</p>
                  <p className="text-sm text-gray-300">{selected.side_effects}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/alternatives?medicine=${encodeURIComponent(selected.name)}`)}
                className="w-full mt-4 bg-primary text-white rounded-xl py-3 font-semibold hover:bg-cyan-500 transition"
              >
                💊 Find Alternatives
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}