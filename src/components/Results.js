import React, { useState, useEffect } from 'react';
import { supabase } from '../backend/supabase';

const Results = ({ userId }) => {
    const [matchingUsers, setMatchingUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState([]);
    const [optionTexts, setOptionTexts] = useState({});
    const [questionTexts, setQuestionTexts] = useState({});

    useEffect(() => {
        const fetchUserResponses = async () => {
            const { data: responses, error } = await supabase
                .from('responses')
                .select('question_id, selected_option_id')
                .eq('user_id', userId);

            if (error) {
                console.error('Error fetching user responses:', error);
            } else {
                setTestResults(responses);
                fetchQuestionAndOptionTexts(responses);
            }
        };

        const fetchQuestionAndOptionTexts = async (responses) => {
            // Obtener los IDs únicos de preguntas y opciones
            const questionIds = [...new Set(responses.map((response) => response.question_id))];
            const optionIds = responses.map((response) => response.selected_option_id);

            // Obtener textos de preguntas
            const { data: questions, error: questionsError } = await supabase
                .from('questions')
                .select('id, question')
                .in('id', questionIds);

            if (questionsError) {
                console.error('Error fetching question texts:', questionsError);
            } else {
                const questionTexts = questions.reduce((acc, question) => {
                    acc[question.id] = question.question;
                    return acc;
                }, {});
                setQuestionTexts(questionTexts);
            }

            // Obtener textos de opciones
            const { data: options, error: optionsError } = await supabase
                .from('options')
                .select('id, text')
                .in('id', optionIds);

            if (optionsError) {
                console.error('Error fetching option texts:', optionsError);
            } else {
                const optionTexts = options.reduce((acc, option) => {
                    acc[option.id] = option.text;
                    return acc;
                }, {});
                setOptionTexts(optionTexts);
            }
        };

        fetchUserResponses();
    }, [userId]);

    const handleCheck = async () => {
        if (testResults.length === 0) return;
    
        setLoading(true);
    
        // Obtener las respuestas del usuario para hacer la búsqueda
        const selectedOptionIds = testResults.map(result => result.selected_option_id);
    
        const { data: matchingUsersData, error } = await supabase
            .from('responses')
            .select('user_id, users (instagram)')
            .in('selected_option_id', selectedOptionIds);
    
        if (error) {
            console.error('Error buscando coincidencias:', error);
        } else {
            // Filtrar usuarios duplicados por `user_id` y que no sea el usuario actual
            const uniqueUsers = Array.from(new Set(matchingUsersData
                .filter(user => user.user_id !== userId)
                .map(user => user.user_id))) // Crear una lista de `user_id` únicos
                .map(id => matchingUsersData.find(user => user.user_id === id)); // Mapear `user_id` únicos a usuarios completos
    
            setMatchingUsers(uniqueUsers);
        }
    
        setLoading(false);
    };
    

    return (
        <div>
            <h2>Resultados del Test:</h2>
            {testResults.map(result => (
                <div key={result.question_id}>
                    <p><strong>Pregunta:</strong> {questionTexts[result.question_id] || 'Cargando...'}</p>
                    <p><strong>Respuesta seleccionada:</strong> {optionTexts[result.selected_option_id] || 'Cargando...'}</p>
                </div>
            ))}
            <button onClick={handleCheck} disabled={loading}>
                {loading ? 'Buscando...' : 'Buscar coincidencias'}
            </button>
            {matchingUsers.length > 0 ? (
                <div>
                    <h3>Usuarios que respondieron lo mismo:</h3>
                    <ul>
    {matchingUsers.map((matchedUser, index) => (
        <li key={`${matchedUser.user_id}-${index}`}>
            {matchedUser.users ? `@${matchedUser.users.instagram}` : 'Instagram no disponible'}
        </li>
    ))}
</ul>

                </div>
            ) : (
                <p>No hay coincidencias todavía.</p>
            )}
        </div>
    );
};

export default Results;
