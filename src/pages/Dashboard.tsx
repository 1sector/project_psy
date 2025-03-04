import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTestStore, TestResult } from '../store/testStore';
import { useClientStore } from '../store/clientStore';
import { usePaymentStore } from '../store/paymentStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { ClipboardList, Users, CreditCard, ArrowRight, Brain } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { tests, results, fetchTests, fetchUserResults } = useTestStore();
  const { clients, fetchClients } = useClientStore();
  const { subscription, fetchSubscription } = usePaymentStore();

  useEffect(() => {
    if (user) {
      fetchTests();
      fetchUserResults(user.id);
      fetchSubscription(user.id);
      
      if (user.role === 'psychologist') {
        fetchClients(user.id);
      }
    }
  }, [user, fetchTests, fetchUserResults, fetchClients, fetchSubscription]);

  // Prepare data for the chart
  const chartData = {
    labels: results.slice(0, 5).map((result: TestResult) => {
      const date = new Date(result.created_at);
      return date.toLocaleDateString();
    }),
    datasets: [
      {
        label: 'Test Scores',
        data: results.slice(0, 5).map((result: TestResult) => result.score),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
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
        text: 'Recent Test Results',
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
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="mt-1 text-gray-600">
          {user?.role === 'psychologist'
            ? 'Manage your clients, create tests, and view results.'
            : 'Take psychological tests and view your results.'}
        </p>
      </div>

      {/* Subscription Banner */}
      {!subscription && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-indigo-800">Upgrade to Premium</h2>
              <p className="mt-1 text-sm text-indigo-600">
                Get access to advanced features, unlimited tests, and detailed analytics.
              </p>
            </div>
            <Link to="/subscription">
              <Button variant="primary">Upgrade Now</Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tests Card */}
        <Card title="Psychological Tests">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-full">
                <ClipboardList className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.role === 'psychologist' ? 'Your Tests' : 'Available Tests'}
                </h3>
                <p className="text-sm text-gray-500">
                  {tests.length} {user?.role === 'psychologist' ? 'created' : 'available'}
                </p>
              </div>
            </div>
            <Link to="/tests">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {tests.slice(0, 3).map((test) => (
              <div key={test.id} className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900">{test.title}</h4>
                    <p className="text-sm text-gray-500 truncate">{test.description}</p>
                  </div>
                  <Link to={`/tests/${test.id}`}>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Results or Clients Card */}
        {user?.role === 'psychologist' ? (
          <Card title="Your Clients">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Client Management</h3>
                  <p className="text-sm text-gray-500">{clients.length} active clients</p>
                </div>
              </div>
              <Link to="/clients">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {clients.slice(0, 3).map((client) => (
                <div key={client.id} className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{client.name}</h4>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                    <Link to={`/clients/${client.id}`}>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <Card title="Your Results">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Brain className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Test Results</h3>
                  <p className="text-sm text-gray-500">{results.length} completed tests</p>
                </div>
              </div>
              <Link to="/results">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {results.slice(0, 3).map((result) => (
                <div key={result.id} className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Test Score: {result.score}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link to={`/results/${result.id}`}>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Subscription Card */}
        <Card title="Subscription">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {subscription ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Free Plan'}
                </h3>
                <p className="text-sm text-gray-500">
                  {subscription
                    ? `Active until ${new Date(subscription.end_date).toLocaleDateString()}`
                    : 'Limited features'}
                </p>
              </div>
            </div>
            <Link to="/subscription">
              <Button variant="outline" size="sm">
                {subscription ? 'Manage' : 'Upgrade'}
              </Button>
            </Link>
          </div>
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {subscription ? 'Unlimited tests' : 'Limited tests (3)'}
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {subscription ? 'Advanced analytics' : 'Basic analytics'}
              </li>
              <li className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {subscription ? 'Priority support' : 'Standard support'}
              </li>
            </ul>
          </div>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Analytics</h2>
        <div className="h-64">
          {results.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No test results available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;