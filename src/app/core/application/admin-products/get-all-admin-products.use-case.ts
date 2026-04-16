import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { AdminProductRepositoryPort } from '../../domain/admin-product/admin-product.repository.port';
import type { AdminProduct } from '../../domain/admin-product/admin-product.model';

@Injectable()
export class GetAllAdminProductsUseCase {
  constructor(private readonly adminProductRepository: AdminProductRepositoryPort) {}

  execute(): Observable<AdminProduct[]> {
    return this.adminProductRepository.findAll();
  }
}
