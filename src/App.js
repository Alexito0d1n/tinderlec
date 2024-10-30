import React, { useState } from 'react';
import './App.css';
import SignUp from './components/SignUp';
import Login from './components/LogIn';
import TestForm from './components/Form';
import Results from './components/Results';
import { supabase } from './backend/supabase';

function App() {
  const [user, setUser] = useState(null);
  const [testResults, setTestResults] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    fetchUserResponses(userData.id);
  };

  const fetchUserResponses = async (userId) => {
    const { data, error } = await supabase
      .from('responses')
      .select('question_id, selected_option_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error al obtener las respuestas:', error);
    } else {
      if (data && data.length > 0) {
        // Guardamos las respuestas y mostramos los resultados, sin permitir más envíos
        setTestResults(data);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTestResults(null);
  };

  return (
    <div className="App">
      <h1>Test de Preguntas</h1>

      {!user ? (
        <>
          <Login onLogin={handleLogin} />
          <SignUp />
        </>
      ) : (
        <>
          <h2>Bienvenido, @{user.instagram}</h2>
          <button onClick={handleLogout}>Cerrar sesión</button>

          {!testResults ? (
            <TestForm userId={user.id} />
          ) : (
            <Results userId={user.id} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
