/**
 * services/imageFeatureExtractor.js
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function generateEmbedding(text, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
  const embedRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: 768
    })
  });
  const embedData = await embedRes.json();
  const embedding = embedData?.embedding?.values;
  if (!embedding || embedding.length !== 768) {
    throw new Error(`Embedding failed: ${embedData?.error?.message || 'Invalid dimension'}`);
  }
  return embedding;
}

async function extractFeatures(imageBuffer, text = '') {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const descriptionText = text || 'Fashion item';

  // If no image buffer (text-only indexing path), skip vision model
  if (!imageBuffer || !Buffer.isBuffer(imageBuffer)) {
    console.log(`Generating text-only embedding: ${descriptionText.slice(0, 80)}...`);
    return generateEmbedding(descriptionText, apiKey);
  }

  // Image uploaded by user - use vision model to describe the item precisely
  console.log('Analyzing uploaded image with vision model...');
  const genAI = new GoogleGenerativeAI(apiKey);
  let enhancedDescription = descriptionText;
  try {
    const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imageBase64 = imageBuffer.toString('base64');
    const prompt = `You are a fashion expert. Analyze this clothing image and describe it precisely in one paragraph. Include:
1. Exact garment type (e.g. skinny jeans, wide-leg trousers, straight-leg pants, flare jeans, cropped jeans, denim skirt)
2. Exact color (e.g. cream white, light wash blue denim, dark navy, black, khaki, grey)
3. Fit style (e.g. high-rise, mid-rise, slim fit, relaxed fit)
4. Key design details (e.g. distressed, embroidered, coated, stretch, selvedge)
5. Brand or aesthetic if visible

Be very specific. Do NOT be generic. Output as a single descriptive paragraph.`;
    const visionResult = await visionModel.generateContent([
      prompt,
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
    ]);
    const visionText = visionResult?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (visionText) {
      enhancedDescription = visionText.trim();
      console.log(`Vision description: ${enhancedDescription.slice(0, 150)}...`);
    }
  } catch (visionErr) {
    console.warn(`Vision model failed, falling back to text: ${visionErr.message}`);
  }

  return generateEmbedding(enhancedDescription, apiKey);
}

module.exports = { extractFeatures };