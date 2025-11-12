/**
 * Quiz Application - Main Entry Point
 * Orchestrates all modules and handles user interactions
 */

import { CONFIG, getSubjectDisplayName } from './config.js';
import { state } from './state.js';
import { loadAvailableSubjects, loadSubjectData } from './api.js';
import { 
  showScreen, 
  updateProgress, 
  updateQuestionBadges,
  showFeedback,
  clearFeedback,
  showSubmitButton,
  showContinueButton,
  disableAllInputs,
  showAlert,
  showConfirm
} from './ui.js';
import { 
  updateLessonDropdown, 
  updateQuestionTypeDropdown, 
  getFilteredQuestions,
  updateInfoText,
  shuffleArray 
} from './filters.js';
import { renderQuestion, setupReorderingDragDrop } from './question-renderer.js';
import { 
  collectAnswer, 
  validateAnswer, 
  checkAnswer 
} from './answer-handler.js';
import { displayResults } from './results.js';

/**
 * Initialize application
 */
async function init() {
  try {
    // Load available subjects
    const subjects = await loadAvailableSubjects();
    populateSubjectDropdown(subjects);
    
    // Setup event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error('Initialization error:', error);
    showAlert('Failed to initialize application');
  }
}

/**
 * Populate subject dropdown with available subjects
 */
function populateSubjectDropdown(subjects) {
  const select = document.getElementById('subject');
  select.innerHTML = '<option value="">-- Choose a Subject --</option>';
  
  subjects.forEach(subject => {
    const option = document.createElement('option');
    option.value = subject;
    option.textContent = getSubjectDisplayName(subject);
    select.appendChild(option);
  });
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Subject selection
  document.getElementById('selectSubjectBtn').addEventListener('click', handleSelectSubject);
  
  // Quiz configuration
  document.getElementById('lessonFilter').addEventListener('change', () => {
    updateQuestionTypeDropdown();
    updateInfoText();
  });
  
  document.getElementById('typeFilter').addEventListener('change', () => {
    updateInfoText();
  });
  
  document.getElementById('backToSubjectsBtn').addEventListener('click', handleBackToSubjects);
  document.getElementById('startQuizBtn').addEventListener('click', handleStartQuiz);
  
  // Quiz
  document.getElementById('exitQuizBtn').addEventListener('click', handleExitQuiz);
  document.getElementById('submitBtn').addEventListener('click', handleSubmitAnswer);
  document.getElementById('continueBtn').addEventListener('click', handleContinue);
  
  // Results
  document.getElementById('retakeQuizBtn').addEventListener('click', handleRetakeQuiz);
}

/**
 * Handle subject selection
 */
async function handleSelectSubject() {
  const subjectName = document.getElementById('subject').value;
  
  if (!subjectName) {
    showAlert('Please select a subject');
    return;
  }
  
  try {
    // Load subject data
    const data = await loadSubjectData(subjectName);
    state.loadSubject(subjectName, data);
    
    // Update UI
    updateLessonDropdown();
    updateQuestionTypeDropdown();
    
    // Show quiz setup screen
    showScreen('quizSetup');
    
  } catch (error) {
    console.error('Error loading subject:', error);
    showAlert(`Failed to load subject: ${error.message}`);
  }
}

/**
 * Handle back to subjects button
 */
function handleBackToSubjects() {
  if (showConfirm('Go back to subject selection? Current configuration will be lost.')) {
    // Reset form
    document.getElementById('subject').value = '';
    document.getElementById('lessonFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('numQuestions').value = CONFIG.DEFAULTS.NUM_QUESTIONS;
    
    // Clear state
    state.reset();
    
    // Show subject selection
    showScreen('subjectSetup');
  }
}

/**
 * Handle start quiz button
 */
function handleStartQuiz() {
  const numQuestions = parseInt(document.getElementById('numQuestions').value);
  const filteredQuestions = getFilteredQuestions();
  
  // Validation
  if (numQuestions < CONFIG.DEFAULTS.MIN_QUESTIONS) {
    showAlert(`Please enter at least ${CONFIG.DEFAULTS.MIN_QUESTIONS} question`);
    return;
  }
  
  if (filteredQuestions.length === 0) {
    showAlert('No questions available with selected filters');
    return;
  }
  
  if (numQuestions > filteredQuestions.length) {
    showAlert(`Only ${filteredQuestions.length} questions available with current filters`);
    return;
  }
  
  // Select and shuffle questions
  const shuffled = shuffleArray(filteredQuestions);
  const selected = shuffled.slice(0, numQuestions);
  
  // Start quiz
  state.startQuiz(selected);
  showScreen('quiz');
  displayCurrentQuestion();
}

/**
 * Display current question
 */
function displayCurrentQuestion() {
  const question = state.getCurrentQuestion();
  const container = document.getElementById('questionContainer');
  
  // Render question
  container.innerHTML = renderQuestion(question);
  
  // Update UI
  updateProgress();
  updateQuestionBadges();
  clearFeedback();
  showSubmitButton();
  
  // Setup drag-drop for reordering if needed
  if (question.type === 'reordering') {
    setupReorderingDragDrop();
  }
}

/**
 * Handle submit answer button
 */
function handleSubmitAnswer() {
  const question = state.getCurrentQuestion();
  const answer = collectAnswer(question);
  
  // Validate answer
  const validation = validateAnswer(question, answer);
  if (!validation.valid) {
    showAlert(validation.message);
    return;
  }
  
  // Save answer
  state.saveAnswer(answer);
  
  // Check if correct
  const isCorrect = checkAnswer(question, answer);
  state.saveResult(question, answer, isCorrect);
  
  // Show feedback
  showFeedback(isCorrect);
  showContinueButton();
  disableAllInputs();
}

/**
 * Handle continue button
 */
function handleContinue() {
  if (state.isLastQuestion()) {
    // Show results
    showScreen('results');
    displayResults();
  } else {
    // Next question
    state.nextQuestion();
    displayCurrentQuestion();
  }
}

/**
 * Handle exit quiz button
 */
function handleExitQuiz() {
  if (showConfirm('Exit current quiz? Your progress will be lost.')) {
    // Reset everything
    document.getElementById('subject').value = '';
    document.getElementById('lessonFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('numQuestions').value = CONFIG.DEFAULTS.NUM_QUESTIONS;
    
    state.reset();
    showScreen('subjectSetup');
  }
}

/**
 * Handle retake quiz button
 */
function handleRetakeQuiz() {
  // Reset filters
  document.getElementById('subject').value = '';
  document.getElementById('lessonFilter').value = '';
  document.getElementById('typeFilter').value = '';
  document.getElementById('numQuestions').value = CONFIG.DEFAULTS.NUM_QUESTIONS;
  
  // Clear state
  state.reset();
  
  // Go back to subject selection
  showScreen('subjectSetup');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);