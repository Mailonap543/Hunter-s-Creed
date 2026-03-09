package com.rpg.Projeto.Hunter.controller;

import com.rpg.Projeto.Hunter.model.Question;
import com.rpg.Projeto.Hunter.model.QuestionCategory;
import com.rpg.Projeto.Hunter.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizService quizService;

    @GetMapping("/challenge")
    public ResponseEntity<Question> getQuestion(
            @RequestParam QuestionCategory category,
            @RequestParam String difficulty) {

        Question q = quizService.getChallenge(category, difficulty);
        return q != null ? ResponseEntity.ok(q) : ResponseEntity.notFound().build();
    }

    @PostMapping("/check")
    public ResponseEntity<Boolean> checkAnswer(@RequestParam Long id, @RequestParam String answer) {
        return ResponseEntity.ok(quizService.validateAnswer(id, answer));
    }

    @PostMapping("/create")
    public ResponseEntity<Question> create(@RequestBody Question question) {
        return ResponseEntity.ok(quizService.createQuestion(question));
    }
}