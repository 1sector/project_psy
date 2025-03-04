import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTestStore, Question, Option } from '../store/testStore';
import { usePaymentStore } from '../store/paymentStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';

const TestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentTest, fetchTestById, submitTestResult } = useTestStore();
  const { createPayment } = usePaymentStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTestById(id);
    }
  }, [id, fetchTestById]);

  const handleOptionSelect = (questionId: string, optionId: string, value: number) => {
    setAnswers({
      ...answers,
      [questionId]: optionId
    });
    
    // Update score
    const newScore = Object.entries(answers).reduce((total, [qId, oId]) => {
      if (qId === questionId) return total; // Don't count the previous answer for this question
      
      const question = currentTest?.questions.find(q => q.id === qId);
      const option = question?.options.find(o => o.id === oId);
      return total + (option?.value || 0);
    }, value);
    
    setScore(newScore);
  };

  const handlePurchaseTest = async () => {
    if (!user || !currentTest) return;
    
    setIsPurchasing(true);
    
    try {
      await createPayment({
        user_id: user.id,
        amount: currentTest.price || 0,
        status: 'completed',
        payment_method: 'credit_card',
        description: `Purchase of test: ${currentTest.title}`
      });
      
      setIsPurchased(true);
    } catch (error) {
      console.error('Error purchasing test:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSubmitTest = async () => {
    if (!user || !currentTest) return;
    
    setIsSubmitting(true);
    
    try {
      // Normalize score to 0-100 scale
      const maxPossibleScore = currentTest.questions.reduce((total, q) => {
        const maxOptionValue = Math.max(...q.options.map(o => o.value));
        return total + maxOptionValue;
      }, 0);
      
      const normalizedScore = Math.round((score / maxPossibleScore) * 100);
      
      await submitTestResult({
        test_id: currentTest.id,
        user_id: user.id,
        score: normalizedScore,
        answers
      });
      
      setIsCompleted(true);
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentTest) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Check if the test requires payment and hasn't been purchased
  const needsPurchase = !!currentTest.price && !isPurchased && user?.role === 'client';
  
  // Get current question
  const currentQuestion = currentTest.questions[currentQuestionIndex];
  
  // Check if all questions have been answered
  const allQuestionsAnswered = currentTest.questions.every(q => answers[q.id]);

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Test Completed!</h2>
            <p className="mt-2 text-gray-600">
              Your score: {score} points
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate('/results')}>
                View Your Results
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (needsPurchase) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900">{currentTest.title}</h2>
            <p className="mt-2 text-gray-600">{currentTest.description}</p>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Premium Test</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>This is a premium test that requires payment to access.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-lg font-medium text-gray-900">
                Price: ${currentTest.price}
              </p>
              <div className="mt-4">
                <Button 
                  onClick={handlePurchaseTest}
                  isLoading={isPurchasing}
                >
                  Purchase and Take Test
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/tests')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Tests
        </button>
        
        <div className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {currentTest.questions.length}
        </div>
      </div>
      
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{currentTest.title}</h2>
          <p className="mt-2 text-gray-600">{currentTest.description}</p>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full" 
            style={{ width: `${((currentQuestionIndex + 1) / currentTest.questions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Question */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {currentQuestion.text}
          </h3>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option: Option) => (
              <div 
                key={option.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  answers[currentQuestion.id] === option.id 
                    ? 'bg-indigo-50 border-indigo-500' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => handleOptionSelect(currentQuestion.id, option.id, option.value)}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    answers[currentQuestion.id] === option.id 
                      ? 'border-indigo-500 bg- indigo-500' 
                      : 'border-gray-300'
                  }`}>
                    {answers[currentQuestion.id] === option.id && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="ml-3 text-gray-900">{option.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          
          {currentQuestionIndex < currentTest.questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(currentTest.questions.length - 1, prev + 1))}
              disabled={!answers[currentQuestion.id]}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmitTest}
              isLoading={isSubmitting}
              disabled={!allQuestionsAnswered}
            >
              Submit Test
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TestDetail;