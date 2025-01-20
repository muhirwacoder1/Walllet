'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { expenseCategories } from '@/utils/categories'
import { formatCurrency } from '@/utils/formatters'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import type { BudgetLimit, BudgetAlert, Category } from '@/types/transaction'
import { toast } from 'sonner'

interface BudgetManagementProps {
  budgetLimits: BudgetLimit[]
  onAddBudget: (budget: Omit<BudgetLimit, 'startDate'>) => void
  budgetAlerts: BudgetAlert[]
}

export function BudgetManagement({ budgetLimits, onAddBudget, budgetAlerts }: BudgetManagementProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('food')
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount) return

    onAddBudget({
      category: selectedCategory,
      amount: parseFloat(amount),
      period,
    })

    toast.success('Budget Set', {
      description: `Budget limit of ${formatCurrency(parseFloat(amount))} set for ${selectedCategory} (${period})`,
    })

    setAmount('')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Budget Limits</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value as Category)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as 'daily' | 'weekly' | 'monthly')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                className="flex-1"
              />
              <Button type="submit" className="w-full sm:w-auto">Set Budget</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetLimits.map((budget) => {
            const alert = budgetAlerts.find(a => a.category === budget.category)
            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <span className="font-medium">
                    {expenseCategories.find(c => c.value === budget.category)?.label}
                  </span>
                  <span className="text-sm sm:text-base">
                    {alert ? formatCurrency(alert.currentSpending) : 0} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <Progress 
                  value={alert ? alert.percentage : 0} 
                  className="h-2"
                  indicatorClassName={alert?.percentage >= 80 ? 'bg-red-500' : undefined}
                />
                {alert?.percentage >= 80 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Budget Alert</AlertTitle>
                    <AlertDescription>
                      You've used {alert.percentage.toFixed(0)}% of your {budget.period} budget for {budget.category}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
} 