import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { CollaboratorRepositoryPort } from '../../domain/collaborator/collaborator.repository.port';
import type { Collaborator } from '../../domain/collaborator/collaborator.model';

@Injectable({ providedIn: 'root' })
export class GetActiveCollaboratorsUseCase {
  constructor(private readonly collaboratorRepository: CollaboratorRepositoryPort) { }

  execute(): Observable<Collaborator[]> {
    return this.collaboratorRepository.findAllActive();
  }
}
