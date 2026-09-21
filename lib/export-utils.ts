/**
 * ==============================================================================
 * Archivo: lib/export-utils.ts
 * ==============================================================================
 * Descripción:
 *  Utilidad técnica para exportar listados de prospectos y leads a formato CSV
 *  compatible con Microsoft Excel y Google Sheets (UTF-8 con BOM).
 * ==============================================================================
 */

export interface ExportableLead {
  id: string | number;
  empresa?: string | null;
  negocio?: string | null;
  nicho?: string | null;
  sector?: string | null;
  telefono?: string | null;
  email?: string | null;
  ciudad?: string | null;
  comunidad?: string | null;
  url_web?: string | null;
  url?: string | null;
  estado_caza?: string | null;
  fallo_detectado?: string | null;
  potencial_venta?: string | null;
  created_at?: string | null;
}

/**
 * Convierte un array de prospectos/leads a una cadena CSV codificada.
 *
 * @param items Lista de prospectos a exportar.
 * @returns Cadena formateada en CSV con encabezados.
 */
export function formatLeadsToCSV(items: ExportableLead[]): string {
  const headers = [
    'ID',
    'Nombre Comercial',
    'Sector / Nicho',
    'Teléfono',
    'Email',
    'Ciudad',
    'Comunidad',
    'Sitio Web',
    'Estado / Oportunidad',
    'Fallo Detectado',
    'Fecha Registro',
  ];

  const rows = items.map((item) => {
    const nombre = item.empresa || item.negocio || 'Sin nombre';
    const sector = item.sector || item.nicho || '';
    const web = item.url_web || item.url || '';
    const estado = item.estado_caza || item.potencial_venta || 'Registrado';
    const fallo = item.fallo_detectado || '';
    const fecha = item.created_at ? new Date(item.created_at).toLocaleDateString('es-ES') : '';

    return [
      String(item.id),
      `"${nombre.replace(/"/g, '""')}"`,
      `"${sector.replace(/"/g, '""')}"`,
      `"${(item.telefono || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.ciudad || '').replace(/"/g, '""')}"`,
      `"${(item.comunidad || '').replace(/"/g, '""')}"`,
      `"${web.replace(/"/g, '""')}"`,
      `"${estado.replace(/"/g, '""')}"`,
      `"${fallo.replace(/"/g, '""')}"`,
      `"${fecha}"`,
    ].join(';');
  });

  return headers.join(';') + '\n' + rows.join('\n');
}

/**
 * Genera la descarga automática del archivo CSV en el navegador.
 *
 * @param items Lista de prospectos a exportar.
 * @param filename Nombre del archivo a generar (opcional).
 */
export function downloadLeadsCSV(items: ExportableLead[], filename = 'prospectos-radar-hunter.csv'): void {
  const csvContent = formatLeadsToCSV(items);
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
