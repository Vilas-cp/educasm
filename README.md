AI-Powered Educational Platform (Next.js Upgrade)

Overview

This project is an AI-powered educational platform that was originally built with React.js and has been migrated to Next.js for improved performance, security, and scalability. The migration was done without starting a new project, ensuring a seamless transition.

Key Features & Improvements

🚀 Migrated from React.js to Next.js

Refactored the project to use Next.js’s routing, SSR, and API routes.

Improved performance, SEO, and scalability.

No need for React Router—Next.js’s file-based routing simplifies navigation.

🔒 Secure API Calls (Moved to Backend)

Previously, API calls were made from the frontend, exposing the API key.

Now, all API requests are handled on the backend using Vercel serverless functions.

Ensured streaming responses still work for real-time interactions.

🛡 Implemented Rate Limiting

Added rate limits to prevent API abuse.

Limits per minute, hour, and day to maintain API stability.

Users receive proper retry-after messages when limits are exceeded.

💬 Chat History (Explore Mode)

Implemented scrollable chat history (similar to Perplexity.ai).

Ensured smooth auto-scrolling and message retention.

🎵 Fixed Play/Pause Button (Playground Mode)

Previously, the button paused but didn’t resume properly.

Now, seamless pausing and resuming with correct state handling.

Tech Stack

Frontend: Next.js (migrated from React.js)

Backend: Vercel Serverless Functions

Styling: Chakra UI

Rate Limiting: rate-limiter-flexible

AI Integration: Google Generative AI API

Setup & Installation

Clone the repository:

git clone https://github.com/your-repo.git
cd your-repo

Install dependencies:

npm install

Create a .env.local file and add your API key:

GEMINI_API_KEY=your_api_key_here

Run the development server:

npm run dev

Open http://localhost:3000 in your browser.

Deployment

Deployed on Vercel for optimal performance and edge function support.

Run:

vercel deploy

Future Improvements

Implement user authentication.

Optimize database storage for chat history.

Enhance AI-generated responses for better accuracy.

Contributing

Pull requests are welcome! If you have any suggestions or improvements, feel free to contribute. 🚀

