import { HttpClient } from '@angular/common/http';
import { CollaboratorRepositoryPort } from '../../domain/collaborator/collaborator.repository.port';
import { CollaboratorApiRepository } from './collaborator-api.repository';

export function collaboratorRepositoryFactory(
  http: HttpClient,
  apiBaseUrl: string,
): CollaboratorRepositoryPort {
  return new CollaboratorApiRepository(http, apiBaseUrl);
}
