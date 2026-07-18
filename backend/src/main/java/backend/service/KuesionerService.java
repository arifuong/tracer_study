package backend.service;

import backend.dto.admin.KuesionerDto;
import backend.dto.admin.PertanyaanDto;
import backend.dto.alumni.FillRequestDto;
import backend.dto.alumni.SubmissionStatusDto;
import backend.entity.Alumni;
import backend.entity.Kuesioner;
import backend.entity.PengisianKuesioner;
import backend.entity.Jawaban;
import backend.entity.Pertanyaan;
import backend.entity.PeriodeKuesioner;
import backend.exception.BusinessException;
import backend.exception.ForbiddenException;
import backend.exception.ResourceNotFoundException;
import backend.repository.AlumniRepository;
import backend.repository.KuesionerRepository;
import backend.repository.PengisianKuesionerRepository;
import backend.repository.JawabanRepository;
import backend.repository.PertanyaanRepository;
import backend.repository.PeriodeKuesionerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

// Service Layer
// Tempat seluruh business logic aplikasi.
@Service
@RequiredArgsConstructor
public class KuesionerService {

    private final AlumniRepository alumniRepository;
    private final KuesionerRepository kuesionerRepository;
    private final PengisianKuesionerRepository pengisianKuesionerRepository;
    private final JawabanRepository jawabanRepository;
    private final PertanyaanRepository pertanyaanRepository;
    private final PeriodeKuesionerRepository periodeKuesionerRepository;
    private final AlumniService alumniService;

    // Memastikan profil alumni sudah lengkap sesuai dengan aturan bisnis.
    // Hanya memvalidasi 6 field: Tempat Lahir, Tanggal Lahir, Tanggal Lulus, No HP, Email, dan Alamat Rumah.
    private boolean isProfileComplete(Alumni alumni) {
        return alumni != null &&
               alumni.getTempatLahir() != null && !alumni.getTempatLahir().trim().isEmpty() &&
               alumni.getTanggalLahir() != null &&
               alumni.getTanggalLulus() != null &&
               alumni.getNoHp() != null && !alumni.getNoHp().trim().isEmpty() &&
               alumni.getEmail() != null && !alumni.getEmail().trim().isEmpty() &&
               alumni.getAlamatRumah() != null && !alumni.getAlamatRumah().trim().isEmpty();
    }

    // Get Active Questionnaires for Alumni
    public List<KuesionerDto> getActiveKuesioner(String username) {
        Alumni alumni = alumniRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni tidak ditemukan"));

        // Memastikan alumni telah melengkapi profil sebelum mengakses kuesioner aktif
        if (!isProfileComplete(alumni)) {
            throw new IllegalStateException("Lengkapi profil terlebih dahulu sebelum mengisi kuesioner.");
        }

        LocalDate today = LocalDate.now();
        List<PeriodeKuesioner> activePeriods = periodeKuesionerRepository.findActivePeriods(today);
        if (activePeriods.isEmpty()) {
            logActiveKuesionerDebug(alumni, null, false, false, false);
            return List.of();
        }

        List<Kuesioner> eligibleKuesioners = new ArrayList<>();

        for (PeriodeKuesioner periode : activePeriods) {
            boolean periodeAktif = validateActivePeriod(periode);
            boolean tahunCocok = isTahunYudisiumMatch(alumni, periode);
            boolean sudahPernahIsi = pengisianKuesionerRepository
                    .existsByAlumniIdAndKuesionerPeriodeId(alumni.getId(), periode.getId());
            logActiveKuesionerDebug(alumni, periode, periodeAktif, tahunCocok, sudahPernahIsi);

            if (!tahunCocok) {
                continue;
            }
            eligibleKuesioners.addAll(kuesionerRepository.findByPeriodeId(periode.getId()));
        }

        return eligibleKuesioners.stream()
                .map(k -> {
                    KuesionerDto dto = mapToKuesionerDto(k);
                    List<PertanyaanDto> questions = pertanyaanRepository.findByKuesionerIdOrderByOrderIndexAsc(k.getId())
                            .stream()
                            .map(this::mapToPertanyaanDto)
                            .collect(Collectors.toList());
                    dto.setPertanyaan(questions);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // Get Submission Status
    public List<SubmissionStatusDto> getSubmissionStatus(String username) {
        Alumni alumni = alumniRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni tidak ditemukan"));

        // Memastikan alumni telah melengkapi profil sebelum memproses status pengisian dashboard
        if (!isProfileComplete(alumni)) {
            throw new IllegalStateException("Lengkapi profil terlebih dahulu sebelum mengisi kuesioner.");
        }

        List<Kuesioner> allKuesioners = kuesionerRepository.findAll();
        List<SubmissionStatusDto> statuses = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Kuesioner k : allKuesioners) {
            var pengisianOpt = pengisianKuesionerRepository.findByAlumniIdAndKuesionerId(alumni.getId(), k.getId());
            String status = pengisianOpt.isPresent() ? "Sudah Mengisi" : "Belum Mengisi";
            String tanggalIsi = pengisianOpt.map(p -> p.getTanggalIsi().format(formatter)).orElse("");
            
            statuses.add(new SubmissionStatusDto(
                k.getId(),
                k.getJudulKuesioner(),
                k.getPeriode().getNamaPeriode(),
                status,
                tanggalIsi
            ));
        }

        return statuses;
    }

    // Submit Answers
    @Transactional
    public void submitAnswers(String username, Long kuesionerId, FillRequestDto request) {
        Alumni alumni = alumniRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni tidak ditemukan"));

        // Memastikan alumni telah melengkapi profil sebelum mengisi kuesioner
        if (!isProfileComplete(alumni)) {
            throw new IllegalStateException("Lengkapi profil terlebih dahulu sebelum mengisi kuesioner.");
        }

        Kuesioner kuesioner = kuesionerRepository.findById(kuesionerId)
                .orElseThrow(() -> new ResourceNotFoundException("Kuesioner tidak ditemukan"));

        PeriodeKuesioner periode = kuesioner.getPeriode();

        // BR-04: Hanya periode aktif yang dapat diisi
        validateActivePeriod(periode);

        // Alumni hanya boleh mengisi jika tahun yudisium sesuai target periode aktif
        if (!isTahunYudisiumMatch(alumni, periode)) {
            throw new ForbiddenException(
                    "Anda tidak termasuk dalam target alumni tahun yudisium untuk periode tracer study yang sedang aktif");
        }

        // BR-03: Alumni hanya boleh mengisi satu kali per periode
        boolean alreadySubmitted = pengisianKuesionerRepository
                .existsByAlumniIdAndKuesionerPeriodeId(alumni.getId(), periode.getId());
        if (alreadySubmitted) {
            throw new BusinessException("Anda sudah mengisi kuesioner pada periode ini");
        }

        // Simpan data pengisian kuesioner
        PengisianKuesioner pengisian = new PengisianKuesioner();
        pengisian.setAlumni(alumni);
        pengisian.setKuesioner(kuesioner);
        pengisian.setTanggalIsi(LocalDateTime.now());
        pengisian.setStatusSubmit(1);
        
        PengisianKuesioner savedPengisian = pengisianKuesionerRepository.save(pengisian);

        // Simpan jawaban kuesioner
        for (var ansDto : request.getJawaban()) {
            Pertanyaan pertanyaan = pertanyaanRepository.findById(ansDto.getPertanyaanId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pertanyaan tidak ditemukan dengan ID: " + ansDto.getPertanyaanId()));

            if (!pertanyaan.getKuesioner().getId().equals(kuesionerId)) {
                throw new BusinessException("Pertanyaan ID " + ansDto.getPertanyaanId() + " bukan bagian dari kuesioner ini");
            }

            Jawaban jawaban = new Jawaban();
            jawaban.setPengisian(savedPengisian);
            jawaban.setPertanyaan(pertanyaan);
            jawaban.setJawabanTeks(ansDto.getJawabanTeks());
            
            jawabanRepository.save(jawaban);
        }
    }

    private boolean validateActivePeriod(PeriodeKuesioner periode) {
        LocalDate today = LocalDate.now();
        LocalDate start = periode.getTanggalMulai();
        LocalDate end = periode.getTanggalSelesai();
        boolean periodeAktif = !today.isBefore(start) && !today.isAfter(end);

        System.out.println("=== DEBUG validateActivePeriod ===");
        System.out.println("Periode id=" + periode.getId() + ", today=" + today + ", mulai=" + start + ", selesai=" + end);
        System.out.println("periode aktif? " + periodeAktif);
        System.out.println("==================================");

        if (!periodeAktif) {
            throw new BusinessException("Kuesioner sudah ditutup atau belum dibuka untuk pengisian");
        }
        return true;
    }

    private boolean isTahunYudisiumMatch(Alumni alumni, PeriodeKuesioner periode) {
        Integer tahunAlumni = alumni.getTahunYudisium();
        Integer tahunTarget = periode.getTahunYudisiumTarget();
        boolean cocok = tahunAlumni != null && tahunTarget != null && tahunAlumni.equals(tahunTarget);

        System.out.println("=== DEBUG isTahunYudisiumMatch ===");
        System.out.println("tahun alumni = " + tahunAlumni);
        System.out.println("tahun target = " + tahunTarget);
        System.out.println("tahun yudisium cocok? " + cocok);
        System.out.println("==================================");

        return cocok;
    }

    private void logActiveKuesionerDebug(Alumni alumni, PeriodeKuesioner periode,
                                         boolean periodeAktif, boolean tahunCocok, boolean sudahPernahIsi) {
        System.out.println("=== DEBUG ===");
        System.out.println();
        System.out.println("Alumni:");
        System.out.println("- id = " + alumni.getId());
        System.out.println("- nama = " + alumni.getNamaLengkap());
        System.out.println("- tanggalLulus = " + alumni.getTanggalLulus());
        System.out.println("- tahunYudisium = " + alumni.getTahunYudisium());
        System.out.println();
        System.out.println("Periode Aktif:");
        if (periode == null) {
            System.out.println("- (tidak ada periode aktif)");
        } else {
            System.out.println("- id = " + periode.getId());
            System.out.println("- namaPeriode = " + periode.getNamaPeriode());
            System.out.println("- tahunYudisiumTarget = " + periode.getTahunYudisiumTarget());
            System.out.println("- tanggalMulai = " + periode.getTanggalMulai());
            System.out.println("- tanggalSelesai = " + periode.getTanggalSelesai());
        }
        System.out.println();
        System.out.println("Hasil Validasi:");
        System.out.println("- periode aktif? " + periodeAktif);
        System.out.println("- tahun yudisium cocok? " + tahunCocok);
        System.out.println("- sudah pernah isi? " + sudahPernahIsi);
        System.out.println();
        System.out.println("================");
    }

    // Mapping Helpers
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

