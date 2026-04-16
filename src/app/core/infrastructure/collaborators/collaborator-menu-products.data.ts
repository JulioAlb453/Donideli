import type { CollaboratorCategory } from '../../domain/collaborator/collaborator.model';

export interface MenuProduct {
  id_producto: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CollaboratorCategory;
  etiquetas: string[];
}

export interface CollaboratorMenu {
  id_colaborador: string;
  productos: MenuProduct[];
}

export const COLLABORATOR_MENU_SEED: CollaboratorMenu[] = [
  {
    id_colaborador: '1',
    productos: [
      {
        id_producto: 'm1-1',
        nombre: 'Leche Santa Clara',
        descripcion: 'Dona de vainilla con centro cremoso de chocolate y chispas de colores.',
        precio: 15,
        categoria: 'donas',
        etiquetas: ['vainilla', 'chocolate'],
      },
      {
        id_producto: 'm1-2',
        nombre: 'Glaseada Rosa',
        descripcion: 'Masa suave glaseada con cobertura frutal y topping crocante.',
        precio: 17,
        categoria: 'donas',
        etiquetas: ['frutal', 'glaseada'],
      },
      {
        id_producto: 'm1-3',
        nombre: 'Fresa Cremosa',
        descripcion: 'Dona rellena de crema de fresa con glaseado de chocolate blanco.',
        precio: 18,
        categoria: 'donas',
        etiquetas: ['fresa', 'chocolate blanco'],
      },
      {
        id_producto: 'm1-4',
        nombre: 'Mini Donas (6 pzas)',
        descripcion: 'Surtido de 6 mini donas con glaseados variados, perfectas para compartir.',
        precio: 90,
        categoria: 'donas',
        etiquetas: ['surtido', 'mini'],
      },
    ],
  },
  {
    id_colaborador: '2',
    productos: [
      {
        id_producto: 'm2-1',
        nombre: 'Cookie Choco Chips',
        descripcion: 'Galleta grande con chips de chocolate semiamargo.',
        precio: 22,
        categoria: 'galletas',
        etiquetas: ['choco', 'artesanal'],
      },
      {
        id_producto: 'm2-2',
        nombre: 'Avena y Miel',
        descripcion: 'Textura suave con avena integral y un toque de miel.',
        precio: 20,
        categoria: 'galletas',
        etiquetas: ['avena', 'miel'],
      },
      {
        id_producto: 'm2-3',
        nombre: 'Galleta Red Velvet',
        descripcion: 'Galleta suave con sabor red velvet y centro cremoso.',
        precio: 24,
        categoria: 'galletas',
        etiquetas: ['red velvet', 'premium'],
      },
      {
        id_producto: 'm2-4',
        nombre: 'Galleta de Avena',
        descripcion: 'Receta de la abuela con avena, pasas y canela.',
        precio: 18,
        categoria: 'galletas',
        etiquetas: ['avena', 'pasas'],
      },
    ],
  },
  {
    id_colaborador: '3',
    productos: [
      {
        id_producto: 'm3-1',
        nombre: 'Frappe de Vainilla',
        descripcion: 'Bebida fría con crema batida y toque de canela.',
        precio: 55,
        categoria: 'bebidas',
        etiquetas: ['frío', 'cremoso'],
      },
      {
        id_producto: 'm3-2',
        nombre: 'Iced Latte',
        descripcion: 'Espresso con leche fría, hielo y jarabe ligero.',
        precio: 48,
        categoria: 'bebidas',
        etiquetas: ['café', 'hielo'],
      },
      {
        id_producto: 'm3-3',
        nombre: 'Smoothie Mango',
        descripcion: 'Mango fresco con yogurt natural y un toque de miel.',
        precio: 52,
        categoria: 'bebidas',
        etiquetas: ['frutal', 'yogurt'],
      },
      {
        id_producto: 'm3-4',
        nombre: 'Agua de Horchata',
        descripcion: 'Bebida de arroz con canela y un toque de vainilla.',
        precio: 35,
        categoria: 'bebidas',
        etiquetas: ['tradicional', 'canela'],
      },
    ],
  },
  {
    id_colaborador: '4',
    productos: [
      {
        id_producto: 'm4-1',
        nombre: 'Dona Vegana Matcha',
        descripcion: 'Dona de matcha con glaseado de coco y sin gluten.',
        precio: 25,
        categoria: 'donas',
        etiquetas: ['vegana', 'matcha'],
      },
      {
        id_producto: 'm4-2',
        nombre: 'Dona Integral Miel',
        descripcion: 'Dona de harina integral endulzada con miel orgánica.',
        precio: 22,
        categoria: 'donas',
        etiquetas: ['integral', 'miel'],
      },
    ],
  },
  {
    id_colaborador: 'admin',
    productos: [
      {
        id_producto: 'adm-1',
        nombre: 'Dona Boston',
        descripcion: 'Dona clásica rellena de crema pastelera con cobertura de chocolate.',
        precio: 19,
        categoria: 'donas',
        etiquetas: ['clásica', 'chocolate'],
      },
      {
        id_producto: 'adm-2',
        nombre: 'Dona Chocolate Belga',
        descripcion: 'Cobertura de chocolate belga premium con relleno de trufa.',
        precio: 21,
        categoria: 'donas',
        etiquetas: ['premium', 'trufa'],
      },
      {
        id_producto: 'adm-3',
        nombre: 'Cookie Doble Chocolate',
        descripcion: 'Galleta de cocoa con chips de chocolate blanco y negro.',
        precio: 24,
        categoria: 'galletas',
        etiquetas: ['doble choco', 'premium'],
      },
      {
        id_producto: 'adm-4',
        nombre: 'Galleta Mantequilla',
        descripcion: 'Receta francesa con mantequilla europea y vainilla natural.',
        precio: 20,
        categoria: 'galletas',
        etiquetas: ['mantequilla', 'francesa'],
      },
      {
        id_producto: 'adm-5',
        nombre: 'Café Americano Helado',
        descripcion: 'Doble shot de espresso con hielo y agua filtrada.',
        precio: 40,
        categoria: 'bebidas',
        etiquetas: ['café', 'helado'],
      },
      {
        id_producto: 'adm-6',
        nombre: 'Limonada con Menta',
        descripcion: 'Limón natural con hojas de menta fresca y miel de agave.',
        precio: 38,
        categoria: 'bebidas',
        etiquetas: ['fresco', 'natural'],
      },
    ],
  },
];

export function getMenuByCollaborator(id: string): MenuProduct[] {
  return COLLABORATOR_MENU_SEED.find((m) => m.id_colaborador === id)?.productos ?? [];
}

export function getMenuByCategory(id: string, category: CollaboratorCategory): MenuProduct[] {
  return getMenuByCollaborator(id).filter((p) => p.categoria === category);
}
