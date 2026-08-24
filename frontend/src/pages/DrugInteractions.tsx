import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

interface Interaction {
  drug1: string
  drug2: string
  severity: 'safe' | 'warning' | 'dangerous'
  description: string
  recommendation: string
  source: string
}

export default function DrugInteractions() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [drugs, setDrugs] = useState<string[]>(['', ''])
  const [loading, setLoading] = useState(false)
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [checked, setChecked] = useState(false)

  const addDrug = () => {
    if (drugs.length < 5) setDrugs([...drugs, ''])
    else toast.error('Maximum 5 drugs allowed')
  }

  const removeDrug = (index: number) => {
    if (drugs.length <= 2) {
      toast.error('Minimum 2 drugs required')
      return
    }
    setDrugs(drugs.filter((_, i) => i !== index))
  }

  const updateDrug = (index: number, value: string) => {
    const updated = [...drugs]
    updated[index] = value
    setDrugs(updated)
  }

  const handleCheck = async () => {
    const validDrugs = drugs.filter(d => d.trim())
    if (validDrugs.length < 2) {
      toast.error('Enter at least 2 medicine names')
      return
    }

    setLoading(true)
    setChecked(true)
    try {
      const response = await fetch(
        `${import.meta.env.VITE_ML_SERVICE_URL}/interaction/check`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ drugs: validDrugs })
        }
      )

      if (!response.ok) throw new Error('Check failed')

      const data = await response.json()
      setInteractions(data.interactions || [])

      const dangerous = data.interactions?.filter((i: Interaction) => i.severity === 'dangerous').length || 0
      const warnings = data.interactions?.filter((i: Interaction) => i.severity === 'warning').length || 0

      if (dangerous > 0) toast.error(`⚠️ ${dangerous} dangerous interaction(s) found!`)
      else if (warnings > 0) toast(`⚠️ ${warnings} warning(s) found`, { icon: '⚠️' })
      else toast.success('No dangerous interactions found!')
    } catch (error) {
      toast.error('Failed to check interactions')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'dangerous':
        return { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', icon: '🚨', label: 'DANGEROUS' }
      case 'warning':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: '⚠️', label: 'WARNING' }
      default:
        return { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: '✅', label: 'SAFE' }
    }
  }

  const overallStatus = () => {
    if (interactions.some(i => i.severity === 'dangerous')) return 'dangerous'
    if (interactions.some(i => i.severity === 'warning')) return 'warning'
    return 'safe'
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

      <div className="pt-24 px-6 pb-10 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">
            ⚠️ <span className="gradient-text">Drug Interaction Checker</span>
          </h1>
          <p className="text-gray-400 mb-8">Check if your medicines are safe to take together</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Enter Medicines</h2>

            <div className="space-y-3 mb-4">
              <AnimatePresence>
                {drugs.map((drug, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={drug}
                      onChange={(e) => updateDrug(index, e.target.value)}
                      placeholder={`Medicine ${index + 1}`}
                      className="flex-1 bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                    />
                    {drugs.length > 2 && (
                      <button
                        onClick={() => removeDrug(index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                      >
                        ✕
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={addDrug}
              className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-primary hover:text-primary transition text-sm mb-4"
            >
              + Add Another Medicine
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCheck}
              disabled={loading}
              className="w-full bg-primary text-white rounded-xl py-3 font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Checking...
                </span>
              ) : '🔍 Check Interactions'}
            </motion.button>

            {/* Quick examples */}
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Quick examples:</p>
              <div className="space-y-1">
                {[
                  ['Warfarin', 'Aspirin'],
                  ['Metformin', 'Alcohol'],
                  ['Ibuprofen', 'Aspirin'],
                ].map((pair, i) => (
                  <button
                    key={i}
                    onClick={() => setDrugs([...pair, ...drugs.slice(2)])}
                    className="w-full text-left text-xs px-3 py-2 bg-surface rounded-lg hover:bg-gray-700 transition text-gray-400"
                  >
                    {pair.join(' + ')}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              ⚠️ Always consult a doctor before changing medications
            </p>
          </motion.div>

          {/* Results Section */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Interaction Results</h2>

            {!checked && !loading && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-3">💊</div>
                <p>Enter medicines and check for interactions</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3 animate-pulse">🔬</div>
                <p className="text-gray-400">Checking interactions...</p>
              </div>
            )}

            {checked && !loading && interactions.length > 0 && (
              <div className="space-y-3">
                {/* Overall status */}
                <div className={`p-3 rounded-xl border ${getSeverityConfig(overallStatus()).bg} mb-4`}>
                  <p className={`font-bold text-center ${getSeverityConfig(overallStatus()).color}`}>
                    {getSeverityConfig(overallStatus()).icon} Overall: {getSeverityConfig(overallStatus()).label}
                  </p>
                </div>

                {interactions.map((interaction, index) => {
                  const config = getSeverityConfig(interaction.severity)
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-xl border ${config.bg}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-sm">
                          {interaction.drug1} + {interaction.drug2}
                        </p>
                        <span className={`text-xs font-bold ${config.color}`}>
                          {config.icon} {config.label}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs mb-2">{interaction.description}</p>
                      <p className={`text-xs font-medium ${config.color}`}>
                        💡 {interaction.recommendation}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">Source: {interaction.source}</p>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}