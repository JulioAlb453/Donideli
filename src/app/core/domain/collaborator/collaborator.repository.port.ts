import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import type { Collaborator } from './collaborator.model';

@Injectable()
export abstract class CollaboratorRepositoryPort {
  abstract findAllActive(): Observable<Collaborator[]>;
}
