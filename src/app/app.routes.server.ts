import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'buyer/colaborador/:id/menu',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/productos',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/ventas-globales',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/proximas-actualizaciones',
    renderMode: RenderMode.Client,
  },
  {
    path: 'login',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
