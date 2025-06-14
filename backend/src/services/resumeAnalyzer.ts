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
          content: `You are a job recruiter that has worked in the industry for YEARS. 
      You are given a resume and is recommending the top 10 job titles that you believe the candidate is a good fit for. The job titles should be jobs that are common in the area are commonly found on job searching sites such as linkedIn or Indeed.  
      Format the response as a JSON object with arrays for jobTitles, skills, and experience.
      The jobTitles should be the job titles that you believe the canidate should apply for.
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