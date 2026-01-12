/**
 * Kinetic English Games – Main Game Module
 * Core game logic, question generation, and state management
 * 
 * @module KineticGame
 */

const KineticGame = (function() {
    'use strict';

    // ==================== GAME CONFIGURATION ====================
    
    const CONFIG = {
        totalQuestions: 20,
        timerDuration: 15,
        pointsCorrect: 10,
        pointsTimeBonus: 30,
        pointsStreak: 5,
        minCombinationsBeforeRepeat: 8,
        answerOptions: 4
    };

    // ==================== QUESTION TYPES ====================
    
    const QUESTION_TYPES = {
        SHAPE_IDENTIFICATION: 'shape_identification',
        SIZE_RECOGNITION: 'size_recognition',
        COLOR_SHAPE: 'color_shape',
        COUNTING_COLOR: 'counting_color',
        LOGICAL_CHALLENGE: 'logical_challenge'
    };

    // ==================== GAME STATE ====================
    
    let gameState = {
        currentQuestion: 0,
        score: 0,
        streak: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        usedCombinations: [],
        timerValue: CONFIG.timerDuration,
        timerInterval: null,
        isAnswered: false,
        currentQuestionData: null,
        difficulty: 1 // 1 = easy, 2 = medium, 3 = hard
    };

    // ==================== DOM ELEMENTS ====================
    
    const DOM = {
        screens: {
            intro: null,
            game: null,
            results: null
        },
        game: {
            questionNumber: null,
            progressFill: null,
            timer: null,
            timerValue: null,
            questionText: null,
            shapeDisplay: null,
            answerOptions: null,
            feedbackMessage: null,
            microTip: null,
            nextBtn: null,
            scoreValue: null,
            streakValue: null,
            streakDisplay: null
        },
        results: {
            finalScore: null,
            finalCorrect: null,
            finalIncorrect: null,
            finalAccuracy: null,
            motivationMessage: null,
            confettiContainer: null
        },
        buttons: {
            start: null,
            playAgain: null
        }
    };

    // ==================== INITIALIZATION ====================

    /**
     * Initialize the game
     */
    function init() {
        cacheDOMElements();
        bindEvents();
        
        // Load voices for speech synthesis
        if ('speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
        }
    }

    /**
     * Cache DOM elements for performance
     */
    function cacheDOMElements() {
        // Screens
        DOM.screens.intro = document.getElementById('intro-screen');
        DOM.screens.game = document.getElementById('game-screen');
        DOM.screens.results = document.getElementById('results-screen');
        
        // Game elements
        DOM.game.questionNumber = document.getElementById('current-question');
        DOM.game.progressFill = document.getElementById('progress-fill');
        DOM.game.timer = document.getElementById('timer');
        DOM.game.timerValue = document.getElementById('timer-value');
        DOM.game.questionText = document.getElementById('question-text');
        DOM.game.shapeDisplay = document.getElementById('shape-display');
        DOM.game.answerOptions = document.getElementById('answer-options');
        DOM.game.feedbackMessage = document.getElementById('feedback-message');
        DOM.game.microTip = document.getElementById('micro-tip');
        DOM.game.nextBtn = document.getElementById('next-btn');
        DOM.game.scoreValue = document.getElementById('score-value');
        DOM.game.streakValue = document.getElementById('streak-value');
        DOM.game.streakDisplay = document.querySelector('.streak-display');
        
        // Results elements
        DOM.results.finalScore = document.getElementById('final-score');
        DOM.results.finalCorrect = document.getElementById('final-correct');
        DOM.results.finalIncorrect = document.getElementById('final-incorrect');
        DOM.results.finalAccuracy = document.getElementById('final-accuracy');
        DOM.results.motivationMessage = document.getElementById('motivation-message');
        DOM.results.confettiContainer = document.getElementById('confetti-container');
        
        // Buttons
        DOM.buttons.start = document.getElementById('start-btn');
        DOM.buttons.playAgain = document.getElementById('play-again-btn');
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        DOM.buttons.start.addEventListener('click', startGame);
        DOM.buttons.playAgain.addEventListener('click', restartGame);
        DOM.game.nextBtn.addEventListener('click', nextQuestion);
    }

    // ==================== SCREEN MANAGEMENT ====================

    /**
     * Show a specific screen
     * @param {string} screenName - 'intro', 'game', or 'results'
     */
    function showScreen(screenName) {
        Object.values(DOM.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        DOM.screens[screenName].classList.add('active');
    }

    // ==================== GAME FLOW ====================

    /**
     * Start the game
     */
    function startGame() {
        AudioManager.init();
        AudioManager.playStart();
        
        // Speak intro
        setTimeout(() => {
            AudioManager.speak('Kinetic English Games by Camilo Marín. Let\'s learn shapes and sizes!', 0.9);
        }, 500);
        
        resetGameState();
        showScreen('game');
        
        setTimeout(() => {
            generateQuestion();
        }, 1500);
    }

    /**
     * Restart the game
     */
    function restartGame() {
        AudioManager.playClick();
        DOM.results.confettiContainer.innerHTML = '';
        resetGameState();
        showScreen('game');
        
        setTimeout(() => {
            generateQuestion();
        }, 300);
    }

    /**
     * Reset game state
     */
    function resetGameState() {
        gameState = {
            currentQuestion: 0,
            score: 0,
            streak: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            usedCombinations: [],
            timerValue: CONFIG.timerDuration,
            timerInterval: null,
            isAnswered: false,
            currentQuestionData: null,
            difficulty: 1
        };
        
        updateUI();
    }

    /**
     * Move to next question
     */
    function nextQuestion() {
        AudioManager.playClick();
        
        if (gameState.currentQuestion >= CONFIG.totalQuestions) {
            endGame();
            return;
        }
        
        DOM.game.nextBtn.classList.remove('show');
        DOM.game.nextBtn.classList.add('hidden');
        
        setTimeout(() => {
            generateQuestion();
        }, 300);
    }

    /**
     * End the game and show results
     */
    function endGame() {
        clearInterval(gameState.timerInterval);
        
        const accuracy = Math.round((gameState.correctAnswers / CONFIG.totalQuestions) * 100);
        
        DOM.results.finalScore.textContent = gameState.score;
        DOM.results.finalCorrect.textContent = gameState.correctAnswers;
        DOM.results.finalIncorrect.textContent = gameState.incorrectAnswers;
        DOM.results.finalAccuracy.textContent = accuracy + '%';
        
        DOM.results.motivationMessage.textContent = getMotivationMessage(accuracy);
        
        showScreen('results');
        
        AudioManager.playVictory();
        createConfetti();
        
        setTimeout(() => {
            AudioManager.speak(`Amazing job! You scored ${gameState.score} points with ${accuracy} percent accuracy!`, 0.9);
        }, 1000);
    }

    /**
     * Get motivational message based on accuracy
     * @param {number} accuracy 
     * @returns {string}
     */
    function getMotivationMessage(accuracy) {
        if (accuracy >= 90) return "🌟 Outstanding! You're a shapes master!";
        if (accuracy >= 75) return "🎉 Excellent work! Keep learning!";
        if (accuracy >= 60) return "👍 Good job! Practice makes perfect!";
        if (accuracy >= 40) return "💪 Nice try! You're getting better!";
        return "🌈 Keep practicing! You'll improve!";
    }

    // ==================== QUESTION GENERATION ====================

    /**
     * Generate a new question based on difficulty
     */
    function generateQuestion() {
        gameState.currentQuestion++;
        gameState.isAnswered = false;
        
        // Update difficulty based on progress
        if (gameState.currentQuestion <= 7) {
            gameState.difficulty = 1; // Easy: one variable
        } else if (gameState.currentQuestion <= 14) {
            gameState.difficulty = 2; // Medium: two variables
        } else {
            gameState.difficulty = 3; // Hard: three variables
        }
        
        // Select question type based on difficulty
        const questionType = selectQuestionType();
        const questionData = createQuestion(questionType);
        
        gameState.currentQuestionData = questionData;
        
        // Render the question
        renderQuestion(questionData);
        updateUI();
        startTimer();
    }

    /**
     * Select question type based on difficulty
     * @returns {string}
     */
    function selectQuestionType() {
        const types = Object.values(QUESTION_TYPES);
        
        if (gameState.difficulty === 1) {
            // Easy: shape identification or size recognition
            return Math.random() > 0.5 
                ? QUESTION_TYPES.SHAPE_IDENTIFICATION 
                : QUESTION_TYPES.SIZE_RECOGNITION;
        } else if (gameState.difficulty === 2) {
            // Medium: color + shape or counting
            return Math.random() > 0.5 
                ? QUESTION_TYPES.COLOR_SHAPE 
                : QUESTION_TYPES.COUNTING_COLOR;
        } else {
            // Hard: any type with emphasis on logical challenges
            const hardTypes = [
                QUESTION_TYPES.COLOR_SHAPE,
                QUESTION_TYPES.COUNTING_COLOR,
                QUESTION_TYPES.LOGICAL_CHALLENGE
            ];
            return hardTypes[Math.floor(Math.random() * hardTypes.length)];
        }
    }

    /**
     * Create a question based on type
     * @param {string} type 
     * @returns {Object}
     */
    function createQuestion(type) {
        switch (type) {
            case QUESTION_TYPES.SHAPE_IDENTIFICATION:
                return createShapeIdentificationQuestion();
            case QUESTION_TYPES.SIZE_RECOGNITION:
                return createSizeRecognitionQuestion();
            case QUESTION_TYPES.COLOR_SHAPE:
                return createColorShapeQuestion();
            case QUESTION_TYPES.COUNTING_COLOR:
                return createCountingColorQuestion();
            case QUESTION_TYPES.LOGICAL_CHALLENGE:
                return createLogicalChallengeQuestion();
            default:
                return createShapeIdentificationQuestion();
        }
    }

    /**
     * Create shape identification question
     */
    function createShapeIdentificationQuestion() {
        const shape = ShapeRenderer.getRandomShape();
        const color = ShapeRenderer.getRandomColor();
        const size = ShapeRenderer.getRandomSize();
        
        const shapes = [{ shape, color, size }];
        const correctAnswer = ShapeRenderer.getShapeDisplayName(shape);
        
        // Generate wrong answers
        const wrongAnswers = ShapeRenderer.getShapeNames()
            .filter(s => s !== shape)
            .map(s => ShapeRenderer.getShapeDisplayName(s))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        const options = shuffleArray([correctAnswer, ...wrongAnswers]);
        
        return {
            type: QUESTION_TYPES.SHAPE_IDENTIFICATION,
            question: "What shape is this?",
            shapes,
            options,
            correctAnswer,
            highlightIndex: 0,
            microTip: `This is a ${shape}!`
        };
    }

    /**
     * Create size recognition question
     */
    function createSizeRecognitionQuestion() {
        const shape = ShapeRenderer.getRandomShape();
        const color = ShapeRenderer.getRandomColor();
        const size = ShapeRenderer.getRandomSize();
        
        const shapes = [{ shape, color, size }];
        const correctAnswer = ShapeRenderer.getSizeDisplayName(size);
        
        // Generate wrong answers
        const wrongAnswers = ShapeRenderer.getSizeNames()
            .filter(s => s !== size)
            .map(s => ShapeRenderer.getSizeDisplayName(s))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        const options = shuffleArray([correctAnswer, ...wrongAnswers]);
        
        return {
            type: QUESTION_TYPES.SIZE_RECOGNITION,
            question: "What size is this shape?",
            shapes,
            options,
            correctAnswer,
            highlightIndex: 0,
            microTip: `${ShapeRenderer.getSizeDisplayName(size)}: not too big, not too small!`
        };
    }

    /**
     * Create color + shape question
     */
    function createColorShapeQuestion() {
        const targetShape = ShapeRenderer.getRandomShape();
        const targetColor = ShapeRenderer.getRandomColor();
        
        // Create distractor shapes
        const shapes = [];
        const numShapes = 3 + Math.floor(Math.random() * 3); // 3-5 shapes
        
        // Add the target shape
        shapes.push({
            shape: targetShape,
            color: targetColor,
            size: ShapeRenderer.getRandomSize()
        });
        
        // Add distractors
        for (let i = 1; i < numShapes; i++) {
            let distShape, distColor;
            do {
                distShape = ShapeRenderer.getRandomShape();
                distColor = ShapeRenderer.getRandomColor();
            } while (distShape === targetShape && distColor === targetColor);
            
            shapes.push({
                shape: distShape,
                color: distColor,
                size: ShapeRenderer.getRandomSize()
            });
        }
        
        const correctAnswer = capitalize(targetColor);
        
        // Generate color options
        const otherColors = ShapeRenderer.getColorNames()
            .filter(c => c !== targetColor && c !== 'white' && c !== 'black')
            .map(c => capitalize(c))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        const options = shuffleArray([correctAnswer, ...otherColors]);
        
        return {
            type: QUESTION_TYPES.COLOR_SHAPE,
            question: `What color is the ${targetShape}?`,
            shapes: shuffleArray(shapes),
            options,
            correctAnswer,
            highlightIndex: -1,
            microTip: `${capitalize(targetColor)} + ${targetShape} = ${targetColor} ${targetShape}!`
        };
    }

    /**
     * Create counting by color question
     */
    function createCountingColorQuestion() {
        const targetColor = ShapeRenderer.getRandomColor();
        const targetCount = 2 + Math.floor(Math.random() * 4); // 2-5 shapes of target color
        
        const shapes = [];
        
        // Add target colored shapes
        for (let i = 0; i < targetCount; i++) {
            shapes.push({
                shape: ShapeRenderer.getRandomShape(),
                color: targetColor,
                size: ShapeRenderer.getRandomSize()
            });
        }
        
        // Add distractor shapes
        const distractorCount = 3 + Math.floor(Math.random() * 4); // 3-6 distractors
        for (let i = 0; i < distractorCount; i++) {
            let distColor;
            do {
                distColor = ShapeRenderer.getRandomColor();
            } while (distColor === targetColor);
            
            shapes.push({
                shape: ShapeRenderer.getRandomShape(),
                color: distColor,
                size: ShapeRenderer.getRandomSize()
            });
        }
        
        const correctAnswer = targetCount.toString();
        
        // Generate number options
        const wrongNumbers = [];
        for (let i = 1; i <= 6; i++) {
            if (i !== targetCount) wrongNumbers.push(i.toString());
        }
        const wrongAnswers = wrongNumbers.sort(() => Math.random() - 0.5).slice(0, 3);
        
        const options = shuffleArray([correctAnswer, ...wrongAnswers]);
        
        return {
            type: QUESTION_TYPES.COUNTING_COLOR,
            question: `How many ${targetColor} shapes are there?`,
            shapes: shuffleArray(shapes),
            options,
            correctAnswer,
            highlightIndex: -1,
            microTip: `Count all the ${targetColor} ones: ${targetCount}!`
        };
    }

    /**
     * Create logical challenge question (size + color filtering)
     */
    function createLogicalChallengeQuestion() {
        const targetSize = ShapeRenderer.getRandomSize();
        const targetColor = ShapeRenderer.getRandomColor();
        const targetCount = 1 + Math.floor(Math.random() * 3); // 1-3 matching shapes
        
        const shapes = [];
        
        // Add target shapes (matching size + color)
        for (let i = 0; i < targetCount; i++) {
            shapes.push({
                shape: ShapeRenderer.getRandomShape(),
                color: targetColor,
                size: targetSize
            });
        }
        
        // Add distractors (some with wrong size, some with wrong color)
        const distractorCount = 4 + Math.floor(Math.random() * 3); // 4-6 distractors
        for (let i = 0; i < distractorCount; i++) {
            const useWrongSize = Math.random() > 0.5;
            
            let distSize = targetSize;
            let distColor = targetColor;
            
            if (useWrongSize) {
                do {
                    distSize = ShapeRenderer.getRandomSize();
                } while (distSize === targetSize);
            } else {
                do {
                    distColor = ShapeRenderer.getRandomColor();
                } while (distColor === targetColor);
            }
            
            shapes.push({
                shape: ShapeRenderer.getRandomShape(),
                color: distColor,
                size: distSize
            });
        }
        
        const correctAnswer = targetCount.toString();
        
        // Generate number options
        const wrongNumbers = [];
        for (let i = 0; i <= 5; i++) {
            if (i !== targetCount) wrongNumbers.push(i.toString());
        }
        const wrongAnswers = wrongNumbers.sort(() => Math.random() - 0.5).slice(0, 3);
        
        const options = shuffleArray([correctAnswer, ...wrongAnswers]);
        
        const sizeDisplay = ShapeRenderer.getSizeDisplayName(targetSize).toLowerCase();
        
        return {
            type: QUESTION_TYPES.LOGICAL_CHALLENGE,
            question: `How many ${sizeDisplay} ${targetColor} shapes can you see?`,
            shapes: shuffleArray(shapes),
            options,
            correctAnswer,
            highlightIndex: -1,
            microTip: `Look for ${sizeDisplay} + ${targetColor}: ${targetCount}!`
        };
    }

    // ==================== RENDERING ====================

    /**
     * Render question to the UI
     * @param {Object} questionData 
     */
    function renderQuestion(questionData) {
        // Update question text
        DOM.game.questionText.textContent = questionData.question;
        
        // Render shapes
        ShapeRenderer.renderShapes(
            DOM.game.shapeDisplay, 
            questionData.shapes, 
            questionData.highlightIndex
        );
        
        // Render answer options
        DOM.game.answerOptions.innerHTML = '';
        questionData.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => handleAnswer(option, btn));
            DOM.game.answerOptions.appendChild(btn);
        });
        
        // Clear feedback
        DOM.game.feedbackMessage.textContent = '';
        DOM.game.feedbackMessage.className = 'feedback-message';
        DOM.game.microTip.textContent = '';
    }

    /**
     * Update UI elements
     */
    function updateUI() {
        DOM.game.questionNumber.textContent = gameState.currentQuestion;
        DOM.game.progressFill.style.width = `${(gameState.currentQuestion / CONFIG.totalQuestions) * 100}%`;
        DOM.game.scoreValue.textContent = gameState.score;
        DOM.game.streakValue.textContent = gameState.streak;
        
        // Update streak visual
        if (gameState.streak >= 3) {
            DOM.game.streakDisplay.classList.add('active');
        } else {
            DOM.game.streakDisplay.classList.remove('active');
        }
    }

    // ==================== TIMER ====================

    /**
     * Start the question timer
     */
    function startTimer() {
        gameState.timerValue = CONFIG.timerDuration;
        DOM.game.timerValue.textContent = gameState.timerValue;
        DOM.game.timer.className = 'timer';
        
        clearInterval(gameState.timerInterval);
        
        gameState.timerInterval = setInterval(() => {
            gameState.timerValue--;
            DOM.game.timerValue.textContent = gameState.timerValue;
            
            // Update timer appearance
            if (gameState.timerValue <= 5) {
                DOM.game.timer.className = 'timer critical';
                if (gameState.timerValue === 5) {
                    AudioManager.playTimerWarning();
                }
            } else if (gameState.timerValue <= 8) {
                DOM.game.timer.className = 'timer warning';
            }
            
            if (gameState.timerValue <= 0) {
                handleTimeout();
            }
        }, 1000);
    }

    /**
     * Handle timer timeout
     */
    function handleTimeout() {
        if (gameState.isAnswered) return;
        
        gameState.isAnswered = true;
        clearInterval(gameState.timerInterval);
        
        AudioManager.playTimeout();
        
        gameState.streak = 0;
        gameState.incorrectAnswers++;
        
        // Show correct answer
        const buttons = DOM.game.answerOptions.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === gameState.currentQuestionData.correctAnswer) {
                btn.classList.add('correct');
            }
        });
        
        DOM.game.feedbackMessage.textContent = "⏰ Time's up!";
        DOM.game.feedbackMessage.className = 'feedback-message incorrect';
        DOM.game.microTip.textContent = gameState.currentQuestionData.microTip;
        
        showNextButton();
        updateUI();
    }

    // ==================== ANSWER HANDLING ====================

    /**
     * Handle answer selection
     * @param {string} answer 
     * @param {HTMLElement} button 
     */
    function handleAnswer(answer, button) {
        if (gameState.isAnswered) return;
        
        gameState.isAnswered = true;
        clearInterval(gameState.timerInterval);
        
        const isCorrect = answer === gameState.currentQuestionData.correctAnswer;
        
        // Disable all buttons
        const buttons = DOM.game.answerOptions.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            if (btn.textContent === gameState.currentQuestionData.correctAnswer) {
                btn.classList.add('correct');
            }
        });
        
        if (isCorrect) {
            handleCorrectAnswer(button);
        } else {
            handleIncorrectAnswer(button);
        }
        
        showNextButton();
        updateUI();
    }

    /**
     * Handle correct answer
     * @param {HTMLElement} button 
     */
    function handleCorrectAnswer(button) {
        AudioManager.playCorrect();
        
        button.classList.add('correct');
        
        // Calculate score
        let points = CONFIG.pointsCorrect;
        const timeBonus = Math.round((gameState.timerValue / CONFIG.timerDuration) * CONFIG.pointsTimeBonus);
        points += timeBonus;
        
        gameState.streak++;
        if (gameState.streak >= 2) {
            points += CONFIG.pointsStreak * (gameState.streak - 1);
            if (gameState.streak >= 3) {
                AudioManager.playStreak();
            }
        }
        
        gameState.score += points;
        gameState.correctAnswers++;
        
        // Feedback
        const messages = ["Great job! 🎉", "Excellent! ⭐", "Perfect! 🌟", "Amazing! 🏆", "Wonderful! 🎊"];
        DOM.game.feedbackMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
        DOM.game.feedbackMessage.className = 'feedback-message correct';
        DOM.game.microTip.textContent = gameState.currentQuestionData.microTip;
    }

    /**
     * Handle incorrect answer
     * @param {HTMLElement} button 
     */
    function handleIncorrectAnswer(button) {
        AudioManager.playIncorrect();
        
        button.classList.add('incorrect');
        
        gameState.streak = 0;
        gameState.incorrectAnswers++;
        
        // Feedback
        DOM.game.feedbackMessage.textContent = "Not quite! Try again next time! 💪";
        DOM.game.feedbackMessage.className = 'feedback-message incorrect';
        DOM.game.microTip.textContent = gameState.currentQuestionData.microTip;
    }

    /**
     * Show next button
     */
    function showNextButton() {
        DOM.game.nextBtn.classList.remove('hidden');
        DOM.game.nextBtn.classList.add('show');
    }

    // ==================== UTILITIES ====================

    /**
     * Fisher-Yates shuffle
     * @param {Array} array 
     * @returns {Array}
     */
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Capitalize first letter
     * @param {string} str 
     * @returns {string}
     */
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Create confetti celebration
     */
    function createConfetti() {
        const colors = ['#3DD8E6', '#F9C21B', '#D94A2F', '#7CC74C', '#9B59B6', '#E91E63'];
        const container = DOM.results.confettiContainer;
        
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 3) + 's';
            confetti.style.animationDelay = (Math.random() * 2) + 's';
            
            // Random shapes
            const shapes = ['circle', 'square', 'triangle'];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            
            if (shape === 'circle') {
                confetti.style.borderRadius = '50%';
            } else if (shape === 'triangle') {
                confetti.style.width = '0';
                confetti.style.height = '0';
                confetti.style.borderLeft = '5px solid transparent';
                confetti.style.borderRight = '5px solid transparent';
                confetti.style.borderBottom = `10px solid ${confetti.style.backgroundColor}`;
                confetti.style.backgroundColor = 'transparent';
            }
            
            container.appendChild(confetti);
        }
    }

    // ==================== PUBLIC API ====================

    return {
        init
    };
})();

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    KineticGame.init();
});
