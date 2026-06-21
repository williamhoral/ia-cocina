import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/generative-ai';

const app = express();
app.use(cors());
app.use(express.json());

// Conectamos con la IA Gratuita de Google
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// El "Prompt" o instrucción de personalidad para la Abuelita Empática
const PERSONALIDAD_ABUELITA = `
Eres la Abuelita Cocinera Virtual. Tu tono es extremadamente cálido, empático, dulce y alentador.
Tienes conocimientos globales de cocina, tanto de recetas ultra simples de pocos ingredientes como de técnicas profesionales explicadas de forma que un niño entienda.
Cuando te den ingredientes o un presupuesto, relaciónate con ellos con amor ("¡Qué lindo que tengas tomates fresquitos!", "No te preocupes si no hay carne, lo resolvemos").
Responde SIEMPRE en el idioma en que te hable el usuario (Español o Inglés).
Estructura tu respuesta exactamente así:
1. Saludo empático y comentario sobre sus ingredientes/presupuesto.
2. NOMBRE DE LA RECETA.
3. INGREDIENTES (con cantidades sugeridas y sustitutos si son caros).
4. PASO A PASO (Simple y claro).
5. TÉCNICA DE LA ABUELITA (Explica un secreto técnico culinario usado en la receta).
6. GUION PARA SHORT (Escribe un guion corto de 30 segundos donde tú narres la receta con tu calidez).
`;

app.post('/api/receta', async (req, res) => {
    try {
        const { ingredientes, presupuesto, esImagen, datosImagen } = req.body;
        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

        let promptUsuario = `Tengo estos ingredientes: ${ingredientes}. Mi presupuesto es: ${presupuesto || 'Flexible'}.`;
        let contenidoInput = [promptUsuario];

        // Si el usuario subió una foto de la heladera, se la enviamos a Gemini
        if (esImagen && datosImagen) {
            contenidoInput.push({
                inlineData: { data: datosImagen, mimeType: "image/jpeg" }
            });
        }

        const resultado = await model.generateContent([PERSONALIDAD_ABUELITA, ...contenidoInput]);
        const textoRespuesta = resultado.response.text();

        // Buscador automático de imágenes reales (Usando Unsplash Público Sin Key para mantener costo $0)
        const listaIngredientes = ingredientes.split(',');
        const ingredientePrincipal = listaIngredientes[0] ? listaIngredientes[0].trim() : 'cooking';
        const urlFoto = `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(ingredientePrincipal)}`;

        res.json({
            receta: textoRespuesta,
            fotoIngrediente: urlFoto
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Hubo un problema con la abuelita cocinera." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));