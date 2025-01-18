'use client'

import { useState } from 'react'
import { Transaction, CategoryLimit } from './types/transaction'
import { UserProfile } from './types/user'
import { TransactionCard } from './components/transaction-card'
import { SpendingChart } from './components/spending-chart'
import { SpendingPieChart } from './components/spending-pie-chart'
import { AddTransactionForm } from './components/add-transaction-form'
import { ThemeToggle } from './components/theme-toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Wallet } from 'lucide-react'
import { formatCurrency } from './utils/formatters'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NotificationDropdown } from './components/notification-dropdown'
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
import { DateRangePicker } from './components/date-range-picker'
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns'

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
  // Add more sample transactions...
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
  photoUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-16%20165538-xYGlimd8qxmyEoS5QhuqaaeMtS1a1D.png', // Using the provided image URL
}

export default function WalletDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions)
  const [categoryLimits] = useState<CategoryLimit[]>(sampleCategoryLimits)
  const [userProfile] = useState<UserProfile>(sampleUserProfile)
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week')
  const [reportStartDate, setReportStartDate] = useState<Date>()
  const [reportEndDate, setReportEndDate] = useState<Date>()

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
      id: (transactions.length + 1).toString(),
    }
    
    // Sort transactions by date in descending order (newest first)
    const updatedTransactions = [...transactions, transaction].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    setTransactions(updatedTransactions)
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

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <img src="/logo.svg" alt="Wallet Logo" className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">My Wallet</h1>
            <p className="text-gray-500">Track your spending and savings</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <NotificationDropdown 
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
          />
          <Avatar>
            <AvatarImage src={userProfile.photoUrl} alt={userProfile.name} />
            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              <span className="text-2xl font-bold">{formatCurrency(totalBalance)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-500">
              {formatCurrency(totalIncome)}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-red-500">
              {formatCurrency(totalExpenses)}
            </span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="income" className="space-y-4">
        <div className="flex justify-center mb-4">
          <TabsList className="grid grid-cols-4 w-[600px]">
            <TabsTrigger value="income">💸 Income</TabsTrigger>
            <TabsTrigger value="expenses">💳 Expenses</TabsTrigger>
            <TabsTrigger value="analysis">📊 Analysis</TabsTrigger>
            <TabsTrigger value="reports">📋 Reports</TabsTrigger>
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
              <CardHeader>
                <CardTitle>Income History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions
                  .filter((t) => t.type === 'income')
                  .map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
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
              <CardHeader>
                <CardTitle>Expense History</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions
                  .filter((t) => t.type === 'expense')
                  .map((transaction) => (
                    <TransactionCard key={transaction.id} transaction={transaction} />
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
                      <TransactionCard key={transaction.id} transaction={transaction} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

