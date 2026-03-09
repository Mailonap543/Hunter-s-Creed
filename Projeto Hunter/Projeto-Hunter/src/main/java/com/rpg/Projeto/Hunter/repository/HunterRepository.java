package com.rpg.Projeto.Hunter.repository;

import com.rpg.Projeto.Hunter.model.Hunter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface HunterRepository extends JpaRepository<Hunter, Long> {


    Optional<Hunter> findByName(String name);
}