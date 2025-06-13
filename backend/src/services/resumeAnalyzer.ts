import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
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
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content: `You are a job recruiter. 
      You are given a resume and you need to recommend the top 10 jobs titles that the candidate is a good fit for. The jobs titles should be jobs that are commonly found on linkedIN or Indeed.  
      Format the response as a JSON object with arrays for jobTitles, skills, and experience.
      The job titles should be the titles of the jobs that the candidate has held.
      The skills should be the skills that the candidate has listed on their resume.
      `
        },
        {
          role: "user",
          content: resumeText
        }
      ],
    });

    const analysis = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      jobTitles: analysis.jobTitles || [],
      skills: analysis.skills || [],
      experience: analysis.experience || []
    };
  } catch (error: unknown) {
    console.error('Error analyzing resume:', error);
    throw new Error(`Failed to analyze resume: ${(error as Error).message}`);
  }
} 