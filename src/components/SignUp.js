import React, { useState } from 'react';
import { supabase } from '../backend/supabase';
import bcrypt from 'bcryptjs';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [instagram, setInstagram] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Expresión regular para validar el correo de alumnos UPM
  const emailRegex = /^[a-zA-Z0-9._%+-]+@alumnos\.upm\.es$/;

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validar el formato del correo electrónico
    if (!emailRegex.test(email)) {
      setError('El correo debe tener el formato *******@alumnos.upm.es');
      return;
    }

    // Cifrar la contraseña
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Insertar el nuevo usuario en la tabla de Supabase
    const { error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, instagram }]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Usuario registrado con éxito');
      setEmail('');
      setPassword('');
      setInstagram('');
    }
  };

  return (
    <div>
      <h2>Registrarse</h2>
      <form onSubmit={handleSignUp}>
        <label>Correo electrónico:</label>
        <input
          type="email"
          placeholder='Debe ser correo @alumno.upm.es'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <label>Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <label>Instagram (@):</label>
        <input
          type="text"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          required
        />
        <br />
        <button type="submit">Registrarse</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default SignUp;
