import { Transaction } from '../types/transaction'
import { formatCurrency } from '../utils/formatters'
import { format } from 'date-fns'
import { getCategoryIcon, getPaymentMethodIcon } from '../utils/categories'

interface TransactionCardProps {
  transaction: Transaction
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg mb-2 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="text-2xl">
          {getCategoryIcon(transaction.category, transaction.type)}
        </div>
        <div>
          <h3 className="font-medium">{transaction.description}</h3>
          <div className="text-sm text-muted-foreground space-x-2">
            <span>{format(new Date(transaction.date), 'PPP')}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              {getPaymentMethodIcon(transaction.paymentMethod)}
              {transaction.paymentMethod.charAt(0).toUpperCase() + transaction.paymentMethod.slice(1)}
            </span>
          </div>
        </div>
      </div>
      <div className={transaction.type === 'income' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
      </div>
    </div>
  )
}

