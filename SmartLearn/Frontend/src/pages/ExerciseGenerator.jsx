import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import './ExerciseGenerator.css';

const ExerciseGenerator = () => {
  // Default subjects (fallback if API fails)
  const defaultSubjects = ['Mathematics', 'Algebra', 'Calculus', 'Statistics', 'Trigonometry', 'Geometry'];
  
  // Form state
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [selectedSubject, setSelectedSubject] = useState(defaultSubjects[0]);
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Exercises state (now supports multiple)
  const [exercises, setExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [results, setResults] = useState({});
  const [showSolutions, setShowSolutions] = useState({});

  // Fetch available subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/ai/exercise/subjects');
      const fetchedSubjects = response.data?.subjects || response.data;
      
      if (Array.isArray(fetchedSubjects) && fetchedSubjects.length > 0) {
        setSubjects(fetchedSubjects);
        setSelectedSubject(fetchedSubjects[0]);
      }
      // If API returns empty, keep the default subjects
    } catch (err) {
      console.error('Failed to fetch subjects, using defaults:', err);
      // Keep default subjects that were set in initial state
    }
  };

  const generateExercises = async () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    setLoading(true);
    setError('');
    setExercises([]);
    setCurrentIndex(0);
    setUserAnswers({});
    setResults({});
    setShowSolutions({});

    try {
      const response = await axios.post('/ai/exercise/generate', {
        subject: selectedSubject,
        difficulty: difficulty,
        count: questionCount
      });

      if (response.data.exercises && response.data.exercises.length > 0) {
        setExercises(response.data.exercises);
      } else if (response.data.exercise) {
        // Legacy single exercise response
        setExercises([response.data.exercise]);
      } else {
        setError('No exercises were generated. Please try again.');
      }
    } catch (err) {
      console.error('Failed to generate exercises:', err);
      setError(err.response?.data?.error || 'Failed to generate exercises. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (exerciseId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [exerciseId]: answer
    }));
  };

  const checkAnswer = async (exercise) => {
    const userAnswer = userAnswers[exercise.id] || '';
    if (!userAnswer.trim()) {
      setError('Please enter your answer');
      return;
    }

    setError('');

    try {
      const response = await axios.post('/ai/exercise/check', {
        expected: exercise.answer,
        student: userAnswer.trim()
      });

      setResults(prev => ({
        ...prev,
        [exercise.id]: {
          correct: response.data.correct,
          feedback: response.data.correct ? 'Excellent work! 🎉' : 'Not quite right. Check the solution below.'
        }
      }));

      if (!response.data.correct) {
        setShowSolutions(prev => ({ ...prev, [exercise.id]: true }));
      }
    } catch (err) {
      // Fallback to local comparison
      const isCorrect = exercise.answer.toLowerCase().trim() === userAnswer.toLowerCase().trim();
      
      setResults(prev => ({
        ...prev,
        [exercise.id]: {
          correct: isCorrect,
          feedback: isCorrect ? 'Excellent work! 🎉' : 'Not quite right. Check the solution below.'
        }
      }));

      if (!isCorrect) {
        setShowSolutions(prev => ({ ...prev, [exercise.id]: true }));
      }
    }
  };

  const toggleSolution = (exerciseId) => {
    setShowSolutions(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const navigateExercise = (direction) => {
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'next' && currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const resetAll = () => {
    setExercises([]);
    setCurrentIndex(0);
    setUserAnswers({});
    setResults({});
    setShowSolutions({});
    setError('');
  };

  const getCompletionStats = () => {
    const total = exercises.length;
    const answered = Object.keys(results).length;
    const correct = Object.values(results).filter(r => r.correct).length;
    return { total, answered, correct };
  };

  const currentExercise = exercises[currentIndex];
  const stats = getCompletionStats();

  return (
    <div className="exercise-generator">
      <div className="exercise-header">
        <h1>📚 Exercise Generator</h1>
        <p>Practice with AI-generated exercises tailored to your learning needs</p>
      </div>

      {/* Exercise Generation Form */}
      <div className="generation-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={loading}
            >
              {subjects.map((subject, index) => (
                <option key={index} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={loading}
            >
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="count">Questions</label>
            <select
              id="count"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              disabled={loading}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n} question{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <button
            className="generate-btn"
            onClick={generateExercises}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>🎲 Generate</>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Progress Bar (when multiple exercises) */}
      {exercises.length > 1 && (
        <div className="progress-section">
          <div className="progress-stats">
            <span>Progress: {stats.answered}/{stats.total}</span>
            <span>Correct: {stats.correct}/{stats.answered || 1}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${(stats.answered / stats.total) * 100}%` }}
            />
          </div>
          <div className="exercise-dots">
            {exercises.map((_, idx) => (
              <button
                key={idx}
                className={`dot ${idx === currentIndex ? 'active' : ''} ${results[exercises[idx]?.id]?.correct ? 'correct' : results[exercises[idx]?.id] ? 'incorrect' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current Exercise Display */}
      {currentExercise && (
        <div className="exercise-container">
          {/* Navigation for multiple exercises */}
          {exercises.length > 1 && (
            <div className="exercise-nav">
              <button 
                onClick={() => navigateExercise('prev')}
                disabled={currentIndex === 0}
                className="nav-btn"
              >
                ← Previous
              </button>
              <span className="exercise-counter">
                Question {currentIndex + 1} of {exercises.length}
              </span>
              <button 
                onClick={() => navigateExercise('next')}
                disabled={currentIndex === exercises.length - 1}
                className="nav-btn"
              >
                Next →
              </button>
            </div>
          )}

          {/* Question Card */}
          <div className="question-card">
            <div className="question-header">
              <span className="question-label">📝 Question {currentExercise.id || currentIndex + 1}</span>
              <span className={`difficulty-badge ${difficulty}`}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            </div>
            <div className="question-content">
              {currentExercise.question}
            </div>
          </div>

          {/* Answer Input Section */}
          <div className="answer-section">
            <label htmlFor="userAnswer">✍️ Your Answer</label>
            <textarea
              id="userAnswer"
              className="answer-input"
              value={userAnswers[currentExercise.id] || ''}
              onChange={(e) => handleAnswerChange(currentExercise.id, e.target.value)}
              placeholder="Type your answer here..."
              rows={3}
              disabled={results[currentExercise.id]?.correct}
            />

            <div className="answer-actions">
              <button
                className="submit-btn"
                onClick={() => checkAnswer(currentExercise)}
                disabled={!userAnswers[currentExercise.id]?.trim() || results[currentExercise.id]?.correct}
              >
                ✅ Check Answer
              </button>

              <button 
                className="solution-btn"
                onClick={() => toggleSolution(currentExercise.id)}
              >
                {showSolutions[currentExercise.id] ? '🙈 Hide Solution' : '👁️ Show Solution'}
              </button>

              {exercises.length > 1 && currentIndex < exercises.length - 1 && (
                <button 
                  className="next-btn"
                  onClick={() => navigateExercise('next')}
                >
                  Next Question →
                </button>
              )}
            </div>
          </div>

          {/* Answer Result */}
          {results[currentExercise.id] && (
            <div className={`result-card ${results[currentExercise.id].correct ? 'correct' : 'incorrect'}`}>
              <span className="result-icon">
                {results[currentExercise.id].correct ? '🎉' : '❌'}
              </span>
              <span className="result-text">
                {results[currentExercise.id].feedback}
              </span>
            </div>
          )}

          {/* Solution Section */}
          {showSolutions[currentExercise.id] && (
            <div className="solution-section">
              <h3>📖 Solution</h3>
              
              <div className="correct-answer-box">
                <span className="label">Answer:</span>
                <span className="answer-value">{currentExercise.answer}</span>
              </div>

              {currentExercise.solution && (
                <div className="solution-steps">
                  <h4>Step-by-Step:</h4>
                  <div className="steps-content">
                    {currentExercise.solution.split('\n').map((step, idx) => (
                      <div key={idx} className="step-item">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary (when all answered) */}
      {exercises.length > 0 && stats.answered === stats.total && (
        <div className="summary-card">
          <h3>🏆 Session Complete!</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-value">{stats.correct}</span>
              <span className="stat-label">Correct</span>
            </div>
            <div className="stat">
              <span className="stat-value">{stats.total - stats.correct}</span>
              <span className="stat-label">Incorrect</span>
            </div>
            <div className="stat">
              <span className="stat-value">{Math.round((stats.correct / stats.total) * 100)}%</span>
              <span className="stat-label">Score</span>
            </div>
          </div>
          <button className="generate-btn" onClick={resetAll}>
            🔄 Start New Session
          </button>
        </div>
      )}

      {/* Empty State */}
      {exercises.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>Ready to Practice?</h3>
          <p>Select subject, difficulty, and number of questions, then click "Generate" to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ExerciseGenerator;