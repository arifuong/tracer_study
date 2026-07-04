package backend.service;

import backend.dto.AlumniProfileDto;
import backend.entity.Alumni;
import backend.repository.AlumniRepository;
import backend.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class AlumniServiceProfileUpdateTests {

    @Autowired
    private AlumniService alumniService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private AlumniRepository alumniRepository;

    @Test
    void updateProfileThrowsExceptionWhenYudisiumFieldsModified() {
        String nim = "T" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        LocalDate tanggalLulus = LocalDate.of(2025, 8, 15);

        // 1. Create alumni via adminService first
        AlumniProfileDto dto = new AlumniProfileDto();
        dto.setNim(nim);
        dto.setNamaLengkap("Alumni Test");
        dto.setProdi("Teknik Informatika");
        dto.setTanggalLulus(tanggalLulus);
        adminService.createAlumni(dto);

        // Fetch user linked to this alumni to get their username
        Alumni alumni = alumniRepository.findByNim(nim).orElseThrow();
        String username = alumni.getUser().getUsername();

        // 2. Prepare payload attempting to modify NIM
        AlumniProfileDto updateNimDto = alumniService.getProfile(username);
        updateNimDto.setNim("DIFFERENT_NIM");
        assertThrows(BusinessException.class, () -> {
            alumniService.updateProfile(username, updateNimDto);
        });

        // 3. Prepare payload attempting to modify Prodi
        AlumniProfileDto updateProdiDto = alumniService.getProfile(username);
        updateProdiDto.setProdi("DIFFERENT_PRODI");
        assertThrows(BusinessException.class, () -> {
            alumniService.updateProfile(username, updateProdiDto);
        });

        // 4. Prepare payload attempting to modify Tanggal Lulus / Yudisium
        AlumniProfileDto updateTanggalLulusDto = alumniService.getProfile(username);
        updateTanggalLulusDto.setTanggalLulus(LocalDate.of(2026, 12, 31));
        assertThrows(BusinessException.class, () -> {
            alumniService.updateProfile(username, updateTanggalLulusDto);
        });
    }
}
