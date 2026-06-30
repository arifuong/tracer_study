package backend.service;

import backend.dto.AlumniProfileDto;
import backend.entity.Alumni;
import backend.entity.User;
import backend.repository.AlumniRepository;
import backend.repository.UserRepository;
import backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class AlumniService {

    private final AlumniRepository alumniRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Get Alumni Profile by Username
    public AlumniProfileDto getProfile(String username) {
        Alumni alumni = alumniRepository.findByUserUsername(username)
                .orElseThrow(() -> new backend.exception.ResourceNotFoundException("Data alumni tidak ditemukan untuk user: " + username));
        return mapToProfileDto(alumni);
    }

    // Update Alumni Profile
    @Transactional
    public AlumniProfileDto updateProfile(String username, AlumniProfileDto dto) {
        Alumni alumni = alumniRepository.findByUserUsername(username)
                .orElseThrow(() -> new backend.exception.ResourceNotFoundException("Data alumni tidak ditemukan untuk user: " + username));

        // Update data diri, kontak, dan alamat
        alumni.setNamaLengkap(dto.getNamaLengkap());
        alumni.setTempatLahir(dto.getTempatLahir());
        alumni.setTanggalLahir(dto.getTanggalLahir());
        alumni.setTanggalLulus(dto.getTanggalLulus());
        alumni.setNoHp(dto.getNoHp());
        alumni.setEmail(dto.getEmail());
        alumni.setJenisKelamin(dto.getJenisKelamin());
        alumni.setAlamatRumah(dto.getAlamatRumah());

        // NIM dan Prodi bersifat read-only bagi Alumni.
        // Hanya Admin yang bisa mengubah field-field tersebut melalui AdminService.

        User user = alumni.getUser();
        String generatedToken = null;

        // Pembaruan Username jika diubah dan bersifat opsional
        String newUsername = dto.getUsername();
        if (newUsername != null && !newUsername.trim().isEmpty() && !newUsername.trim().equals(user.getUsername())) {
            newUsername = newUsername.trim();
            if (newUsername.length() < 4) {
                throw new backend.exception.BusinessException("Username minimal 4 karakter");
            }
            if (!newUsername.matches("^[a-zA-Z0-9_.]+$")) {
                throw new backend.exception.BusinessException("Username hanya boleh mengandung huruf, angka, underscore (_), dan titik (.)");
            }
            if (userRepository.existsByUsername(newUsername)) {
                throw new backend.exception.BusinessException("Username sudah digunakan.");
            }
            user.setUsername(newUsername);
            userRepository.save(user);
            
            // Generate token baru karena username berubah
            generatedToken = jwtUtil.generateToken(newUsername, user.getRole().name());
        }

        // Alur perubahan password
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            // Password Saat Ini wajib benar
            if (dto.getCurrentPassword() == null || dto.getCurrentPassword().trim().isEmpty()) {
                throw new backend.exception.BusinessException("Password saat ini wajib diisi");
            }
            if (!passwordEncoder.matches(dto.getCurrentPassword().trim(), user.getPassword())) {
                throw new backend.exception.BusinessException("Password saat ini salah");
            }
            // Password Baru minimal 8 karakter
            String newPassword = dto.getPassword().trim();
            if (newPassword.length() < 8) {
                throw new backend.exception.BusinessException("Password baru minimal 8 karakter");
            }
            // Konfirmasi Password harus sama
            if (dto.getConfirmPassword() == null || !newPassword.equals(dto.getConfirmPassword().trim())) {
                throw new backend.exception.BusinessException("Konfirmasi password tidak cocok dengan password baru");
            }
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setPasswordChanged(true); // Menandai bahwa password sudah diubah dari default
            userRepository.save(user);
        }

        Alumni updated = alumniRepository.save(alumni);
        AlumniProfileDto resultDto = mapToProfileDto(updated);
        
        if (generatedToken != null) {
            resultDto.setToken(generatedToken);
        }
        
        return resultDto;
    }

    // Memastikan profil alumni sudah lengkap sesuai dengan aturan bisnis.
    // Hanya memvalidasi 6 field: Tempat Lahir, Tanggal Lahir, Tanggal Lulus, No HP, Email, dan Alamat Rumah.
    // NIM, Nama Lengkap, dan Program Studi tidak divalidasi karena dijamin oleh Admin.
    private boolean isProfileComplete(Alumni alumni) {
        return alumni != null &&
               alumni.getTempatLahir() != null && !alumni.getTempatLahir().trim().isEmpty() &&
               alumni.getTanggalLahir() != null &&
               alumni.getTanggalLulus() != null &&
               alumni.getNoHp() != null && !alumni.getNoHp().trim().isEmpty() &&
               alumni.getEmail() != null && !alumni.getEmail().trim().isEmpty() &&
               alumni.getAlamatRumah() != null && !alumni.getAlamatRumah().trim().isEmpty();
    }

    // Mapping Helpers
    private AlumniProfileDto mapToProfileDto(Alumni alumni) {
        AlumniProfileDto dto = new AlumniProfileDto();
        dto.setId(alumni.getId());
        dto.setNim(alumni.getNim());
        dto.setNamaLengkap(alumni.getNamaLengkap());
        dto.setUsername(alumni.getUser().getUsername());
        dto.setTempatLahir(alumni.getTempatLahir());
        dto.setTanggalLahir(alumni.getTanggalLahir());
        dto.setProdi(alumni.getProdi());
        dto.setTanggalLulus(alumni.getTanggalLulus());
        dto.setNoHp(alumni.getNoHp());
        dto.setEmail(alumni.getEmail());
        dto.setJenisKelamin(alumni.getJenisKelamin());
        dto.setAlamatRumah(alumni.getAlamatRumah());
        
        // Mengatur flag kelengkapan profil dan perubahan password default
        dto.setProfileComplete(isProfileComplete(alumni));
        dto.setPasswordChanged(alumni.getUser().isPasswordChanged());
        
        return dto;
    }
}
