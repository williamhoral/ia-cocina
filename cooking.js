export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { ingredients } = req.body;
    // Aquí Vercel toma tu clave oculta del servidor
    const apiKey = process.env.GEMINI_API_KEY; 

    const promptText = `Actúa como una abuela experta en cocina y creadora de contenido. Con estos ingredientes: "${ingredients}", haz lo siguiente:
1. Dame una receta fácil explicando el paso a paso de forma muy cariñosa.
2. Dame un secreto técnico de cocina aplicable a la receta.
3. Escribe un guion cortito para un video de YouTube Short/Reel (máximo 50 segundos) invitando a la gente a cocinar, usando frases empáticas y pausadas.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        const recipeText = data.candidates[0].content.parts[0].text;
        
        return res.status(200).json({ recipe: recipeText });
    } catch (error) {
        return res.status(500).json({ error: 'Error procesando la receta' });
    }
}