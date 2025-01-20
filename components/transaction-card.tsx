import { Transaction } from '../types/transaction'
import { formatCurrency } from '../utils/formatters'
import { format } from 'date-fns'
import { getCategoryIcon, getPaymentMethodIcon } from '../utils/categories'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TransactionCardProps {
  transaction: Transaction
  onDelete: (id: string) => void
}

export function TransactionCard({ transaction, onDelete }: TransactionCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg mb-2 hover:bg-accent/50 transition-colors gap-4">
      <div className="flex items-start gap-4 w-full sm:w-auto">
        <div className="text-2xl">
          {getCategoryIcon(transaction.category, transaction.type)}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{transaction.description}</h3>
          <div className="text-sm text-muted-foreground space-y-1 sm:space-y-0 sm:space-x-2">
            <span className="block sm:inline">{format(new Date(transaction.date), 'PPP')}</span>
            <span className="hidden sm:inline">•</span>
            <span className="block sm:inline-flex items-center gap-1">
              {getPaymentMethodIcon(transaction.paymentMethod)}
              {transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
        <div className={`${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'} font-medium`}>
          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(transaction.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

