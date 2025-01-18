import { Progress } from '@/components/ui/progress'
import { CategoryLimit } from '../types/transaction'
import { formatCurrency, getCategoryIcon } from '../utils/formatters'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface CategoryProgressProps {
  categoryLimit: CategoryLimit
}

export function CategoryProgress({ categoryLimit }: CategoryProgressProps) {
  const percentage = (categoryLimit.spent / categoryLimit.limit) * 100
  const isNearLimit = percentage >= 80

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getCategoryIcon(categoryLimit.category)}</span>
          <span className="capitalize">{categoryLimit.category}</span>
        </div>
        <div className="text-sm">
          {formatCurrency(categoryLimit.spent)} / {formatCurrency(categoryLimit.limit)}
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
      {isNearLimit && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You're approaching your spending limit for {categoryLimit.category}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

