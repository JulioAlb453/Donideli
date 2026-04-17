import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AdminOrderRepositoryPort } from '../../domain/admin-order/admin-order.repository.port';
import type { AdminOrder } from '../../domain/admin-order/admin-order.model';


@Injectable()
export class AdminOrderApiRepository extends AdminOrderRepositoryPort {
  findAll(): Observable<AdminOrder[]> {
    return of([]);
  }
}
