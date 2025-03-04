import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTestStore, TestResult } from '../store/testStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { ArrowLeft, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const ResultDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { results, currentTest, fetchTestById } = useTestStore();
  
  // Find the current result
  const result = results.find((r: TestResult) => r.id === id);
  
  useEffect(() => {
    if (result?.test_id) {
      fetchTestById(result.test_id);
    }
  }, [result, fetchTestById]);
  
  if (!result) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Prepare chart data
  const chartData = {
    labels: ['Score', 'Remaining'],
    datasets: [
      {
        data: [result.score, 100 - result.score],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(229, 231, 235, 0.5)',
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(229, 231, 235)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  
  // Determine result category
  const getResultCategory = () => {
    if (result.score >= 80) {
      return {
        icon: <CheckCircle className="h-8 w-8 text-green-500" />,
        label: 'Excellent',
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
      };
    } else if (result.score >= 60) {
      return {
        icon: <CheckCircle className="h-8 w-8 text-blue-500" />,
        label: 'Good',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
      };
    } else if (result.score >= 40) {
      return {
        icon: <HelpCircle className="h-8 w-8 text-yellow-500" />,
        label: 'Average',
        color: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
      };
    } else {
      return {
        icon: <AlertCircle className="h-8 w-8 text-red-500" />,
        label: 'Needs Improvement',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
      };
    }
  };
  
  const category = getResultCategory();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/results')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Results
        </button>
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Test Result</h1>
            <p className="mt-1 text-gray-600">
              {currentTest?.title || 'Psychological Test'}
            </p>
            <p className="text-sm text-gray-500">
              Taken on {new Date(result.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to={`/tests/${result.test_id}`}>
              <Button variant="outline">
                Take Test Again
              </Button>
            </Link>
          </div>
        </div>
      </Card>
      
      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-1">
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <Doughnut data={chartData} options={chartOptions} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-bold text-gray-900">{result.score}</span>
                  <span className="text-lg text-gray-500">/100</span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">Your Score</p>
            </div>
          </div>
        </Card>
        
        <Card className="md:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Result Analysis</h2>
          
          <div className={`p-4 rounded-lg ${category.bg} ${category.border} border mb-4 flex items-start`}>
            <div className="mr-3 mt-1">
              {category.icon}
            </div>
            <div>
              <h3 className={`font-medium ${category.color}`}>{category.label}</h3>
              <p className="text-gray-600 mt-1">{result.analysis}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Strengths</h3>
              <p className="text-gray-600 mt-1">
                {result.score >= 70 
                  ? 'Your results show excellent psychological well-being and coping mechanisms.'
                  : result.score >= 50
                  ? 'You demonstrate good awareness of your emotions and psychological needs.'
                  : 'You have potential for growth and self-improvement.'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Areas for Improvement</h3>
              <p className="text-gray-600 mt-1">
                {result.score >= 70 
                  ? 'Continue maintaining your mental health practices.'
                  : result.score >= 50
                  ? 'Consider developing additional coping strategies for stress management.'
                  : 'Regular consultation with a mental health professional is recommended.'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Recommendations</h3>
              <ul className="list-disc list-inside text-gray-600 mt-1">
                <li>Regular self-assessment and reflection</li>
                <li>Maintain a healthy work-life balance</li>
                <li>Practice mindfulness and stress-reduction techniques</li>
                {result.score < 60 && (
                  <li>Consider scheduling a session with a psychologist for personalized guidance</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Detailed Breakdown */}
      <Card title="Detailed Breakdown">
        <p className="text-gray-600 mb-4">
          This section provides a detailed analysis of your responses to each question.
        </p>
        
        {currentTest?.questions.map((question, index) => {
          const answerId = result.answers[question.id];
          const selectedOption = question.options.find(o => o.id === answerId);
          
          return (
            <div key={question.id} className="border-t pt-4 pb-4">
              <p className="font-medium text-gray-900">Question {index + 1}: {question.text}</p>
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Your answer: <span className="font-medium">{selectedOption?.text || 'Not answered'}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Score: <span className="font-medium">{selectedOption?.value || 0} points</span>
                </p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

export default ResultDetail;