package com.rpg.Projeto.Hunter.service;

import com.rpg.Projeto.Hunter.model.Question;
import com.rpg.Projeto.Hunter.model.QuestionCategory;
import com.rpg.Projeto.Hunter.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuizService {

    @Autowired
    private QuestionRepository questionRepository;

    public Question getChallenge(QuestionCategory category, String difficulty) {
        return questionRepository.findRandomQuestion(category.name(), difficulty);
    }

    public boolean validateAnswer(Long questionId, String userAnswer) {
        return questionRepository.findById(questionId)
                .map(q -> q.getCorrectAnswer().equalsIgnoreCase(userAnswer.trim()))
                .orElse(false);
    }

    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }
}