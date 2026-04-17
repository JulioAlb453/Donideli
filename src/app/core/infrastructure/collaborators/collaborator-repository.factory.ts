import { HttpClient } from '@angular/common/http';
import { CollaboratorRepositoryPort } from '../../domain/collaborator/collaborator.repository.port';
import { CollaboratorApiRepository } from './collaborator-api.repository';
import { CollaboratorInMemoryRepository } from './collaborator-in-memory.repository';

export function collaboratorRepositoryFactory(
  http: HttpClient,
  apiBaseUrl: string,
): CollaboratorRepositoryPort {
  if (apiBaseUrl) {
    return new CollaboratorApiRepository(http, apiBaseUrl);
  }
  return new CollaboratorInMemoryRepository();
}
