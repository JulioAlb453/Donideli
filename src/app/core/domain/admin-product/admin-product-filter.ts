import type { CollaboratorCategory } from '../collaborator/collaborator.model';
import type { AdminProduct } from './admin-product.model';

export type AdminProductCategoryFilter = 'all' | CollaboratorCategory;

export function filterAdminProducts(
  products: AdminProduct[],
  category: AdminProductCategoryFilter,
  search: string,
): AdminProduct[] {
  const q = search.trim().toLowerCase();
  return products.filter((p) => {
    const categoryOk = category === 'all' || p.category === category;
    const searchOk =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.collaboratorName.toLowerCase().includes(q);
    return categoryOk && searchOk;
  });
}
