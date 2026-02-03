import { createSlice } from '@reduxjs/toolkit'

export interface Invoice {
  id: string
  amount: number
  status: 'draft' | 'sent' | 'paid'
  due_date: string
}

interface BillingState {
  invoices: Invoice[]
  total_revenue: number
}

const initialState: BillingState = {
  invoices: [],
  total_revenue: 0,
}

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {},
})

export default billingSlice.reducer
