"use client"

import { Badge } from "@/components/ui/badge"
import type { SaleStatus } from "@/types/sale"
import { cn } from "@/lib/utils"

interface SaleBadgeProps {
  status: SaleStatus
  discount?: number // % giảm giá
  className?: string
}

export function SaleBadge({ status, discount, className }: SaleBadgeProps) {
  if (status === 'none') return null

  const getBadgeConfig = () => {
    switch (status) {
      case 'active':
        return {
          label: discount ? `-${discount}%` : 'Đang sale',
          variant: 'default' as const,
          className: 'bg-red-500 text-white hover:bg-red-600',
        }
      case 'upcoming':
        return {
          label: 'Sắp sale',
          variant: 'secondary' as const,
          className: 'bg-yellow-500 text-white hover:bg-yellow-600',
        }
      case 'expired':
        return {
          label: 'Hết sale',
          variant: 'outline' as const,
          className: 'bg-gray-200 text-gray-600',
        }
      default:
        return null
    }
  }

  const config = getBadgeConfig()
  if (!config) return null

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

