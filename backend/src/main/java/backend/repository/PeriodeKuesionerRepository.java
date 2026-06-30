package backend.repository;

import backend.entity.PeriodeKuesioner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

// Repository Pattern
// Digunakan untuk akses database melalui Spring Data JPA.
@Repository
public interface PeriodeKuesionerRepository extends JpaRepository<PeriodeKuesioner, Long> {
    
    @Query("SELECT p FROM PeriodeKuesioner p WHERE :date BETWEEN p.tanggalMulai AND p.tanggalSelesai")
    List<PeriodeKuesioner> findActivePeriods(@Param("date") LocalDate date);
}
