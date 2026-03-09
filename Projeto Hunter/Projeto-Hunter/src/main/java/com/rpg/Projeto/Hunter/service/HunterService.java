package com.rpg.Projeto.Hunter.service;

import com.rpg.Projeto.Hunter.model.Hunter;
import com.rpg.Projeto.Hunter.repository.HunterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class HunterService {

    @Autowired
    private HunterRepository hunterRepository;

    public Hunter createOrLoadHunter(String name) {
        return hunterRepository.findByName(name)
                .orElseGet(() -> {
                    Hunter newHunter = new Hunter();
                    newHunter.setName(name);

                    newHunter.setHealth(10);
                    newHunter.setScore(0);
                    return hunterRepository.save(newHunter);
                });
    }

    public Hunter getHunterStats(String name) {
        return hunterRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Caçador não encontrado: " + name));
    }

    @Transactional
    public Hunter updateStats(Long hunterId, boolean isCorrectAnswer) {
        Hunter hunter = hunterRepository.findById(hunterId)
                .orElseThrow(() -> new RuntimeException("ID inválido"));

        if (isCorrectAnswer) {
            hunter.setScore(hunter.getScore() + 1);

        } else {
            hunter.setHealth(hunter.getHealth() - 1);
            if (hunter.getHealth() < 0) hunter.setHealth(0);
        }

        return hunterRepository.save(hunter);
    }
}