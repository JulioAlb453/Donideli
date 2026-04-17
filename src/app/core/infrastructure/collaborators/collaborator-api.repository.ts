import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../config/api-base-url.token';
import { CollaboratorRepositoryPort } from '../../domain/collaborator/collaborator.repository.port';
import type { Collaborator, CollaboratorCategory, CollaboratorStatus } from '../../domain/collaborator/collaborator.model';
import { normalizeProductCategory } from '../productos/product-catalog.mapper';

interface CollaboratorApiRow {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  bio: string | null;
  specialty: string;
  productCount: number;
  salesCount: number;
  isOnline: boolean;
  status: string;
}

@Injectable()
export class CollaboratorApiRepository extends CollaboratorRepositoryPort {
  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) private readonly apiBaseUrl: string,
  ) {
    super();
  }

  findAllActive(): Observable<Collaborator[]> {
    const url = `${this.apiBaseUrl}/colaboradores/`;
    return this.http.get<CollaboratorApiRow[]>(url).pipe(
      map((rows) =>
        rows
          .filter((r) => r.status === 'active')
          .map((r) => this.mapRow(r)),
      ),
    );
  }

  private mapRow(r: CollaboratorApiRow): Collaborator {
    return {
      id: r.id,
      email: r.email,
      displayName: r.displayName,
      handle: r.handle,
      bio: r.bio ?? '',
      specialty: normalizeProductCategory(r.specialty),
      productCount: r.productCount,
      salesCount: r.salesCount,
      isOnline: Boolean(r.isOnline),
      status: r.status as CollaboratorStatus,
    };
  }
}
