import { describe, expect, it } from 'vitest';
import { formatLeadsToCSV } from './export-utils';

describe('export-utils formatLeadsToCSV', () => {
  it('genera los encabezados CSV correctamente', () => {
    const csv = formatLeadsToCSV([]);
    expect(csv).toContain('ID;Nombre Comercial;Sector / Nicho;Teléfono;Email;Ciudad;Comunidad;Sitio Web;Estado / Oportunidad;Fallo Detectado;Fecha Registro');
  });

  it('formatea un prospecto correctamente', () => {
    const sample = [
      {
        id: 1,
        negocio: 'Clínica Dental Sonrisas',
        sector: 'Salud & Estética',
        telefono: '+34604051111',
        email: 'info@sonrisas.es',
        ciudad: 'Santiago de Compostela',
        comunidad: 'Galicia',
        url: 'https://sonrisas.es',
        potencial_venta: 'Alto',
        fallo_detectado: 'Sin reserva online',
      },
    ];

    const csv = formatLeadsToCSV(sample);
    expect(csv).toContain('"Clínica Dental Sonrisas"');
    expect(csv).toContain('"Salud & Estética"');
    expect(csv).toContain('"+34604051111"');
    expect(csv).toContain('"Santiago de Compostela"');
    expect(csv).toContain('"Sin reserva online"');
  });
});
