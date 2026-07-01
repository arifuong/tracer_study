import api from '../api/axios';

export const downloadPdf = (periodeId, namaLaporan) => {
  return api.post('/api/laporan/export/pdf', {
    periodeId,
    namaLaporan
  }, {
    responseType: 'blob'
  });
};

export const downloadExcel = (periodeId, namaLaporan) => {
  return api.post('/api/laporan/export/excel', {
    periodeId,
    namaLaporan
  }, {
    responseType: 'blob'
  });
};
