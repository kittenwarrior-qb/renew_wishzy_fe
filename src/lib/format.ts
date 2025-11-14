export const formatDateDDMMYYYY = (input?: string | Date | null) => {
  if (!input) return ''
  const d = typeof input === 'string' ? new Date(input) : input
  if (Number.isNaN(d.getTime())) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export const formatVND = (n?: number | null) => {
  if (n == null || Number.isNaN(Number(n))) return ''
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(n))
}

export const formatPercent = (n?: number | null) => {
  if (n == null || Number.isNaN(Number(n))) return ''
  return `${Number(n)}%`
}
