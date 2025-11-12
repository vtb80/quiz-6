/**
 * Answer Handler
 * Collects and validates user answers
 */

import { state } from './state.js';

/**
 * Collect answer from the current question's UI
 */
export function collectAnswer(question) {
  switch(question.type) {
    case 'multiple_choice':
    case 'true_false':
      return collectRadioAnswer();
    
    case 'fill_in_blank':
      return collectFillBlankAnswer();
    
    case 'matching':
      return collectMatchingAnswer();
    
    case 'reordering':
      return collectReorderingAnswer();
    
    case 'reading_comprehension':
      return collectReadingComprehensionAnswer(question);
    
    default:
      return null;
  }
}

/**
 * Collect radio button answer (MC/TF)
 */
function collectRadioAnswer() {
  const selected = document.querySelector('input[name="answer"]:checked');
  return selected ? parseInt(selected.value) : null;
}

/**
 * Collect fill in the blank answer
 */
function collectFillBlankAnswer() {
  const input = document.getElementById('fillBlank');
  return input ? input.value : null;
}

/**
 * Collect matching answer
 */
function collectMatchingAnswer() {
  const answer = {};
  document.querySelectorAll('.pair-select').forEach(select => {
    answer[select.dataset.id] = select.value;
  });
  return answer;
}

/**
 * Collect reordering answer
 */
function collectReorderingAnswer() {
  const items = document.querySelectorAll('.reordering-item');
  return Array.from(items).map(item => parseInt(item.dataset.order));
}

/**
 * Collect reading comprehension answer
 */
function collectReadingComprehensionAnswer(question) {
  const answer = {};
  question.questions.forEach((subQ, idx) => {
    const selected = document.querySelector(`input[name="reading_q${idx}"]:checked`);
    answer[idx] = selected ? parseInt(selected.value) : null;
  });
  return answer;
}

/**
 * Validate that an answer is provided
 */
export function validateAnswer(question, answer) {
  if (answer === null || answer === '') {
    return { valid: false, message: 'Please provide an answer' };
  }
  
  // Special validation for reading comprehension
  if (question.type === 'reading_comprehension') {
    const hasAllAnswers = Object.values(answer).every(v => v !== null);
    if (!hasAllAnswers) {
      return { valid: false, message: 'Please answer all questions in the passage' };
    }
  }
  
  // Special validation for matching
  if (question.type === 'matching') {
    const hasAllSelections = Object.values(answer).every(v => v !== '');
    if (!hasAllSelections) {
      return { valid: false, message: 'Please match all pairs' };
    }
  }
  
  return { valid: true };
}

/**
 * Check if answer is correct
 */
export function checkAnswer(question, answer) {
  switch(question.type) {
    case 'multiple_choice':
    case 'true_false':
      return answer === question.correct;
    
    case 'fill_in_blank':
      return checkFillInBlank(question, answer);
    
    case 'matching':
      return checkMatching(question, answer);
    
    case 'reordering':
      return checkReordering(question, answer);
    
    case 'reading_comprehension':
      return checkReadingComprehension(question, answer);
    
    default:
      return false;
  }
}

/**
 * Check fill in the blank answer
 */
function checkFillInBlank(question, answer) {
  if (!question.correct || !Array.isArray(question.correct)) {
    return false;
  }
  return question.correct.some(c => 
    c.toLowerCase() === (answer || '').toLowerCase()
  );
}

/**
 * Check matching answer
 */
function checkMatching(question, answer) {
  if (!answer || Object.keys(answer).length === 0) {
    return false;
  }
  return Object.keys(question.correct).every(key => 
    answer[key] === question.correct[key]
  );
}

/**
 * Check reordering answer
 */
function checkReordering(question, answer) {
  if (!answer) return false;
  const correctOrder = question.items.map(item => item.order);
  return JSON.stringify(answer) === JSON.stringify(correctOrder);
}

/**
 * Check reading comprehension answer
 */
function checkReadingComprehension(question, answer) {
  if (!answer || typeof answer !== 'object') {
    return false;
  }
  return question.questions.every((subQ, idx) => 
    answer[idx] === subQ.correct
  );
}

/**
 * Format user answer for display
 */
export function formatUserAnswer(question, answer) {
  if (answer === null || answer === '') {
    return 'No answer provided';
  }
  
  switch(question.type) {
    case 'multiple_choice':
      return question.options[answer] || answer;
    
    case 'true_false':
      return answer === 0 ? 'True' : 'False';
    
    case 'fill_in_blank':
      return answer;
    
    case 'matching':
      return Object.values(answer).join(', ');
    
    case 'reordering':
      const orderMap = {};
      question.items.forEach(item => {
        orderMap[item.order] = item.text;
      });
      return answer.map(order => orderMap[order]).join(' → ');
    
    case 'reading_comprehension':
      const results = [];
      question.questions.forEach((subQ, idx) => {
        if (answer[idx] !== undefined) {
          results.push(`Q${idx + 1}: ${subQ.options[answer[idx]]}`);
        }
      });
      return results.join(', ');
    
    default:
      return String(answer);
  }
}

/**
 * Format correct answer for display
 */
export function formatCorrectAnswer(question) {
  switch(question.type) {
    case 'multiple_choice':
      return question.options[question.correct];
    
    case 'true_false':
      return question.correct === 0 ? 'True' : 'False';
    
    case 'fill_in_blank':
      return question.correct.join(', ');
    
    case 'matching':
      return Object.values(question.correct).join(', ');
    
    case 'reordering':
      const sortedItems = [...question.items].sort((a, b) => a.order - b.order);
      return sortedItems.map(item => item.text).join(' → ');
    
    case 'reading_comprehension':
      const results = [];
      question.questions.forEach((subQ, idx) => {
        results.push(`Q${idx + 1}: ${subQ.options[subQ.correct]}`);
      });
      return results.join(', ');
    
    default:
      return 'N/A';
  }
}