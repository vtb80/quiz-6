let allQuestions = [];
let allLessons = [];
let selectedQuestions = [];
let currentIndex = 0;
let userAnswers = [];
let questionResults = [];
let currentSubject = '';

// Subject name aliases for display
const subjectAliases = {
    'sample': 'Sample Questions',
    'science': 'Science',
    'khoa_hoc_tu_nhien': 'Khoa Học Tự Nhiên',
	'cong_nghe':'Công Nghệ',
	'giao_duc_cong_dan':'Giáo Dục Công Dân',
	'lich_su_dia_li': 'Lịch Sử Địa Lí',
	'tin_hoc': 'Tin Học'
};

// Question type names for display
const questionTypeNames = {
    'multiple_choice': 'Multiple Choice',
    'true_false': 'True/False',
    'fill_in_blank': 'Fill in the Blank',
    'matching': 'Matching',
    'reordering': 'Reordering',
    'reading_comprehension': 'Reading Comprehension'
};

window.addEventListener('DOMContentLoaded', () => {
    loadAvailableSubjects();
});

function loadAvailableSubjects() {
    const possibleSubjects = ['sample','science','khoa_hoc_tu_nhien','lich_su_dia_li','cong_nghe','tin_hoc','giao_duc_cong_dan'];
    let loaded = [];
    
    possibleSubjects.forEach(subject => {
        fetch(`questions-${subject}.json`)
            .then(response => {
                if (response.ok) {
                    loaded.push(subject);
                    updateSubjectDropdown(loaded);
                }
            })
            .catch(() => {});
    });
}

function updateSubjectDropdown(loadedSubjects) {
    const select = document.getElementById('subject');
    select.innerHTML = '<option value="">-- Choose a Subject --</option>';
    loadedSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        // Use alias if available, otherwise format the subject name
        option.textContent = subjectAliases[subject] || subject.charAt(0).toUpperCase() + subject.slice(1).replace(/_/g, ' ');
        select.appendChild(option);
    });
}

function selectSubject() {
    const subject = document.getElementById('subject').value;
    if (!subject) {
        alert('Please select a subject');
        return;
    }
    
    currentSubject = subject;
    loadQuestions(subject);
}

async function loadQuestions(subject) {
    try {
        const response = await fetch(`questions-${subject}.json`);
        if (!response.ok) throw new Error('File not found');
        
        const data = await response.json();
        allQuestions = data.questions || [];
        allLessons = data.lessons || [];
        
        if (allQuestions.length === 0) {
            alert('No questions found in this subject');
            return;
        }
        
        // Update lesson dropdown
        updateLessonDropdown();
        
        document.getElementById('subjectSetup').classList.remove('active');
        document.getElementById('quizSetup').classList.add('active');
    } catch (error) {
        alert(`Error loading questions: ${error.message}`);
    }
}

function updateLessonDropdown() {
    const select = document.getElementById('lessonFilter');
    select.innerHTML = '<option value="">All Lessons</option>';
    
    // Add lessons that have questions
    allLessons.forEach(lesson => {
        const count = allQuestions.filter(q => q.lessonId === lesson.id).length;
        if (count > 0) {  // Only show lessons with questions
            const option = document.createElement('option');
            option.value = lesson.id;
            option.textContent = `${lesson.name} (${count} questions)`;
            select.appendChild(option);
        }
    });
    
    // Add "Others" option if there are unassigned questions
    const othersCount = allQuestions.filter(q => !q.lessonId).length;
    if (othersCount > 0) {
        const option = document.createElement('option');
        option.value = 'others';
        option.textContent = `Others - Unassigned (${othersCount} questions)`;
        select.appendChild(option);
    }
    
    // Update question type dropdown based on available types
    updateQuestionTypeDropdown();
    
    // Update info text
    const infoText = document.getElementById('lessonInfo');
    const lessonsWithQuestions = allLessons.filter(l => 
        allQuestions.some(q => q.lessonId === l.id)
    ).length;
    infoText.textContent = `${lessonsWithQuestions} lesson(s), ${allQuestions.length} total questions`;
    
    // Add change listeners
    select.addEventListener('change', updateQuestionTypeDropdown);
}

function updateQuestionTypeDropdown() {
    const lessonFilter = document.getElementById('lessonFilter').value;
    const typeSelect = document.getElementById('typeFilter');
    const currentType = typeSelect.value;
    
    // Get questions for selected lesson
    let filteredQuestions = allQuestions;
    if (lessonFilter) {
        if (lessonFilter === 'others') {
            filteredQuestions = filteredQuestions.filter(q => !q.lessonId);
        } else {
            filteredQuestions = filteredQuestions.filter(q => q.lessonId === lessonFilter);
        }
    }
    
    // Count questions by type
    const typeCounts = {};
    filteredQuestions.forEach(q => {
        typeCounts[q.type] = (typeCounts[q.type] || 0) + 1;
    });
    
    // Rebuild type dropdown
    typeSelect.innerHTML = '<option value="">All Types</option>';
    
    // Add only types that have questions
    Object.keys(questionTypeNames).forEach(type => {
        if (typeCounts[type] && typeCounts[type] > 0) {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = `${questionTypeNames[type]} (${typeCounts[type]})`;
            typeSelect.appendChild(option);  // Fixed: was 'select', should be 'typeSelect'
        }
    });
    
    // Restore previous selection if still valid
    if (currentType && typeCounts[currentType]) {
        typeSelect.value = currentType;
    }
    
    // Update question count
    updateQuestionCount();
    
    // Add change listener if not already added
    if (!typeSelect.dataset.listenerAdded) {
        typeSelect.addEventListener('change', updateQuestionCount);
        typeSelect.dataset.listenerAdded = 'true';
    }
}

function updateQuestionCount() {
    const lessonFilter = document.getElementById('lessonFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;
    
    let filtered = allQuestions;
    
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
    
    const infoText = document.getElementById('lessonInfo');
    infoText.textContent = `${filtered.length} question(s) available with current filters`;
}

function startQuiz() {
    const numQuestions = parseInt(document.getElementById('numQuestions').value);
    const typeFilter = document.getElementById('typeFilter').value;
    const lessonFilter = document.getElementById('lessonFilter').value;
    
    let filteredQuestions = allQuestions;
    
    // Filter by lesson first
    if (lessonFilter) {
        if (lessonFilter === 'others') {
            filteredQuestions = filteredQuestions.filter(q => !q.lessonId);
        } else {
            filteredQuestions = filteredQuestions.filter(q => q.lessonId === lessonFilter);
        }
    }
    
    // Then filter by type
    if (typeFilter) {
        filteredQuestions = filteredQuestions.filter(q => q.type === typeFilter);
    }
    
    if (numQuestions < 1) {
        alert('Please enter at least 1 question');
        return;
    }
    
    if (filteredQuestions.length === 0) {
        alert('No questions available with selected filters');
        return;
    }
    
    if (numQuestions > filteredQuestions.length) {
        alert(`Only ${filteredQuestions.length} questions available with current filters`);
        return;
    }
    
    selectedQuestions = filteredQuestions.sort(() => 0.5 - Math.random()).slice(0, numQuestions);
    userAnswers = new Array(numQuestions).fill(null);
    questionResults = new Array(numQuestions).fill(null);
    currentIndex = 0;
    
    document.getElementById('quizSetup').classList.remove('active');
    document.getElementById('quiz').classList.add('active');
    document.getElementById('total').textContent = numQuestions;
    
    displayQuestion();
}

function displayQuestion() {
    const question = selectedQuestions[currentIndex];
    const container = document.getElementById('questionContainer');
    
    let html = '';
    
    switch(question.type) {
        case 'multiple_choice':
            html += displayMultipleChoice(question);
            break;
        case 'true_false':
            html += displayTrueFalse(question);
            break;
        case 'fill_in_blank':
            html += displayFillInBlank(question);
            break;
        case 'matching':
            html += displayMatching(question);
            break;
        case 'reordering':
            html += displayReordering(question);
            break;
        case 'reading_comprehension':
            html += displayReadingComprehension(question);
            break;
    }
    
    container.innerHTML = html;
    document.getElementById('current').textContent = currentIndex + 1;
    
    const typeBadge = document.getElementById('typeBadge');
    typeBadge.textContent = formatType(question.type);
    typeBadge.classList.add('show');
    
    // Show lesson badge if question has a lesson
    const lessonBadge = document.getElementById('lessonBadge');
    if (question.lessonId) {
        const lesson = allLessons.find(l => l.id === question.lessonId);
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
    
    const feedbackDiv = document.getElementById('feedback');
    feedbackDiv.classList.remove('show', 'feedback-correct', 'feedback-incorrect');
    feedbackDiv.textContent = '';
    
    document.getElementById('submitBtn').style.display = 'block';
    document.getElementById('continueBtn').style.display = 'none';
    
    enableAllInputs();
    
    if (question.type === 'reordering') {
        setupReorderingButtons();
    }
}

function displayMultipleChoice(question) {
    let html = `<h3>${question.question}</h3><div class="options">`;
    
    const shuffledOptions = question.options.map((opt, idx) => ({ opt, originalIdx: idx }))
        .sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach((item) => {
        const isSelected = userAnswers[currentIndex] === item.originalIdx;
        html += `
            <label class="option">
                <input type="radio" name="answer" value="${item.originalIdx}" ${isSelected ? 'checked' : ''}>
                ${item.opt}
            </label>
        `;
    });
    return html + '</div>';
}

function displayTrueFalse(question) {
    const options = [
        { label: 'True', value: 0 },
        { label: 'False', value: 1 }
    ].sort(() => Math.random() - 0.5);
    
    let html = `<h3>${question.question}</h3><div class="true-false">`;
    options.forEach(opt => {
        const isSelected = userAnswers[currentIndex] === opt.value;
        html += `
            <label class="option">
                <input type="radio" name="answer" value="${opt.value}" ${isSelected ? 'checked' : ''}>
                ${opt.label}
            </label>
        `;
    });
    return html + '</div>';
}

function displayFillInBlank(question) {
    const answer = userAnswers[currentIndex] || '';
    return `
        <h3>${question.question}</h3>
        <input type="text" id="fillBlank" class="fill-blank-input" value="${answer}" placeholder="Type your answer here...">
    `;
}

function displayMatching(question) {
    let html = `<h3>${question.question}</h3><div class="matching-container">`;
    const currentAnswer = userAnswers[currentIndex] || {};
    
    const shuffledPairs = [...question.pairs].sort(() => Math.random() - 0.5);
    const shuffledOptions = [...question.pairs].sort(() => Math.random() - 0.5);
    
    shuffledPairs.forEach(pair => {
        const selectedValue = currentAnswer[pair.id] || '';
        const options = shuffledOptions.map(p => `<option value="${p.capital}" ${selectedValue === p.capital ? 'selected' : ''}>${p.capital}</option>`).join('');
        
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

function displayReordering(question) {
    let html = `<h3>${question.question}</h3><div class="reordering-container" id="reorderList">`;
    
    const shuffledItems = question.items.map((item, idx) => ({ ...item, originalIdx: idx }))
        .sort(() => Math.random() - 0.5);
    
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

function displayReadingComprehension(question) {
    let html = `
        <div class="passage">${question.passage}</div>
    `;
    
    question.questions.forEach((subQ, idx) => {
        html += `<h4 style="margin-top: 20px; margin-bottom: 10px;">Question ${idx + 1}: ${subQ.question}</h4>`;
        
        const shuffledOptions = subQ.options.map((opt, optIdx) => ({ opt, originalIdx: optIdx }))
            .sort(() => Math.random() - 0.5);
        
        html += `<div class="options">`;
        
        shuffledOptions.forEach((item) => {
            const currentAns = userAnswers[currentIndex] || {};
            const isSelected = currentAns[idx] === item.originalIdx;
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

function formatType(type) {
    const types = {
        'multiple_choice': 'Multiple Choice',
        'true_false': 'True/False',
        'fill_in_blank': 'Fill in the Blank',
        'matching': 'Matching',
        'reordering': 'Reordering',
        'reading_comprehension': 'Reading Comprehension'
    };
    return types[type] || type;
}

function setupReorderingButtons() {
    const container = document.getElementById('reorderList');
    if (!container) return;
    
    const items = container.querySelectorAll('.reordering-item');
    let draggedElement = null;
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
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
    } else {
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
}

function submitAnswer() {
    const question = selectedQuestions[currentIndex];
    let answer = null;
    
    switch(question.type) {
        case 'multiple_choice':
        case 'true_false':
            const selected = document.querySelector('input[name="answer"]:checked');
            answer = selected ? parseInt(selected.value) : null;
            break;
        
        case 'fill_in_blank':
            answer = document.getElementById('fillBlank').value;
            break;
        
        case 'matching':
            answer = {};
            document.querySelectorAll('.pair-select').forEach(select => {
                answer[select.dataset.id] = select.value;
            });
            break;
        
        case 'reordering':
            const items = document.querySelectorAll('.reordering-item');
            answer = Array.from(items).map(item => parseInt(item.dataset.order));
            break;
        
        case 'reading_comprehension':
            answer = {};
            question.questions.forEach((subQ, idx) => {
                const selected = document.querySelector(`input[name="reading_q${idx}"]:checked`);
                answer[idx] = selected ? parseInt(selected.value) : null;
            });
            
            if (Object.values(answer).some(v => v === null)) {
                alert('Please answer all questions in the passage');
                return;
            }
            break;
    }
    
    if (answer === null || (typeof answer === 'string' && answer === '')) {
        alert('Please provide an answer');
        return;
    }
    
    userAnswers[currentIndex] = answer;
    
    const isCorrect = checkAnswer(question, answer);
    questionResults[currentIndex] = {
        question: question,
        answer: answer,
        isCorrect: isCorrect
    };
    
    showFeedback(isCorrect);
}

function checkAnswer(question, answer) {
    switch(question.type) {
        case 'multiple_choice':
        case 'true_false':
            return answer === question.correct;
        
        case 'fill_in_blank':
            if (!question.correct || !Array.isArray(question.correct)) return false;
            return question.correct.some(c => c.toLowerCase() === (answer || '').toLowerCase());
        
        case 'matching':
            if (!answer || Object.keys(answer).length === 0) return false;
            return Object.keys(question.correct).every(key => answer[key] === question.correct[key]);
        
        case 'reordering':
            if (!answer) return false;
            const correctOrder = question.items.map(item => item.order);
            return JSON.stringify(answer) === JSON.stringify(correctOrder);
        
        case 'reading_comprehension':
            if (!answer || typeof answer !== 'object') return false;
            return question.questions.every((subQ, idx) => {
                return answer[idx] === subQ.correct;
            });
        
        default:
            return false;
    }
}

function showFeedback(isCorrect) {
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
    document.getElementById('submitBtn').style.display = 'none';
    document.getElementById('continueBtn').style.display = 'block';
    
    disableAllInputs();
}

function disableAllInputs() {
    document.querySelectorAll('#questionContainer input[type="radio"]').forEach(input => {
        input.disabled = true;
    });
    
    document.querySelectorAll('#questionContainer input[type="text"]').forEach(input => {
        input.disabled = true;
    });
    
    document.querySelectorAll('#questionContainer select').forEach(select => {
        select.disabled = true;
    });
    
    document.querySelectorAll('.reorder-btn').forEach(btn => {
        btn.disabled = true;
    });
}

function enableAllInputs() {
    document.querySelectorAll('#questionContainer input[type="radio"]').forEach(input => {
        input.disabled = false;
    });
    
    document.querySelectorAll('#questionContainer input[type="text"]').forEach(input => {
        input.disabled = false;
    });
    
    document.querySelectorAll('#questionContainer select').forEach(select => {
        select.disabled = false;
    });
    
    document.querySelectorAll('.reorder-btn').forEach(btn => {
        btn.disabled = false;
    });
}

function nextQuestion() {
    const isLastQuestion = currentIndex === selectedQuestions.length - 1;
    
    if (isLastQuestion) {
        showResults();
    } else {
        currentIndex++;
        displayQuestion();
    }
}

function showResults() {
    let score = 0;
    let incorrectQuestions = [];
    
    questionResults.forEach((result, idx) => {
        if (result.isCorrect) {
            score++;
        } else {
            incorrectQuestions.push(result);
        }
    });
    
    const percentage = Math.round((score / selectedQuestions.length) * 100);
    
    document.getElementById('quiz').classList.remove('active');
    document.getElementById('results').classList.add('active');
    document.getElementById('scoreDisplay').textContent = `${score}/${selectedQuestions.length}`;
    document.getElementById('resultText').textContent = `You scored ${percentage}% correct!`;
    
    displayIncorrectQuestions(incorrectQuestions);
}

function displayIncorrectQuestions(incorrectQuestions) {
    const container = document.getElementById('incorrectQuestions');
    
    if (incorrectQuestions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #28a745; font-size: 18px; margin-top: 20px;">🎉 Perfect! All answers correct!</p>';
        return;
    }
    
    let html = '<h3 style="margin-bottom: 15px; text-align: left;">Incorrect Answers:</h3>';
    
    incorrectQuestions.forEach((result, idx) => {
        const q = result.question;
        html += `<div class="incorrect-item">`;
        html += `<h4>Question ${idx + 1}: ${q.question || 'Reading Comprehension'}</h4>`;
        
        // Show lesson if available
        if (q.lessonId) {
            const lesson = allLessons.find(l => l.id === q.lessonId);
            if (lesson) {
                html += `<p style="font-size: 12px; color: #666;">📚 Lesson: ${lesson.name}</p>`;
            }
        } else {
            html += `<p style="font-size: 12px; color: #666;">📂 Others</p>`;
        }
        
        html += `<p><strong>Your answer:</strong> ${getUserAnswerText(q, result.answer)}</p>`;
        html += `<div class="correct-answer"><strong>Correct answer:</strong> ${formatCorrectAnswerDisplay(q)}</div>`;
        html += `</div>`;
    });
    
    container.innerHTML = html;
}

function getUserAnswerText(question, answer) {
    if (answer === null || answer === '') return 'No answer provided';
    
    switch(question.type) {
        case 'multiple_choice':
            if (typeof answer === 'number' && question.options) {
                return question.options[answer];
            }
            return answer;
        
        case 'true_false':
            if (typeof answer === 'number') {
                return answer === 0 ? 'True' : 'False';
            }
            return answer;
        
        case 'fill_in_blank':
            return answer;
        
        case 'matching':
            if (typeof answer === 'object' && !Array.isArray(answer)) {
                return Object.values(answer).join(', ');
            }
            return answer;
        
        case 'reordering':
            if (Array.isArray(answer)) {
                const orderMap = {};
                question.items.forEach(item => {
                    orderMap[item.order] = item.text;
                });
                return answer.map(order => orderMap[order]).join(' → ');
            }
            return answer;
        
        case 'reading_comprehension':
            if (typeof answer === 'object') {
                let results = [];
                question.questions.forEach((subQ, idx) => {
                    if (answer[idx] !== undefined) {
                        results.push(`Q${idx + 1}: ${subQ.options[answer[idx]]}`);
                    }
                });
                return results.join(', ');
            }
            return 'Multiple answers';
        
        default:
            return answer;
    }
}

function formatCorrectAnswerDisplay(question) {
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
            let results = [];
            question.questions.forEach((subQ, idx) => {
                results.push(`Q${idx + 1}: ${subQ.options[subQ.correct]}`);
            });
            return results.join(', ');
        
        default:
            return 'N/A';
    }
}

function retakeQuiz() {
    document.querySelectorAll('input, select, button').forEach(el => {
        if (el.id !== 'submitBtn' && el.id !== 'continueBtn') {
            el.disabled = false;
        }
    });
    
    document.getElementById('subjectSetup').classList.add('active');
    document.getElementById('quizSetup').classList.remove('active');
    document.getElementById('quiz').classList.remove('active');
    document.getElementById('results').classList.remove('active');
    document.getElementById('subject').value = '';
    document.getElementById('lessonFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('numQuestions').value = 5;
    
    currentIndex = 0;
    userAnswers = [];
    questionResults = [];
    allQuestions = [];
    allLessons = [];
    selectedQuestions = [];
}

function goBackToSubjects() {
    // Confirm if user wants to go back
    if (confirm('Go back to subject selection? Current configuration will be lost.')) {
        document.getElementById('quizSetup').classList.remove('active');
        document.getElementById('subjectSetup').classList.add('active');
        
        // Reset filters
        document.getElementById('lessonFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('numQuestions').value = 5;
        document.getElementById('subject').value = '';
        
        // Clear data
        allQuestions = [];
        allLessons = [];
        currentSubject = '';
    }
}

function exitQuiz() {
    // Confirm exit
    if (confirm('Exit current quiz? Your progress will be lost.')) {
        document.getElementById('quiz').classList.remove('active');
        document.getElementById('subjectSetup').classList.add('active');
        
        // Reset everything
        document.getElementById('subject').value = '';
        document.getElementById('lessonFilter').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('numQuestions').value = 5;
        
        // Clear all data
        currentIndex = 0;
        userAnswers = [];
        questionResults = [];
        selectedQuestions = [];
        allQuestions = [];
        allLessons = [];
        currentSubject = '';
    }
}