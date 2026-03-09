package com.rpg.Projeto.Hunter.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Entity
@Table(name = "hunter")
public class Hunter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name = "Kaelen";


    private int health = 3;
    private int score = 0;
    private int currentLevel = 1;


    private int errorsTech = 0;
    private int errorsLanguage = 0;

    private String location = "Initial Point";

    private java.time.LocalDateTime lastPlayed;
}