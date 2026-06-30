package backend.controller;

import backend.dto.*;
import backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;


// Bertanggung jawab menerima request dari client.
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // --- ALUMNI CRUD ---

    @GetMapping("/alumni")
    public ResponseEntity<List<AlumniProfileDto>> getAllAlumni() {
        return ResponseEntity.ok(adminService.getAllAlumni());
    }

    @GetMapping("/alumni/{id}")
    public ResponseEntity<AlumniProfileDto> getAlumniById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminService.getAlumniById(id));
    }

    @PostMapping("/alumni")
    public ResponseEntity<AlumniProfileDto> createAlumni(@Valid @RequestBody AlumniProfileDto dto) {
        return ResponseEntity.ok(adminService.createAlumni(dto));
    }

    @PutMapping("/alumni/{id}")
    public ResponseEntity<AlumniProfileDto> updateAlumni(@PathVariable("id") Long id, @Valid @RequestBody AlumniProfileDto dto) {
        return ResponseEntity.ok(adminService.updateAlumni(id, dto));
    }

    @DeleteMapping("/alumni/{id}")
    public ResponseEntity<String> deleteAlumni(@PathVariable("id") Long id) {
        adminService.deleteAlumni(id);
        return ResponseEntity.ok("Data alumni dan akun terkait berhasil dihapus");
    }

    // --- PERIODE CRUD ---

    @GetMapping("/periode")
    public ResponseEntity<List<PeriodeKuesionerDto>> getAllPeriode() {
        return ResponseEntity.ok(adminService.getAllPeriode());
    }

    @GetMapping("/periode/{id}")
    public ResponseEntity<PeriodeKuesionerDto> getPeriodeById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminService.getPeriodeById(id));
    }

    @PostMapping("/periode")
    public ResponseEntity<PeriodeKuesionerDto> createPeriode(@Valid @RequestBody PeriodeKuesionerDto dto) {
        return ResponseEntity.ok(adminService.createPeriode(dto));
    }

    @PutMapping("/periode/{id}")
    public ResponseEntity<PeriodeKuesionerDto> updatePeriode(@PathVariable("id") Long id, @Valid @RequestBody PeriodeKuesionerDto dto) {
        return ResponseEntity.ok(adminService.updatePeriode(id, dto));
    }

    @DeleteMapping("/periode/{id}")
    public ResponseEntity<String> deletePeriode(@PathVariable("id") Long id) {
        adminService.deletePeriode(id);
        return ResponseEntity.ok("Periode kuesioner berhasil dihapus");
    }

    // --- KUESIONER CRUD ---

    @GetMapping("/kuesioner")
    public ResponseEntity<List<KuesionerDto>> getAllKuesioner() {
        return ResponseEntity.ok(adminService.getAllKuesioner());
    }

    @GetMapping("/kuesioner/{id}")
    public ResponseEntity<KuesionerDto> getKuesionerById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminService.getKuesionerById(id));
    }

    @PostMapping("/kuesioner")
    public ResponseEntity<KuesionerDto> createKuesioner(@Valid @RequestBody KuesionerDto dto) {
        return ResponseEntity.ok(adminService.createKuesioner(dto));
    }

    @PutMapping("/kuesioner/{id}")
    public ResponseEntity<KuesionerDto> updateKuesioner(@PathVariable("id") Long id, @Valid @RequestBody KuesionerDto dto) {
        return ResponseEntity.ok(adminService.updateKuesioner(id, dto));
    }

    @DeleteMapping("/kuesioner/{id}")
    public ResponseEntity<String> deleteKuesioner(@PathVariable("id") Long id) {
        adminService.deleteKuesioner(id);
        return ResponseEntity.ok("Kuesioner berhasil dihapus");
    }

    // --- PERTANYAAN CRUD ---

    @GetMapping("/kuesioner/{kuesioner_id}/pertanyaan")
    public ResponseEntity<List<PertanyaanDto>> getPertanyaanByKuesioner(@PathVariable("kuesioner_id") Long kuesionerId) {
        return ResponseEntity.ok(adminService.getPertanyaanByKuesioner(kuesionerId));
    }

    @PostMapping("/kuesioner/{kuesioner_id}/pertanyaan")
    public ResponseEntity<PertanyaanDto> createPertanyaan(@PathVariable("kuesioner_id") Long kuesionerId, @Valid @RequestBody PertanyaanDto dto) {
        return ResponseEntity.ok(adminService.createPertanyaan(kuesionerId, dto));
    }

    @PutMapping("/pertanyaan/{id}")
    public ResponseEntity<PertanyaanDto> updatePertanyaan(@PathVariable("id") Long id, @Valid @RequestBody PertanyaanDto dto) {
        return ResponseEntity.ok(adminService.updatePertanyaan(id, dto));
    }

    @DeleteMapping("/pertanyaan/{id}")
    public ResponseEntity<String> deletePertanyaan(@PathVariable("id") Long id) {
        adminService.deletePertanyaan(id);
        return ResponseEntity.ok("Pertanyaan berhasil dihapus");
    }

    // --- MONITORING ---

    @GetMapping("/monitoring/{periodeId}")
    public ResponseEntity<List<MonitoringDto>> getMonitoringList(@PathVariable("periodeId") Long periodeId) {
        return ResponseEntity.ok(adminService.getMonitoringList(periodeId));
    }

    @GetMapping("/monitoring/{periodeId}/alumni/{alumniId}")
    public ResponseEntity<AlumniAnswersDto> getAlumniAnswers(
            @PathVariable("periodeId") Long periodeId,
            @PathVariable("alumniId") Long alumniId) {
        return ResponseEntity.ok(adminService.getAlumniAnswers(periodeId, alumniId));
    }
}
