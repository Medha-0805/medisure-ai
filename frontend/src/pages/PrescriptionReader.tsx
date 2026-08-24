import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

interface ExtractedMedicine {
  name: string
  dosage: string
  frequency: string
  duration: string
}

interface PrescriptionResult {
  raw_text: string
  doctor_name: string
  medicines: ExtractedMedicine[]
  confidence: string
}

export default function PrescriptionReader() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PrescriptionResult | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile)
    setResult(null)

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileChange(droppedFile)
  }

  const handleExtract = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `${import.meta.env.VITE_ML_SERVICE_URL}/prescription/extract`,
        { method: 'POST', body: formData }
      )

      if (!response.ok) throw new Error('Extraction failed')

      const data = await response.json()
      setResult(data.data)
      toast.success('Prescription extracted successfully!')
    } catch (error) {
      toast.error('Failed to extract prescription. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-400'
      case 'low': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Navbar */}
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
            🔬 <span className="gradient-text">AI Prescription Reader</span>
          </h1>
          <p className="text-gray-400 mb-8">Upload your prescription and let AI extract medicine information automatically</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Upload Prescription</h2>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
                dragOver ? 'border-primary bg-primary/10' : 'border-gray-600 hover:border-primary'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <>
                  <div className="text-5xl mb-3">📄</div>
                  <p className="text-gray-400 text-sm">Drag & drop or click to upload</p>
                  <p className="text-gray-500 text-xs mt-1">Supports JPG, PNG, PDF</p>
                </>
              )}
            </div>

            {file && (
              <div className="mt-3 p-3 bg-surface rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-300 truncate">{file.name}</span>
                <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExtract}
              disabled={!file || loading}
              className="w-full mt-4 bg-primary text-white rounded-xl py-3 font-semibold hover:bg-cyan-500 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Extracting...
                </span>
              ) : '🔍 Extract Prescription'}
            </motion.button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              ⚠️ This does not replace professional medical advice
            </p>
          </motion.div>

          {/* Results Section */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Extracted Information</h2>

            {!result && !loading && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-5xl mb-3">📋</div>
                <p>Upload a prescription to see extracted details</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3 animate-pulse">🤖</div>
                <p className="text-gray-400">AI is reading your prescription...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4">
                {/* Confidence */}
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <span className="text-sm text-gray-400">Confidence</span>
                  <span className={`text-sm font-semibold ${getSeverityColor(result.confidence)}`}>
                    {result.confidence.toUpperCase()}
                  </span>
                </div>

                {/* Doctor Name */}
                {result.doctor_name && (
                  <div className="p-3 bg-surface rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Doctor</p>
                    <p className="text-sm font-medium">Dr. {result.doctor_name}</p>
                  </div>
                )}

                {/* Medicines */}
                <div>
                  <p className="text-sm font-semibold mb-2 text-primary">
                    💊 Medicines Found ({result.medicines.length})
                  </p>
                  {result.medicines.length === 0 ? (
                    <p className="text-gray-500 text-sm">No medicines detected. Try a clearer image.</p>
                  ) : (
                    <div className="space-y-2">
                      {result.medicines.map((med, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3 bg-surface rounded-lg border border-gray-700"
                        >
                          <p className="font-medium text-white">{med.name}</p>
                          <div className="flex gap-3 mt-1 flex-wrap">
                            {med.dosage && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">{med.dosage}</span>}
                            {med.frequency && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">{med.frequency}</span>}
                            {med.duration && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">{med.duration}</span>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Raw Text */}
                {result.raw_text && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">View raw extracted text</summary>
                    <p className="text-xs text-gray-500 mt-2 p-2 bg-surface rounded max-h-32 overflow-y-auto">{result.raw_text}</p>
                  </details>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}