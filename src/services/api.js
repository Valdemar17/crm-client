export const generateGeminiContent = async (prompt) => {
  const apiKey = ""; // La clave se inyecta automáticamente en el entorno de ejecución
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) throw new Error('Error en la llamada a la API');
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo generar respuesta.";
  } catch (error) {
    console.error("Error llamando a Gemini:", error);
    return "Lo sentimos, hubo un error al conectar con la IA. Por favor intenta de nuevo.";
  }
};
