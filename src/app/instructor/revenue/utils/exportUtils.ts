// Revenue Export Utilities

export interface ExportTransaction {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  amount: number;
  instructorEarning: number;
  status: string;
  paymentProvider: string;
  transactionDate: string;
}

export const exportToCSV = (transactions: ExportTransaction[], filename: string = 'revenue-report') => {
  const headers = [
    'ID',
    'Tên học viên',
    'Email học viên', 
    'Khóa học',
    'Tổng tiền',
    'Thu nhập giảng viên',
    'Trạng thái',
    'Phương thức thanh toán',
    'Ngày giao dịch'
  ];

  const csvContent = [
    headers.join(','),
    ...transactions.map(transaction => [
      transaction.id,
      `"${transaction.studentName}"`,
      transaction.studentEmail,
      `"${transaction.courseName}"`,
      transaction.amount,
      transaction.instructorEarning,
      transaction.status,
      transaction.paymentProvider,
      transaction.transactionDate
    ].join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (data: any, filename: string = 'revenue-report') => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatCurrency = (amount: number, currency: string = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const generateRevenueReport = (transactions: ExportTransaction[], statistics: any) => {
  const reportDate = new Date().toLocaleDateString('vi-VN');
  
  return {
    metadata: {
      reportTitle: 'Báo cáo doanh thu giảng viên',
      generatedAt: new Date().toISOString(),
      reportDate,
      totalTransactions: transactions.length,
    },
    summary: {
      totalRevenue: statistics?.totalRevenue || 0,
      totalOrders: statistics?.totalOrders || 0,
      completedOrders: statistics?.completedOrders || 0,
      averageOrderValue: statistics?.averageOrderValue || 0,
      monthlyRevenue: statistics?.monthlyRevenue || 0,
    },
    transactions: transactions.map(t => ({
      ...t,
      formattedAmount: formatCurrency(t.amount),
      formattedEarning: formatCurrency(t.instructorEarning),
      formattedDate: formatDate(t.transactionDate)
    })),
    courseBreakdown: generateCourseBreakdown(transactions),
    paymentMethodBreakdown: generatePaymentMethodBreakdown(transactions)
  };
};

const generateCourseBreakdown = (transactions: ExportTransaction[]) => {
  const courseStats = new Map();
  
  transactions.forEach(transaction => {
    const courseId = transaction.courseName; // Using courseName as key since we don't have courseId
    
    if (!courseStats.has(courseId)) {
      courseStats.set(courseId, {
        courseName: transaction.courseName,
        totalRevenue: 0,
        totalTransactions: 0,
        completedTransactions: 0
      });
    }
    
    const stats = courseStats.get(courseId);
    stats.totalRevenue += transaction.instructorEarning;
    stats.totalTransactions += 1;
    
    if (transaction.status === 'completed') {
      stats.completedTransactions += 1;
    }
  });
  
  return Array.from(courseStats.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
};

const generatePaymentMethodBreakdown = (transactions: ExportTransaction[]) => {
  const paymentStats = new Map();
  
  transactions.forEach(transaction => {
    const method = transaction.paymentProvider;
    
    if (!paymentStats.has(method)) {
      paymentStats.set(method, {
        method,
        totalRevenue: 0,
        totalTransactions: 0,
        completedTransactions: 0
      });
    }
    
    const stats = paymentStats.get(method);
    stats.totalRevenue += transaction.instructorEarning;
    stats.totalTransactions += 1;
    
    if (transaction.status === 'completed') {
      stats.completedTransactions += 1;
    }
  });
  
  return Array.from(paymentStats.values())
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
};