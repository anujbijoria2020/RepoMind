AI GitHub SaaS – Smart Repo Insights & Collaboration

This is an AI-powered GitHub SaaS application that helps developers and teams manage their projects more effectively.
With this platform, you can:

Create Projects linked to your GitHub repositories

Log commits and commit summaries automatically

Ask AI questions about your repository and get context-aware answers using RAG (Retrieval Augmented Generation)

Save Q&A history for future reference

Create project meetings, upload audio, and let AI generate summaries and actionable issues

Collaborate with team members through invites

Track repository insights in one dashboard

Features

GitHub integration via Octokit

AI-powered Q&A about your repository using Gemini AI + Vector Embeddings

RAG pipeline for retrieving relevant files before answering questions

Meeting summarization and issue generation from uploaded audio

Commit history tracking with summaries

Project-based organization with team collaboration tools

Tech Stack

Next.js 14 (App Router)

tRPC – type-safe API layer

TailwindCSS – styling

Prisma + NeonDB (PostgreSQL) – database

Clerk – authentication and user management

Octokit – GitHub API integration

Gemini AI – LLM for Q&A and summarization

Vector embeddings – for semantic search and RAG

Getting Started

Clone the repository:

git clone https://github.com/your-username/ai-github-saas.git
cd ai-github-saas


Install dependencies:

npm install


Setup environment variables in .env:

DATABASE_URL="your-neon-postgres-url"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
GITHUB_TOKEN="your-github-pat"
GEMINI_API_KEY="your-gemini-api-key"


Push the Prisma schema:

npx prisma db push


Run the development server:

npm run dev

Future Improvements

Notifications for new commits and meeting updates

Advanced analytics on code quality and productivity

Exportable meeting and Q&A summaries