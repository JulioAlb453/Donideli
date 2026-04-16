import type { AdminOrder, AdminOrderStatus } from './admin-order.model';

export type AdminOrderStatusFilter = 'all' | AdminOrderStatus;

export function filterAdminOrders(
  orders: AdminOrder[],
  status: AdminOrderStatusFilter,
  search: string,
): AdminOrder[] {
  const q = search.trim().toLowerCase();
  return orders.filter((o) => {
    const statusOk = status === 'all' || o.status === status;
    if (!q) {
      return statusOk;
    }
    const itemText = o.items.map((i) => `${i.productName} x${i.quantity}`).join(' ');
    const searchOk =
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.replace(/\s/g, '').toLowerCase().includes(q.replace(/\s/g, '')) ||
      o.collaboratorName.toLowerCase().includes(q) ||
      itemText.toLowerCase().includes(q);
    return statusOk && searchOk;
  });
}
