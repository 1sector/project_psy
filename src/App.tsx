import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Components
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import CreateTest from './pages/CreateTest';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Results from './pages/Results';
import ResultDetail from './pages/ResultDetail';
import Subscription from './pages/Subscription';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="dashboard" element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          } />
          
          <Route path="tests" element={
            <AuthGuard>
              <Tests />
            </AuthGuard>
          } />
          
          <Route path="tests/:id" element={
            <AuthGuard>
              <TestDetail />
            </AuthGuard>
          } />
          
          <Route path="tests/create" element={
            <AuthGuard allowedRoles={['psychologist']}>
              <CreateTest />
            </AuthGuard>
          } />
          
          <Route path="clients" element={
            <AuthGuard allowedRoles={['psychologist']}>
              <Clients />
            </AuthGuard>
          } />
          
          <Route path="clients/:id" element={
            <AuthGuard allowedRoles={['psychologist']}>
              <ClientDetail />
            </AuthGuard>
          } />
          
          <Route path="results" element={
            <AuthGuard>
              <Results />
            </AuthGuard>
          } />
          
          <Route path="results/:id" element={
            <AuthGuard>
              <ResultDetail />
            </AuthGuard>
          } />
          
          <Route path="subscription" element={
            <AuthGuard>
              <Subscription />
            </AuthGuard>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;