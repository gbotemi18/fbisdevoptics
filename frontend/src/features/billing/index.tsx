import { Routes, Route } from 'react-router-dom'
import BillingDashboard from './pages/BillingDashboard'

export default function BillingModule() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<BillingDashboard />} />
      </Routes>
    </div>
  )
}
