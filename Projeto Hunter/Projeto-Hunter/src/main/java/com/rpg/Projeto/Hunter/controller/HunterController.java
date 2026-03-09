package com.rpg.Projeto.Hunter.controller;

import com.rpg.Projeto.Hunter.model.Hunter;
import com.rpg.Projeto.Hunter.service.HunterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hunter")

@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:5173"})
public class HunterController {

    @Autowired
    private HunterService hunterService;


    @PostMapping("/start")
    public ResponseEntity<Hunter> startGame(@RequestParam String name) {
        Hunter hunter = hunterService.createOrLoadHunter(name);
        return ResponseEntity.ok(hunter);
    }


    @GetMapping("/{name}")
    public ResponseEntity<Hunter> getStats(@PathVariable String name) {
        return ResponseEntity.ok(hunterService.getHunterStats(name));
    }


    @PostMapping("/{id}/update")
    public ResponseEntity<Hunter> updateScore(
            @PathVariable Long id,
            @RequestParam boolean correct) {
        Hunter updatedHunter = hunterService.updateStats(id, correct);
        return ResponseEntity.ok(updatedHunter);
    }
}