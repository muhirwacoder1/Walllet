export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0, // RWF doesn't use cents
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export const getCategoryIcon = (category: Category): string => {
  const icons: Record<Category, string> = {
    food: '🍕',
    transport: '🚗',
    shopping: '🛍️',
    entertainment: '🎮',
    bills: '📃',
    salary: '💰',
    other: '📦',
  }
  return icons[category]
}

