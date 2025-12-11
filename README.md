# Entoo2 Web

Frontend web application for Entoo2 - a document sharing platform for law students.

## Tech Stack

- **Framework**: SvelteKit 2.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Internationalization**: svelte-i18n (Czech, English)
- **Build Tool**: Vite

## Features

- 🌓 Dark/Light mode with Linear-inspired design
- 🌍 Multi-language support (Czech, English)
- 🔐 Authentication (Login, Register)
- 📚 Subject and document management
- 🔍 Full-text search with fuzzy matching
- ⭐ Favorites system
- 💬 Comments and Q&A
- 📱 Responsive design

## Development

### Prerequisites

- Node.js 18+ and npm/pnpm
- Running backend API (see [entoo2-api](https://github.com/P3chys/entoo2-api))

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Docker

### Development

```bash
docker build -f Dockerfile.dev -t entoo2-web:dev .
docker run -p 5173:5173 entoo2-web:dev
```

### Production

```bash
docker build -t entoo2-web:latest .
docker run -p 3000:3000 entoo2-web:latest
```

## Project Structure

```
src/
├── lib/
│   ├── components/     # Reusable UI components
│   ├── stores/         # Svelte stores (auth, theme, etc.)
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── i18n/           # Translation files
├── routes/             # SvelteKit routes
│   ├── (auth)/         # Authentication pages
│   ├── (app)/          # Main application pages
│   └── +layout.svelte  # Root layout
└── app.css             # Global styles
```

## Related Repositories

- [entoo2-api](https://github.com/P3chys/entoo2-api) - Backend API
- [entoo2-infra](https://github.com/P3chys/entoo2-infra) - Infrastructure and Docker Compose

## License

MIT
