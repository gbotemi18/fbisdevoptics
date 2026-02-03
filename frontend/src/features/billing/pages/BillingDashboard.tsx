export default function BillingDashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Billing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Monthly Recurring Revenue</p>
          <p className="text-2xl font-bold text-primary-500">$0.00</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Active Subscriptions</p>
          <p className="text-2xl font-bold text-primary-500">0</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-gray-600">Outstanding Invoices</p>
          <p className="text-2xl font-bold text-primary-500">0</p>
        </div>
      </div>
    </div>
  )
}
