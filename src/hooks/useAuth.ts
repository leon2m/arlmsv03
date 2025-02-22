import { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    id: 'mock-user-id',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test Kullanıcı'
    }
  });
  const [requiredSurveyPending, setRequiredSurveyPending] = useState(false);

  return { user, loading, requiredSurveyPending };
}