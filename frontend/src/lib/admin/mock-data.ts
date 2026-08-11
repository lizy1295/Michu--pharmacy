export const MOCK_DASHBOARD_STATS = {
  totalRevenue: 1250000,
  todayOrders: 48,
  totalProducts: 156,
  totalCustomers: 892,
  totalPrescriptions: 234,
  pendingOrders: 12,
  outOfStock: 8,
  monthlySales: 450000,
};

export const MOCK_RECENT_ORDERS = [
  { id: 1, orderNumber: 'ORD-001', customer: 'Abebe Kebede', total: 1250, status: 'Pending', date: '2026-07-28' },
  { id: 2, orderNumber: 'ORD-002', customer: 'Sara Tesfaye', total: 890, status: 'Approved', date: '2026-07-28' },
  { id: 3, orderNumber: 'ORD-003', customer: 'Dawit Hailu', total: 2100, status: 'Shipped', date: '2026-07-27' },
  { id: 4, orderNumber: 'ORD-004', customer: 'Marta Alemu', total: 450, status: 'Completed', date: '2026-07-27' },
  { id: 5, orderNumber: 'ORD-005', customer: 'Yohannes Bekele', total: 1800, status: 'Pending', date: '2026-07-26' },
];

export const MOCK_RECENT_CUSTOMERS = [
  { id: 1, name: 'Abebe Kebede', email: 'abebe@example.com', orders: 12, joinedAt: '2026-07-20' },
  { id: 2, name: 'Sara Tesfaye', email: 'sara@example.com', orders: 8, joinedAt: '2026-07-22' },
  { id: 3, name: 'Dawit Hailu', email: 'dawit@example.com', orders: 5, joinedAt: '2026-07-25' },
  { id: 4, name: 'Marta Alemu', email: 'marta@example.com', orders: 15, joinedAt: '2026-07-15' },
  { id: 5, name: 'Yohannes Bekele', email: 'yohannes@example.com', orders: 3, joinedAt: '2026-07-26' },
];

export const MOCK_PRODUCTS = [
  { id: 1, name: 'Panadol 500mg', brand: 'GSK', category: 'Medicine', price: 45, stock: 500, status: 'active', prescriptionRequired: false },
  { id: 2, name: 'Metformin 850mg', brand: 'Merck', category: 'Medicine', price: 120, stock: 300, status: 'active', prescriptionRequired: true },
  { id: 3, name: 'Amoxicillin 500mg', brand: 'Sandoz', category: 'Medicine', price: 85, stock: 150, status: 'active', prescriptionRequired: true },
  { id: 4, name: 'Vitamin C 1000mg', brand: 'Nature Made', category: 'Supplement', price: 350, stock: 200, status: 'active', prescriptionRequired: false },
  { id: 5, name: 'Cetrizine 10mg', brand: 'UCB', category: 'Medicine', price: 95, stock: 5, status: 'active', prescriptionRequired: false },
];

export const MOCK_CATEGORIES = [
  { id: 1, name: 'Medicine', slug: 'medicine', productCount: 15, status: 'active' },
  { id: 2, name: 'Supplement', slug: 'supplement', productCount: 13, status: 'active' },
  { id: 3, name: 'Cosmetic', slug: 'cosmetic', productCount: 12, status: 'active' },
];
