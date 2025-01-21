'use client'

import { useState, useEffect } from 'react'
import { Transaction, CategoryLimit, BudgetLimit, BudgetAlert } from '@/types/transaction'
import { UserProfile } from '@/types/user'
import { TransactionCard } from './transaction-card'
import { SpendingChart } from './spending-chart'
import { SpendingPieChart } from './spending-pie-chart'
import { AddTransactionForm } from './add-transaction-form'
import { ThemeToggle } from './theme-toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Wallet } from 'lucide-react'
import { formatCurrency } from '@/utils/formatters'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NotificationDropdown } from './notification-dropdown'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from './date-range-picker'
import { startOfDay, endOfDay, isWithinInterval, startOfWeek, startOfMonth } from 'date-fns'
import { getStoredTransactions, storeTransactions } from '@/utils/storage'
import { BudgetManagement } from './budget-management'
import { toast } from 'sonner'

// Sample data
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: 2500,
    type: 'income',
    category: 'salary',
    description: 'Monthly Salary',
    date: new Date('2024-01-15'),
    paymentMethod: 'bank',
  },
  {
    id: '2',
    amount: 45.99,
    type: 'expense',
    category: 'food',
    description: 'Grocery Shopping',
    date: new Date('2024-01-16'),
    paymentMethod: 'mobile',
    location: 'Whole Foods Market',
  },
]

const sampleCategoryLimits: CategoryLimit[] = [
  {
    category: 'food',
    limit: 500,
    spent: 450,
  },
  {
    category: 'entertainment',
    limit: 200,
    spent: 150,
  },
  {
    category: 'shopping',
    limit: 300,
    spent: 280,
  },
]

const chartLabels = ['Jan 10', 'Jan 11', 'Jan 12', 'Jan 13', 'Jan 14', 'Jan 15', 'Jan 16']
const incomeData = [0, 0, 0, 0, 0, 2500, 0]
const expenseData = [100, 150, 200, 180, 120, 250, 45.99]

const sampleUserProfile: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  photoUrl: '/avatar.png', // Move this to public folder
}

const WalletDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categoryLimits] = useState<CategoryLimit[]>(sampleCategoryLimits)
  const [userProfile] = useState<UserProfile>(sampleUserProfile)
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week')
  const [reportStartDate, setReportStartDate] = useState<Date>()
  const [reportEndDate, setReportEndDate] = useState<Date>()
  const [incomePage, setIncomePage] = useState(1)
  const [expensePage, setExpensePage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([])
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([])

  useEffect(() => {
    const storedTransactions = getStoredTransactions()
    setTransactions(storedTransactions)
  }, [])

  useEffect(() => {
    const alerts: BudgetAlert[] = budgetLimits.map(budget => {
      let startDate: Date
      const now = new Date()
      
      switch (budget.period) {
        case 'daily':
          startDate = startOfDay(now)
          break
        case 'weekly':
          startDate = startOfWeek(now)
          break
        case 'monthly':
          startDate = startOfMonth(now)
          break
      }

      const periodExpenses = transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category === budget.category &&
          isWithinInterval(new Date(t.date), { start: startDate, end: now })
        )
        .reduce((sum, t) => sum + t.amount, 0)

      const percentage = (periodExpenses / budget.amount) * 100

      // Show notification when budget is exceeded
      if (percentage >= 100) {
        toast.error('Budget Alert', {
          description: `You've exceeded your ${budget.period} budget for ${budget.category}!`,
          duration: 5000,
        })
      } 
      // Show warning when approaching budget limit
      else if (percentage >= 80 && percentage < 100) {
        toast.warning('Budget Warning', {
          description: `You're approaching your ${budget.period} budget for ${budget.category}!`,
          duration: 5000,
        })
      }

      return {
        category: budget.category,
        currentSpending: periodExpenses,
        limit: budget.amount,
        percentage
      }
    })

    setBudgetAlerts(alerts)
  }, [transactions, budgetLimits])

  const totalBalance = transactions.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount
  }, 0)

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: crypto.randomUUID(),
    }
    
    const updatedTransactions = [...transactions, transaction].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    setTransactions(updatedTransactions)
    storeTransactions(updatedTransactions)
    
    // Check budget limits immediately for new expenses
    if (transaction.type === 'expense') {
      budgetLimits.forEach(budget => {
        if (budget.category === transaction.category) {
          let startDate: Date
          const now = new Date()
          
          switch (budget.period) {
            case 'daily':
              startDate = startOfDay(now)
              break
            case 'weekly':
              startDate = startOfWeek(now)
              break
            case 'monthly':
              startDate = startOfMonth(now)
              break
          }

          const periodExpenses = updatedTransactions
            .filter(t => 
              t.type === 'expense' && 
              t.category === budget.category &&
              isWithinInterval(new Date(t.date), { start: startDate, end: now })
            )
            .reduce((sum, t) => sum + t.amount, 0)

          const percentage = (periodExpenses / budget.amount) * 100

          if (percentage >= 100) {
            toast.error('Budget Exceeded!', {
              description: `This transaction has exceeded your ${budget.period} budget for ${budget.category}!`,
            })
          }
        }
      })
    }
    
    // Reset pagination
    if (transaction.type === 'income') {
      setIncomePage(1)
    } else {
      setExpensePage(1)
    }
  }

  const handleDeleteTransaction = (id: string) => {
    const transaction = transactions.find(t => t.id === id)
    const updatedTransactions = transactions.filter(t => t.id !== id)
    setTransactions(updatedTransactions)
    storeTransactions(updatedTransactions)
    
    // Reset page if current page becomes empty
    if (transaction?.type === 'income') {
      const { total } = getPaginatedTransactions(updatedTransactions, 'income')
      const maxPage = Math.ceil(total / itemsPerPage)
      if (incomePage > maxPage) {
        setIncomePage(Math.max(1, maxPage))
      }
    } else {
      const { total } = getPaginatedTransactions(updatedTransactions, 'expense')
      const maxPage = Math.ceil(total / itemsPerPage)
      if (expensePage > maxPage) {
        setExpensePage(Math.max(1, maxPage))
      }
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (!reportStartDate || !reportEndDate) return true
    
    const transactionDate = startOfDay(new Date(transaction.date))
    return isWithinInterval(transactionDate, {
      start: startOfDay(reportStartDate),
      end: endOfDay(reportEndDate)
    })
  })

  const reportIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const reportExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0)

  const getPaginatedTransactions = (transactions: Transaction[], type: TransactionType) => {
    const filteredTransactions = transactions.filter(t => t.type === type)
    const currentPage = type === 'income' ? incomePage : expensePage
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return {
      transactions: filteredTransactions.slice(start, end),
      hasMore: end < filteredTransactions.length,
      total: filteredTransactions.length
    }
  }

  const handleAddBudget = (newBudget: Omit<BudgetLimit, 'startDate'>) => {
    const budget: BudgetLimit = {
      ...newBudget,
      startDate: new Date()
    }
    
    setBudgetLimits(prev => {
      const filtered = prev.filter(b => b.category !== budget.category)
      return [...filtered, budget]
    })
  }

  const calculateTimeframeData = (
    transactions: Transaction[], 
    type: 'income' | 'expense',
    timeframe: 'week' | 'month' | 'year'
  ) => {
    const now = new Date()
    const periods = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 12
    const data = new Array(periods).fill(0)
    
    transactions
      .filter(t => t.type === type)
      .forEach(transaction => {
        const date = new Date(transaction.date)
        let index
        
        if (timeframe === 'week') {
          index = periods - 1 - Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        } else if (timeframe === 'month') {
          index = periods - 1 - Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
        } else {
          index = date.getMonth()
        }
        
        if (index >= 0 && index < periods) {
          data[index] += transaction.amount
        }
      })
      
    return data
  }

  const generateTimeframeLabels = (timeframe: 'week' | 'month' | 'year') => {
    const now = new Date()
    const periods = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 12
    const labels = []
    
    if (timeframe === 'year') {
      return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      labels.push(format(date, timeframe === 'week' ? 'MMM d' : 'MMM d'))
    }
    
    return labels
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6 text-primary"
            >
              <path d="M2.273 5.625A4.483 4.483 0 015.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 3H5.25a3 3 0 00-2.977 2.625zM2.273 8.625A4.483 4.483 0 015.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0018.75 6H5.25a3 3 0 00-2.977 2.625zM5.25 9a3 3 0 00-3 3v6a3 3 0 003 3h13.5a3 3 0 003-3v-6a3 3 0 00-3-3H15a.75.75 0 00-.75.75 2.25 2.25 0 01-4.5 0A.75.75 0 009 9H5.25z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome!</h1>
            <p className="text-muted-foreground">Track your finances</p>
          </div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <ThemeToggle />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
              <span className="text-2xl font-bold">{formatCurrency(totalBalance)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Total Income</span>
              <span className="text-2xl font-bold text-green-500">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">Total Expenses</span>
              <span className="text-2xl font-bold text-red-500">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Section */}
      <div className="mt-6">
        <Tabs defaultValue="income" className="w-full">
          <div className="mb-4 overflow-x-auto">
            <TabsList className="inline-flex h-auto w-auto min-w-full p-1 bg-muted/50 rounded-lg">
              <div className="flex gap-1">
                <TabsTrigger 
                  value="income" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M1 4a1 1 0 011-1h16a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4zm12 4a3 3 0 11-6 0 3 3 0 016 0zM4 9a1 1 0 100-2 1 1 0 000 2zm13-1a1 1 0 11-2 0 1 1 0 012 0zM1.75 14.5a.75.75 0 000 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 00-1.5 0v.784a.272.272 0 01-.35.25A49.043 49.043 0 001.75 14.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden sm:inline">Income</span>
                  <span className="inline sm:hidden">💸</span>
                </TabsTrigger>

                <TabsTrigger 
                  value="expenses" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.5 4A1.5 1.5 0 001 5.5V6h18v-.5A1.5 1.5 0 0017.5 4h-15zM19 8.5H1v6A1.5 1.5 0 002.5 16h15a1.5 1.5 0 001.5-1.5v-6zM3 13.25a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zm4.75-.75a.75.75 0 000 1.5h3.5a.75.75 0 000-1.5h-3.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden sm:inline">Expenses</span>
                  <span className="inline sm:hidden">💳</span>
                </TabsTrigger>

                <TabsTrigger 
                  value="budget" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.798 7.45c.512-.67 1.135-.95 1.702-.95s1.19.28 1.702.95a.75.75 0 001.192-.91C12.637 5.55 11.596 5 10.5 5s-2.137.55-2.894 1.54A5.205 5.205 0 006.83 8H5.75a.75.75 0 000 1.5h.77a6.333 6.333 0 000 1h-.77a.75.75 0 000 1.5h1.08c.183.528.442 1.023.776 1.46.757.99 1.798 1.54 2.894 1.54s2.137-.55 2.894-1.54a.75.75 0 00-1.192-.91c-.512.67-1.135.95-1.702.95s-1.19-.28-1.702-.95a3.505 3.505 0 01-.343-.55h1.795a.75.75 0 000-1.5H8.026a4.835 4.835 0 010-1h2.224a.75.75 0 000-1.5H8.455c.098-.195.212-.38.343-.55z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden sm:inline">Budget</span>
                  <span className="inline sm:hidden">💰</span>
                </TabsTrigger>

                <TabsTrigger 
                  value="analysis" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Analysis</span>
                  <span className="inline sm:hidden">📊</span>
                </TabsTrigger>

                <TabsTrigger 
                  value="reports" 
                  className="flex items-center gap-2 px-4 py-2.5 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v11.75A2.75 2.75 0 0016.75 18h-12A2.75 2.75 0 012 15.25V3.5zm3.75 7a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zm0 3a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5zM5 5.75A.75.75 0 015.75 5h4.5a.75.75 0 01.75.75v2.5a.75.75 0 01-.75.75h-4.5A.75.75 0 015 8.25v-2.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden sm:inline">Reports</span>
                  <span className="inline sm:hidden">📋</span>
                </TabsTrigger>
              </div>
            </TabsList>
          </div>

          <TabsContent value="income">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Income</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddTransactionForm 
                    onAddTransaction={handleAddTransaction} 
                    defaultType="income"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Income History ({transactions.filter(t => t.type === 'income').length})</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIncomePage(p => Math.max(1, p - 1))}
                      disabled={incomePage === 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIncomePage(p => p + 1)}
                      disabled={!getPaginatedTransactions(transactions, 'income').hasMore}
                    >
                      Next
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {getPaginatedTransactions(transactions, 'income').transactions.map((transaction) => (
                    <TransactionCard 
                      key={transaction.id} 
                      transaction={transaction} 
                      onDelete={handleDeleteTransaction} 
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Expense</CardTitle>
                </CardHeader>
                <CardContent>
                  <AddTransactionForm 
                    onAddTransaction={handleAddTransaction} 
                    defaultType="expense"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Expense History ({transactions.filter(t => t.type === 'expense').length})</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setExpensePage(p => Math.max(1, p - 1))}
                      disabled={expensePage === 1}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setExpensePage(p => p + 1)}
                      disabled={!getPaginatedTransactions(transactions, 'expense').hasMore}
                    >
                      Next
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {getPaginatedTransactions(transactions, 'expense').transactions.map((transaction) => (
                    <TransactionCard 
                      key={transaction.id} 
                      transaction={transaction} 
                      onDelete={handleDeleteTransaction} 
                    />
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Spending Trends</CardTitle>
                  <Select
                    value={timeframe}
                    onValueChange={(value) => setTimeframe(value as 'week' | 'month' | 'year')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">Last 30 days</SelectItem>
                      <SelectItem value="year">This year</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <SpendingChart 
                    incomeData={calculateTimeframeData(transactions, 'income', timeframe)}
                    expenseData={calculateTimeframeData(transactions, 'expense', timeframe)}
                    labels={generateTimeframeLabels(timeframe)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <SpendingPieChart transactions={transactions} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <DateRangePicker
                    startDate={reportStartDate}
                    endDate={reportEndDate}
                    onStartDateChange={setReportStartDate}
                    onEndDateChange={setReportEndDate}
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium text-gray-500">Period Income</div>
                      <div className="text-2xl font-bold text-green-500">
                        {formatCurrency(reportIncome)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-medium text-gray-500">Period Expenses</div>
                      <div className="text-2xl font-bold text-red-500">
                        {formatCurrency(reportExpenses)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Transactions in Period</h3>
                    {filteredTransactions.length === 0 ? (
                      <p className="text-sm text-gray-500">No transactions found in the selected period.</p>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TransactionCard key={transaction.id} transaction={transaction} onDelete={handleDeleteTransaction} />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <BudgetManagement
              budgetLimits={budgetLimits}
              onAddBudget={handleAddBudget}
              budgetAlerts={budgetAlerts}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default WalletDashboard 