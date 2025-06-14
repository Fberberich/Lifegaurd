# Resume Analyzer and Job Matcher

A web application that analyzes resumes using OpenAI's API and matches them with relevant job opportunities.

## Features

- Resume upload and analysis
- Automatic job title extraction
- Skills and experience analysis
- Job matching based on resume content
- Modern UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd lifeguard
```

2. Install dependencies:
```bash
npm run install:all
```

3. Configure environment variables:
   - Create a `.env` file in the `backend` directory
   - Add your OpenAI API key:
     ```
     PORT=3001
     OPENAI_API_KEY=your_openai_api_key_here
     ```

4. Start the development servers:
```bash
npm run dev
```

This will start both the frontend (on port 5173) and backend (on port 3001) servers.

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Upload your resume (PDF format)
3. Wait for the analysis to complete
4. View the suggested job titles and matching job opportunities

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - Fetch API

- Backend:
  - Node.js
  - Express
  - TypeScript
  - OpenAI API
  - PDF Parse

## License

MIT
