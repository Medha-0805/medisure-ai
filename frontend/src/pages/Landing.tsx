import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const features = [
  { icon: '💊', title: 'Medicine Verification', desc: 'Verify medicines via QR code instantly' },
  { icon: '🔬', title: 'AI Prescription Reader', desc: 'Extract medicine info from prescriptions' },
  { icon: '🤖', title: 'AI Health Assistant', desc: 'Chat with our intelligent health bot' },
  { icon: '⚠️', title: 'Drug Interaction Checker', desc: 'Check safe medicine combinations' },
  { icon: '📍', title: 'Emergency Locator', desc: 'Find nearby hospitals and pharmacies' },
  { icon: '⏰', title: 'Medicine Reminders', desc: 'Never miss your medication again' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Navbar */}
      <nav className="glass fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold gradient-text">MediSure AI</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 text-sm bg-primary rounded-lg hover:bg-cyan-500 transition font-medium"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Intelligent</span> Healthcare
            <br />Assistance Platform
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Verify medicines, read prescriptions with AI, check drug interactions,
            and get 24/7 health assistance — all in one platform.
          </p>
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-cyan-500 transition"
            >
              Start for Free
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-8 py-4 glass text-white rounded-xl font-semibold text-lg hover:border-primary transition"
            >
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need for <span className="gradient-text">better healthcare</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-2xl p-6 hover:border-primary transition cursor-pointer"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass py-8 px-6 text-center text-gray-400 text-sm">
        <p>© 2026 MediSure AI — Built for Cummins College of Engineering, Nagpur</p>
        <p className="mt-1 text-xs">This platform does not replace professional medical advice.</p>
      </footer>
    </div>
  )
}