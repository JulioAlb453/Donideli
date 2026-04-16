import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AdminProduct } from './admin-product.model';

@Injectable()
export abstract class AdminProductRepositoryPort {
  abstract findAll(): Observable<AdminProduct[]>;
}
