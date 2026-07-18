package backend.dto.alumni;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

// DTO Pattern
// Mencegah Entity dikirim langsung ke frontend.
public class AlumniProfileDto {

    private Long id;

    @NotBlank(message = "NIM tidak boleh kosong")
    @Size(max = 20, message = "NIM maksimal 20 karakter")
    private String nim;

    @NotBlank(message = "Nama lengkap tidak boleh kosong")
    @Size(max = 100, message = "Nama lengkap maksimal 100 karakter")
    private String namaLengkap;

    @Size(max = 50, message = "Tempat lahir maksimal 50 karakter")
    private String tempatLahir;

    // Menggunakan LocalDate untuk menghindari masalah kompatibilitas Date saat runtime
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate tanggalLahir;

    @NotBlank(message = "Program studi tidak boleh kosong")
    @Size(max = 100, message = "Program studi maksimal 100 karakter")
    private String prodi;

    // Menggunakan LocalDate untuk menghindari masalah kompatibilitas Date saat runtime
    @NotNull(message = "Tanggal lulus tidak boleh kosong")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate tanggalLulus;

    @Pattern(
        regexp = "^(08|\\+628)[0-9]{8,13}$",
        message = "Nomor HP tidak valid"
    )
    @Size(max = 20, message = "Nomor HP maksimal 20 karakter")
    private String noHp;

    @Email(message = "Email tidak valid")
    @Size(max = 100, message = "Email maksimal 100 karakter")
    private String email;

    private String jenisKelamin;

    private String alamatRumah;

    private String password;

    private String currentPassword;

    private String confirmPassword;

    private String username;

    private String token;

    private boolean profileComplete;

    private boolean passwordChanged;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNim() { return nim; }
    public void setNim(String nim) { this.nim = nim; }
    public String getNamaLengkap() { return namaLengkap; }
    public void setNamaLengkap(String namaLengkap) { this.namaLengkap = namaLengkap; }
    public String getTempatLahir() { return tempatLahir; }
    public void setTempatLahir(String tempatLahir) { this.tempatLahir = tempatLahir; }
    public LocalDate getTanggalLahir() { return tanggalLahir; }
    public void setTanggalLahir(LocalDate tanggalLahir) { this.tanggalLahir = tanggalLahir; }
    public String getProdi() { return prodi; }
    public void setProdi(String prodi) { this.prodi = prodi; }
    public LocalDate getTanggalLulus() { return tanggalLulus; }
    public void setTanggalLulus(LocalDate tanggalLulus) { this.tanggalLulus = tanggalLulus; }
    public String getNoHp() { return noHp; }
    public void setNoHp(String noHp) { this.noHp = noHp; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getJenisKelamin() { return jenisKelamin; }
    public void setJenisKelamin(String jenisKelamin) { this.jenisKelamin = jenisKelamin; }
    public String getAlamatRumah() { return alamatRumah; }
    public void setAlamatRumah(String alamatRumah) { this.alamatRumah = alamatRumah; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getCurrentPassword() { return currentPassword; }
    public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public boolean isProfileComplete() { return profileComplete; }
    public void setProfileComplete(boolean profileComplete) { this.profileComplete = profileComplete; }
    public boolean isPasswordChanged() { return passwordChanged; }
    public void setPasswordChanged(boolean passwordChanged) { this.passwordChanged = passwordChanged; }
}

