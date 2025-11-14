export const maskDDMMYYYY = (raw: string): string => {
  const d = (raw || '').replace(/[^0-9]/g, '')
  const dd = d.slice(0, 2)
  const mm = d.slice(2, 4)
  const yyyy = d.slice(4, 8)
  if (d.length <= 2) return dd
  if (d.length <= 4) return `${dd}/${mm}`
  return `${dd}/${mm}/${yyyy}`
}

export const parseDDMMYYYY = (s: string | null | undefined): Date | null => {
  if (!s) return null
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s).trim())
  if (!m) return null
  const dd = Number(m[1])
  const mm = Number(m[2])
  const yyyy = Number(m[3])
  const d = new Date(yyyy, mm - 1, dd)
  if (d.getFullYear() !== yyyy || d.getMonth() !== mm - 1 || d.getDate() !== dd) return null
  return d
}

export const fmtDDMMYYYY = (d: Date | null): string => {
  if (!d) return ''
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yy = d.getFullYear()
  return `${dd}/${mm}/${yy}`
}

export const validateDateRange = (start: string | null | undefined, end: string | null | undefined): string | null => {
  const sd = parseDDMMYYYY(start)
  const ed = parseDDMMYYYY(end)
  if (start && !sd) return 'Ngày bắt đầu không hợp lệ (dd/mm/yyyy)'
  if (end && !ed) return 'Ngày kết thúc không hợp lệ (dd/mm/yyyy)'
  if (sd && ed && ed.getTime() <= sd.getTime()) return 'Ngày kết thúc phải sau ngày bắt đầu'
  return null
}

export const toVndGrouped = (numOrStr: number | string | '' | null | undefined): string => {
  const n = typeof numOrStr === 'number' ? numOrStr : Number(String(numOrStr || '').replace(/[^0-9]/g, ''))
  if (!Number.isFinite(n) || n === 0) return ''
  return n.toLocaleString('vi-VN')
}

export const formatVndText = (raw: string): string => {
  const digits = (raw || '').replace(/[^0-9]/g, '')
  if (!digits) return ''
  const n = Number(digits)
  return n.toLocaleString('vi-VN')
}

export const toNumberFromGrouped = (raw: string | number | undefined): number => {
  if (typeof raw === 'number') return raw
  const s = String(raw ?? '').replace(/\./g, '')
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

export const validateDiscountValue = (discountType: 'percent' | 'fixed', valueStr: string): string | undefined => {
  if (valueStr === '') return 'Vui lòng nhập giá trị giảm'
  if (discountType === 'percent') {
    const n = Number(valueStr)
    if (!Number.isFinite(n) || n < 1 || n >= 50) return 'Phần trăm giảm phải từ 1 đến 50'
  } else {
    const n = Number((valueStr || '').replace(/[^0-9]/g, ''))
    if (!Number.isFinite(n) || n < 1000) return 'Giá trị tối thiểu 1.000₫'
  }
  return undefined
}
