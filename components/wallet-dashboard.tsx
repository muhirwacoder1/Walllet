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

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={userProfile.photoUrl} alt={userProfile.name} />
            <AvatarFallback>{userProfile.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {userProfile.name}!</h1>
            <p className="text-muted-foreground">Track your finances</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
          <TabsList className="w-full flex flex-wrap justify-start gap-2 bg-transparent">
            <TabsTrigger value="income" className="flex-1 sm:flex-none">💸 Income</TabsTrigger>
            <TabsTrigger value="expenses" className="flex-1 sm:flex-none">💳 Expenses</TabsTrigger>
            <TabsTrigger value="budget" className="flex-1 sm:flex-none">💰 Budget</TabsTrigger>
            <TabsTrigger value="analysis" className="flex-1 sm:flex-none">📊 Analysis</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1 sm:flex-none">📋 Reports</TabsTrigger>
          </TabsList>

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
                    incomeData={incomeData}
                    expenseData={expenseData}
                    labels={chartLabels}
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