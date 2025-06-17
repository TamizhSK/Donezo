# Donezo✅

**A beautifully built minimal full-stack todo app for clarity and speed.**  
Donezo is a task management app designed with simplicity, performance, and dark mode support in mind. Whether you're organizing your day or tracking your projects, Donezo helps you stay focused with an intuitive UI and persistent cloud storage.

## Live Demo

Access the app here: [https://donezo-vert.vercel.app](https://donezo-vert.vercel.app)

## Features

- Add, edit, and delete tasks
- Categorize tasks (Work, Personal, Shopping, Health)
- Dark and light mode support
- Task completion toggle
- Search and filter by category
- Built with modern UI components (Tailwind, Shadcn UI)
- Fully responsive and mobile-friendly
- Persistent backend with PostgreSQL on Render

## Tech Stack

**Frontend**  
- Next.js (App Router)
- Tailwind CSS  
- Shadcn UI  
- TypeScript

**Backend**  
- Node.js + Express  
- PostgreSQL (hosted on Render)  
- `pg` for database interaction  
- CORS + REST API setup

## Setup Instructions

1. Clone the repository
2. Install dependencies  
````
   npm install
````

3. Set up your `.env` file with the following variables:

   ```
   PG_HOST=
   PG_PORT=5432
   PG_USER=
   PG_PASSWORD=
   PG_DATABASE=
   ```

4. Run the backend:

   ```
   npm start
   ```

5. Navigate to the frontend at [http://localhost:3000](http://localhost:3000) or deploy using Vercel.

## Deployment

* Frontend deployed on [Vercel](https://vercel.com/)
* Backend runs on [Render](https://render.com/)
* Uses environment variables for secure database connections


