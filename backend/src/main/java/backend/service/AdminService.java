package backend.service;

import backend.dto.*;
import backend.entity.*;
import backend.exception.BusinessException;
import backend.exception.ResourceNotFoundException;
import backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AlumniRepository alumniRepository;
    private final PeriodeKuesionerRepository periodeKuesionerRepository;
    private final KuesionerRepository kuesionerRepository;
    private final PertanyaanRepository pertanyaanRepository;
    private final PengisianKuesionerRepository pengisianKuesionerRepository;
    private final JawabanRepository jawabanRepository;
    private final PasswordEncoder passwordEncoder;

    // --- ALUMNI CRUD ---

    public List<AlumniProfileDto> getAllAlumni() {
        return alumniRepository.findAll().stream()
                .map(this::mapToAlumniProfileDto)
                .collect(Collectors.toList());
    }

    public AlumniProfileDto getAlumniById(Long id) {
        Alumni alumni = alumniRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni tidak ditemukan dengan ID: " + id));
        return mapToAlumniProfileDto(alumni);
    }

    @Transactional
    public AlumniProfileDto createAlumni(AlumniProfileDto dto) {
        if (alumniRepository.existsByNim(dto.getNim())) {
            throw new BusinessException("Alumni dengan NIM " + dto.getNim() + " sudah terdaftar");
        }
        if (userRepository.existsByUsername(dto.getNim())) {
            throw new BusinessException("Username " + dto.getNim() + " sudah digunakan");
        }

        // Buat User Akun Alumni secara otomatis (username = nim, password default = nim atau password kustom)
        User user = new User();
        user.setUsername(dto.getNim());
        String defaultPassword = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) 
                ? dto.getPassword().trim() 
                : dto.getNim();
        user.setPassword(passwordEncoder.encode(defaultPassword));
        user.setRole(User.Role.ALUMNI);
        user.setCreatedAt(LocalDateTime.now());
        user.setPasswordChanged(false); // Default password belum diubah
        User savedUser = userRepository.save(user);

        // Buat data profile Alumni
        Alumni alumni = new Alumni();
        alumni.setUser(savedUser);
        alumni.setNim(dto.getNim());
        alumni.setNamaLengkap(dto.getNamaLengkap());
        alumni.setTempatLahir(dto.getTempatLahir());
        // Mengubah input tanggal lahir dari frontend menjadi LocalDate untuk disimpan ke database
        alumni.setTanggalLahir(dto.getTanggalLahir());
        alumni.setProdi(dto.getProdi());
        // Mengubah input tanggal lulus dari DTO menjadi LocalDate untuk disimpan ke database
        alumni.setTanggalLulus(dto.getTanggalLulus());
        alumni.setNoHp(dto.getNoHp());
        alumni.setEmail(dto.getEmail());
        alumni.setJenisKelamin(dto.getJenisKelamin());
        alumni.setAlamatRumah(dto.getAlamatRumah());

        Alumni savedAlumni = alumniRepository.save(alumni);
        return mapToAlumniProfileDto(savedAlumni);
    }

    @Transactional
    public AlumniProfileDto updateAlumni(Long id, AlumniProfileDto dto) {
        Alumni alumni = alumniRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni tidak ditemukan dengan ID: " + id));

        // Update profile
        alumni.setNamaLengkap(dto.getNamaLengkap());
        alumni.setTempatLahir(dto.getTempatLahir());
        // Menyimpan input tanggal lahir baru dari DTO sebagai LocalDate
        alumni.setTanggalLahir(dto.getTanggalLahir());
        // Menyimpan input tanggal lulus baru dari DTO sebagai LocalDate
        alumni.setTanggalLulus(dto.getTanggalLulus());
        alumni.setNoHp(dto.getNoHp());
        alumni.setEmail(dto.getEmail());
        alumni.setJenisKelamin(dto.getJenisKelamin());
        alumni.setAlamatRumah(dto.getAlamatRumah());

        // NIM dan Prodi bersifat read-only setelah diinput pertama kali.
        // Jika NIM diganti, pastikan unik.
        if (alumni.getNim() == null || alumni.getNim().trim().isEmpty()) {
            alumni.setNim(dto.getNim());
        }
        if (alumni.getProdi() == null || alumni.getProdi().trim().isEmpty()) {
            alumni.setProdi(dto.getProdi());
        }

        Alumni saved = alumniRepository.save(alumni);
        return mapToAlumniProfileDto(saved);
    }

    @Transactional
    public void deleteAlumni(Long id) {
        Alumni alumni = alumniRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni tidak ditemukan dengan ID: " + id));

        // Hapus secara kaskade (cascade) secara manual untuk menjamin integritas referential
        // 2. Hapus Jawaban dan Pengisian Kuesioner
        List<Kuesioner> kuesioners = kuesionerRepository.findAll();
        for (Kuesioner k : kuesioners) {
            var pengisianOpt = pengisianKuesionerRepository.findByAlumniIdAndKuesionerId(alumni.getId(), k.getId());
            if (pengisianOpt.isPresent()) {
                PengisianKuesioner p = pengisianOpt.get();
                List<Jawaban> jawabanList = jawabanRepository.findByPengisianId(p.getId());
                jawabanRepository.deleteAll(jawabanList);
                pengisianKuesionerRepository.delete(p);
            }
        }

        // 3. Hapus Alumni dan User
        User user = alumni.getUser();
        alumniRepository.delete(alumni);
        userRepository.delete(user);
    }



    // --- PERIODE CRUD ---

    public List<PeriodeKuesionerDto> getAllPeriode() {
        return periodeKuesionerRepository.findAll().stream()
                .map(this::mapToPeriodeDto)
                .collect(Collectors.toList());
    }

    public PeriodeKuesionerDto getPeriodeById(Long id) {
        PeriodeKuesioner p = periodeKuesionerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Periode tidak ditemukan dengan ID: " + id));
        return mapToPeriodeDto(p);
    }

    @Transactional
    public PeriodeKuesionerDto createPeriode(PeriodeKuesionerDto dto) {
        if (dto.getTanggalSelesai().isBefore(dto.getTanggalMulai())) {
            throw new BusinessException("Tanggal selesai tidak boleh kurang dari tanggal mulai");
        }
        PeriodeKuesioner p = new PeriodeKuesioner();
        p.setNamaPeriode(dto.getNamaPeriode());
        p.setTanggalMulai(dto.getTanggalMulai());
        p.setTanggalSelesai(dto.getTanggalSelesai());
        p.setKeterangan(dto.getKeterangan());
        
        PeriodeKuesioner saved = periodeKuesionerRepository.save(p);
        return mapToPeriodeDto(saved);
    }

    @Transactional
    public PeriodeKuesionerDto updatePeriode(Long id, PeriodeKuesionerDto dto) {
        if (dto.getTanggalSelesai().isBefore(dto.getTanggalMulai())) {
            throw new BusinessException("Tanggal selesai tidak boleh kurang dari tanggal mulai");
        }
        PeriodeKuesioner p = periodeKuesionerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Periode tidak ditemukan dengan ID: " + id));

        p.setNamaPeriode(dto.getNamaPeriode());
        p.setTanggalMulai(dto.getTanggalMulai());
        p.setTanggalSelesai(dto.getTanggalSelesai());
        p.setKeterangan(dto.getKeterangan());

        PeriodeKuesioner saved = periodeKuesionerRepository.save(p);
        return mapToPeriodeDto(saved);
    }

    @Transactional
    public void deletePeriode(Long id) {
        PeriodeKuesioner p = periodeKuesionerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Periode tidak ditemukan dengan ID: " + id));
        
        // Caskade hapus kuesioner di dalam periode
        List<Kuesioner> kuesioners = kuesionerRepository.findByPeriodeId(id);
        for (Kuesioner k : kuesioners) {
            deleteKuesioner(k.getId());
        }
        periodeKuesionerRepository.delete(p);
    }

    // --- KUESIONER CRUD ---

    public List<KuesionerDto> getAllKuesioner() {
        return kuesionerRepository.findAll().stream()
                .map(k -> {
                    KuesionerDto dto = mapToKuesionerDto(k);
                    dto.setPertanyaan(pertanyaanRepository.findByKuesionerId(k.getId()).stream()
                            .map(this::mapToPertanyaanDto).collect(Collectors.toList()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public KuesionerDto getKuesionerById(Long id) {
        Kuesioner k = kuesionerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kuesioner tidak ditemukan dengan ID: " + id));
        KuesionerDto dto = mapToKuesionerDto(k);
        dto.setPertanyaan(pertanyaanRepository.findByKuesionerId(k.getId()).stream()
                .map(this::mapToPertanyaanDto).collect(Collectors.toList()));
        return dto;
    }

    @Transactional
    public KuesionerDto createKuesioner(KuesionerDto dto) {
        PeriodeKuesioner p = periodeKuesionerRepository.findById(dto.getPeriodeId())
                .orElseThrow(() -> new ResourceNotFoundException("Periode tidak ditemukan dengan ID: " + dto.getPeriodeId()));

        Kuesioner k = new Kuesioner();
        k.setPeriode(p);
        k.setJudulKuesioner(dto.getJudulKuesioner());
        k.setDeskripsi(dto.getDeskripsi());

        Kuesioner saved = kuesionerRepository.save(k);
        return mapToKuesionerDto(saved);
    }

    @Transactional
    public KuesionerDto updateKuesioner(Long id, KuesionerDto dto) {
        Kuesioner k = kuesionerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kuesioner tidak ditemukan dengan ID: " + id));

        PeriodeKuesioner p = periodeKuesionerRepository.findById(dto.getPeriodeId())
                .orElseThrow(() -> new ResourceNotFoundException("Periode tidak ditemukan dengan ID: " + dto.getPeriodeId()));

        k.setPeriode(p);
        k.setJudulKuesioner(dto.getJudulKuesioner());
        k.setDeskripsi(dto.getDeskripsi());

        Kuesioner saved = kuesionerRepository.save(k);
        return mapToKuesionerDto(saved);
    }

    @Transactional
    public void deleteKuesioner(Long id) {
        Kuesioner k = kuesionerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Kuesioner tidak ditemukan dengan ID: " + id));

        // Hapus pertanyaan
        List<Pertanyaan> pertanyaanList = pertanyaanRepository.findByKuesionerId(id);
        pertanyaanRepository.deleteAll(pertanyaanList);

        // Hapus pengisian
        List<PengisianKuesioner> pengisians = pengisianKuesionerRepository.findByKuesionerId(id);
        for (PengisianKuesioner p : pengisians) {
            List<Jawaban> jawabanList = jawabanRepository.findByPengisianId(p.getId());
            jawabanRepository.deleteAll(jawabanList);
        }
        pengisianKuesionerRepository.deleteAll(pengisians);

        kuesionerRepository.delete(k);
    }

    // --- PERTANYAAN CRUD ---

    public List<PertanyaanDto> getPertanyaanByKuesioner(Long kuesionerId) {
        return pertanyaanRepository.findByKuesionerIdOrderByOrderIndexAsc(kuesionerId).stream()
                .map(this::mapToPertanyaanDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PertanyaanDto createPertanyaan(Long kuesionerId, PertanyaanDto dto) {
        Kuesioner k = kuesionerRepository.findById(kuesionerId)
                .orElseThrow(() -> new ResourceNotFoundException("Kuesioner tidak ditemukan dengan ID: " + kuesionerId));

        Pertanyaan p = new Pertanyaan();
        p.setKuesioner(k);
        p.setTeksPertanyaan(dto.getTeksPertanyaan());
        p.setTipePertanyaan(Pertanyaan.TipePertanyaan.valueOf(dto.getTipePertanyaan()));
        p.setPilihan(dto.getPilihan());
        p.setOrderIndex(dto.getOrderIndex());

        Pertanyaan saved = pertanyaanRepository.save(p);
        return mapToPertanyaanDto(saved);
    }

    @Transactional
    public PertanyaanDto updatePertanyaan(Long id, PertanyaanDto dto) {
        Pertanyaan p = pertanyaanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pertanyaan tidak ditemukan dengan ID: " + id));

        p.setTeksPertanyaan(dto.getTeksPertanyaan());
        p.setTipePertanyaan(Pertanyaan.TipePertanyaan.valueOf(dto.getTipePertanyaan()));
        p.setPilihan(dto.getPilihan());
        p.setOrderIndex(dto.getOrderIndex());

        Pertanyaan saved = pertanyaanRepository.save(p);
        return mapToPertanyaanDto(saved);
    }

    @Transactional
    public void deletePertanyaan(Long id) {
        Pertanyaan p = pertanyaanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pertanyaan tidak ditemukan dengan ID: " + id));
        
        // Hapus jawaban yang merujuk pertanyaan ini
        List<Jawaban> jawabanList = jawabanRepository.findByPertanyaanId(id);
        jawabanRepository.deleteAll(jawabanList);

        pertanyaanRepository.delete(p);
    }

    // --- MONITORING ---

    public List<MonitoringDto> getMonitoringList(Long periodeId) {
        PeriodeKuesioner periode = periodeKuesionerRepository.findById(periodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Periode tidak ditemukan dengan ID: " + periodeId));

        List<Kuesioner> kuesioners = kuesionerRepository.findByPeriodeId(periodeId);
        List<Alumni> alumniList = alumniRepository.findAll();
        List<MonitoringDto> list = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Alumni alumni : alumniList) {
            String status = "Belum Mengisi";
            String tanggalIsi = "";

            // Jika ada minimal satu kuesioner yang diisi, update status
            for (Kuesioner k : kuesioners) {
                var pengisianOpt = pengisianKuesionerRepository.findByAlumniIdAndKuesionerId(alumni.getId(), k.getId());
                if (pengisianOpt.isPresent()) {
                    status = "Sudah Mengisi";
                    tanggalIsi = pengisianOpt.get().getTanggalIsi().format(formatter);
                    break;
                }
            }

            list.add(new MonitoringDto(
                alumni.getNamaLengkap(),
                alumni.getNim(),
                status,
                tanggalIsi,
                alumni.getId()
            ));
        }

        return list;
    }

    public AlumniAnswersDto getAlumniAnswers(Long periodeId, Long alumniId) {
        Alumni alumni = alumniRepository.findById(alumniId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni tidak ditemukan dengan ID: " + alumniId));

        List<Kuesioner> kuesioners = kuesionerRepository.findByPeriodeId(periodeId);
        if (kuesioners.isEmpty()) {
            throw new BusinessException("Tidak ada kuesioner pada periode ini");
        }
        
        Kuesioner kuesioner = kuesioners.get(0); // Ambil kuesioner pertama di periode tersebut
        PengisianKuesioner pengisian = pengisianKuesionerRepository.findByAlumniIdAndKuesionerId(alumniId, kuesioner.getId())
                .orElseThrow(() -> new BusinessException("Alumni belum mengisi kuesioner ini"));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        AlumniAnswersDto dto = new AlumniAnswersDto();
        dto.setAlumniId(alumni.getId());
        dto.setNamaAlumni(alumni.getNamaLengkap());
        dto.setNim(alumni.getNim());
        dto.setProdi(alumni.getProdi());
        dto.setJudulKuesioner(kuesioner.getJudulKuesioner());
        dto.setTanggalIsi(pengisian.getTanggalIsi().format(formatter));

        List<Pertanyaan> questions = pertanyaanRepository.findByKuesionerIdOrderByOrderIndexAsc(kuesioner.getId());
        List<QuestionAnswerDto> qAList = new ArrayList<>();

        for (Pertanyaan p : questions) {
            var jawabanOpt = jawabanRepository.findByPengisianId(pengisian.getId()).stream()
                    .filter(j -> j.getPertanyaan().getId().equals(p.getId()))
                    .findFirst();

            String answerText = jawabanOpt.map(Jawaban::getJawabanTeks).orElse("-");
            qAList.add(new QuestionAnswerDto(
                    p.getId(),
                    p.getTeksPertanyaan(),
                    p.getTipePertanyaan().name(),
                    answerText
            ));
        }

        dto.setAnswers(qAList);
        return dto;
    }

    // --- MAPPING HELPERS ---

    private boolean isProfileComplete(Alumni alumni) {
        return alumni != null &&
               alumni.getTempatLahir() != null && !alumni.getTempatLahir().trim().isEmpty() &&
               alumni.getTanggalLahir() != null &&
               alumni.getTanggalLulus() != null &&
               alumni.getNoHp() != null && !alumni.getNoHp().trim().isEmpty() &&
               alumni.getEmail() != null && !alumni.getEmail().trim().isEmpty() &&
               alumni.getAlamatRumah() != null && !alumni.getAlamatRumah().trim().isEmpty();
    }

    private AlumniProfileDto mapToAlumniProfileDto(Alumni alumni) {
        AlumniProfileDto dto = new AlumniProfileDto();
        dto.setId(alumni.getId());
        dto.setNim(alumni.getNim());
        dto.setNamaLengkap(alumni.getNamaLengkap());
        dto.setTempatLahir(alumni.getTempatLahir());
        dto.setTanggalLahir(alumni.getTanggalLahir());
        dto.setProdi(alumni.getProdi());
        dto.setTanggalLulus(alumni.getTanggalLulus());
        dto.setNoHp(alumni.getNoHp());
        dto.setEmail(alumni.getEmail());
        dto.setJenisKelamin(alumni.getJenisKelamin());
        dto.setAlamatRumah(alumni.getAlamatRumah());
        
        dto.setProfileComplete(isProfileComplete(alumni));
        dto.setPasswordChanged(alumni.getUser().isPasswordChanged());
        return dto;
    }

    private PeriodeKuesionerDto mapToPeriodeDto(PeriodeKuesioner p) {
        PeriodeKuesionerDto dto = new PeriodeKuesionerDto();
        dto.setId(p.getId());
        dto.setNamaPeriode(p.getNamaPeriode());
        dto.setTanggalMulai(p.getTanggalMulai());
        dto.setTanggalSelesai(p.getTanggalSelesai());
        dto.setKeterangan(p.getKeterangan());
        return dto;
    }

    private KuesionerDto mapToKuesionerDto(Kuesioner kuesioner) {
        KuesionerDto dto = new KuesionerDto();
        dto.setId(kuesioner.getId());
        dto.setPeriodeId(kuesioner.getPeriode().getId());
        dto.setPeriodeNama(kuesioner.getPeriode().getNamaPeriode());
        dto.setJudulKuesioner(kuesioner.getJudulKuesioner());
        dto.setDeskripsi(kuesioner.getDeskripsi());
        return dto;
    }

    private PertanyaanDto mapToPertanyaanDto(Pertanyaan pertanyaan) {
        PertanyaanDto dto = new PertanyaanDto();
        dto.setId(pertanyaan.getId());
        dto.setKuesionerId(pertanyaan.getKuesioner().getId());
        dto.setTeksPertanyaan(pertanyaan.getTeksPertanyaan());
        dto.setTipePertanyaan(pertanyaan.getTipePertanyaan().name());
        dto.setPilihan(pertanyaan.getPilihan());
        dto.setOrderIndex(pertanyaan.getOrderIndex());
        return dto;
    }
}
