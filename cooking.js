export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  try {
    const { ingredientes } = req.body;
    
    // Vercel lee tu clave guardada "GEMINI_API_KEY" (La nueva versión AQ)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'La clave secreta no está configurada en Vercel.' });
    }

    // URL oficial y moderna para las nuevas firmas de Google Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Actúa como una abuela cocinera experta y cariñosa. Te daré una lista de ingredientes y debes sugerirme una o dos recetas fáciles que pueda preparar usándolos. Si faltan ingredientes básicos (como sal, agua o aceite), asume que los tengo. Usa emojis y un tono muy dulce. Ingredientes: ${ingredientes}` }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return res.status(200).json({ receta: data.candidates[0].content.parts[0].text });
    } else {
      return res.status(500).json({ error: 'La API no devolvió texto. Revisa la clave en Vercel.' });
    }

  } catch (error) {
    return res.status(500).json({ error: 'Error interno en el servidor de la API.' });
  }
}
