# DWI Classroom Dashboard

An AI-powered classroom platform for DWI education programs. Features include role-based login (Student, Instructor, Admin), automated attendance, an AI assistant for students, curriculum building tools, live class monitoring, scheduling, and a public-facing website.

Originally built in [Google AI Studio](https://aistudio.google.com/), adapted for local development with Vite.

## Prerequisites

- [Bun](https://bun.sh/) (v1.0+) — runtime and package manager
- (Optional) A [Google Gemini API key](https://aistudio.google.com/apikey) for AI-powered features

## Getting Started

```bash
# Clone the repo
git clone git@github.com:Diiiploy/tx-dwi.git
cd tx-dwi

# Install dependencies
bun install

# Start the dev server
bun run dev
```

The app will be available at **http://localhost:5173/**.

To make it accessible on your local network:

```bash
bunx vite --host
```

## Gemini API Key (Optional)

The app includes AI-powered features (student chat assistant, ad copy generation, class summaries) that require a Google Gemini API key. Without a key, the app loads and runs normally — AI features will show an error only when invoked.

To enable AI features, set the `API_KEY` environment variable:

```bash
API_KEY=your-gemini-api-key bun run dev
```

Or create a `.env` file in the project root:

```
API_KEY=your-gemini-api-key
```

## Project Structure

```
├── index.html              # Entry point
├── index.tsx               # React root mount
├── App.tsx                 # Main app component (routing, state)
├── types.ts                # TypeScript type definitions
├── components/
│   ├── RoleSelector.tsx    # Landing page — role selection
│   ├── StudentLogin.tsx    # Student authentication flow
│   ├── StudentClassroom.tsx# Student classroom view
│   ├── AdminDashboard.tsx  # Admin dashboard entry
│   ├── admin/              # Admin sub-components (scheduling, monitoring, CMS, etc.)
│   ├── student/            # Student sub-components
│   ├── website/            # Public-facing website pages
│   ├── dwi/                # DWI-specific paperwork components
│   └── icons.tsx           # Shared icon components
├── services/
│   ├── geminiService.ts    # Google Gemini AI integration
│   └── telzioService.ts    # Telzio phone/call integration
├── utils/
│   ├── ndpScoring.ts       # NDP screening score calculation
│   └── audio.ts            # Audio utilities
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Tech Stack

- **React 19** with TypeScript
- **Tailwind CSS** (via CDN)
- **Vite** for development and bundling
- **Google Gemini AI** (`@google/genai`) for AI features
- **Bun** as the package manager and runtime

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
