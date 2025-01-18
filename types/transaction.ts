export type TransactionType = 'income' | 'expense'
export type PaymentMethod = 'bank' | 'mobile'
export type Category = 'food' | 'transport' | 'shopping' | 'entertainment' | 'bills' | 'salary' | 'other'

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category: Category
  description: string
  date: Date
  paymentMethod: PaymentMethod
  location?: string
}

export interface CategoryLimit {
  category: Category
  limit: number
  spent: number
}

