import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

export default function AppRoutes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </RouterRoutes>
  );
}
