export const STORAGE_KEYS = {
  TRANSACTIONS: 'wallet_transactions',
  BUDGET_LIMITS: 'wallet_budget_limits',
} as const

// Helper function to chunk data for storage
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function getStoredTransactions() {
  if (typeof window === 'undefined') return []
  
  try {
    // Get all transactions from localStorage
    const allTransactions: any[] = []
    let index = 0
    let chunk = localStorage.getItem(`${STORAGE_KEYS.TRANSACTIONS}_${index}`)
    
    while (chunk) {
      const parsedChunk = JSON.parse(chunk)
      allTransactions.push(...parsedChunk)
      index++
      chunk = localStorage.getItem(`${STORAGE_KEYS.TRANSACTIONS}_${index}`)
    }

    // Convert stored date strings back to Date objects
    return allTransactions.map((t: any) => ({
      ...t,
      date: new Date(t.date)
    }))
  } catch (error) {
    console.error('Error parsing stored transactions:', error)
    return []
  }
}

export function storeTransactions(transactions: any[]) {
  if (typeof window === 'undefined') return

  try {
    // Clear existing chunks
    let index = 0
    while (localStorage.getItem(`${STORAGE_KEYS.TRANSACTIONS}_${index}`)) {
      localStorage.removeItem(`${STORAGE_KEYS.TRANSACTIONS}_${index}`)
      index++
    }

    // Store new chunks
    // Split into chunks of 100 transactions to avoid localStorage size limits
    const chunks = chunkArray(transactions, 100)
    chunks.forEach((chunk, index) => {
      localStorage.setItem(
        `${STORAGE_KEYS.TRANSACTIONS}_${index}`,
        JSON.stringify(chunk)
      )
    })
  } catch (error) {
    console.error('Error storing transactions:', error)
  }
}

// Helper function to clear all stored transactions
export function clearStoredTransactions() {
  if (typeof window === 'undefined') return
  
  let index = 0
  while (localStorage.getItem(`${STORAGE_KEYS.TRANSACTIONS}_${index}`)) {
    localStorage.removeItem(`${STORAGE_KEYS.TRANSACTIONS}_${index}`)
    index++
  }
}

export function getStoredBudgetLimits(): BudgetLimit[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(STORAGE_KEYS.BUDGET_LIMITS)
  if (!stored) return []
  
  try {
    const limits = JSON.parse(stored)
    return limits.map((limit: any) => ({
      ...limit,
      startDate: new Date(limit.startDate)
    }))
  } catch (error) {
    console.error('Error parsing stored budget limits:', error)
    return []
  }
}

export function storeBudgetLimits(limits: BudgetLimit[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.BUDGET_LIMITS, JSON.stringify(limits))
} 