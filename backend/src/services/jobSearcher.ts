import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
console.log('RAPIDAPI_KEY loaded:', RAPIDAPI_KEY ? 'Yes' : 'No');

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
}

export async function searchJobs(jobTitles: string[], jobType: string, location?: string, radius?: number): Promise<Job[]> {
  const jobs: Job[] = [];
  const seenJobs = new Set<string>();

  // Map job type to JSearch API experience parameter
  const experienceParam = jobType === 'entry-level' ? 'under_3_years_experience' : 'more_than_3_years_experience';

  for (const title of jobTitles) {
    try {
      // Construct the query with proper formatting for location and radius
      let query = title;
      if (location) {
        // If radius is provided, append it to the location
        const locationWithRadius = radius ? `${location} within ${radius} miles` : location;
        query = `${query} in ${locationWithRadius}`;
      }

      console.log('Searching with query:', query);
      console.log('Experience level:', experienceParam);
      console.log('Location:', location);
      console.log('Radius:', radius);

      const params = new URLSearchParams({
        query,
        num_pages: '3',
        date_posted: 'month',
        sort_by: 'date',
        job_sources: 'indeed,linkedin,ziprecruiter,google_jobs',
        experience_level: experienceParam,
        country: 'us',
        language: 'en'
      });

      const url = `https://jsearch.p.rapidapi.com/search?${params.toString()}`;
      console.log('Full API URL:', url);

      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      });

      const data = await response.json();
      console.log('API Response Status:', response.status);
      console.log('Number of jobs found:', data?.data?.length || 0);

      if (data?.data) {
        const newJobs = data.data
          .filter((job: any) => !seenJobs.has(job.job_id))
          .map((job: any) => {
            seenJobs.add(job.job_id);
            console.log('Job source:', job.job_source);
            console.log('Job location:', job.job_city, job.job_state);
            console.log('Job salary:', job.job_salary);
            return {
              id: job.job_id,
              title: job.job_title,
              company: job.employer_name,
              location: job.job_city ? `${job.job_city}, ${job.job_state}` : job.job_country,
              description: job.job_description,
              salary: job.job_salary ? job.job_salary.replace(/[^\d\s\-$.,KkMm]/g, '') : null,
              source: job.job_source || 'Unknown',
              url: job.job_apply_link || job.job_url,
              postedAt: job.job_posted_at_datetime_utc
            };
          });
        jobs.push(...newJobs);
      } else {
        console.log('No data in API response:', data);
      }
    } catch (error) {
      console.error(`Error searching for ${title}:`, error);
    }
  }

  console.log('Total unique jobs found:', jobs.length);
  return jobs;
}

type JobType = 'no_experience' | 'under_3_years_experience' | 'more_than_3_years_experience';

function mapJobType(jobType: string): JobType {
    switch (jobType) {
        case 'internship':
            return 'no_experience';
        case 'entry-level':
            return 'under_3_years_experience';
        case 'advanced':
            return 'more_than_3_years_experience';
        default:
            return 'under_3_years_experience';
    }
}