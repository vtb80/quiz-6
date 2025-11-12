/**
 * Application Configuration
 * All constants and settings in one place
 */

export const CONFIG = {
  // Available subjects to scan for
  POSSIBLE_SUBJECTS: [
    'sample',
    'science',
    'khoa_hoc_tu_nhien',
    'lich_su_dia_li',
    'cong_nghe',
    'tin_hoc',
    'giao_duc_cong_dan'
  ],

  // Subject display names
  SUBJECT_ALIASES: {
    'sample': 'Sample Questions',
    'science': 'Science',
    'khoa_hoc_tu_nhien': 'Khoa Học Tự Nhiên',
    'cong_nghe': 'Công Nghệ',
    'giao_duc_cong_dan': 'Giáo Dục Công Dân',
    'lich_su_dia_li': 'Lịch Sử Địa Lí',
    'tin_hoc': 'Tin Học'
  },

  // Question type display names
  QUESTION_TYPE_NAMES: {
    'multiple_choice': 'Multiple Choice',
    'true_false': 'True/False',
    'fill_in_blank': 'Fill in the Blank',
    'matching': 'Matching',
    'reordering': 'Reordering',
    'reading_comprehension': 'Reading Comprehension'
  },

  // Default settings
  DEFAULTS: {
    NUM_QUESTIONS: 5,
    MIN_QUESTIONS: 1,
    MAX_QUESTIONS: 100
  }
};

/**
 * Get formatted subject name
 */
export function getSubjectDisplayName(subjectKey) {
  return CONFIG.SUBJECT_ALIASES[subjectKey] || 
         subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1).replace(/_/g, ' ');
}

/**
 * Get formatted question type name
 */
export function getQuestionTypeName(typeKey) {
  return CONFIG.QUESTION_TYPE_NAMES[typeKey] || typeKey;
}