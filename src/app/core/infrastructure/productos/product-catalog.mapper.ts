import type { CollaboratorCategory } from '../../domain/collaborator/collaborator.model';
import type { AdminProduct, AdminProductCardIcon } from '../../domain/admin-product/admin-product.model';

export interface ProductoListApiRow {
  id: number;
  nombre: string;
  categoria: string | null;
  precio: number;
  estado?: string;
  stock?: number;
  colaborador_nombre?: string;
  ventas_count?: number;
  id_colaborador?: number | null;
}

export interface MenuProduct {
  id_producto: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CollaboratorCategory;
  etiquetas: string[];
}

export function normalizeProductCategory(raw: string | null | undefined): CollaboratorCategory {
  const s = (raw ?? '').trim().toLowerCase();
  if (!s) {
    return 'donas';
  }
  if (s === 'galletas' || s.includes('gallet')) {
    return 'galletas';
  }
  if (
    s === 'bebidas' ||
    s.includes('bebida') ||
    s.includes('cafe') ||
    s.includes('café') ||
    s.includes('coffee')
  ) {
    return 'bebidas';
  }
  if (s === 'donas' || s.includes('dona') || s.includes('donut')) {
    return 'donas';
  }
  return 'donas';
}

function categoryToAdminIcon(cat: CollaboratorCategory): AdminProductCardIcon {
  switch (cat) {
    case 'galletas':
      return 'cookie';
    case 'bebidas':
      return 'milk-bottle';
    default:
      return 'donut';
  }
}

export function mapApiRowToMenuProduct(row: ProductoListApiRow): MenuProduct {
  const categoria = normalizeProductCategory(row.categoria);
  return {
    id_producto: String(row.id),
    nombre: row.nombre,
    descripcion: row.nombre,
    precio: row.precio,
    categoria,
    etiquetas: [],
  };
}

export function mapApiRowToAdminProduct(row: ProductoListApiRow): AdminProduct {
  const category = normalizeProductCategory(row.categoria);
  const stock = typeof row.stock === 'number' ? row.stock : 0;
  const outOfStock = row.estado === 'agotado' || stock <= 0;
  const cid = row.id_colaborador;
  return {
    id: String(row.id),
    name: row.nombre,
    category,
    priceMx: row.precio,
    status: outOfStock ? 'out_of_stock' : 'active',
    collaboratorName: row.colaborador_nombre?.trim() || '—',
    salesCount: row.ventas_count ?? 0,
    icon: categoryToAdminIcon(category),
    stock,
    collaboratorDbId: typeof cid === 'number' ? cid : null,
  };
}
