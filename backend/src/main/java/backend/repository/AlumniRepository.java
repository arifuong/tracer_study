package backend.repository;

import backend.entity.Alumni;
import backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

// Repository Pattern
// Digunakan untuk akses database melalui Spring Data JPA.
@Repository
public interface AlumniRepository extends JpaRepository<Alumni, Long> {
    Optional<Alumni> findByUser(User user);
    Optional<Alumni> findByUserUsername(String username);
    Optional<Alumni> findByNim(String nim);
    boolean existsByNim(String nim);
    List<Alumni> findByProdi(String prodi);
}
