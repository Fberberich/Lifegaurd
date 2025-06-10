import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { analyzeResume } from './services/resumeAnalyzer';
import { searchJobs } from './services/jobSearcher';

dotenv.config();

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
    const { jobTitles } = req.query;
    if (!jobTitles || typeof jobTitles !== 'string') {
      return res.status(400).json({ error: 'Job titles are required' });
    }

    const titles = jobTitles.split(',');
    const jobs = await searchJobs(titles);
    res.json(jobs);
  } catch (error) {
    console.error('Error searching jobs:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 