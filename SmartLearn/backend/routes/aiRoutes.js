const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { aiClient, AIServiceError, AI_SERVICES } = require("../utils/aiServiceClient");

const router = express.Router();

// =====================================================
// Exercise Generation
// =====================================================

/**
 * @route   POST /api/ai/generate-exercise
 * @desc    Generate exercise using Python RAG service
 * @access  Protected
 */
router.post("/generate-exercise", protect, async (req, res) => {
  try {
    const { subject, difficulty, exerciseType, additionalContext } = req.body;

    if (!subject) {
      return res.status(400).json({ message: "Subject is required" });
    }

    console.log(`📝 Generating exercise: ${subject} (${difficulty}, ${exerciseType})`);

    const result = await aiClient.generateExercise(
      subject,
      difficulty || "medium",
      exerciseType || "multiple-choice",
      additionalContext || ""
    );

    console.log(`✅ Exercise generated successfully`);

    res.json({
      success: true,
      exercise: result.exercise,
      retrievedDocs: result.retrievedDocs || 0,
    });
  } catch (error) {
    console.error("❌ Exercise generation error:", error.message);
    handleAIError(res, error);
  }
});

/**
 * @route   GET /api/ai/subjects
 * @desc    Get available subjects from exercise database
 * @access  Protected
 */
router.get("/subjects", protect, async (req, res) => {
  try {
    const result = await aiClient.getSubjects();
    res.json({ success: true, subjects: result.subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error.message);
    res.status(500).json({ message: "Failed to fetch subjects", subjects: [] });
  }
});

/**
 * @route   POST /api/ai/exercise/generate
 * @desc    Generate one or more exercises (supports count parameter)
 * @access  Protected
 */
router.post("/exercise/generate", protect, async (req, res) => {
  try {
    const { subject, difficulty, topic, count } = req.body;

    if (!subject && !topic) {
      return res.status(400).json({ message: "Subject or topic is required" });
    }

    const questionCount = Math.min(Math.max(parseInt(count) || 1, 1), 10);
    console.log(`📝 Generating ${questionCount} exercise(s): ${subject || topic} (${difficulty})`);

    // Call the new /generate endpoint with count
    const result = await aiClient.request('exercise', '/generate', 'POST', {
      subject: subject || topic,
      difficulty: difficulty || "medium",
      count: questionCount
    });

    console.log(`✅ Generated ${result.total || 1} exercise(s) successfully`);

    // Return exercises array (new format)
    res.json({
      success: true,
      exercises: result.exercises || [result.exercise],
      total: result.total || 1,
      subject: result.subject || subject || topic,
      difficulty: result.difficulty || difficulty || "medium"
    });
  } catch (error) {
    console.error("❌ Exercise generation error:", error.message);
    
    // Fallback to legacy endpoint if new one fails
    try {
      const { subject, difficulty, topic } = req.body;
      const result = await aiClient.generateExercise(
        subject || topic,
        difficulty || "medium",
        "problem-solving",
        ""
      );
      
      res.json({
        success: true,
        exercises: result.exercise ? [result.exercise] : [],
        total: 1,
        subject: subject || topic,
        difficulty: difficulty || "medium"
      });
    } catch (fallbackError) {
      handleAIError(res, error);
    }
  }
});

/**
 * @route   GET /api/ai/exercise/subjects
 * @desc    Get available subjects (alternate route)
 * @access  Protected
 */
router.get("/exercise/subjects", protect, async (req, res) => {
  const defaultSubjects = ['Mathematics', 'Algebra', 'Calculus', 'Statistics', 'Trigonometry', 'Geometry'];
  
  try {
    const result = await aiClient.getSubjects();
    const subjects = result?.subjects || result || defaultSubjects;
    res.json({ success: true, subjects: Array.isArray(subjects) ? subjects : defaultSubjects });
  } catch (error) {
    console.error("Error fetching subjects from AI service, using defaults:", error.message);
    // Return 200 with default subjects instead of 500 error
    res.json({ 
      success: true, 
      subjects: defaultSubjects,
      fromCache: true
    });
  }
});

/**
 * @route   POST /api/ai/exercise/check
 * @desc    Check user's answer against correct answer
 * @access  Protected
 */
router.post("/exercise/check", protect, async (req, res) => {
  try {
    // Support both old and new format
    const { exercise, userAnswer, correctAnswer, expected, student } = req.body;
    
    const studentAnswer = student || userAnswer;
    const expectedAnswer = expected || correctAnswer || exercise?.answer;

    if (!studentAnswer) {
      return res.status(400).json({ message: "Student answer is required" });
    }

    console.log(`🔍 Checking answer...`);

    // Try to use the new Python check-answer endpoint first
    try {
      const result = await aiClient.request('exercise', '/check-answer', 'POST', {
        expected: expectedAnswer || '',
        student: studentAnswer
      });

      return res.json({
        success: true,
        correct: result.correct,
        expected: result.expected,
        student: result.student,
        feedback: result.correct ? 'Correct! 🎉' : 'Not quite right.'
      });
    } catch (checkError) {
      console.log('Python check failed, using AI fallback');
    }

    // Fallback: Use AI to check the answer
    try {
      const checkPrompt = `
        Question: ${exercise?.question || 'Unknown question'}
        Correct Answer: ${expectedAnswer || 'Unknown'}
        User's Answer: ${studentAnswer}
        
        Evaluate if the user's answer is correct. Consider:
        1. Is the answer mathematically/logically equivalent?
        2. Is the reasoning sound?
        
        Respond with JSON:
        {
          "correct": true/false,
          "feedback": "explanation",
          "steps": ["step 1", "step 2", ...]
        }
      `;

      const chatResult = await aiClient.chat(checkPrompt, null, []);
      
      // Try to parse AI response as JSON
      let parsed;
      try {
        const jsonMatch = chatResult.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // If parsing fails, do simple comparison
      }

      if (parsed) {
        return res.json({
          success: true,
          correct: parsed.correct,
          feedback: parsed.feedback,
          steps: parsed.steps || exercise?.solution_steps || []
        });
      }
    } catch (aiError) {
      console.log('AI check failed, using simple comparison');
    }

    // Fallback: Simple string comparison
    const correct = String(expectedAnswer || '')
      .toLowerCase().trim() === String(studentAnswer).toLowerCase().trim();

    res.json({
      success: true,
      correct,
      feedback: correct ? 
        'Your answer is correct! Well done!' : 
        'Your answer is not quite right. Review the solution below.',
      steps: exercise?.solution_steps || []
    });
  } catch (error) {
    console.error("❌ Answer check error:", error.message);
    res.status(500).json({ message: "Failed to check answer" });
  }
});

// =====================================================
// AI Chatbot
// =====================================================

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI tutor using RAG
 * @access  Protected
 */
router.post("/chat", protect, async (req, res) => {
  try {
    const { message, sessionId, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    console.log(`💬 Chat request: "${message.substring(0, 50)}..."`);

    const result = await aiClient.chat(message, sessionId, history || []);

    console.log(`✅ Chat response generated`);

    res.json({
      success: true,
      response: result.response,
      sources: result.sources || [],
    });
  } catch (error) {
    console.error("❌ Chat error:", error.message);
    handleAIError(res, error);
  }
});

/**
 * @route   POST /api/ai/search
 * @desc    Search knowledge base for relevant content
 * @access  Protected
 */
router.post("/search", protect, async (req, res) => {
  try {
    const { query, k } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    const result = await aiClient.search(query, k || 5);

    res.json({
      success: true,
      results: result.results,
      count: result.count,
    });
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ message: "Search failed" });
  }
});

// =====================================================
// Sentiment Analysis
// =====================================================

/**
 * @route   POST /api/ai/analyze-sentiment
 * @desc    Analyze sentiment of course review
 * @access  Protected
 */
router.post("/analyze-sentiment", protect, async (req, res) => {
  try {
    const { text, reviews } = req.body;

    if (!text && !reviews) {
      return res.status(400).json({ message: "Text or reviews array is required" });
    }

    console.log(`🎭 Analyzing sentiment...`);

    let result;
    if (text) {
      result = await aiClient.analyzeSentiment(text);
    } else {
      result = await aiClient.batchAnalyzeSentiment(reviews);
    }

    console.log(`✅ Sentiment analyzed successfully`);

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("❌ Sentiment analysis error:", error.message);
    handleAIError(res, error);
  }
});

/**
 * @route   POST /api/ai/batch-sentiment
 * @desc    Analyze multiple reviews with statistics
 * @access  Protected
 */
router.post("/batch-sentiment", protect, async (req, res) => {
  try {
    const { reviews } = req.body;

    if (!reviews || !Array.isArray(reviews)) {
      return res.status(400).json({ message: "Reviews array is required" });
    }

    console.log(`🎭 Batch analyzing ${reviews.length} reviews...`);

    const result = await aiClient.batchAnalyzeSentiment(reviews);

    console.log(`✅ Batch sentiment analyzed successfully`);

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("❌ Batch sentiment analysis error:", error.message);
    handleAIError(res, error);
  }
});

// =====================================================
// Health Check
// =====================================================

/**
 * @route   GET /api/ai/services-health
 * @desc    Check health of Python AI services
 * @access  Protected
 */
router.get("/services-health", protect, async (req, res) => {
  try {
    const health = await aiClient.checkHealth();
    res.status(health.overall === "healthy" ? 200 : 503).json(health);
  } catch (error) {
    res.status(500).json({
      overall: "error",
      message: "Health check failed",
      error: error.message,
    });
  }
});

// =====================================================
// Error Handler Helper
// =====================================================

function handleAIError(res, error) {
  if (error instanceof AIServiceError) {
    return res.status(error.statusCode).json({ message: error.message, code: error.code });
  }

  res.status(500).json({ message: error.message || "AI service error" });
}

module.exports = router;
