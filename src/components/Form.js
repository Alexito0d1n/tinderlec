import React, { useEffect, useState } from 'react';
import { supabase } from '../backend/supabase';

const Form = ({ userId }) => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          question,
          options (
            id,
            text
          )
        `);

      if (error) {
        console.error('Error fetching questions:', error);
        return;
      }

      setQuestions(data);

      //usuario ha respondido
      const { data: responses } = await supabase
        .from('responses')
        .select('id')
        .eq('user_id', userId);

      if (responses && responses.length > 0) {
        setSubmitted(true);
      }
    };

    fetchQuestions();
  }, [userId]);

  const handleChange = (questionId, selectedOptionId) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedOptionId,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allQuestionsAnswered = questions.every((q) => answers[q.id]);
    if (!allQuestionsAnswered) {
      setError('Por favor, responde todas las preguntas.');
      return;
    }
//guardar respuestas
    const responsesToInsert = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      user_id: userId,
      question_id: parseInt(questionId),
      selected_option_id: parseInt(selectedOptionId),
    }));

    const { error } = await supabase
      .from('responses')
      .insert(responsesToInsert);

    if (error) {
      setError('Hubo un problema al guardar tus respuestas.');
      console.error('Error al guardar las respuestas:', error);
    } else {
      setError(null);
      setSubmitted(true);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {questions.map((question) => (
        <div key={question.id}>
          <label>
            {question.question}
            <select
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              required
              disabled={submitted}
            >
              <option value="">Selecciona una opción</option>
              {question.options && question.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.text}
                </option>
              ))}
            </select>
          </label>
          <br />
        </div>
      ))}
      <button type="submit" disabled={submitted}>
        {submitted ? 'Respuestas enviadas' : 'Enviar Respuestas'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {submitted && <p style={{ color: 'green' }}>Tus respuestas han sido enviadas correctamente.</p>}
    </form>
  );
};

export default Form;
