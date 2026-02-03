import React from 'react'
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
  const [now, setNow] = React.useState(new Date())
  const [summary, setSummary] = React.useState<null | {
    totalEndpoints: number
    avgLatencyMs: number
    uptimeTodayPercent: number
    scheduledApis: number
    totalRunsToday: number
    successRateToday: number
    scheduledRunsToday: number
    pipelineSuccess: number
    serversActive: string
    serverUptime: number
    monitoringSince: string
  }>(null)

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  React.useEffect(() => {
    fetch('/api/v1/metrics/summary')
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
  }, [])

  return (
    <div className="min-h-[75vh] grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-10 items-start">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-blue-600 font-bold">FB</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">FBIS DevOptics</p>
            <h2 className="text-2xl font-bold">Welcome back</h2>
          </div>
        </div>

        <p className="text-gray-500 mb-6">Sign in to access your monitoring dashboard.</p>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
              <span className="text-gray-400">👤</span>
              <input
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Enter your username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
              <span className="text-gray-400">🔒</span>
              <input
                type="password"
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Enter your password"
              />
              <span className="text-gray-400">👁️</span>
            </div>
          </div>
          <button
            type="button"
            className="w-full bg-blue-100 text-blue-800 font-semibold py-3 rounded-lg shadow-sm hover:bg-blue-200 transition"
          >
            Sign in
          </button>
          <p className="text-sm text-gray-500 text-center">
            Don&apos;t have an account? <span className="text-blue-600">Sign up</span>
          </p>
        </form>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">{now.toLocaleTimeString()}</h2>
            <p className="text-gray-500 text-sm">
              Monitoring active since {summary?.monitoringSince ? new Date(summary.monitoringSince).toLocaleTimeString() : 'midnight'}
            </p>
          </div>
          <div className="flex items-center gap-2 border border-green-200 bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            LIVE
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Total endpoints</p>
            <p className="text-2xl font-semibold">{summary?.totalEndpoints ?? 137}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Avg latency</p>
            <p className="text-2xl font-semibold">{summary?.avgLatencyMs ?? 177} <span className="text-sm text-gray-500">ms</span></p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Uptime today</p>
            <div className="flex items-center gap-3">
              <div className="h-2 w-full bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-green-600 rounded-full"
                  style={{ width: `${summary?.uptimeTodayPercent ?? 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{summary?.uptimeTodayPercent ?? 100}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Scheduled APIs</p>
            <p className="text-2xl font-semibold">{summary?.scheduledApis ?? 6}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Total runs today</p>
            <p className="text-2xl font-semibold">{summary?.totalRunsToday ?? 1227}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Success rate today</p>
            <p className="text-2xl font-semibold">{summary?.successRateToday ?? 97}<span className="text-sm text-gray-500">%</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Scheduled runs today</p>
            <p className="text-2xl font-semibold">{summary?.scheduledRunsToday ?? 4}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Pipeline success rate</p>
            <div className="flex items-center gap-3">
              <div className="h-2 w-full bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-blue-600 rounded-full"
                  style={{ width: `${summary?.pipelineSuccess ?? 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{summary?.pipelineSuccess ?? 100}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Servers active</p>
            <p className="text-2xl font-semibold">{summary?.serversActive ?? '0/0'}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Server uptime</p>
            <div className="flex items-center gap-3">
              <div className="h-2 w-full bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-green-600 rounded-full"
                  style={{ width: `${summary?.serverUptime ?? 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{summary?.serverUptime ?? 100}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
