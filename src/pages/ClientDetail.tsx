import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';
import { useClientStore, Session } from '../store/clientStore';
import { useTestStore } from '../store/testStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { ArrowLeft, Calendar, ClipboardList, Plus, Edit, Trash2 } from 'lucide-react';

interface SessionFormData {
  date: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface ClientNotesFormData {
  notes: string;
}

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentClient, sessions, fetchClientById, fetchClientSessions, updateClient, addSession, updateSession, deleteSession } = useClientStore();
  const { results, fetchUserResults } = useTestStore();
  
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  
  const sessionForm = useForm<SessionFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'scheduled'
    }
  });
  
  const notesForm = useForm<ClientNotesFormData>();
  
  useEffect(() => {
    if (id) {
      fetchClientById(id);
      fetchClientSessions(id);
      
      // Fetch test results for this client
      if (currentClient?.user_id) {
        fetchUserResults(currentClient.user_id);
      }
    }
  }, [id, fetchClientById, fetchClientSessions, fetchUserResults, currentClient?.user_id]);
  
  useEffect(() => {
    if (currentClient) {
      notesForm.setValue('notes', currentClient.notes || '');
    }
  }, [currentClient, notesForm]);
  
  const handleAddSession = async (data: SessionFormData) => {
    if (!id) return;
    
    try {
      await addSession({
        client_id: id,
        date: data.date,
        notes: data.notes,
        status: data.status
      });
      
      setIsAddingSession(false);
      sessionForm.reset();
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };
  
  const handleEditSession = async (data: SessionFormData) => {
    if (!editingSessionId) return;
    
    try {
      await updateSession(editingSessionId, {
        date: data.date,
        notes: data.notes,
        status: data.status
      });
      
      setEditingSessionId(null);
      sessionForm.reset();
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };
  
  const startEditingSession = (session: Session) => {
    sessionForm.setValue('date', session.date);
    sessionForm.setValue('notes', session.notes);
    sessionForm.setValue('status', session.status);
    setEditingSessionId(session.id);
  };
  
  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };
  
  const handleUpdateNotes = async (data: ClientNotesFormData) => {
    if (!currentClient || !id) return;
    
    try {
      await updateClient(id, {
        notes: data.notes
      });
      
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  if (!currentClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/clients')}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Clients
        </button>
      </div>
      
      {/* Client Info */}
      <Card className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentClient.name}</h1>
            <p className="text-gray-600">{currentClient.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/clients/edit/${id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
        </div>
      </Card>
      
      {/* Client Notes */}
      <Card className="mb-6" title="Client Notes">
        {isEditingNotes ? (
          <form onSubmit={notesForm.handleSubmit(handleUpdateNotes)}>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={6}
              {...notesForm.register('notes')}
            ></textarea>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditingNotes(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Notes</Button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-gray-700 whitespace-pre-wrap">
              {currentClient.notes || 'No notes available.'}
            </p>
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingNotes(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Notes
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Sessions */}
      <Card className="mb-6" title="Sessions">
        {isAddingSession || editingSessionId ? (
          <form onSubmit={
            editingSessionId 
              ? sessionForm.handleSubmit(handleEditSession)
              : sessionForm.handleSubmit(handleAddSession)
          }>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  {...sessionForm.register('date', { required: true })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  {...sessionForm.register('status', { required: true })}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={4}
                  {...sessionForm.register('notes')}
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddingSession(false);
                  setEditingSessionId(null);
                  sessionForm.reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingSessionId ? 'Update Session' : 'Add Session'}
              </Button>
            </div>
          </form>
        ) : (
          <div>
            {sessions.length > 0 ? (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border-t pt-4">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(session.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            Status: <span className={`font-medium ${
                              session.status === 'completed' ? 'text-green-600' :
                              session.status === 'cancelled' ? 'text-red-600' :
                              'text-yellow-600'
                            }`}>
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditingSession(session)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    {session.notes && (
                      <div className="mt-2 pl-7">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No sessions recorded yet.</p>
            )}
            
            <div className="mt-6">
              <Button
                onClick={() => setIsAddingSession(true)}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Session
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Test Results */}
      <Card title="Test Results">
        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <ClipboardList className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Score: {result.score}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(result.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/results/${result.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No test results available for this client.</p>
        )}
      </Card>
    </div>
  );
};

export default ClientDetail;