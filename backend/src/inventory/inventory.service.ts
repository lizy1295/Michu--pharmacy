import { Injectable } from '@nestjs/common';

export interface InventoryOverview {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  expiredItems: number;
  incomingShipments: number;
  warehouseValue: number;
}

export interface LowStockItem {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
  status: 'critical' | 'low' | 'warning';
}

export interface ExpiredItem {
  id: number;
  name: number;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
}

export interface IncomingShipment {
  id: number;
  productName: string;
  supplier: string;
  expectedDate: string;
  quantity: number;
  status: 'ordered' | 'shipped' | 'received';
}

@Injectable()
export class InventoryService {
  async getOverview(): Promise<InventoryOverview> {
    return {
      totalProducts: 156,
      totalStock: 15420,
      lowStockItems: 8,
      expiredItems: 3,
      incomingShipments: 5,
      warehouseValue: 2450000,
    };
  }

  async getLowStock(): Promise<LowStockItem[]> {
    return [
      { id: 1, name: 'Amoxicillin 500mg', currentStock: 5, minStock: 20, status: 'critical' },
      { id: 2, name: 'Metformin 850mg', currentStock: 12, minStock: 30, status: 'low' },
      { id: 3, name: 'Cetrizine 10mg', currentStock: 18, minStock: 25, status: 'warning' },
    ];
  }

  async getExpired(): Promise<ExpiredItem[]> {
    return [
      { id: 1, name: 1, batchNumber: 'BTH-2024-001', expiryDate: '2026-06-30', quantity: 50 },
      { id: 2, name: 2, batchNumber: 'BTH-2024-045', expiryDate: '2026-07-15', quantity: 30 },
    ];
  }

  async getIncoming(): Promise<IncomingShipment[]> {
    return [
      { id: 1, productName: 'Paracetamol 500mg', supplier: 'GSK Ethiopia', expectedDate: '2026-07-30', quantity: 1000, status: 'shipped' },
      { id: 2, productName: 'Ibuprofen 400mg', supplier: 'Abbott', expectedDate: '2026-08-01', quantity: 500, status: 'ordered' },
    ];
  }
}
