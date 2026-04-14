import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AdminProductRepositoryPort } from '../../domain/admin-product/admin-product.repository.port';
import type { AdminProduct } from '../../domain/admin-product/admin-product.model';
import { ADMIN_PRODUCT_SEED } from './admin-product-in-memory.data';

@Injectable()
export class AdminProductInMemoryRepository extends AdminProductRepositoryPort {
  findAll(): Observable<AdminProduct[]> {
    return of([...ADMIN_PRODUCT_SEED]);
  }
}
