import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { AdminOrderRepositoryPort } from '../../domain/admin-order/admin-order.repository.port';
import type { AdminOrderStatus } from '../../domain/admin-order/admin-order.model';

@Injectable()
export class UpdateAdminOrderStatusUseCase {
  constructor(private readonly adminOrderRepository: AdminOrderRepositoryPort) {}

  execute(id: string, status: AdminOrderStatus): Observable<void> {
    return this.adminOrderRepository.updateStatus(id, status);
  }
}
