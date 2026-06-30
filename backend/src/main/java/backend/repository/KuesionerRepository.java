package backend.repository;

import backend.entity.Kuesioner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

// Repository Pattern
// Digunakan untuk akses database melalui Spring Data JPA.
@Repository
public interface KuesionerRepository extends JpaRepository<Kuesioner, Long> {
    List<Kuesioner> findByPeriodeId(Long periodeId);
    
    @Query("SELECT k FROM Kuesioner k JOIN k.periode p WHERE :date BETWEEN p.tanggalMulai AND p.tanggalSelesai")
    List<Kuesioner> findActiveQuestionnaires(@Param("date") LocalDate date);
}
