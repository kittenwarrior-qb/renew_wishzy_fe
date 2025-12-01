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

export type DateRange = {
  startDate: string;
  endDate: string;
};

export const getDateRange = (mode: 'day' | 'week' | 'month' | 'year'): DateRange => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  switch (mode) {
    case 'day':
      // Full current month (1st to last day)
      startDate = new Date(currentYear, currentMonth, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      break;

    case 'week':
      // Full current month (1st to last day)
      startDate = new Date(currentYear, currentMonth, 1);
      endDate = new Date(currentYear, currentMonth + 1, 0);
      break;

    case 'month':
      // Full current year (Jan 1 to Dec 31)
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31);
      break;

    case 'year':
      // Last 5 years (from 5 years ago to current year)
      startDate = new Date(currentYear - 4, 0, 1);
      endDate = new Date(currentYear, 11, 31);
      break;

    default:
      startDate = new Date(now);
      endDate = new Date(now);
  }

  return {
    startDate: formatDateYYYYMMDD(startDate),
    endDate: formatDateYYYYMMDD(endDate)
  };
};

const formatDateYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
