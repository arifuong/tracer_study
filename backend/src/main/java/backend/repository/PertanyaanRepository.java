package backend.repository;

import backend.entity.Pertanyaan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// Repository Pattern
// Digunakan untuk akses database melalui Spring Data JPA.
@Repository
public interface PertanyaanRepository extends JpaRepository<Pertanyaan, Long> {
    List<Pertanyaan> findByKuesionerId(Long kuesionerId);
    List<Pertanyaan> findByKuesionerIdOrderByOrderIndexAsc(Long kuesionerId);
}
