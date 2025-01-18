'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/utils/formatters'

interface NotificationDropdownProps {
  totalIncome: number
  totalExpenses: number
}

export function NotificationDropdown({ totalIncome, totalExpenses }: NotificationDropdownProps) {
  const spendingPercentage = (totalExpenses / totalIncome) * 100

  const getNotifications = () => {
    const notifications = []

    if (spendingPercentage >= 100) {
      notifications.push({
        id: 'exceed-100',
        icon: '🚨',
        message: `Warning: Your expenses (${formatCurrency(totalExpenses)}) have exceeded your income (${formatCurrency(totalIncome)})`,
        severity: 'critical'
      })
    } else if (spendingPercentage >= 80) {
      notifications.push({
        id: 'exceed-80',
        icon: '⚠️',
        message: `Alert: Your expenses are at ${spendingPercentage.toFixed(1)}% of your income`,
        severity: 'high'
      })
    } else if (spendingPercentage >= 70) {
      notifications.push({
        id: 'exceed-70',
        icon: '⚠️',
        message: `Notice: Your expenses have reached ${spendingPercentage.toFixed(1)}% of your income`,
        severity: 'medium'
      })
    } else if (spendingPercentage >= 50) {
      notifications.push({
        id: 'exceed-50',
        icon: '📊',
        message: `Info: Your expenses are at ${spendingPercentage.toFixed(1)}% of your income`,
        severity: 'low'
      })
    }

    return notifications
  }

  const notifications = getNotifications()
  const hasNotifications = notifications.length > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {notifications.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`flex items-start gap-2 p-3 ${
                notification.severity === 'critical' 
                  ? 'bg-red-50 dark:bg-red-950' 
                  : notification.severity === 'high'
                  ? 'bg-orange-50 dark:bg-orange-950'
                  : ''
              }`}
            >
              <span className="text-xl">{notification.icon}</span>
              <span className="text-sm">{notification.message}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem className="text-center text-sm text-muted-foreground">
            No new notifications ✨
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

