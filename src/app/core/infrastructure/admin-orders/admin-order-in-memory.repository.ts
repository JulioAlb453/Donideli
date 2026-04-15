import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AdminOrderRepositoryPort } from '../../domain/admin-order/admin-order.repository.port';
import type { AdminOrder } from '../../domain/admin-order/admin-order.model';
import { ADMIN_ORDER_SEED } from './admin-order-in-memory.data';

@Injectable()
export class AdminOrderInMemoryRepository extends AdminOrderRepositoryPort {
  findAll(): Observable<AdminOrder[]> {
    return of([...ADMIN_ORDER_SEED]);
  }
}
