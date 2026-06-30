package backend.repository;

import backend.entity.Jawaban;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// Repository Pattern
// Digunakan untuk akses database melalui Spring Data JPA.
@Repository
public interface JawabanRepository extends JpaRepository<Jawaban, Long> {
    List<Jawaban> findByPengisianId(Long pengisianId);
    List<Jawaban> findByPertanyaanId(Long pertanyaanId);
}
