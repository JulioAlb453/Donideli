export type AdminOrderStatus = 'pending' | 'on_the_way' | 'delivered' | 'cancelled';

export interface AdminOrderLineItem {
  productName: string;
  quantity: number;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  collaboratorName: string;
  items: AdminOrderLineItem[];
  totalMx: number;
  createdAtIso: string;
  status: AdminOrderStatus;
}
