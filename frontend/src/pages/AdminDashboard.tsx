import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

interface Stats {
  totalUsers: number
  totalMedicines: number
  totalPrescriptions: number
  totalReminders: number
  totalVerifications: number
}

interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  blood_group?: string
  is_active: boolean
  created_at: string
}

interface Verification {
  id: string
  user_id: string
  medicine_id: string
  result: string
  scanned_at: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'verifications'>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'verifications') fetchVerifications()
  }, [activeTab])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data)
    } catch {
      toast.error('Failed to load stats. Admin access required.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data.users || [])
    } catch {
      toast.error('Failed to load users')
    }
  }

  const fetchVerifications = async () => {
    try {
      const response = await api.get('/admin/verifications')
      setVerifications(response.data.verifications || [])
    } catch {
      toast.error('Failed to load verifications')
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/users/${userId}`, { is_active: !currentStatus })
      toast.success(currentStatus ? 'User deactivated' : 'User activated')
      fetchUsers()
    } catch {
      toast.error('Failed to update user')
    }
  }

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'patient' : 'admin'
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole })
      toast.success(`Role updated to ${newRole}`)
      fetchUsers()
    } catch {
      toast.error('Failed to update role')
    }
  }

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-cyan-500 to-blue-500' },
    { label: 'Total Medicines', value: stats.totalMedicines, icon: '💊', color: 'from-green-500 to-emerald-500' },
    { label: 'Prescriptions', value: stats.totalPrescriptions, icon: '📋', color: 'from-purple-500 to-pink-500' },
    { label: 'Active Reminders', value: stats.totalReminders, icon: '⏰', color: 'from-yellow-500 to-orange-500' },
    { label: 'QR Verifications', value: stats.totalVerifications, icon: '✅', color: 'from-red-500 to-rose-500' },
  ] : []

  return (
    <div className="min-h-screen bg-background text-white">
      <nav className="glass fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold gradient-text">MediSure AI</span>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
          >
            ← Dashboard
          </button>
          <span className="text-gray-400 text-sm">{user?.name}</span>
        </div>
      </nav>

      <div className="pt-24 px-6 pb-10 max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">
            🛡️ <span className="gradient-text">Admin Dashboard</span>
          </h1>
          <p className="text-gray-400 mb-8">Platform analytics, user management and verification logs</p>
        </motion.div>

        <div className="flex gap-2 mb-6">
          {(['overview', 'users', 'verifications'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition capitalize ${
                activeTab === tab ? 'bg-primary text-white' : 'glass text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' && '📊 '}
              {tab === 'users' && '👥 '}
              {tab === 'verifications' && '✅ '}
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3 animate-pulse">📊</div>
                <p className="text-gray-400">Loading analytics...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {statCards.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-2xl p-5"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl mb-3`}>
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-gray-800 hover:bg-surface/50">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-gray-400">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => toggleAdminRole(u.id, u.role)}
                          className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition"
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => toggleUserStatus(u.id, u.is_active)}
                          className={`text-xs px-2 py-1 rounded transition ${
                            u.is_active
                              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-3">👥</div>
                <p>No users found</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'verifications' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-left text-gray-400">
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">Medicine ID</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Scanned At</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((v) => (
                    <tr key={v.id} className="border-b border-gray-800 hover:bg-surface/50">
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          v.result === 'authentic' ? 'bg-green-500/20 text-green-400' :
                          v.result === 'suspicious' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {v.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{v.medicine_id?.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono">{v.user_id?.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(v.scanned_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {verifications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-3">✅</div>
                <p>No verification logs yet</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}