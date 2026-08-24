import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'

interface Reminder {
  id: string
  medicine_name: string
  dosage: string
  frequency: string
  times: string[]
  start_date: string
  end_date: string
  is_active: boolean
  notes: string
}

interface ReminderForm {
  medicine_name: string
  dosage: string
  frequency: string
  times: string[]
  start_date: string
  end_date: string
  notes: string
}

export default function Reminders() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ReminderForm>({
    medicine_name: '',
    dosage: '',
    frequency: 'once_daily',
    times: ['08:00'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    notes: ''
  })

  const frequencyOptions = [
    { value: 'once_daily', label: 'Once Daily', times: 1 },
    { value: 'twice_daily', label: 'Twice Daily', times: 2 },
    { value: 'thrice_daily', label: 'Thrice Daily', times: 3 },
    { value: 'four_times', label: 'Four Times Daily', times: 4 },
    { value: 'weekly', label: 'Weekly', times: 1 },
    { value: 'as_needed', label: 'As Needed', times: 1 },
  ]

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    setLoading(true)
    try {
      const response = await api.get('/reminders')
      setReminders(response.data.reminders || [])
    } catch (error) {
      console.error('Failed to fetch reminders')
    } finally {
      setLoading(false)
    }
  }

  const handleFrequencyChange = (freq: string) => {
    const option = frequencyOptions.find(f => f.value === freq)
    const timesCount = option?.times || 1
    const defaultTimes = ['08:00', '14:00', '20:00', '22:00']
    setForm({
      ...form,
      frequency: freq,
      times: defaultTimes.slice(0, timesCount)
    })
  }

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...form.times]
    newTimes[index] = value
    setForm({ ...form, times: newTimes })
  }

  const handleSubmit = async () => {
    if (!form.medicine_name.trim()) {
      toast.error('Please enter medicine name')
      return
    }

    try {
      if (editingId) {
        await api.put(`/reminders/${editingId}`, form)
        toast.success('Reminder updated!')
      } else {
        await api.post('/reminders', form)
        toast.success('Reminder created!')
      }
      setShowForm(false)
      setEditingId(null)
      resetForm()
      fetchReminders()
    } catch (error) {
      toast.error('Failed to save reminder')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/reminders/${id}`)
      toast.success('Reminder deleted!')
      fetchReminders()
    } catch (error) {
      toast.error('Failed to delete reminder')
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/reminders/${id}`, { is_active: !isActive })
      toast.success(isActive ? 'Reminder paused' : 'Reminder activated')
      fetchReminders()
    } catch (error) {
      toast.error('Failed to update reminder')
    }
  }

  const handleEdit = (reminder: Reminder) => {
    setForm({
      medicine_name: reminder.medicine_name,
      dosage: reminder.dosage,
      frequency: reminder.frequency,
      times: reminder.times,
      start_date: reminder.start_date,
      end_date: reminder.end_date || '',
      notes: reminder.notes || ''
    })
    setEditingId(reminder.id)
    setShowForm(true)
  }

  const resetForm = () => {
    setForm({
      medicine_name: '',
      dosage: '',
      frequency: 'once_daily',
      times: ['08:00'],
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: ''
    })
  }

  const getFrequencyLabel = (freq: string) => {
    return frequencyOptions.find(f => f.value === freq)?.label || freq
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">⏰ <span className="gradient-text">Medicine Reminders</span></h1>
            <p className="text-gray-400 mt-1">Never miss your medication again</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { resetForm(); setEditingId(null); setShowForm(true) }}
            className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-cyan-500 transition"
          >
            + Add Reminder
          </motion.button>
        </motion.div>

        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass rounded-2xl p-6 mb-6"
            >
              <h2 className="text-lg font-semibold mb-4">
                {editingId ? 'Edit Reminder' : 'New Reminder'}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Medicine Name *</label>
                  <input
                    type="text"
                    value={form.medicine_name}
                    onChange={(e) => setForm({ ...form, medicine_name: e.target.value })}
                    placeholder="e.g. Paracetamol 500mg"
                    className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Dosage</label>
                  <input
                    type="text"
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    placeholder="e.g. 1 tablet"
                    className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => handleFrequencyChange(e.target.value)}
                    className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                  >
                    {frequencyOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">End Date (optional)</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Notes</label>
                  <input
                    type="text"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Take after meals"
                    className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Times */}
              <div className="mt-4">
                <label className="text-sm text-gray-400 mb-2 block">Reminder Times</label>
                <div className="flex gap-3 flex-wrap">
                  {form.times.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Time {index + 1}:</span>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="bg-surface border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary transition"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-cyan-500 transition"
                >
                  {editingId ? 'Update Reminder' : 'Save Reminder'}
                </motion.button>
                <button
                  onClick={() => { setShowForm(false); setEditingId(null); resetForm() }}
                  className="px-6 py-3 glass text-gray-300 rounded-xl hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reminders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3 animate-pulse">⏰</div>
            <p className="text-gray-400">Loading reminders...</p>
          </div>
        ) : reminders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 glass rounded-2xl">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-xl font-semibold mb-2">No Reminders Yet</h3>
            <p className="text-gray-400 mb-6">Add your first medicine reminder to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-cyan-500 transition"
            >
              + Add First Reminder
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder, index) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`glass rounded-2xl p-5 border transition ${
                  reminder.is_active ? 'border-primary/30' : 'border-gray-700 opacity-60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{reminder.medicine_name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        reminder.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {reminder.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <div className="flex gap-4 flex-wrap text-sm text-gray-400">
                      {reminder.dosage && (
                        <span>💊 {reminder.dosage}</span>
                      )}
                      <span>🔄 {getFrequencyLabel(reminder.frequency)}</span>
                      <span>📅 From {reminder.start_date}</span>
                      {reminder.end_date && <span>To {reminder.end_date}</span>}
                    </div>

                    {reminder.times && reminder.times.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {reminder.times.map((time, i) => (
                          <span key={i} className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-lg">
                            🕐 {time}
                          </span>
                        ))}
                      </div>
                    )}

                    {reminder.notes && (
                      <p className="text-xs text-gray-500 mt-2">📝 {reminder.notes}</p>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggle(reminder.id, reminder.is_active)}
                      className={`px-3 py-2 rounded-lg text-xs transition ${
                        reminder.is_active
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {reminder.is_active ? '⏸ Pause' : '▶ Resume'}
                    </button>
                    <button
                      onClick={() => handleEdit(reminder)}
                      className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs hover:bg-blue-500/30 transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}