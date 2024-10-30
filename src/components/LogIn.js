import React, { useState } from 'react';
import { supabase } from '../backend/supabase';
import bcrypt from 'bcryptjs';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Buscar el usuario por su correo electrónico
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, password, instagram')
      .eq('email', email)
      .single();

    if (userError) {
      setError('El usuario no existe');
    } else {
      const validPassword = bcrypt.compareSync(password, userData.password);

      if (validPassword) {
        // Si la contraseña es válida, iniciar sesión
        console.log('Inicio de sesión exitoso:', userData);
        onLogin({ id: userData.id, instagram: userData.instagram });
      } else {
        setError('Contraseña incorrecta');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Iniciar sesión</button>
      {error && <p>{error}</p>}
    </form>
  );
};

export default Login;
