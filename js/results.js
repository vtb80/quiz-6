/**
 * Results Module
 * Handles results screen and scoring
 */

import { state } from './state.js';
import { formatUserAnswer, formatCorrectAnswer } from './answer-handler.js';

/**
 * Display quiz results
 */
export function displayResults() {
  const score = state.calculateScore();
  const incorrectQuestions = state.getIncorrectQuestions();
  
  // Update score display
  document.getElementById('scoreDisplay').textContent = `${score.correct}/${score.total}`;
  document.getElementById('resultText').textContent = `You scored ${score.percentage}% correct!`;
  
  // Display incorrect questions
  displayIncorrectQuestions(incorrectQuestions);
}

/**
 * Display list of incorrect questions
 */
function displayIncorrectQuestions(incorrectQuestions) {
  const container = document.getElementById('incorrectQuestions');
  
  if (incorrectQuestions.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: #28a745; font-size: 18px; margin-top: 20px;">
        🎉 Perfect! All answers correct!
      </p>
    `;
    return;
  }
  
  let html = '<h3 style="margin-bottom: 15px; text-align: left;">Incorrect Answers:</h3>';
  
  incorrectQuestions.forEach((result, idx) => {
    const q = result.question;
    html += '<div class="incorrect-item">';
    
    // Question text
    const questionText = q.question || 'Reading Comprehension';
    html += `<h4>Question ${idx + 1}: ${questionText}</h4>`;
    
    // Show lesson if available
    const lesson = state.getLessonById(q.lessonId);
    if (lesson) {
      html += `<p style="font-size: 12px; color: #666;">📚 Lesson: ${lesson.name}</p>`;
    } else if (q.lessonId === null) {
      html += `<p style="font-size: 12px; color: #666;">📂 Others</p>`;
    }
    
    // User's answer
    html += `<p><strong>Your answer:</strong> ${formatUserAnswer(q, result.answer)}</p>`;
    
    // Correct answer
    html += `<div class="correct-answer"><strong>Correct answer:</strong> ${formatCorrectAnswer(q)}</div>`;
    
    html += '</div>';
  });
  
  container.innerHTML = html;
}