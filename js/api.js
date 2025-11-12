/**
 * API Module - Data Loading
 * Handles fetching JSON files
 */

import { CONFIG } from './config.js';

/**
 * Discover available subjects by trying to fetch JSON files
 * @returns {Promise<string[]>} Array of available subject names
 */
export async function loadAvailableSubjects() {
  const availableSubjects = [];
  
  for (const subject of CONFIG.POSSIBLE_SUBJECTS) {
    try {
      const response = await fetch(`questions/questions-${subject}.json`);
      if (response.ok) {
        availableSubjects.push(subject);
      }
    } catch (error) {
      // Subject file doesn't exist, skip
      console.debug(`Subject '${subject}' not found`);
    }
  }
  
  return availableSubjects;
}

/**
 * Load subject data from JSON file
 * @param {string} subjectName - Subject name (e.g., 'sample', 'science')
 * @returns {Promise<Object>} Subject data with lessons and questions
 */
export async function loadSubjectData(subjectName) {
  try {
    const response = await fetch(`questions/questions-${subjectName}.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to load subject: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate structure
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid data format: missing questions array');
    }
    
    // Ensure lessons array exists
    if (!data.lessons) {
      data.lessons = [];
    }
    
    return data;
    
  } catch (error) {
    console.error('Error loading subject data:', error);
    throw error;
  }
}