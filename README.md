# AI Flashcard Generator

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Project Scope](#project-scope)
  - [In Scope (MVP)](#in-scope-mvp)
  - [Out of Scope (MVP)](#out-of-scope-mvp)
- [Project Status](#project-status)
- [License](#license)

## Project Description

AI Flashcard Generator is a web application designed to assist students in creating educational flashcards efficiently. It utilizes AI (specifically Google Gemini) to automatically generate flashcards from text pasted by the user, significantly reducing the manual effort involved. The application also helps users identify key information within their source material.

Key features include:
- User account management (registration, login, deletion).
- Topic creation and management for organizing flashcards.
- AI-powered flashcard generation from user-provided text.
- Manual flashcard creation and editing capabilities.
- Strict character limits for flashcard content (100 for front, 500 for back).
- Interface for reviewing and refining AI-generated flashcards (Accept, Regenerate, Edit).
- Integration with an open-source spaced repetition algorithm for study sessions.
- User-friendly error handling.

The primary goal is to streamline the flashcard creation process and encourage the use of spaced repetition, an effective learning technique.

## Tech Stack

- **Framework:** [Astro](https://astro.build/)
- **UI Components:** [React](https://react.dev/) with [Shadcn/ui](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend / Database:** [Supabase](https://supabase.com/) (for user auth and data storage)
- **AI:** [Google Gemini](https://gemini.google.com/) (for flashcard generation)
- **Package Manager:** [npm](https://www.npmjs.com/)
- **Runtime:** [Node.js](https://nodejs.org/) (v22.14.0 specified in `.nvmrc`)
- **Testing:**
  - **Unit & Integration:** [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  - **E2E:** [Playwright](https://playwright.dev/)
  - **API Mocking:** [MSW](https://mswjs.io/)
- **Linting/Formatting:** ESLint, Prettier
- **Git Hooks:** Husky

## Getting Started Locally

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd ai-flashcard-generator
    ```
    *(Replace `<your-repository-url>` with the actual URL)*
2.  **Set up Node.js:**
    Ensure you have Node.js version `22.14.0` installed. If you use [nvm](https://github.com/nvm-sh/nvm), you can run:
    ```bash
    nvm use
    ```
    Or install the required version manually.
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Set up environment variables:**
    Copy the example environment file and fill in the required values (Supabase keys, Gemini API key, etc.):
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file with your specific credentials.
5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running locally, typically at `http://localhost:4321`.

## Available Scripts

In the project directory, you can run the following scripts:

- `npm run dev`: Runs the app in development mode with hot-reloading.
- `npm run start`: Starts the app in production mode (requires `npm run build` first).
- `npm run build`: Builds the app for production.
- `npm run preview`: Previews the production build locally.
- `npm run astro`: Access Astro CLI commands.
- `npm run format`: Formats the code using Prettier.
- `npm run lint`: Lints the code using ESLint.
- `npm run test`: Runs unit and integration tests with Vitest.
- `npm run test:e2e`: Runs end-to-end tests with Playwright.
- `npm run test:ui`: Opens Playwright UI for debugging E2E tests.

### curl example
```bash
curl -v -X POST localhost:3000/api/topics/123/generate \
-H "Content-Type: application/json" \
-d '{
  "source_text": "This is a valid source text."
}'```

## Testing

The project employs a comprehensive testing strategy:

- **Unit & Integration Testing**: Using Vitest and React Testing Library to test individual components and their integration.
- **End-to-End Testing**: Using Playwright to automate browser testing across Chrome, Firefox, and Safari.
- **API Testing**: Using MSW (Mock Service Worker) for mocking API responses during testing.

Testing is integrated into the CI/CD pipeline to ensure quality assurance before deployment.

## Project Scope

### In Scope (MVP)

- User authentication (register, login, delete account).
- Topic management (create, rename, delete).
- Pasting text as a source for AI generation.
- AI (Gemini) generation of flashcards (front/back).
- Strict enforcement of character limits (100/500).
- User notification and required editing if AI exceeds limits.
- AI flashcard review interface (Accept, Regenerate, Edit).
- Manual flashcard creation, editing, and deletion within topics.
- Browsing user-created topics and their flashcards.
- Integration with an open-source spaced repetition algorithm for study sessions.
- User-friendly error messages (e.g., for API issues).

### Out of Scope (MVP)

- Custom-built spaced repetition algorithm.
- Importing flashcards or source material from files (PDF, DOCX, CSV, etc.).
- Processing URLs to fetch content for generation.
- Sharing topics or flashcards between users.
- Integrations with other platforms (LMS, calendars).
- Dedicated mobile applications (iOS, Android).
- Advanced text formatting on flashcards (bold, italics, lists).
- Adding images or audio to flashcards.
- Offline mode.

## Project Status

The project is currently in the **Minimum Viable Product (MVP)** development phase.

## License

This project is licensed under the **ISC License**. See the [LICENSE](https://opensource.org/licenses/ISC) file for details (Note: A separate LICENSE file is not present in the provided context, but `package.json` specifies ISC).

`