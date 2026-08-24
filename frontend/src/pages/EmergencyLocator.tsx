import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

interface Location {
  lat: number
  lng: number
}

export default function EmergencyLocator() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)

  const emergencyNumbers = [
    { name: 'Ambulance', number: '108', icon: '🚑', color: 'from-red-500 to-rose-600' },
    { name: 'Police', number: '100', icon: '🚔', color: 'from-blue-500 to-blue-600' },
    { name: 'Fire Brigade', number: '101', icon: '🚒', color: 'from-orange-500 to-red-500' },
    { name: 'Disaster Mgmt', number: '1078', icon: '🆘', color: 'from-purple-500 to-purple-600' },
    { name: 'Women Helpline', number: '1091', icon: '👩', color: 'from-pink-500 to-pink-600' },
    { name: 'Child Helpline', number: '1098', icon: '👶', color: 'from-yellow-500 to-yellow-600' },
  ]

  const getLocation = () => {
    setLoading(true)
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setLocation(loc)
        toast.success('Location found!')
        setLoading(false)
      },
      () => {
        toast.error('Unable to get your location. Please allow location access.')
        setLoading(false)
      }
    )
  }

  const openGoogleMaps = (type: string) => {
    if (!location) {
      toast.error('Please get your location first')
      return
    }
    window.open(
      `https://www.google.com/maps/search/${type}/@${location.lat},${location.lng},15z`,
      '_blank'
    )
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

      <div className="pt-24 px-6 pb-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">
            📍 <span className="gradient-text">Emergency Locator</span>
          </h1>
          <p className="text-gray-400 mb-8">Find nearby hospitals and pharmacies instantly</p>
        </motion.div>

        {/* Emergency Numbers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-lg font-semibold mb-4 text-red-400">🚨 Emergency Numbers (India)</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {emergencyNumbers.map((item, index) => (
              <motion.a
                key={index}
                href={`tel:${item.number}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-center cursor-pointer`}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <p className="font-bold text-lg">{item.number}</p>
                <p className="text-xs opacity-80">{item.name}</p>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Location Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">📍 Your Location</h2>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={getLocation}
              disabled={loading}
              className="w-full bg-primary text-white rounded-xl py-3 font-semibold hover:bg-cyan-500 transition disabled:opacity-50 mb-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Getting location...
                </span>
              ) : '📍 Get My Location'}
            </motion.button>

            {location && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="p-3 bg-surface rounded-lg">
                  <p className="text-xs text-gray-400">Coordinates</p>
                  <p className="text-sm font-mono">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openGoogleMaps('hospitals')}
                    className="p-3 bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition"
                  >
                    🏥 Nearby Hospitals
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openGoogleMaps('pharmacy')}
                    className="p-3 bg-green-500/20 text-green-400 rounded-xl text-sm font-semibold hover:bg-green-500/30 transition"
                  >
                    💊 Nearby Pharmacies
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openGoogleMaps('blood bank')}
                    className="p-3 bg-red-500/20 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition"
                  >
                    🩸 Blood Banks
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openGoogleMaps('clinic')}
                    className="p-3 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/30 transition"
                  >
                    🩺 Clinics
                  </motion.button>
                </div>
              </motion.div>
            )}

            {!location && !loading && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-5xl mb-3">📍</div>
                <p className="text-sm">Click the button above to get your current location</p>
              </div>
            )}
          </motion.div>

          {/* Map */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">🗺️ Map View</h2>
            {location ? (
              <iframe
                src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
                width="100%"
                height="300"
                className="rounded-xl border border-gray-700"
                title="Your Location"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-64 bg-surface rounded-xl border border-gray-700">
                <div className="text-center text-gray-500">
                  <div className="text-5xl mb-3">🗺️</div>
                  <p className="text-sm">Map will appear here after getting your location</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* First Aid Tips */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">🩹 Quick First Aid Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Heart Attack', tips: ['Call 108 immediately', 'Keep patient calm and still', 'Loosen tight clothing', 'Give aspirin if available'], icon: '❤️' },
              { title: 'Severe Bleeding', tips: ['Apply firm pressure', 'Use clean cloth or bandage', 'Elevate injured area', 'Do not remove bandage'], icon: '🩸' },
              { title: 'Unconscious Person', tips: ['Check breathing', 'Place in recovery position', 'Do not give food/water', 'Call 108 immediately'], icon: '😮' },
            ].map((item, index) => (
              <div key={index} className="bg-surface rounded-xl p-4">
                <p className="font-semibold mb-2">{item.icon} {item.title}</p>
                <ul className="space-y-1">
                  {item.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                      <span className="text-primary mt-0.5">•</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}