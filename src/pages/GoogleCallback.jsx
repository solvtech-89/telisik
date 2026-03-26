import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE } from '../config';

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      fetch(`${API_BASE}/api/auth/social/google/callback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.access_token) {
            localStorage.setItem('token', data.access_token);
          }
          navigate('/');
        })
        .catch(err => {
          console.error('Auth error:', err);
          navigate('/login?error=auth_failed');
        });
    }
  }, [searchParams, navigate]);

  return <div>Authenticating...</div>;
}