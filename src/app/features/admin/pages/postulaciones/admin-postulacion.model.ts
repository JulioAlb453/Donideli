export interface AdminPostulacionRow {
  id: number;
  id_comprador?: number | null;
  nombre_completo: string;
  email: string;
  telefono: string;
  specialty: string;
  mensaje: string | null;
  estado: string;
  creado_en: string;
}
