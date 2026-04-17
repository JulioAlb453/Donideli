import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { AdminProduct, AdminProductCreateBody, AdminProductUpdateBody } from './admin-product.model';

@Injectable()
export abstract class AdminProductRepositoryPort {
  abstract findAll(): Observable<AdminProduct[]>;
  abstract create(body: AdminProductCreateBody): Observable<void>;
  abstract update(id: string, body: AdminProductUpdateBody): Observable<void>;
  abstract delete(id: string): Observable<void>;
}
