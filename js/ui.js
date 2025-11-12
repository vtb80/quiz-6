/**
 * UI Utilities
 * Screen management and UI helper functions
 */

import { getQuestionTypeName } from './config.js';
import { state } from './state.js';

/**
 * Show a specific screen and hide others
 */
export function showScreen(screenId) {
  const screens = ['subjectSetup', 'quizSetup', 'quiz', 'results'];
  screens.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.toggle('active', id === screenId);
    }
  });
}

/**
 * Update progress display
 */
export function updateProgress() {
  const progress = state.getProgress();
  document.getElementById('current').textContent = progress.current;
  document.getElementById('total').textContent = progress.total;
}

/**
 * Update question type and lesson badges
 */
export function updateQuestionBadges() {
  const question = state.getCurrentQuestion();
  
  // Type badge
  const typeBadge = document.getElementById('typeBadge');
  typeBadge.textContent = getQuestionTypeName(question.type);
  typeBadge.classList.add('show');
  
  // Lesson badge
  const lessonBadge = document.getElementById('lessonBadge');
  if (question.lessonId) {
    const lesson = state.getLessonById(question.lessonId);
    if (lesson) {
      lessonBadge.textContent = `📚 ${lesson.name}`;
      lessonBadge.style.display = 'inline-block';
    } else {
      lessonBadge.style.display = 'none';
    }
  } else {
    lessonBadge.textContent = '📂 Others';
    lessonBadge.style.display = 'inline-block';
  }
}

/**
 * Show feedback after answer submission
 */
export function showFeedback(isCorrect) {
  const feedbackDiv = document.getElementById('feedback');
  feedbackDiv.classList.remove('feedback-correct', 'feedback-incorrect');
  
  if (isCorrect) {
    feedbackDiv.textContent = '✓ Correct!';
    feedbackDiv.classList.add('feedback-correct');
  } else {
    feedbackDiv.textContent = '✗ Incorrect';
    feedbackDiv.classList.add('feedback-incorrect');
  }
  
  feedbackDiv.classList.add('show');
}

/**
 * Clear feedback display
 */
export function clearFeedback() {
  const feedbackDiv = document.getElementById('feedback');
  feedbackDiv.classList.remove('show', 'feedback-correct', 'feedback-incorrect');
  feedbackDiv.textContent = '';
}

/**
 * Show submit button, hide continue button
 */
export function showSubmitButton() {
  document.getElementById('submitBtn').style.display = 'block';
  document.getElementById('continueBtn').style.display = 'none';
}

/**
 * Show continue button, hide submit button
 */
export function showContinueButton() {
  document.getElementById('submitBtn').style.display = 'none';
  document.getElementById('continueBtn').style.display = 'block';
}

/**
 * Disable all input elements in question container
 */
export function disableAllInputs() {
  const container = document.getElementById('questionContainer');
  
  container.querySelectorAll('input[type="radio"]').forEach(input => {
    input.disabled = true;
  });
  
  container.querySelectorAll('input[type="text"]').forEach(input => {
    input.disabled = true;
  });
  
  container.querySelectorAll('select').forEach(select => {
    select.disabled = true;
  });
  
  // Disable drag on reordering items
  container.querySelectorAll('.reordering-item').forEach(item => {
    item.draggable = false;
    item.style.cursor = 'default';
  });
}

/**
 * Enable all input elements in question container
 */
export function enableAllInputs() {
  const container = document.getElementById('questionContainer');
  
  container.querySelectorAll('input[type="radio"]').forEach(input => {
    input.disabled = false;
  });
  
  container.querySelectorAll('input[type="text"]').forEach(input => {
    input.disabled = false;
  });
  
  container.querySelectorAll('select').forEach(select => {
    select.disabled = false;
  });
}

/**
 * Show alert with custom message
 */
export function showAlert(message) {
  alert(message);
}

/**
 * Show confirmation dialog
 */
export function showConfirm(message) {
  return confirm(message);
}