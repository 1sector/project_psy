import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTestStore, Test } from '../store/testStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus, Search, Filter, ArrowRight } from 'lucide-react';

const Tests: React.FC = () => {
  const { user } = useAuthStore();
  const { tests, userTests, fetchTests, fetchUserTests } = useTestStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    fetchTests();
    if (user && user.role === 'psychologist') {
      fetchUserTests(user.id);
    }
  }, [fetchTests, fetchUserTests, user]);

  const displayTests = user?.role === 'psychologist' ? userTests : tests;

  const filteredTests = displayTests.filter((test: Test) => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          test.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'free') return matchesSearch && !test.price;
    if (filter === 'paid') return matchesSearch && !!test.price;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'psychologist' ? 'Your Tests' : 'Available Tests'}
            </h1>
            <p className="mt-1 text-gray-600">
              {user?.role === 'psychologist'
                ? 'Create and manage psychological tests for your clients.'
                : 'Browse and take psychological tests.'}
            </p>
          </div>
          {user?.role === 'psychologist' && (
            <div className="mt-4 md:mt-0">
              <Link to="/tests/create">
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Test
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <div className="relative flex-grow mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'free' | 'paid')}
            >
              <option value="all">All Tests</option>
              <option value="free">Free Tests</option>
              <option value="paid">Premium Tests</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTests.length > 0 ? (
          filteredTests.map((test: Test) => (
            <Card key={test.id} className="h-full flex flex-col">
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-gray-900">{test.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{test.description}</p>
                <div className="mt-4 flex items-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    test.price ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {test.price ? `Premium - $${test.price}` : 'Free'}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {test.questions.length} questions
                  </span>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Link to={`/tests/${test.id}`}>
                  <Button variant="outline" size="sm">
                    {user?.role === 'psychologist' ? 'Edit' : 'Take Test'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">
              {searchTerm
                ? 'No tests match your search criteria.'
                : user?.role === 'psychologist'
                ? 'You haven\'t created any tests yet.'
                : 'No tests available at the moment.'}
            </p>
            {user?.role === 'psychologist' && (
              <div className="mt-4">
                <Link to="/tests/create">
                  <Button>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Test
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tests;