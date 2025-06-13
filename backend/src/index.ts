import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { analyzeResume } from './services/resumeAnalyzer';
import { searchJobs } from './services/jobSearcher';



const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend server is running!' });
});

// Routes
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resumeBuffer = req.file.buffer;
    const analysis = await analyzeResume(resumeBuffer);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
});

app.get('/api/search-jobs', async (req, res) => {
  try {
    const { jobTitles, jobType, location, radius } = req.query;
    if (!jobTitles || typeof jobTitles !== 'string') {
      return res.status(400).json({ error: 'Job titles are required' });
    }
    if (!jobType || typeof jobType !== 'string') {
      return res.status(400).json({ error: 'Job type is required' });
    }

    const titles = jobTitles.split(',');
    const radiusNum = radius ? parseInt(radius as string) : undefined;
    console.log('Searching jobs with titles:', titles, 'and type:', jobType, 'location:', location, 'radius:', radiusNum);
    const jobs = await searchJobs(titles, jobType, location as string, radiusNum);
    console.log('Found jobs:', jobs);
    res.json({ jobs, searchTitles: titles });
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
});

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please try these steps:`);
    console.error('1. Close any other instances of the server');
    console.error('2. Wait a few seconds and try again');
    console.error('3. Or use a different port by setting the PORT environment variable');
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
}); 