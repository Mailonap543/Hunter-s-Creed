package com.rpg.Projeto.Hunter.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 500)
    private String statement;

    @Enumerated(EnumType.STRING)
    private QuestionCategory category;

    private String difficulty;

    private String correctAnswer;

    private String wrongAnswers;
}