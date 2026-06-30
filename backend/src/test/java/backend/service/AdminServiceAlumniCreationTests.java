package backend.service;

import backend.dto.AlumniProfileDto;
import backend.entity.Alumni;
import backend.repository.AlumniRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

@SpringBootTest
@Transactional
class AdminServiceAlumniCreationTests {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AlumniRepository alumniRepository;

    @Test
    void createAlumniAcceptsOnlyRequiredAdminFields() {
        LocalDate tanggalLulus = LocalDate.of(2026, 6, 25);
        String nim = "T" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);

        AlumniProfileDto dto = new AlumniProfileDto();
        dto.setNim(nim);
        dto.setNamaLengkap("Alumni Minimal");
        dto.setProdi("Sistem Informasi");
        dto.setTanggalLulus(tanggalLulus);

        AlumniProfileDto created = adminService.createAlumni(dto);
        Alumni saved = alumniRepository.findByNim(nim).orElseThrow();

        assertNotNull(created.getId());
        assertEquals(nim, saved.getNim());
        assertEquals("Alumni Minimal", saved.getNamaLengkap());
        assertEquals("Sistem Informasi", saved.getProdi());
        assertEquals(tanggalLulus, saved.getTanggalLulus());
        assertNull(saved.getTempatLahir());
        assertNull(saved.getTanggalLahir());
        assertNull(saved.getEmail());
        assertNull(saved.getNoHp());
        assertNull(saved.getAlamatRumah());
        assertNull(saved.getJenisKelamin());
    }
}
