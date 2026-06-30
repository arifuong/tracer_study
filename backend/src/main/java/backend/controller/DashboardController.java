package backend.controller;

import backend.dto.DashboardDto;
import backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Bertanggung jawab menerima request dari client.

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // Admin Dashboard Endpoint
    @GetMapping("/admin/dashboard")
    public ResponseEntity<DashboardDto> getAdminDashboard(@RequestParam(value = "periodeId", required = false) Long periodeId) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(periodeId));
    }

    // Pimpinan Dashboard Endpoint
    @GetMapping("/pimpinan/dashboard")
    public ResponseEntity<DashboardDto> getPimpinanDashboard(@RequestParam(value = "periodeId", required = false) Long periodeId) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(periodeId));
    }

    // Generic Dashboard Endpoint
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard(@RequestParam(value = "periodeId", required = false) Long periodeId) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(periodeId));
    }
}
