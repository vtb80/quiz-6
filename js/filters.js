/**
 * Filter Logic
 * Handles lesson and question type filtering
 */

import { CONFIG, getQuestionTypeName } from './config.js';
import { state } from './state.js';

/**
 * Update lesson dropdown with available lessons
 */
export function updateLessonDropdown() {
  const select = document.getElementById('lessonFilter');
  select.innerHTML = '<option value="">All Lessons</option>';
  
  // Add lessons that have questions
  state.allLessons.forEach(lesson => {
    const count = state.allQuestions.filter(q => q.lessonId === lesson.id).length;
    if (count > 0) {
      const option = document.createElement('option');
      option.value = lesson.id;
      option.textContent = `${lesson.name} (${count} questions)`;
      select.appendChild(option);
    }
  });
  
  // Add "Others" option if there are unassigned questions
  const othersCount = state.allQuestions.filter(q => !q.lessonId).length;
  if (othersCount > 0) {
    const option = document.createElement('option');
    option.value = 'others';
    option.textContent = `Others - Unassigned (${othersCount} questions)`;
    select.appendChild(option);
  }
  
  // Update info text
  updateInfoText();
}

/**
 * Update question type dropdown based on selected lesson
 */
export function updateQuestionTypeDropdown() {
  const lessonFilter = document.getElementById('lessonFilter').value;
  const typeSelect = document.getElementById('typeFilter');
  const currentType = typeSelect.value;
  
  // Get questions for selected lesson
  let filteredQuestions = getFilteredQuestionsByLesson(lessonFilter);
  
  // Count questions by type
  const typeCounts = {};
  filteredQuestions.forEach(q => {
    typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
  });
  
  // Rebuild type dropdown
  typeSelect.innerHTML = '<option value="">All Types</option>';
  
  // Add only types that have questions
  Object.keys(CONFIG.QUESTION_TYPE_NAMES).forEach(type => {
    if (typeCounts[type] && typeCounts[type] > 0) {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = `${getQuestionTypeName(type)} (${typeCounts[type]})`;
      typeSelect.appendChild(option);
    }
  });
  
  // Restore previous selection if still valid
  if (currentType && typeCounts[currentType]) {
    typeSelect.value = currentType;
  }
  
  // Update info text
  updateInfoText();
}

/**
 * Get filtered questions by lesson
 */
function getFilteredQuestionsByLesson(lessonFilter) {
  if (!lessonFilter) {
    return state.allQuestions;
  }
  
  if (lessonFilter === 'others') {
    return state.allQuestions.filter(q => !q.lessonId);
  }
  
  return state.allQuestions.filter(q => q.lessonId === lessonFilter);
}

/**
 * Get filtered questions by both lesson and type
 */
export function getFilteredQuestions() {
  const lessonFilter = document.getElementById('lessonFilter').value;
  const typeFilter = document.getElementById('typeFilter').value;
  
  let filtered = state.allQuestions;
  
  // Filter by lesson
  if (lessonFilter) {
    if (lessonFilter === 'others') {
      filtered = filtered.filter(q => !q.lessonId);
    } else {
      filtered = filtered.filter(q => q.lessonId === lessonFilter);
    }
  }
  
  // Filter by type
  if (typeFilter) {
    filtered = filtered.filter(q => q.type === typeFilter);
  }
  
  return filtered;
}

/**
 * Update info text showing available questions
 */
export function updateInfoText() {
  const filtered = getFilteredQuestions();
  const infoText = document.getElementById('lessonInfo');
  infoText.textContent = `${filtered.length} question(s) available with current filters`;
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}