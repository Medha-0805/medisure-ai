import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

interface Medicine {
  id: string
  name: string
  manufacturer: string
  composition: string
  is_verified: boolean
}

interface VerificationResult {
  status: 'authentic' | 'suspicious' | 'not_found'
  medicine?: Medicine
  message: string
}

export default function QRVerification() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'generate' | 'verify'>('generate')
  const [searchQuery, setSearchQuery] = useState('')
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null)
  const [manualCode, setManualCode] = useState('')
  const scannerRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => null)
      }
    }
  }, [])

  const searchMedicines = async () => {
    if (!searchQuery.trim()) return
    try {
      const response = await api.get(`/medicines?q=${encodeURIComponent(searchQuery)}`)
      setMedicines(response.data.medicines || [])
    } catch {
      toast.error('Search failed')
    }
  }

  const generateQR = async (medicine: Medicine) => {
    setSelectedMedicine(medicine)
    const qrData = JSON.stringify({
      id: medicine.id,
      name: medicine.name,
      manufacturer: medicine.manufacturer,
      verified: medicine.is_verified
    })
    try {
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      })
      setQrCodeUrl(url)
      toast.success('QR Code generated!')
    } catch {
      toast.error('Failed to generate QR code')
    }
  }

  const handleScannedData = (decodedText: string) => {
    setManualCode(decodedText)
    toast.success('QR Code scanned!')
  }

  const verifyManualCode = async () => {
    if (!manualCode.trim()) {
      toast.error('Please enter a medicine ID')
      return
    }
    try {
      let medicineId = manualCode.trim()
      try {
        const parsed = JSON.parse(manualCode)
        medicineId = parsed.id
      } catch {
        // use as is
      }
      const response = await api.get(`/medicines/${medicineId}`)
      const medicine = response.data.medicine
      if (medicine) {
        setVerificationResult({
          status: medicine.is_verified ? 'authentic' : 'suspicious',
          medicine,
          message: medicine.is_verified
            ? 'This medicine is verified and authentic!'
            : 'This medicine could not be verified. Check with your pharmacist.'
        })
      } else {
        setVerificationResult({ status: 'not_found', message: 'Medicine not found in our database.' })
      }
    } catch {
      setVerificationResult({ status: 'not_found', message: 'Medicine not found in our database.' })
    }
  }

  const startScanner = async () => {
    setScanning(true)
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode')
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )
      scannerRef.current.render(
        (decodedText: string) => {
          handleScannedData(decodedText)
          stopScanner()
        },
        () => null
      )
    } catch {
      toast.error('Camera not available')
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => null)
      scannerRef.current = null
    }
    setScanning(false)
  }

  const handleFileUpload = async (file: File) => {
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      const html5Qrcode = new Html5Qrcode('qr-file-reader')
      const result = await html5Qrcode.scanFile(file, false)
      handleScannedData(result)
      html5Qrcode.clear()
    } catch {
      toast.error('Could not read QR code from this image. Try a clearer photo.')
    }
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    e.target.value = ''
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'authentic':
        return { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: '✅' }
      case 'suspicious':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: '⚠️' }
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/30', icon: '❓' }
    }
  }

  return (
    <div className="min-h-screen bg-background text-white">
      <nav className="glass fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold gradient-text">MediSure AI</span>
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

      <div className="pt-24 px-6 pb-10 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">
            📱 <span className="gradient-text">QR Medicine Verification</span>
          </h1>
          <p className="text-gray-400 mb-8">Generate and verify medicine QR codes for authenticity</p>
        </motion.div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${activeTab === 'generate' ? 'bg-primary text-white' : 'glass text-gray-400 hover:text-white'}`}
          >
            🔲 Generate QR
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${activeTab === 'verify' ? 'bg-primary text-white' : 'glass text-gray-400 hover:text-white'}`}
          >
            🔍 Verify Medicine
          </button>
        </div>

        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Search Medicine</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchMedicines()}
                  placeholder="Search medicine name..."
                  className="flex-1 bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
                />
                <button
                  onClick={searchMedicines}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-cyan-500 transition"
                >
                  🔍
                </button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    onClick={() => generateQR(med)}
                    className={`p-3 rounded-lg cursor-pointer transition border ${
                      selectedMedicine?.id === med.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-700 hover:border-primary/50 bg-surface'
                    }`}
                  >
                    <p className="font-medium text-sm">{med.name}</p>
                    <p className="text-xs text-gray-400">{med.manufacturer}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6 text-center">
              <h2 className="text-lg font-semibold mb-4">Generated QR Code</h2>
              {qrCodeUrl ? (
                <div>
                  <img src={qrCodeUrl} alt="QR Code" className="mx-auto rounded-xl mb-4 bg-white p-3" />
                  <p className="font-semibold">{selectedMedicine?.name}</p>
                  <p className="text-gray-400 text-sm mb-4">{selectedMedicine?.manufacturer}</p>
                  <a href={qrCodeUrl} download={`${selectedMedicine?.name}-QR.png`} className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-cyan-500 transition">
                    ⬇️ Download QR Code
                  </a>
                </div>
              ) : (
                <div className="py-12 text-gray-500">
                  <div className="text-6xl mb-3">🔲</div>
                  <p>Search and select a medicine to generate its QR code</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Scan or Enter Code</h2>

              <div id="qr-reader" className="mb-4" />
              <div id="qr-file-reader" className="hidden" />

              <div className="grid grid-cols-2 gap-3 mb-4">
                {!scanning ? (
                  <button
                    onClick={startScanner}
                    className="py-3 bg-primary text-white rounded-xl font-semibold hover:bg-cyan-500 transition"
                  >
                    📷 Use Camera
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="py-3 bg-red-500/20 text-red-400 rounded-xl font-semibold hover:bg-red-500/30 transition"
                  >
                    ⏹ Stop Camera
                  </button>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3 bg-surface border border-gray-700 text-gray-200 rounded-xl font-semibold hover:border-primary transition"
                >
                  🖼️ Upload QR Image
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileInputChange}
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-gray-500 text-xs">OR ENTER MANUALLY</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter medicine ID..."
                className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition mb-3"
              />
              <button
                onClick={verifyManualCode}
                className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-cyan-500 transition"
              >
                🔍 Verify Medicine
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Verification Result</h2>
              {!verificationResult ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-3">🔍</div>
                  <p>Scan a QR code or enter a medicine ID to verify</p>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <div className={`p-4 rounded-xl border mb-4 ${getStatusConfig(verificationResult.status).bg}`}>
                    <p className={`text-xl font-bold text-center ${getStatusConfig(verificationResult.status).color}`}>
                      {getStatusConfig(verificationResult.status).icon} {verificationResult.status.toUpperCase()}
                    </p>
                    <p className="text-center text-sm text-gray-300 mt-1">{verificationResult.message}</p>
                  </div>
                  {verificationResult.medicine && (
                    <div className="space-y-2">
                      <div className="p-3 bg-surface rounded-lg">
                        <p className="text-xs text-gray-400">Medicine Name</p>
                        <p className="font-semibold">{verificationResult.medicine.name}</p>
                      </div>
                      <div className="p-3 bg-surface rounded-lg">
                        <p className="text-xs text-gray-400">Manufacturer</p>
                        <p className="text-sm">{verificationResult.medicine.manufacturer}</p>
                      </div>
                      <div className="p-3 bg-surface rounded-lg">
                        <p className="text-xs text-gray-400">Composition</p>
                        <p className="text-sm">{verificationResult.medicine.composition}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}