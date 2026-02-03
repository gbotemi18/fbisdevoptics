import { Routes, Route, Link } from 'react-router-dom'
import UserModule from '@features/users'
import BillingModule from '@features/billing'
import K8sMonitoringModule from '@features/k8s-monitoring'
import AuthModule from '@features/auth'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-900">FBIS DevOptics</h1>
            <ul className="flex gap-4">
              <li><Link to="/" className="text-primary-500 hover:text-primary-900">Home</Link></li>
              <li><Link to="/users" className="text-primary-500 hover:text-primary-900">Users</Link></li>
              <li><Link to="/billing" className="text-primary-500 hover:text-primary-900">Billing</Link></li>
              <li><Link to="/k8s-monitoring" className="text-primary-500 hover:text-primary-900">K8s Monitoring</Link></li>
              <li><Link to="/auth" className="text-primary-500 hover:text-primary-900">Auth</Link></li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/users/*" element={<UserModule />} />
          <Route path="/billing/*" element={<BillingModule />} />
          <Route path="/k8s-monitoring/*" element={<K8sMonitoringModule />} />
          <Route path="/auth/*" element={<AuthModule />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <p>&copy; 2024 FBIS DevOptics. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function HomePage() {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">Welcome to FBIS DevOptics</h2>
      <p className="text-gray-600 mb-8">
        A production-grade, modular monorepo for modern SaaS applications.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Frontend</h3>
          <p className="text-gray-600">React + Vite + TypeScript + Redux + Tailwind</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Backend</h3>
          <p className="text-gray-600">Go + Gin + PostgreSQL + gRPC</p>
        </div>
      </div>
    </div>
  )
}
