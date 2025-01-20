export type TransactionType = 'income' | 'expense'
export type PaymentMethod = 'bank' | 'mobile' | 'cash' | 'card'
export type Category = 
  | 'salary' 
  | 'freelance'
  | 'investments'
  | 'business'
  | 'rental'
  | 'food'
  | 'transportation'
  | 'entertainment'
  | 'shopping'
  | 'utilities'
  | 'healthcare'
  | 'education'
  | 'travel'
  | 'other'

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

// Add this interface for budget limits
export interface BudgetLimit {
  category: Category
  amount: number
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
}

// Add this to track budget alerts
export interface BudgetAlert {
  category: Category
  currentSpending: number
  limit: number
  percentage: number
}

