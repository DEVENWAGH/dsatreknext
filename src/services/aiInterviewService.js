class AIInterviewService {
  constructor() {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.conversation = [];
  }

  async generateResponse(userInput, context) {
    try {
      const response = await fetch('/api/ai-interview-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput,
          context,
          currentQuestion: this.getCurrentQuestion(),
          questionIndex: this.currentQuestionIndex
        })
      });

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI response generation failed:', error);
      return "I'm sorry, could you please repeat that?";
    }
  }

  setQuestions(questions) {
    this.questions = questions;
    this.currentQuestionIndex = 0;
  }

  getCurrentQuestion() {
    return this.questions[this.currentQuestionIndex] || null;
  }

  moveToNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      return true;
    }
    return false;
  }

  getProgress() {
    return {
      current: this.currentQuestionIndex + 1,
      total: this.questions.length,
      percentage: Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100)
    };
  }

  isInterviewComplete() {
    return this.currentQuestionIndex >= this.questions.length - 1;
  }

  reset() {
    this.currentQuestionIndex = 0;
    this.conversation = [];
  }
}

export default new AIInterviewService();