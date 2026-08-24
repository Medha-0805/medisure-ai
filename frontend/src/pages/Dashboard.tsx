import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect, useState } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const modules = [
  { icon: '🔬', title: 'Prescription Reader', desc: 'Upload and extract medicine info', color: 'from-cyan-500 to-blue-500', path: '/prescription' },
  { icon: '💊', title: 'Medicine Alternatives', desc: 'Find similar medicines', color: 'from-green-500 to-emerald-500', path: '/alternatives' },
  { icon: '⚠️', title: 'Drug Interactions', desc: 'Check medicine combinations', color: 'from-yellow-500 to-orange-500', path: '/interactions' },
  { icon: '📱', title: 'QR Verification', desc: 'Verify medicine authenticity', color: 'from-purple-500 to-pink-500', path: '/qr' },
  { icon: '📍', title: 'Emergency Locator', desc: 'Find nearby hospitals', color: 'from-red-500 to-rose-500', path: '/emergency' },
  { icon: '⏰', title: 'Reminders', desc: 'Manage medicine schedule', color: 'from-blue-500 to-indigo-500', path: '/reminders' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Chat with health AI', color: 'from-teal-500 to-cyan-500', path: '/chat' },
  { icon: '💰', title: 'Medicine Search', desc: 'Search 11,000+ medicines', color: 'from-amber-500 to-yellow-500', path: '/prices' },
]

interface Stats {
  prescriptions: number
  reminders: number
  verifications: number
  chats: number
}

export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ prescriptions: 0, reminders: 0, verifications: 0, chats: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoadingStats(true)
    try {
      const [remindersRes, prescriptionsRes] = await Promise.allSettled([
        api.get('/reminders'),
        api.get('/prescriptions'),
      ])

      const remindersCount = remindersRes.status === 'fulfilled'
        ? remindersRes.value.data.reminders?.length || 0
        : 0

      const prescriptionsCount = prescriptionsRes.status === 'fulfilled'
        ? prescriptionsRes.value.data.prescriptions?.length || 0
        : 0

      setStats({
        prescriptions: prescriptionsCount,
        reminders: remindersCount,
        verifications: 0,
        chats: 0,
      })
    } catch (error) {
      console.error('Failed to fetch stats')
    } finally {
      setLoadingStats(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const statCards = [
    { label: 'Prescriptions', value: stats.prescriptions, icon: '📋' },
    { label: 'Reminders', value: stats.reminders, icon: '⏰' },
    { label: 'Verifications', value: stats.verifications, icon: '✅' },
    { label: 'Chat Sessions', value: stats.chats, icon: '💬' },
  ]

  return (
    <div className="min-h-screen bg-background text-white">
      <nav className="glass fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold gradient-text">MediSure AI</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Hello, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="gradient-text">{user?.name}</span> 👋
            </h1>
            <p className="text-gray-400 mt-1">What would you like to do today?</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {statCards.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4 text-center"
              >
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-primary">
                  {loadingStats ? '...' : stat.value}
                </div>
                <div className="text-gray-400 text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <h2 className="text-xl font-semibold mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modules.map((module, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(module.path)}
                className="glass rounded-2xl p-6 cursor-pointer hover:border-primary transition"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center text-2xl mb-4`}>
                  {module.icon}
                </div>
                <h3 className="font-semibold mb-1">{module.title}</h3>
                <p className="text-gray-400 text-xs">{module.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}