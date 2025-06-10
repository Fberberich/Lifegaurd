import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeResume(resumeBuffer: Buffer): Promise<{
  jobTitles: string[];
  skills: string[];
  experience: string[];
}> {
  try {
    // Parse PDF content
    const pdfData = await pdfParse(resumeBuffer);
    const resumeText = pdfData.text;

    // Use OpenAI to analyze the resume
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a resume analyzer. Extract job titles, skills, and experience from the resume. Format the response as a JSON object with arrays for jobTitles, skills, and experience."
        },
        {
          role: "user",
          content: resumeText
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    return {
      jobTitles: analysis.jobTitles || [],
      skills: analysis.skills || [],
      experience: analysis.experience || []
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw new Error('Failed to analyze resume');
  }
} 