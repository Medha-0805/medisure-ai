import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Landing from './pages/Landing.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Dashboard from './pages/Dashboard.tsx'
import PrescriptionReader from './pages/PrescriptionReader.tsx'
import MedicineAlternatives from './pages/MedicineAlternatives.tsx'
import DrugInteractions from './pages/DrugInteractions.tsx'
import AIChat from './pages/AIChat.tsx'
import Reminders from './pages/Reminders.tsx'
import EmergencyLocator from './pages/EmergencyLocator.tsx'
import MedicineSearch from './pages/MedicineSearch.tsx'
import QRVerification from './pages/QRVerification.tsx'
import AdminDashboard from './pages/AdminDashboard.tsx'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/prescription" element={<ProtectedRoute><PrescriptionReader /></ProtectedRoute>} />
      <Route path="/alternatives" element={<ProtectedRoute><MedicineAlternatives /></ProtectedRoute>} />
      <Route path="/interactions" element={<ProtectedRoute><DrugInteractions /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
      <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
      <Route path="/emergency" element={<ProtectedRoute><EmergencyLocator /></ProtectedRoute>} />
      <Route path="/prices" element={<ProtectedRoute><MedicineSearch /></ProtectedRoute>} />
      <Route path="/qr" element={<ProtectedRoute><QRVerification /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App