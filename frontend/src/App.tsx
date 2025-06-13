import { useState } from 'react'
import './App.css'

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary: string | null;
  source: string;
}

interface ResumeAnalysis {
  jobTitles: string[];
  skills: string[];
  experience: string[];
}

interface JobSearchResponse {
  jobs: Job[];
  searchTitles: string[];
}

type JobType = 'internship' | 'entry-level' | 'advanced' | 'fulltime' | 'parttime' | 'contract';

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [searchTitles, setSearchTitles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<'upload' | 'results'>('upload')
  const [jobType, setJobType] = useState<JobType>('entry-level')
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())
  const [location, setLocation] = useState<string>('')
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [searchRadius] = useState(50)

  const toggleJobDescription = (jobId: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const detectLocation = () => {
    setIsDetectingLocation(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setIsDetectingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          const city = data.address.city || data.address.town || data.address.village
          const state = data.address.state
          const country = data.address.country
          setLocation(`${city}, ${state}, ${country}`)
        } catch (err) {
          setError('Failed to get location details')
        } finally {
          setIsDetectingLocation(false)
        }
      },
      (error) => {
        setError('Unable to retrieve your location')
        setIsDetectingLocation(false)
      }
    )
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      // Analyze resume using fetch
      const analysisResponse = await fetch('http://localhost:3001/api/analyze-resume', {
        method: 'POST',
        body: formData,
      })

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze resume')
      }

      const analysisData = await analysisResponse.json()
      setAnalysis(analysisData)

      // Search for jobs using fetch
      const jobsResponse = await fetch(
        `http://localhost:3001/api/search-jobs?jobTitles=${encodeURIComponent(analysisData.jobTitles.join(','))}&jobType=${jobType}&location=${encodeURIComponent(location)}&radius=${searchRadius}`
      )

      if (!jobsResponse.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const jobsData: JobSearchResponse = await jobsResponse.json()
      console.log('Raw jobs data from API:', jobsData);
      console.log('Jobs data type:', typeof jobsData);
      console.log('Is jobs data an array?', Array.isArray(jobsData));
      setJobs(jobsData.jobs)
      setSearchTitles(jobsData.searchTitles)
      console.log('Updated jobs state:', jobs);
      setCurrentPage('results')
    } catch (err) {
      setError(`Failed to process resume: ${(err as Error).message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <nav className="bg-blue-600 py-4 shadow-md">
        <div className="w-full flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <div className="text-2xl font-bold text-white">Lifeguard</div>
          <div className="space-x-4">
            <button
              onClick={() => setCurrentPage('upload')}
              className="text-white hover:text-blue-100 transition-colors text-base"
            >
              New Search
            </button>
            <button
              onClick={() => { /* Implement navigation to previous searches */ }}
              className="text-white hover:text-blue-100 transition-colors text-base"
            >
              
            </button>
          </div>
        </div>
      </nav>

      <div className="w-full py-8">
        {currentPage === 'upload' ? (
          <div className="bg-white rounded-lg shadow-lg mt-10 max-w-7xl mx-auto p-20 sm:px- lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-extrabold text-gray-800 mb-2">Search Tech Jobs</h2>
            </div>
            <div className="space-y-6">
                <div className="relative">
                    <label htmlFor="experience-level" className="block text-gray-700 text-base font-semibold mb-2">Experience Level</label>
                    <select
                        id="experience-level"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value as JobType)}
                        className="block appearance-none w-full bg-gray-50 border border-gray-300 text-gray-900 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    >
                        <option value="entry-level" className="text-gray-700">Entry Level</option>
                        <option value="experienced" className="text-gray-700">Experienced</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 mt-8">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                </div>

                <div>
                    <label htmlFor="location" className="block text-gray-700 text-base font-semibold mb-2">Location (optional)</label>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., New York, Remote, United States"
                            className="flex-grow shadow-sm appearance-none border rounded-lg py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-50 border-gray-300 placeholder-gray-400 focus:bg-white focus:border-blue-500 transition-colors"
                        />
                        <button
                            onClick={detectLocation}
                            disabled={isDetectingLocation}
                            className={`flex items-center px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors ${isDetectingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {isDetectingLocation ? 'Detecting...' : 'Use My Location'}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-2 text-sm text-red-500">{error}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="resume-upload" className="block text-gray-700 text-base font-semibold mb-2">Upload Resume (optional)</label>
                    <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 cursor-pointer">
                        <label htmlFor="resume-upload" className="flex-grow text-gray-500 py-3 px-4 truncate cursor-pointer">
                            {file ? file.name : 'No file chosen'}
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="hidden"
                            id="resume-upload"
                        />
                        <label htmlFor="resume-upload" className="flex-shrink-0 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-5 rounded-r-lg cursor-pointer transition-colors">
                            Choose File
                        </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Upload your resume (PDF or DOC) to get personalized job matches based on your skills and experience.</p>
                </div>

                <button
                    onClick={handleUpload}
                    disabled={loading}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors text-lg${loading ? ' opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? 'Processing...' : 'Search Jobs'}
                </button>

                {error && (
                    <div className="bg-red-500 text-white p-3 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg mt-10 max-w-4xl mx-auto p-8 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-gray-800 mb-6">Search Results</h2>
            <p className="text-gray-600 mb-6 text-lg">Found {jobs.length} jobs matching your criteria</p>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Search Criteria</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2"><span className="font-semibold">Job Titles Used:</span></p>
                <ul className="list-disc list-inside space-y-1">
                  {searchTitles.map((title, index) => (
                    <li key={index} className="text-gray-600">{title}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex space-x-4 mb-8">
              <button
                onClick={() => setCurrentPage('upload')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors text-base"
              >
                New Search
              </button>
            </div>

            <div className="space-y-6">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-gray-800">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{(job.title || 'No Title')}</h3>
                        <p className="text-gray-600 mt-1">{job.company}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-gray-500 text-xs">8 hours ago</span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 text-base">
                      <span className="font-semibold">Jobs via</span> {job.source}
                    </p>
                    <p className="text-gray-600 mb-4 text-sm">
                      <svg className="w-4 h-4 inline-block mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      {(job.location || 'N/A')}
                    </p>

                    {expandedJobs.has(job.id) && (
                      <div className="mt-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2">Job Description:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap mb-4">{job.description}</p>
                        <a 
                          href={job.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          Apply Now
                        </a>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-gray-600">
                        {job.salary && (
                          <span className="font-semibold text-green-600">
                            <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.salary}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleJobDescription(job.id)}
                        className="text-blue-600 hover:underline text-sm font-semibold"
                      >
                        {expandedJobs.has(job.id) ? 'Show Less' : 'Show More'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center text-lg mt-8">No jobs found. Try adjusting your search criteria.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
