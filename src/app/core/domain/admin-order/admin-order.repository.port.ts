import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AdminOrder } from './admin-order.model';

@Injectable()
export abstract class AdminOrderRepositoryPort {
  abstract findAll(): Observable<AdminOrder[]>;
}
