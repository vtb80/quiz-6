/**
 * Quiz State Management
 * Single source of truth for all application state
 */

class QuizState {
  constructor() {
    this.reset();
  }

  reset() {
    this.allQuestions = [];
    this.allLessons = [];
    this.selectedQuestions = [];
    this.currentIndex = 0;
    this.userAnswers = [];
    this.questionResults = [];
    this.currentSubject = '';
  }

  /**
   * Load subject data
   */
  loadSubject(subjectName, data) {
    this.currentSubject = subjectName;
    this.allQuestions = data.questions || [];
    this.allLessons = data.lessons || [];
  }

  /**
   * Start a new quiz with selected questions
   */
  startQuiz(questions) {
    this.selectedQuestions = questions;
    this.currentIndex = 0;
    this.userAnswers = new Array(questions.length).fill(null);
    this.questionResults = new Array(questions.length).fill(null);
  }

  /**
   * Get current question
   */
  getCurrentQuestion() {
    return this.selectedQuestions[this.currentIndex];
  }

  /**
   * Save user's answer for current question
   */
  saveAnswer(answer) {
    this.userAnswers[this.currentIndex] = answer;
  }

  /**
   * Get user's answer for current question
   */
  getCurrentAnswer() {
    return this.userAnswers[this.currentIndex];
  }

  /**
   * Save result for current question
   */
  saveResult(question, answer, isCorrect) {
    this.questionResults[this.currentIndex] = {
      question,
      answer,
      isCorrect
    };
  }

  /**
   * Move to next question
   */
  nextQuestion() {
    if (!this.isLastQuestion()) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  /**
   * Check if current question is the last one
   */
  isLastQuestion() {
    return this.currentIndex === this.selectedQuestions.length - 1;
  }

  /**
   * Get quiz progress
   */
  getProgress() {
    return {
      current: this.currentIndex + 1,
      total: this.selectedQuestions.length
    };
  }

  /**
   * Calculate score
   */
  calculateScore() {
    const correct = this.questionResults.filter(r => r && r.isCorrect).length;
    const total = this.selectedQuestions.length;
    const percentage = Math.round((correct / total) * 100);
    
    return {
      correct,
      total,
      percentage
    };
  }

  /**
   * Get incorrect questions
   */
  getIncorrectQuestions() {
    return this.questionResults.filter(r => r && !r.isCorrect);
  }

  /**
   * Get lesson by ID
   */
  getLessonById(lessonId) {
    if (!lessonId) return null;
    return this.allLessons.find(l => l.id === lessonId);
  }
}

// Export singleton instance
export const state = new QuizState();