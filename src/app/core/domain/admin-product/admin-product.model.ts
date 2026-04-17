import type { CollaboratorCategory } from '../collaborator/collaborator.model';

export type AdminProductStatus = 'active' | 'out_of_stock';

/** Misma convención que `FlaticonIconName` (UI); el dominio no importa shared. */
export type AdminProductCardIcon = 'cookie' | 'donut' | 'milk-bottle';

export interface AdminProduct {
  id: string;
  name: string;
  category: CollaboratorCategory;
  priceMx: number;
  status: AdminProductStatus;
  collaboratorName: string;
  salesCount: number;
  icon: AdminProductCardIcon;
  stock: number;
  collaboratorDbId: number | null;
}

export interface AdminProductCreateBody {
  nombre: string;
  precio: number;
  categoria: string | null;
  stock_disponible: number;
  id_colaborador: number | null;
}

export type AdminProductUpdateBody = Partial<{
  nombre: string;
  precio: number;
  categoria: string | null;
  stock_disponible: number;
  id_colaborador: number | null;
}>;
