package backend.repository;

import backend.entity.Laporan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

// Repository Pattern
// Digunakan untuk akses database melalui Spring Data JPA.
@Repository
public interface LaporanRepository extends JpaRepository<Laporan, Long> {
    List<Laporan> findAllByOrderByCreatedAtDesc();
}
