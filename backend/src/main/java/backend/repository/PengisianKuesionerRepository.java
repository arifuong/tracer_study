package backend.repository;

import backend.entity.PengisianKuesioner;
import backend.entity.Alumni;
import backend.entity.Kuesioner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

// Repository Pattern
// Digunakan untuk akses database melalui Spring Data JPA.
@Repository
public interface PengisianKuesionerRepository extends JpaRepository<PengisianKuesioner, Long> {
    Optional<PengisianKuesioner> findByAlumniAndKuesioner(Alumni alumni, Kuesioner kuesioner);
    Optional<PengisianKuesioner> findByAlumniIdAndKuesionerId(Long alumniId, Long kuesionerId);
    boolean existsByAlumniIdAndKuesionerId(Long alumniId, Long kuesionerId);
    boolean existsByAlumniIdAndKuesionerPeriodeId(Long alumniId, Long periodeId);
    List<PengisianKuesioner> findByKuesionerId(Long kuesionerId);
    List<PengisianKuesioner> findByKuesionerPeriodeId(Long periodeId);

    @Query("SELECT COUNT(DISTINCT p.alumni.id) FROM PengisianKuesioner p")
    long countDistinctAlumni();

    @Query("SELECT COUNT(DISTINCT p.alumni.id) FROM PengisianKuesioner p WHERE p.kuesioner.periode.id = :periodeId")
    long countDistinctAlumniByPeriodeId(@Param("periodeId") Long periodeId);
}
