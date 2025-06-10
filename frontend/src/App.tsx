import { useState } from 'react'
import axios from 'axios'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
}

interface ResumeAnalysis {
  jobTitles: string[];
  skills: string[];
  experience: string[];
}

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
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

      const analysisResponse = await axios.post('http://localhost:3001/api/analyze-resume', formData)
      setAnalysis(analysisResponse.data)

      // Search for jobs based on the analyzed job titles
      const jobsResponse = await axios.get('http://localhost:3001/api/search-jobs', {
        params: {
          jobTitles: analysisResponse.data.jobTitles.join(',')
        }
      })
      setJobs(jobsResponse.data)
    } catch (err) {
      setError('Failed to process resume. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Lifeguard</h1>
          <p className="text-gray-600">Your AI-powered resume analyzer and job matcher</p>
        </header>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Your Resume</h2>
              <p className="text-gray-600 mb-6">Upload your resume in PDF format to get started</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Choose PDF File
              </label>
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {file.name}
                </p>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className={`w-full py-3 px-4 rounded-md text-white font-semibold transition-colors
                ${loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Analyze Resume'
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-md">
                {error}
              </div>
            )}

            {analysis && (
              <div className="mt-8 space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-4">Analysis Results</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-blue-700">Suggested Job Titles:</h4>
                      <ul className="mt-2 space-y-1">
                        {analysis.jobTitles.map((title, index) => (
                          <li key={index} className="text-gray-700">{title}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-700">Skills:</h4>
                      <ul className="mt-2 space-y-1">
                        {analysis.skills.map((skill, index) => (
                          <li key={index} className="text-gray-700">{skill}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {jobs.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Matching Jobs</h3>
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-lg text-gray-800">{job.title}</h4>
                      <p className="text-gray-600">{job.company} - {job.location}</p>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{job.description}</p>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                      >
                        View Job
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
