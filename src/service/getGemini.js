import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GOOGLE_GENERATIVE_AI_KEY
);

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function processTitleMood(titles) {
  try {
    const cacheKey = 'titleScores';
    let cachedScores = JSON.parse(localStorage.getItem(cacheKey)) || {};

    const cacheMiss = titles.filter((title) => !cachedScores[title]);
    if (cacheMiss.length === 0) {
      return titles.map((title) => cachedScores[title]);
    }

    let prompt = `For each sentence of the following sentences, 
      give a score based on sentiment analysis, ranging from 0 to 10,
      0 being the most friendly, supportive and empathetic, while 10
      is the most aggressive and charged. Return only a list of numbers,
      without any further explanations. Make sure that the number of scores
      you return matches the number of sentences. The sentences are: `;
    prompt += JSON.stringify(cacheMiss);

    const result = await model.generateContent(prompt);
    const answer = await result.response.text();
    const newScores = JSON.parse(answer);

    cacheMiss.forEach((title, index) => {
      cachedScores[title] = newScores[index];
    });

    localStorage.setItem(cacheKey, JSON.stringify(cachedScores));

    return titles.map((title) => cachedScores[title]);
  } catch (error) {
    console.error('Error in processTitleMood:', error);
    return titles.map(() => null);
  }
}

export async function changeMood(data) {
  try {
    const prompt = `I will give you a title and a news story. You need to 
make them both calmer, more empathetic, and more positive without losing any of the important existing facts.

Title: "${data.title}"

Description: "${data.description}"

Return the new value as a **plain JSON** object with the format:
{
  "title": "<new updated title here>",
  "description": "<new updated description here>"
}

Return **ONLY** this JSON object, without any additional text or explanations.

Do **NOT** include any code blocks, markdown formatting, or additional characters.

Ensure the JSON is valid and parsable.
`;

    const result = await model.generateContent(prompt);
    let answer = await result.response.text();

    answer = answer.replace(/```json|```/g, '').trim();

    return JSON.parse(answer);
  } catch (error) {
    console.error('Error in changeMood:', error);
    // eslint-disable-next-line no-undef
    console.error('Response received:', answer);
    return { title: data.title, description: data.description };
  }
}
