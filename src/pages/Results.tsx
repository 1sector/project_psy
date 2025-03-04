import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTestStore, TestResult } from '../store/testStore';
import Card from '../components/Card';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Results: React.FC = () => {
  const { user } = useAuthStore();
  const { results, fetchUserResults } = useTestStore();

  useEffect(() => {
    if (user) {
      fetchUserResults(user.id);
    }
  }, [user, fetchUserResults]);

  // Prepare data for the chart
  const sortedResults = [...results].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  const chartData = {
    labels: sortedResults.map((result) => {
      const date = new Date(result.created_at);
      return date.toLocaleDateString();
    }),
    datasets: [
      {
        label: 'Test Scores',
        data: sortedResults.map((result) => result.score),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Your Test Score Progress',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Test Results</h1>
        <p className="mt-1 text-gray-600">
          View and analyze your psychological test results.
        </p>
      </div>

      {/* Progress Chart */}
      {results.length > 0 && (
        <Card className="p-4">
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Card>
      )}

      {/* Results List */}
      <Card title="All Results">
        {results.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {results.map((result: TestResult) => (
              <div key={result.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <ClipboardList className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Score: {result.score}/100
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Link to={`/results/${result.id}`} className="flex items-center text-indigo-600 hover:text-indigo-900">
                    View Details
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No results yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't taken any tests yet.
            </p>
            <div className="mt-6">
              <Link
                to="/tests"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Take a Test
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Results;