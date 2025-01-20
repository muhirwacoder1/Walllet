import { Category, TransactionType } from '@/types/transaction'

export const incomeCategories = [
  { value: 'salary' as Category, label: '💰 Salary', icon: '💰' },
  { value: 'freelance' as Category, label: '💻 Freelance', icon: '💻' },
  { value: 'investments' as Category, label: '📈 Investments', icon: '📈' },
  { value: 'business' as Category, label: '🏢 Business', icon: '🏢' },
  { value: 'rental' as Category, label: '🏠 Rental', icon: '🏠' },
  { value: 'other' as Category, label: '✨ Other', icon: '✨' },
] as const

export const expenseCategories = [
  { value: 'food' as Category, label: '🍕 Food & Dining', icon: '🍕' },
  { value: 'transportation' as Category, label: '🚗 Transportation', icon: '🚗' },
  { value: 'entertainment' as Category, label: '🎮 Entertainment', icon: '🎮' },
  { value: 'shopping' as Category, label: '🛍️ Shopping', icon: '🛍️' },
  { value: 'utilities' as Category, label: '💡 Utilities', icon: '💡' },
  { value: 'healthcare' as Category, label: '🏥 Healthcare', icon: '🏥' },
  { value: 'education' as Category, label: '📚 Education', icon: '📚' },
  { value: 'travel' as Category, label: '✈️ Travel', icon: '✈️' },
  { value: 'other' as Category, label: '✨ Other', icon: '✨' },
] as const

export const paymentMethods = [
  { value: 'cash', label: '💵 Cash', icon: '💵' },
  { value: 'card', label: '💳 Card', icon: '💳' },
  { value: 'bank', label: '🏦 Bank Transfer', icon: '🏦' },
  { value: 'mobile', label: '📱 Mobile Payment', icon: '📱' },
] as const

export function getCategoryIcon(category: Category, type: TransactionType): string {
  const categories = type === 'income' ? incomeCategories : expenseCategories
  return categories.find(c => c.value === category)?.icon || '📦'
}

export function getPaymentMethodIcon(method: string): string {
  return paymentMethods.find(m => m.value === method)?.icon || '💳'
} 