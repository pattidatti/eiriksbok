import React, { useState } from 'react';
import type { QuizQuestion } from '../types';
import './Quiz.css';
import { motion } from 'framer-motion';

interface QuizProps {
    questions: QuizQuestion[];
}

export const Quiz: React.FC<QuizProps> = ({ questions }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleOptionClick = (option: string) => {
        if (isAnswered) return;
        setSelectedOption(option);
    };

    const submitAnswer = () => {
        setIsAnswered(true);
        if (selectedOption === questions[currentQuestion].answer) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setShowResult(true);
        }
    };

    if (showResult) {
        return (
            <div className="quiz-container quiz-result">
                <h3>Quiz Fullført!</h3>
                <p>Du fikk {score} av {questions.length} riktige.</p>
                <button className="next-btn" onClick={() => window.location.reload()}>Start på nytt</button>
            </div>
        )
    }

    if (!questions || questions.length === 0) return null;

    const question = questions[currentQuestion];

    return (
        <div className="quiz-container">
            <h3>Quiz: Sjekk hva du kan</h3>
            <div className="question-card">
                <p className="question-text">{question.question}</p>
                <div className="options-grid">
                    {question.options.map((option) => (
                        <button
                            key={option}
                            className={`option-btn ${selectedOption === option ? 'selected' : ''} ${isAnswered && option === question.answer ? 'correct' : ''} ${isAnswered && selectedOption === option && option !== question.answer ? 'wrong' : ''}`}
                            onClick={() => handleOptionClick(option)}
                            disabled={isAnswered}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                {!isAnswered && selectedOption && (
                    <motion.button
                        className="submit-btn"
                        onClick={submitAnswer}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Svar
                    </motion.button>
                )}
                {isAnswered && (
                    <motion.button
                        className="next-btn"
                        onClick={nextQuestion}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {currentQuestion < questions.length - 1 ? 'Neste' : 'Se resultat'}
                    </motion.button>
                )}
            </div>
        </div>
    );
};
