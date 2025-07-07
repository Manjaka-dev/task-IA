'use client';

import { useState, useEffect } from 'react';

export default function DebugSupabase() {
  const [debug, setDebug] = useState({
    url: '',
    key: '',
    error: null as string | null,
    connection: 'En cours...'
  });

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    setDebug(prev => ({
      ...prev,
      url: url || 'UNDEFINED',
      key: key ? key.substring(0, 20) + '...' : 'UNDEFINED'
    }));

    // Test de connexion simple
    if (url && key) {
      fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      })
      .then(response => {
        if (response.ok) {
          setDebug(prev => ({ ...prev, connection: '✅ Connexion OK' }));
        } else {
          setDebug(prev => ({ 
            ...prev, 
            connection: `❌ Erreur ${response.status}`,
            error: `Status: ${response.status} ${response.statusText}`
          }));
        }
      })
      .catch(err => {
        setDebug(prev => ({ 
          ...prev, 
          connection: '❌ Erreur réseau',
          error: err.message
        }));
      });
    } else {
      setDebug(prev => ({ 
        ...prev, 
        connection: '❌ Variables manquantes' 
      }));
    }
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'black',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h3>🔍 Debug Supabase</h3>
      <p><strong>URL:</strong> {debug.url}</p>
      <p><strong>Key:</strong> {debug.key}</p>
      <p><strong>Connexion:</strong> {debug.connection}</p>
      {debug.error && <p><strong>Erreur:</strong> {debug.error}</p>}
    </div>
  );
}
