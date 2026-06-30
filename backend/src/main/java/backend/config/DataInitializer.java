package backend.config;

import backend.entity.*;
import backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// DataInitializer
// Menginisialisasi data awal (seeding) untuk testing dan demonstrasi saat aplikasi pertama kali dijalankan.
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AlumniRepository alumniRepository;
    private final PeriodeKuesionerRepository periodeKuesionerRepository;
    private final KuesionerRepository kuesionerRepository;
    private final PertanyaanRepository pertanyaanRepository;
    private final PengisianKuesionerRepository pengisianKuesionerRepository;
    private final JawabanRepository jawabanRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== MEMULAI DATABASE SEEDING & UPDATE UNTUK TRACER STUDY ===");

        // 1. CEK ATAU SEED USERS & ALUMNI
        if (userRepository.count() == 0) {
            // Seed Admin
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole(User.Role.ADMIN);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);

            // Seed Pimpinan
            User pimpinan = new User();
            pimpinan.setUsername("pimpinan");
            pimpinan.setPassword(passwordEncoder.encode("pimpinan"));
            pimpinan.setRole(User.Role.PIMPINAN);
            pimpinan.setCreatedAt(LocalDateTime.now());
            userRepository.save(pimpinan);

            // Seed 20 Alumni
            String[] namaAlumni = {
                "Ahmad Fauzi", "Budi Santoso", "Citra Dewi", "Deni Saputra", "Eka Putri",
                "Farhan Hakim", "Gita Permata", "Hendra Wijaya", "Indah Lestari", "Joko Prasetyo",
                "Kartika Sari", "Lukmanul Hakim", "Mega Utami", "Novianti Rahayu", "Oki Setiawan",
                "Putra Ramadhan", "Rina Astuti", "Surya Kencana", "Tari Handayani", "Wahyu Hidayat"
            };

            for (int i = 0; i < 20; i++) {
                String nim = String.valueOf(23110010 + i);
                User user = new User();
                user.setUsername(nim);
                user.setPassword(passwordEncoder.encode(nim));
                user.setRole(User.Role.ALUMNI);
                user.setCreatedAt(LocalDateTime.now());
                user.setPasswordChanged(true);
                userRepository.save(user);

                Alumni alumni = new Alumni();
                alumni.setUser(user);
                alumni.setNim(nim);
                alumni.setNamaLengkap(namaAlumni[i]);
                alumni.setTempatLahir("Kota Ke-" + (i + 1));
                alumni.setTanggalLahir(LocalDate.of(2002, 1, 1).plusDays(i));
                alumni.setProdi("Sistem Informasi");
                alumni.setTanggalLulus(LocalDate.of(2025, 8, 15));
                alumni.setNoHp("08123456789" + i);
                alumni.setEmail("alumni" + nim + "@univ.ac.id");
                alumni.setJenisKelamin(i % 2 == 0 ? "Laki-laki" : "Perempuan");
                alumni.setAlamatRumah("Jl. Sudirman No. " + (i + 1) + ", Bandung");
                alumniRepository.save(alumni);
            }
        }

        // 2. CEK ATAU SEED PERIODE KUESIONER
        List<PeriodeKuesioner> periodeList = periodeKuesionerRepository.findAll();
        PeriodeKuesioner periodeAktif;
        if (periodeList.isEmpty()) {
            periodeAktif = new PeriodeKuesioner();
            periodeAktif.setNamaPeriode("Tracer Study 2025");
            periodeAktif.setTanggalMulai(LocalDate.now().minusDays(15));
            periodeAktif.setTanggalSelesai(LocalDate.now().plusDays(45));
            periodeAktif.setKeterangan("Periode Pelacakan Lulusan 2025");
            periodeAktif = periodeKuesionerRepository.save(periodeAktif);
        } else {
            periodeAktif = periodeList.get(0);
        }

        // 3. CEK ATAU SEED KUESIONER
        List<Kuesioner> kuesionerList = kuesionerRepository.findAll();
        Kuesioner kuesionerAktif;
        if (kuesionerList.isEmpty()) {
            kuesionerAktif = new Kuesioner();
            kuesionerAktif.setPeriode(periodeAktif);
            kuesionerAktif.setJudulKuesioner("Tracer Study Alumni 2025");
            kuesionerAktif.setDeskripsi("Kuesioner resmi penelusuran alumni STMIK MARDIRA INDONESIA tahun kelulusan 2025.");
            kuesionerAktif = kuesionerRepository.save(kuesionerAktif);
        } else {
            kuesionerAktif = kuesionerList.get(0);
            if (!"Tracer Study Alumni 2025".equals(kuesionerAktif.getJudulKuesioner())) {
                kuesionerAktif.setJudulKuesioner("Tracer Study Alumni 2025");
                kuesionerAktif.setDeskripsi("Kuesioner resmi penelusuran alumni STMIK MARDIRA INDONESIA tahun kelulusan 2025.");
                kuesionerAktif = kuesionerRepository.save(kuesionerAktif);
            }
        }

        // 4. CEK & UPDATE / SEED PERTANYAAN
        class QuestionDef {
            String teks;
            Pertanyaan.TipePertanyaan tipe;
            String pilihan;
            String[] answers;
            QuestionDef(String teks, Pertanyaan.TipePertanyaan tipe, String pilihan, String[] answers) {
                this.teks = teks;
                this.tipe = tipe;
                this.pilihan = pilihan;
                this.answers = answers;
            }
        }

        List<QuestionDef> newDefs = new ArrayList<>();
        newDefs.add(new QuestionDef("Apa aktivitas utama Anda saat ini?", Pertanyaan.TipePertanyaan.CHOICE, "[\"Bekerja\",\"Wirausaha\",\"Melanjutkan Studi\",\"Belum Bekerja\"]", new String[] {
            "Bekerja", "Bekerja", "Bekerja", "Bekerja", "Bekerja", "Bekerja", "Bekerja", "Bekerja", "Bekerja", "Bekerja", "Bekerja", "Bekerja",
            "Wirausaha", "Wirausaha", "Wirausaha",
            "Melanjutkan Studi", "Melanjutkan Studi", "Melanjutkan Studi",
            "Belum Bekerja", "Belum Bekerja"
        }));
        newDefs.add(new QuestionDef("Berapa lama Anda memperoleh pekerjaan pertama setelah lulus?", Pertanyaan.TipePertanyaan.CHOICE, "[\"Sebelum lulus\",\"Kurang dari 3 bulan\",\"3–6 bulan\",\"6–12 bulan\",\"Lebih dari 12 bulan\",\"Belum bekerja\"]", new String[] {
            "Sebelum lulus", "Kurang dari 3 bulan", "Kurang dari 3 bulan", "3–6 bulan", "3–6 bulan", "Sebelum lulus", "Kurang dari 3 bulan", "3–6 bulan", "6–12 bulan", "Kurang dari 3 bulan", "3–6 bulan", "6–12 bulan",
            "Sebelum lulus", "Kurang dari 3 bulan", "3–6 bulan",
            "Kurang dari 3 bulan", "3–6 bulan", "Lebih dari 12 bulan",
            "Belum bekerja", "Belum bekerja"
        }));
        newDefs.add(new QuestionDef("Seberapa sesuai pekerjaan Anda saat ini dengan bidang studi yang ditempuh?", Pertanyaan.TipePertanyaan.CHOICE, "[\"Sangat Sesuai\",\"Sesuai\",\"Cukup Sesuai\",\"Kurang Sesuai\",\"Tidak Sesuai\"]", new String[] {
            "Sangat Sesuai", "Sesuai", "Sangat Sesuai", "Sesuai", "Sesuai", "Sangat Sesuai", "Sesuai", "Sesuai", "Cukup Sesuai", "Sesuai", "Sesuai", "Kurang Sesuai",
            "Sangat Sesuai", "Sesuai", "Cukup Sesuai",
            "Sesuai", "Cukup Sesuai", "Kurang Sesuai",
            "Tidak Sesuai", "Tidak Sesuai"
        }));
        newDefs.add(new QuestionDef("Bagaimana status pekerjaan Anda saat ini?", Pertanyaan.TipePertanyaan.CHOICE, "[\"Tetap\",\"Kontrak\",\"Freelance\",\"Wirausaha\",\"Belum Bekerja\"]", new String[] {
            "Tetap", "Kontrak", "Tetap", "Kontrak", "Tetap", "Tetap", "Kontrak", "Freelance", "Kontrak", "Tetap", "Kontrak", "Freelance",
            "Wirausaha", "Wirausaha", "Wirausaha",
            "Freelance", "Kontrak", "Belum Bekerja",
            "Belum Bekerja", "Belum Bekerja"
        }));
        newDefs.add(new QuestionDef("Bagaimana kualitas dosen dalam menyampaikan materi?", Pertanyaan.TipePertanyaan.CHOICE, "[\"Sangat Baik\",\"Baik\",\"Cukup\",\"Kurang\",\"Sangat Kurang\"]", new String[] {
            "Sangat Baik", "Baik", "Sangat Baik", "Baik", "Baik", "Sangat Baik", "Baik", "Cukup", "Baik", "Sangat Baik", "Baik", "Cukup",
            "Sangat Baik", "Baik", "Baik",
            "Sangat Baik", "Baik", "Cukup",
            "Baik", "Kurang"
        }));
        newDefs.add(new QuestionDef("Seberapa puas Anda terhadap kualitas pendidikan di STMIK MARDIRA INDONESIA?", Pertanyaan.TipePertanyaan.CHOICE, "[\"Sangat Puas\",\"Puas\",\"Cukup Puas\",\"Tidak Puas\",\"Sangat Tidak Puas\"]", new String[] {
            "Sangat Puas", "Puas", "Sangat Puas", "Puas", "Puas", "Sangat Puas", "Puas", "Cukup Puas", "Puas", "Sangat Puas", "Puas", "Cukup Puas",
            "Sangat Puas", "Puas", "Puas",
            "Sangat Puas", "Puas", "Cukup Puas",
            "Puas", "Tidak Puas"
        }));
        newDefs.add(new QuestionDef("Apakah kompetensi yang diperoleh selama kuliah membantu pekerjaan Anda saat ini?", Pertanyaan.TipePertanyaan.CHOICE, "[\"Sangat Membantu\",\"Membantu\",\"Cukup Membantu\",\"Kurang Membantu\",\"Tidak Membantu\"]", new String[] {
            "Sangat Membantu", "Membantu", "Sangat Membantu", "Membantu", "Membantu", "Sangat Membantu", "Membantu", "Cukup Membantu", "Membantu", "Sangat Membantu", "Membantu", "Cukup Membantu",
            "Sangat Membantu", "Membantu", "Membantu",
            "Sangat Membantu", "Membantu", "Cukup Membantu",
            "Kurang Membantu", "Tidak Membantu"
        }));
        newDefs.add(new QuestionDef("Apakah Anda bersedia merekomendasikan STMIK MARDIRA INDONESIA kepada orang lain?", Pertanyaan.TipePertanyaan.CHOICE, "[\"Sangat Bersedia\",\"Bersedia\",\"Ragu-ragu\",\"Tidak Bersedia\",\"Sangat Tidak Bersedia\"]", new String[] {
            "Sangat Bersedia", "Bersedia", "Sangat Bersedia", "Bersedia", "Bersedia", "Sangat Bersedia", "Bersedia", "Bersedia", "Bersedia", "Sangat Bersedia", "Bersedia", "Bersedia",
            "Sangat Bersedia", "Bersedia", "Bersedia",
            "Sangat Bersedia", "Bersedia", "Ragu-ragu",
            "Ragu-ragu", "Tidak Bersedia"
        }));
        newDefs.add(new QuestionDef("Apa saran Anda untuk meningkatkan kualitas pendidikan di STMIK MARDIRA INDONESIA?", Pertanyaan.TipePertanyaan.TEXT, null, new String[] {
            "Perbanyak kerja sama dengan industri teknologi dan perusahaan multinasional.",
            "Tingkatkan kegiatan magang terstruktur sejak semester awal.",
            "Perbarui kurikulum secara berkala sesuai kebutuhan dunia kerja terkini.",
            "Tambahkan pelatihan sertifikasi profesi internasional untuk mahasiswa.",
            "Tingkatkan fasilitas laboratorium komputer dengan spesifikasi perangkat keras terbaru.",
            "Perbanyak seminar karier dan career fair dengan mengundang praktisi langsung.",
            "Tingkatkan pelayanan akademik dan kemudahan administrasi berbasis digital.",
            "Tingkatkan pembinaan soft skill seperti komunikasi, kepemimpinan, dan kerja tim.",
            "Perlu lebih banyak praktikum dan studi kasus proyek nyata (real-world projects).",
            "Tingkatkan hubungan dan kolaborasi antara ikatan alumni dengan pihak kampus.",
            "Sediakan inkubator bisnis untuk mahasiswa yang tertarik di bidang wirausaha digital.",
            "Perbanyak langganan jurnal internasional dan e-book gratis di perpustakaan.",
            "Tingkatkan kecepatan akses Wi-Fi di seluruh area publik kampus.",
            "Buka lebih banyak peminatan di bidang Artificial Intelligence dan Keamanan Siber.",
            "Fasilitasi mentoring tugas akhir dengan bimbingan langsung dari pakar industri.",
            "Optimalkan program pertukaran mahasiswa dengan universitas luar negeri.",
            "Tingkatkan penyaluran kerja lulusan melalui pusat pembinaan karier kampus.",
            "Beri dukungan dana dan mentoring intensif untuk mahasiswa yang mengikuti kompetisi IT.",
            "Sederhanakan birokrasi pengajuan proposal kegiatan himpunan dan kemahasiswaan.",
            "Tingkatkan interaksi praktis di kelas agar suasana belajar lebih interaktif dan dinamis."
        }));

        List<Pertanyaan> existingQuestions = pertanyaanRepository.findAll();
        existingQuestions.sort((a, b) -> Integer.compare(a.getOrderIndex(), b.getOrderIndex()));

        List<Pertanyaan> savedQuestions = new ArrayList<>();

        for (int i = 0; i < newDefs.size(); i++) {
            QuestionDef def = newDefs.get(i);
            Pertanyaan p;
            if (i < existingQuestions.size()) {
                p = existingQuestions.get(i);
                p.setTeksPertanyaan(def.teks);
                p.setTipePertanyaan(def.tipe);
                p.setPilihan(def.pilihan);
                p.setOrderIndex(i + 1);
            } else {
                p = new Pertanyaan();
                p.setKuesioner(kuesionerAktif);
                p.setTeksPertanyaan(def.teks);
                p.setTipePertanyaan(def.tipe);
                p.setPilihan(def.pilihan);
                p.setOrderIndex(i + 1);
            }
            savedQuestions.add(pertanyaanRepository.save(p));
        }

        if (existingQuestions.size() > newDefs.size()) {
            for (int i = newDefs.size(); i < existingQuestions.size(); i++) {
                Pertanyaan excess = existingQuestions.get(i);
                List<Jawaban> jl = jawabanRepository.findByPertanyaanId(excess.getId());
                jawabanRepository.deleteAll(jl);
                pertanyaanRepository.delete(excess);
            }
        }

        // 5. CEK & UPDATE / SEED JAWABAN (UNTUK 20 ALUMNI SEEDING)
        List<Alumni> alumniList = alumniRepository.findAll();
        for (int i = 0; i < Math.min(20, alumniList.size()); i++) {
            Alumni alumni = alumniList.get(i);
            
            List<PengisianKuesioner> pengisianList = pengisianKuesionerRepository.findAll();
            PengisianKuesioner pengisian = null;
            for (PengisianKuesioner pk : pengisianList) {
                if (pk.getAlumni().getId().equals(alumni.getId()) && pk.getKuesioner().getId().equals(kuesionerAktif.getId())) {
                    pengisian = pk;
                    break;
                }
            }
            
            if (pengisian == null) {
                pengisian = new PengisianKuesioner();
                pengisian.setAlumni(alumni);
                pengisian.setKuesioner(kuesionerAktif);
                pengisian.setTanggalIsi(LocalDateTime.now().minusDays(i + 1));
                pengisian.setStatusSubmit(1);
                pengisian = pengisianKuesionerRepository.save(pengisian);
            }

            List<Jawaban> existingJawaban = jawabanRepository.findAll();
            List<Jawaban> pengisianJawaban = new ArrayList<>();
            for (Jawaban j : existingJawaban) {
                if (j.getPengisian().getId().equals(pengisian.getId())) {
                    pengisianJawaban.add(j);
                }
            }

            for (int qIdx = 0; qIdx < savedQuestions.size(); qIdx++) {
                Pertanyaan q = savedQuestions.get(qIdx);
                String expectedAns = newDefs.get(qIdx).answers[i];

                Jawaban j = null;
                for (Jawaban existJ : pengisianJawaban) {
                    if (existJ.getPertanyaan().getId().equals(q.getId())) {
                        j = existJ;
                        break;
                    }
                }

                if (j != null) {
                    j.setJawabanTeks(expectedAns);
                    jawabanRepository.save(j);
                } else {
                    j = new Jawaban();
                    j.setPengisian(pengisian);
                    j.setPertanyaan(q);
                    j.setJawabanTeks(expectedAns);
                    jawabanRepository.save(j);
                }
            }
        }

        System.out.println("=== DATABASE SEEDING & UPDATE BERHASIL DISELESAIKAN ===");
    }
}
