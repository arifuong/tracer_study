package backend.controller;

import backend.dto.AlumniProfileDto;
import backend.dto.FillRequestDto;
import backend.dto.KuesionerDto;
import backend.dto.SubmissionStatusDto;
import backend.service.AlumniService;
import backend.service.KuesionerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;


// Bertanggung jawab menerima request dari client.
@RestController
@RequestMapping("/api/alumni")
@RequiredArgsConstructor
public class AlumniController {

    private final AlumniService alumniService;
    private final KuesionerService kuesionerService;

    // Profile Endpoints
    @GetMapping("/profile")
    public ResponseEntity<AlumniProfileDto> getProfile(Principal principal) {
        return ResponseEntity.ok(alumniService.getProfile(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<AlumniProfileDto> updateProfile(Principal principal, @Valid @RequestBody AlumniProfileDto dto) {
        return ResponseEntity.ok(alumniService.updateProfile(principal.getName(), dto));
    }

    // Questionnaire Endpoints
    @GetMapping("/kuesioner/active")
    public ResponseEntity<List<KuesionerDto>> getActiveKuesioner(Principal principal) {
        return ResponseEntity.ok(kuesionerService.getActiveKuesioner(principal.getName()));
    }

    @GetMapping("/pengisian/status")
    public ResponseEntity<List<SubmissionStatusDto>> getSubmissionStatus(Principal principal) {
        return ResponseEntity.ok(kuesionerService.getSubmissionStatus(principal.getName()));
    }

    @PostMapping("/kuesioner/{id}/isi")
    public ResponseEntity<String> submitAnswers(Principal principal, @PathVariable("id") Long id, @Valid @RequestBody FillRequestDto request) {
        kuesionerService.submitAnswers(principal.getName(), id, request);
        return ResponseEntity.ok("Jawaban berhasil dikirim");
    }
}
