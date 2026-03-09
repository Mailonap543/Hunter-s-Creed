package com.rpg.Projeto.Hunter.repository;

import com.rpg.Projeto.Hunter.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query(value = "SELECT * FROM questions WHERE category = :category AND difficulty = :difficulty ORDER BY RAND() LIMIT 1", nativeQuery = true)
    Question findRandomQuestion(String category, String difficulty);
}