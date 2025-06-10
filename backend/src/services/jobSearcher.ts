interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
}

export async function searchJobs(jobTitles: string[]): Promise<Job[]> {
  try {
    const jobs: Job[] = [];
    
    // Search for each job title
    for (const title of jobTitles) {
      // Using GitHub Jobs API as an example
      const response = await fetch(
        `https://jobs.github.com/positions.json?search=${encodeURIComponent(title)}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch jobs for ${title}`);
      }

      const jobResults = await response.json();
      jobs.push(...jobResults.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        url: job.url
      })));
    }

    return jobs;
  } catch (error) {
    console.error('Error searching jobs:', error);
    throw new Error('Failed to search jobs');
  }
} 