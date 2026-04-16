import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { AdminOrderRepositoryPort } from '../../domain/admin-order/admin-order.repository.port';
import type { AdminOrder } from '../../domain/admin-order/admin-order.model';

@Injectable()
export class GetAllAdminOrdersUseCase {
  constructor(private readonly adminOrderRepository: AdminOrderRepositoryPort) {}

  execute(): Observable<AdminOrder[]> {
    return this.adminOrderRepository.findAll();
  }
}
