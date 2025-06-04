# Question Adventure Time 🎮

A modern interactive quiz application built with React, TypeScript, and TailwindCSS.

## Features

- Multiple difficulty levels (Easy, Medium, Hard)
- Team-based gameplay
- Real-time scoring system
- Timer-based questions
- Beautiful UI with animations
- Responsive design for all devices

## Tech Stack

- React 18
- TypeScript
- TailwindCSS
- ShadcnUI Components
- Vite
- React Router
- React Query
- Supabase

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for backend services)

### Installation Steps

1. Clone the repository

   ```bash
   git clone https://github.com/sunny11011/question-adventure-time.git
   cd question-adventure-time
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure Supabase credentials

   - Create a new project at [Supabase](https://supabase.com)
   - Go to Project Settings > API to get your project URL and anon/public key
   - Open `src/integrations/supabase/client.ts`
   - Replace `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` with your credentials
   - Open `supabase/config.toml`
   - Replace `project_id` with your Supabase project ID (found in Project Settings > General)

4. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open your browser and visit `http://localhost:5173`

### Database Schema

The project uses the following Supabase tables:

- `quizzes`: Stores quiz configurations and settings
- `teams`: Stores team information
- `questions`: Stores quiz questions and answers
- `scores`: Stores team scores and progress

## Project Structure

```bash
src
├── components      # Reusable components
├── hooks           # Custom React hooks
├── pages           # Application pages
├── styles          # Global styles and TailwindCSS configuration
└── utils           # Utility functions
```

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/YourFeature`)
6. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadcnUI](https://ui.shadcn.com/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [React Query](https://react-query.tanstack.com/)
- [Supabase](https://supabase.com/)
