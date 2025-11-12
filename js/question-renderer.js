/**
 * Question Renderer
 * Renders different question types to HTML
 */

import { shuffleArray } from './filters.js';
import { state } from './state.js';

/**
 * Main render function - dispatches to specific renderer
 */
export function renderQuestion(question) {
  const renderers = {
    'multiple_choice': renderMultipleChoice,
    'true_false': renderTrueFalse,
    'fill_in_blank': renderFillInBlank,
    'matching': renderMatching,
    'reordering': renderReordering,
    'reading_comprehension': renderReadingComprehension
  };
  
  const renderer = renderers[question.type];
  if (!renderer) {
    return '<p>Unknown question type</p>';
  }
  
  return renderer(question);
}

/**
 * Render question image if present
 */
function renderQuestionImage(question) {
  if (!question.questionImage) {
    return '';
  }
  
  const scale = question.questionImageScale || 50;
  return `
    <div class="question-image-container">
      <img src="${question.questionImage}" 
           alt="Question image" 
           class="question-image"
           style="max-width: ${scale}%; max-height: 400px;">
    </div>
  `;
}

/**
 * Render Multiple Choice question
 */
function renderMultipleChoice(question) {
  const userAnswer = state.getCurrentAnswer();
  let html = `<h3>${question.question}</h3>`;
  
  // Add question image if present
  html += renderQuestionImage(question);
  
  // Check if using option images
  const hasOptionImages = question.optionImages && Object.keys(question.optionImages).length > 0;
  
  if (hasOptionImages) {
    // Render options as images
    html += '<div class="options options-images">';
    
    const optionScale = question.optionImageScale || 75;
    const imageEntries = Object.entries(question.optionImages).map(([idx, imgPath]) => ({
      originalIdx: parseInt(idx),
      imgPath: imgPath
    }));
    const shuffledOptions = shuffleArray(imageEntries);
    
    shuffledOptions.forEach((item) => {
      const isSelected = userAnswer === item.originalIdx;
      html += `
        <label class="option option-image">
          <input type="radio" name="answer" value="${item.originalIdx}" ${isSelected ? 'checked' : ''}>
          <img src="${item.imgPath}" 
               alt="Option ${item.originalIdx}" 
               class="option-image-img"
               style="max-width: ${optionScale}%; max-height: 200px;">
        </label>
      `;
    });
  } else {
    // Render options as text
    html += '<div class="options">';
    
    const options = question.options.map((opt, idx) => ({ opt, originalIdx: idx }));
    const shuffledOptions = shuffleArray(options);
    
    shuffledOptions.forEach((item) => {
      const isSelected = userAnswer === item.originalIdx;
      html += `
        <label class="option">
          <input type="radio" name="answer" value="${item.originalIdx}" ${isSelected ? 'checked' : ''}>
          ${item.opt}
        </label>
      `;
    });
  }
  
  return html + '</div>';
}

/**
 * Render True/False question
 */
function renderTrueFalse(question) {
  const userAnswer = state.getCurrentAnswer();
  const options = [
    { label: 'True', value: 0 },
    { label: 'False', value: 1 }
  ];
  const shuffledOptions = shuffleArray(options);
  
  let html = `<h3>${question.question}</h3><div class="true-false">`;
  shuffledOptions.forEach(opt => {
    const isSelected = userAnswer === opt.value;
    html += `
      <label class="option">
        <input type="radio" name="answer" value="${opt.value}" ${isSelected ? 'checked' : ''}>
        ${opt.label}
      </label>
    `;
  });
  
  return html + '</div>';
}

/**
 * Render Fill in the Blank question
 */
function renderFillInBlank(question) {
  const answer = state.getCurrentAnswer() || '';
  let html = `<h3>${question.question}</h3>`;
  
  // Add question image if present
  html += renderQuestionImage(question);
  
  html += `
    <input type="text" id="fillBlank" class="fill-blank-input" value="${answer}" placeholder="Type your answer here...">
  `;
  
  return html;
}

/**
 * Render Matching question
 */
function renderMatching(question) {
  const currentAnswer = state.getCurrentAnswer() || {};
  let html = `<h3>${question.question}</h3><div class="matching-container">`;
  
  const shuffledPairs = shuffleArray([...question.pairs]);
  const shuffledOptions = shuffleArray([...question.pairs]);
  
  shuffledPairs.forEach(pair => {
    const selectedValue = currentAnswer[pair.id] || '';
    const options = shuffledOptions.map(p => 
      `<option value="${p.capital}" ${selectedValue === p.capital ? 'selected' : ''}>${p.capital}</option>`
    ).join('');
    
    html += `
      <div class="pair-item">
        <span class="pair-label">${pair.country}</span>
        <select class="pair-select" data-id="${pair.id}">
          <option value="">-- Select --</option>
          ${options}
        </select>
      </div>
    `;
  });
  
  return html + '</div>';
}

/**
 * Render Reordering question
 */
function renderReordering(question) {
  let html = `<h3>${question.question}</h3><div class="reordering-container" id="reorderList">`;
  
  const items = question.items.map((item, idx) => ({ ...item, originalIdx: idx }));
  const shuffledItems = shuffleArray(items);
  
  // Debug: Log to verify shuffling (can remove later)
  console.log('Original order:', question.items.map(i => i.order));
  console.log('Shuffled order:', shuffledItems.map(i => i.order));
  
  shuffledItems.forEach((item) => {
    html += `
      <div class="reordering-item" draggable="true" data-order="${item.order}">
        <span class="drag-handle">⋮⋮</span>
        <span>${item.text}</span>
      </div>
    `;
  });
  
  return html + '</div>';
}

/**
 * Render Reading Comprehension question
 */
function renderReadingComprehension(question) {
  const currentAnswer = state.getCurrentAnswer() || {};
  let html = `<div class="passage">${question.passage}</div>`;
  
  question.questions.forEach((subQ, idx) => {
    html += `<h4 style="margin-top: 20px; margin-bottom: 10px;">Question ${idx + 1}: ${subQ.question}</h4>`;
    
    const options = subQ.options.map((opt, optIdx) => ({ opt, originalIdx: optIdx }));
    const shuffledOptions = shuffleArray(options);
    
    html += `<div class="options">`;
    
    shuffledOptions.forEach((item) => {
      const isSelected = currentAnswer[idx] === item.originalIdx;
      html += `
        <label class="option">
          <input type="radio" name="reading_q${idx}" value="${item.originalIdx}" ${isSelected ? 'checked' : ''}>
          ${item.opt}
        </label>
      `;
    });
    
    html += `</div>`;
  });
  
  return html;
}

/**
 * Setup drag-and-drop for reordering questions
 */
export function setupReorderingDragDrop() {
  const container = document.getElementById('reorderList');
  if (!container) return;
  
  const items = container.querySelectorAll('.reordering-item');
  let draggedElement = null;
  
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTouchDevice) {
    setupTouchDragDrop(container, items);
  } else {
    setupMouseDragDrop(container, items);
  }
}

/**
 * Setup touch-based drag and drop
 */
function setupTouchDragDrop(container, items) {
  let draggedElement = null;
  
  items.forEach(item => {
    let touchStartY = 0;
    let currentY = 0;
    
    item.addEventListener('touchstart', (e) => {
      draggedElement = item;
      touchStartY = e.touches[0].clientY;
      item.style.opacity = '0.5';
      item.style.zIndex = '1000';
    });
    
    item.addEventListener('touchmove', (e) => {
      if (!draggedElement) return;
      e.preventDefault();
      
      currentY = e.touches[0].clientY;
      const allItems = [...container.querySelectorAll('.reordering-item')];
      
      allItems.forEach(otherItem => {
        if (otherItem === draggedElement) return;
        
        const rect = otherItem.getBoundingClientRect();
        const middle = rect.top + rect.height / 2;
        
        if (currentY < middle && currentY > rect.top) {
          container.insertBefore(draggedElement, otherItem);
        } else if (currentY > middle && currentY < rect.bottom) {
          container.insertBefore(draggedElement, otherItem.nextSibling);
        }
      });
    });
    
    item.addEventListener('touchend', () => {
      if (draggedElement) {
        draggedElement.style.opacity = '1';
        draggedElement.style.zIndex = '';
        draggedElement = null;
      }
    });
  });
}

/**
 * Setup mouse-based drag and drop
 */
function setupMouseDragDrop(container, items) {
  let draggedElement = null;
  
  items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = item;
      setTimeout(() => {
        item.style.opacity = '0.5';
      }, 0);
    });
    
    item.addEventListener('dragend', () => {
      item.style.opacity = '1';
      draggedElement = null;
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (draggedElement === item) return;
      
      const rect = item.getBoundingClientRect();
      const middle = rect.top + rect.height / 2;
      
      if (e.clientY < middle) {
        container.insertBefore(draggedElement, item);
      } else {
        container.insertBefore(draggedElement, item.nextSibling);
      }
    });
    
    item.addEventListener('drop', (e) => {
      e.preventDefault();
    });
  });
}