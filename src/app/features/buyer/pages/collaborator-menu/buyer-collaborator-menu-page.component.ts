import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-buyer-collaborator-menu-page',
  standalone: false,
  templateUrl: './buyer-collaborator-menu-page.component.html',
  styleUrl: './buyer-collaborator-menu-page.component.css',
})
export class BuyerCollaboratorMenuPageComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly collaboratorId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('id'))),
    { initialValue: null },
  );
}
