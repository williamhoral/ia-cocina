import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Permitir que cualquier cel o compu pueda consultar la API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { ingredientes } = req.body;

    if (!ingredientes) {
      return res.status(400).json({ error: 'Faltan los ingredientes' });
    }

    // Aquí el servidor va a buscar de forma automática la clave secreta que guardamos en Vercel
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'La clave secreta no está configurada en Vercel.' });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const prompt = `Actúa como una abuela cocinera experta y cariñosa. Te daré una lista de ingredientes y debes sugerirme una o dos recetas fáciles que pueda preparar usándolos. Si faltan ingredientes básicos (como sal, agua o aceite), asume que los tengo. Usa emojis y un tono muy dulce. Ingredientes: ${ingredientes}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.status(200).json({ receta: response.text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Hubo un error al conectar con la Abuelita IA.' });
  }
}