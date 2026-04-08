import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CollaboratorRepositoryPort } from '../../domain/collaborator/collaborator.repository.port';
import type { Collaborator } from '../../domain/collaborator/collaborator.model';
import { COLLABORATOR_SEED } from './collaborator-in-memory.data';

@Injectable()
export class CollaboratorInMemoryRepository extends CollaboratorRepositoryPort {
  findAllActive(): Observable<Collaborator[]> {
    return of(COLLABORATOR_SEED.filter((c) => c.status === 'active'));
  }
}
