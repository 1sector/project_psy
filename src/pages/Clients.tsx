import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useClientStore, Client } from '../store/clientStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus, Search, User, ArrowRight } from 'lucide-react';

const Clients: React.FC = () => {
  const { user } = useAuthStore();
  const { clients, fetchClients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && user.role === 'psychologist') {
      fetchClients(user.id);
    }
  }, [fetchClients, user]);

  const filteredClients = clients.filter((client: Client) => {
    return client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           client.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Clients</h1>
            <p className="mt-1 text-gray-600">
              Manage your client list and their records.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link to="/clients/add">
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Add New Client
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredClients.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredClients.map((client: Client) => (
              <div key={client.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{client.name}</h3>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </div>
                  <Link to={`/clients/${client.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No clients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? 'No clients match your search criteria.'
                : 'You haven\'t added any clients yet.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link to="/clients/add">
                  <Button>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Client
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

export default Clients;