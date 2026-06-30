package backend.service;

import backend.dto.KuesionerDto;
import backend.dto.PertanyaanDto;
import backend.dto.FillRequestDto;
import backend.dto.SubmissionStatusDto;
import backend.entity.Alumni;
import backend.entity.Kuesioner;
import backend.entity.PengisianKuesioner;
import backend.entity.Jawaban;
import backend.entity.Pertanyaan;
import backend.exception.BusinessException;
import backend.exception.ResourceNotFoundException;
import backend.repository.AlumniRepository;
import backend.repository.KuesionerRepository;
import backend.repository.PengisianKuesionerRepository;
import backend.repository.JawabanRepository;
import backend.repository.PertanyaanRepository;
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
        List<Kuesioner> activeKuesioners = kuesionerRepository.findActiveQuestionnaires(today);
        
        return activeKuesioners.stream()
                .map(k -> {
                    KuesionerDto dto = mapToKuesionerDto(k);
                    // Fetch and map questions
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

        // BR-04: Hanya periode aktif yang dapat diisi
        LocalDate today = LocalDate.now();
        LocalDate start = kuesioner.getPeriode().getTanggalMulai();
        LocalDate end = kuesioner.getPeriode().getTanggalSelesai();
        if (today.isBefore(start) || today.isAfter(end)) {
            throw new BusinessException("Kuesioner sudah ditutup atau belum dibuka untuk pengisian");
        }

        // BR-03: Alumni hanya boleh mengisi satu kali per periode/kuesioner
        boolean alreadySubmitted = pengisianKuesionerRepository.existsByAlumniIdAndKuesionerId(alumni.getId(), kuesionerId);
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
