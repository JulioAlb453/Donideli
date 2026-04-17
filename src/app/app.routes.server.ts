import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'login/registro', renderMode: RenderMode.Client },

  { path: 'buyer/inicio', renderMode: RenderMode.Client },
  { path: 'buyer/colaboradores', renderMode: RenderMode.Client },
  { path: 'buyer/colaborador/:id/menu', renderMode: RenderMode.Client },
  { path: 'buyer/carrito', renderMode: RenderMode.Client },
  { path: 'buyer/checkout/datos', renderMode: RenderMode.Client },
  { path: 'buyer/checkout/pago', renderMode: RenderMode.Client },
  { path: 'buyer/pedidos', renderMode: RenderMode.Client },

  { path: 'admin/productos', renderMode: RenderMode.Client },
  { path: 'admin/ventas-globales', renderMode: RenderMode.Client },
  { path: 'admin/proximas-actualizaciones/postulantes', renderMode: RenderMode.Client },
  { path: 'admin/proximas-actualizaciones/colaboradores', renderMode: RenderMode.Client },
  { path: 'admin/proximas-actualizaciones', renderMode: RenderMode.Client },

  { path: '**', renderMode: RenderMode.Prerender },
];
