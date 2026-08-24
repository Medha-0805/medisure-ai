import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

interface Alternative {
  id: string
  name: string
  generic_name: string
  composition: string
  manufacturer: string
  price: number
  category: string
  similarity_score: number
}

export default function MedicineAlternatives() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [alternatives, setAlternatives] = useState<Alternative[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a medicine name')
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ML_SERVICE_URL}/recommend/alternatives`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medicine_name: searchQuery, top_k: 10 })
        }
      )

      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      setAlternatives(data.alternatives || [])
      toast.success(`Found ${data.alternatives?.length || 0} alternatives!`)
    } catch (error) {
      toast.error('Failed to find alternatives')
    } finally {
      setLoading(false)
    }
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400'
    if (score >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return 'High Match'
    if (score >= 0.6) return 'Medium Match'
    return 'Low Match'
  }

  const cheapest = alternatives.length > 0
    ? alternatives.reduce((min, alt) => alt.price < min.price ? alt : min)
    : null

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

      <div className="pt-24 px-6 pb-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">
            💊 <span className="gradient-text">Medicine Alternatives</span>
          </h1>
          <p className="text-gray-400 mb-8">Find similar medicines using AI-powered recommendations</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Enter medicine name (e.g. Paracetamol, Ibuprofen...)"
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

          {/* Quick suggestions */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {['Paracetamol', 'Ibuprofen', 'Azithromycin', 'Metformin', 'Atorvastatin'].map((med) => (
              <button
                key={med}
                onClick={() => { setSearchQuery(med); }}
                className="text-xs px-3 py-1 bg-surface border border-gray-700 rounded-full hover:border-primary hover:text-primary transition"
              >
                {med}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3 animate-pulse">🤖</div>
            <p className="text-gray-400">AI is finding alternatives...</p>
          </div>
        )}

        {!loading && searched && alternatives.length === 0 && (
          <div className="text-center py-12 glass rounded-2xl">
            <div className="text-5xl mb-3">😕</div>
            <p className="text-gray-400">No alternatives found for "{searchQuery}"</p>
          </div>
        )}

        {!loading && alternatives.length > 0 && (
          <>
            {/* Cheapest highlight */}
            {cheapest && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-4 mb-4 border border-green-500/30 bg-green-500/5"
              >
                <p className="text-green-400 text-sm font-semibold mb-1">💰 Cheapest Alternative</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold">{cheapest.name}</p>
                    <p className="text-gray-400 text-sm">{cheapest.manufacturer}</p>
                  </div>
                  <p className="text-green-400 font-bold text-xl">₹{cheapest.price}</p>
                </div>
              </motion.div>
            )}

            {/* All results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alternatives.map((alt, index) => (
                <motion.div
                  key={alt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass rounded-xl p-4 border transition ${
                    cheapest?.id === alt.id ? 'border-green-500/30' : 'border-gray-700 hover:border-primary'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{alt.name}</p>
                      <p className="text-xs text-gray-400">{alt.generic_name}</p>
                    </div>
                    <span className={`text-xs font-semibold ${getSimilarityColor(alt.similarity_score)}`}>
                      {getSimilarityLabel(alt.similarity_score)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{alt.composition}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{alt.manufacturer}</span>
                    <span className="text-primary font-bold">₹{alt.price}</span>
                  </div>
                  {/* Similarity bar */}
                  <div className="mt-2 bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${alt.similarity_score * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{(alt.similarity_score * 100).toFixed(0)}% match</p>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}