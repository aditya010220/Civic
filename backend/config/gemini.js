import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const validateEvidence = async (evidence) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this campaign evidence for validity and relevance:
      Type: ${evidence.evidenceType}
      Description: ${evidence.description}
      Source: ${evidence.source}
      ${evidence.testimonialContent ? `Content: ${evidence.testimonialContent}` : ''}
      
      Provide an analysis considering:
      1. Credibility of the source
      2. Relevance to the campaign
      3. Potential red flags
      4. Verification recommendations
      
      Return a JSON object with:
      {
        isValid: boolean,
        confidence: number (0-1),
        concerns: string[],
        recommendations: string[]
      }`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Gemini AI validation error:', error);
    return {
      isValid: false,
      confidence: 0,
      concerns: ['AI validation failed'],
      recommendations: ['Manual review required']
    };
  }
};