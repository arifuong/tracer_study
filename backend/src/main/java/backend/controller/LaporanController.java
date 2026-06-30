package backend.controller;

import backend.dto.LaporanDto;
import backend.entity.Laporan;
import backend.service.ReportService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;


// Bertanggung jawab menerima request dari client.

@RestController
@RequestMapping("/api/laporan")
@RequiredArgsConstructor
public class LaporanController {

    private final ReportService reportService;

    // List all generated reports
    @GetMapping
    public ResponseEntity<List<LaporanDto>> getLaporanList() {
        List<LaporanDto> dtos = reportService.getLaporanList().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Export to PDF and download
    @PostMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(Principal principal, @RequestBody ExportRequest request) {
        byte[] pdfBytes = reportService.exportPdf(
                principal.getName(),
                request.getPeriodeId(),
                request.getNamaLaporan()
        );

        String filename = (request.getNamaLaporan() != null ? request.getNamaLaporan().trim().replace(" ", "_") : "Laporan_Tracer_Study") + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    // Export to Excel and download
    @PostMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel(Principal principal, @RequestBody ExportRequest request) {
        byte[] excelBytes = reportService.exportExcel(
                principal.getName(),
                request.getPeriodeId(),
                request.getNamaLaporan()
        );

        String filename = (request.getNamaLaporan() != null ? request.getNamaLaporan().trim().replace(" ", "_") : "Laporan_Tracer_Study") + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    private LaporanDto mapToDto(Laporan laporan) {
        LaporanDto dto = new LaporanDto();
        dto.setId(laporan.getId());
        dto.setAdminNama(laporan.getAdmin().getUsername());
        dto.setNamaLaporan(laporan.getNamaLaporan());
        dto.setFilterKriteria(laporan.getFilterKriteria());
        dto.setTipeFile(laporan.getTipeFile().name());
        dto.setFilePath(laporan.getFilePath());
        dto.setCreatedAt(laporan.getCreatedAt());
        return dto;
    }

    @Data
    public static class ExportRequest {
        private Long periodeId;
        private String namaLaporan;
    }
}
