import { MigrationFile } from '../types';

export interface AppPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  files: MigrationFile[];
}

export const APP_PRESETS: AppPreset[] = [
  {
    id: 'current-aistudio-app',
    name: 'Current AI Studio Project',
    tagline: 'Direct export of this running workspace',
    description: 'All workspace code, Vite/React configuration, metadata, and styles ready to be committed to GitHub.',
    files: [
      {
        id: 'f-1',
        path: 'package.json',
        content: JSON.stringify(
          {
            name: "gitmigrate-studio",
            private: true,
            version: "1.0.0",
            type: "module",
            scripts: {
              dev: "vite --port=3000 --host=0.0.0.0",
              build: "vite build",
              preview: "vite preview",
              lint: "tsc --noEmit"
            },
            dependencies: {
              "@tailwindcss/vite": "^4.3.3",
              "jszip": "^3.10.2",
              "lucide-react": "^0.546.0",
              "motion": "^12.23.24",
              "react": "^19.0.1",
              "react-dom": "^19.0.1",
              "tailwindcss": "^4.3.3",
              "vite": "^8.3.0"
            },
            devDependencies: {
              "@types/jszip": "^3.4.1",
              "@types/react": "^19.3.0",
              "@types/react-dom": "^19.3.0",
              "typescript": "^7.0.2"
            }
          },
          null,
          2
        ),
        isBinary: false,
        size: 780,
      },
      {
        id: 'f-2',
        path: 'tsconfig.json',
        content: JSON.stringify(
          {
            compilerOptions: {
              target: "ES2022",
              module: "ESNext",
              moduleResolution: "bundler",
              jsx: "react-jsx",
              strict: true,
              skipLibCheck: true
            }
          },
          null,
          2
        ),
        isBinary: false,
        size: 210,
      },
      {
        id: 'f-3',
        path: 'vite.config.ts',
        content: `import tailwindcss from '@tailwindcss/vite';\nimport react from '@vitejs/plugin-react';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({\n  plugins: [react(), tailwindcss()],\n});\n`,
        isBinary: false,
        size: 195,
      },
      {
        id: 'f-4',
        path: 'index.html',
        content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <title>GitMigrate Studio</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.tsx"></script>\n  </body>\n</html>\n`,
        isBinary: false,
        size: 245,
      },
      {
        id: 'f-5',
        path: 'src/main.tsx',
        content: `import { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\ncreateRoot(document.getElementById('root')!).render(<App />);\n`,
        isBinary: false,
        size: 170,
      },
      {
        id: 'f-6',
        path: 'src/App.tsx',
        content: `// Production GitMigrate Application Container\nexport default function App() {\n  return <main className="p-8">GitMigrate Studio</main>;\n}\n`,
        isBinary: false,
        size: 160,
      },
      {
        id: 'f-7',
        path: 'src/services/github.ts',
        content: `// GitHub Git Database API Connector\nexport class GitHubService {\n  // Handles Blobs, Recursive Trees, and Atomic Commits\n}\n`,
        isBinary: false,
        size: 520,
      },
      {
        id: 'f-8',
        path: 'src/types/index.ts',
        content: `export interface MigrationFile {\n  path: string;\n  content: string;\n  isBinary: boolean;\n}\n`,
        isBinary: false,
        size: 140,
      },
      {
        id: 'f-9',
        path: 'src/components/DirectoryTreeView.tsx',
        content: `// Hierarchical Directory Tree View with expand/collapse and path mapping\n`,
        isBinary: false,
        size: 320,
      },
      {
        id: 'f-10',
        path: '.gitignore',
        content: `node_modules/\ndist/\n.DS_Store\n*.log\n.env\n`,
        isBinary: false,
        size: 45,
      },
      {
        id: 'f-11',
        path: '.env.example',
        content: `# Production Environment Variables\nAPP_NAME="GitMigrate Studio"\nAPP_URL="https://ais-pre-wciiprsson4ojhsidws7gh-275720226797.europe-west2.run.app"\n`,
        isBinary: false,
        size: 135,
      },
      {
        id: 'f-12',
        path: '.github/workflows/deploy.yml',
        content: `name: Production CI\non:\n  push:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci && npm run build\n`,
        isBinary: false,
        size: 240,
      },
    ],
  },
  {
    id: 'monorepo-suite',
    name: 'Multi-App Monorepo Workspace',
    tagline: '3 apps + shared packages + CI pipeline',
    description: 'Complex multi-tiered directory structure with apps/client, apps/server, packages/ui, and root configs.',
    files: [
      {
        id: 'm-1',
        path: 'apps/client/package.json',
        content: JSON.stringify({ name: "@workspace/client", version: "1.0.0", scripts: { dev: "vite" } }, null, 2),
        isBinary: false,
        size: 180,
      },
      {
        id: 'm-2',
        path: 'apps/client/src/main.tsx',
        content: `import React from 'react';\nexport const ClientApp = () => <div>Client App</div>;`,
        isBinary: false,
        size: 95,
      },
      {
        id: 'm-3',
        path: 'apps/client/src/components/Navbar.tsx',
        content: `export const Navbar = () => <nav className="border-b">Navbar</nav>;`,
        isBinary: false,
        size: 80,
      },
      {
        id: 'm-4',
        path: 'apps/client/src/styles/globals.css',
        content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
        isBinary: false,
        size: 70,
      },
      {
        id: 'm-5',
        path: 'apps/server/package.json',
        content: JSON.stringify({ name: "@workspace/server", version: "1.0.0", scripts: { start: "node server.js" } }, null, 2),
        isBinary: false,
        size: 190,
      },
      {
        id: 'm-6',
        path: 'apps/server/src/server.ts',
        content: `import express from 'express';\nconst app = express();\napp.get('/api/health', (req, res) => res.json({ status: 'ok' }));\napp.listen(8080);`,
        isBinary: false,
        size: 160,
      },
      {
        id: 'm-7',
        path: 'apps/server/src/routes/auth.ts',
        content: `import { Router } from 'express';\nexport const authRouter = Router();`,
        isBinary: false,
        size: 90,
      },
      {
        id: 'm-8',
        path: 'packages/shared-types/index.ts',
        content: `export interface User { id: string; email: string; role: 'admin' | 'user'; }\nexport interface AuthResponse { token: string; user: User; }`,
        isBinary: false,
        size: 140,
      },
      {
        id: 'm-9',
        path: 'packages/ui/src/Button.tsx',
        content: `export const Button = ({ children }: { children: React.ReactNode }) => <button>{children}</button>;`,
        isBinary: false,
        size: 110,
      },
      {
        id: 'm-10',
        path: 'packages/ui/src/Modal.tsx',
        content: `export const Modal = ({ isOpen }: { isOpen: boolean }) => isOpen ? <div>Modal</div> : null;`,
        isBinary: false,
        size: 105,
      },
      {
        id: 'm-11',
        path: 'infra/docker/Dockerfile.api',
        content: `FROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCMD ["node", "dist/server.js"]`,
        isBinary: false,
        size: 120,
      },
      {
        id: 'm-12',
        path: 'docker-compose.yml',
        content: `version: '3.8'\nservices:\n  api:\n    build: { context: ., dockerfile: infra/docker/Dockerfile.api }\n    ports: ['8080:8080']`,
        isBinary: false,
        size: 150,
      },
      {
        id: 'm-13',
        path: '.github/workflows/monorepo-ci.yml',
        content: `name: Monorepo CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm test`,
        isBinary: false,
        size: 175,
      },
      {
        id: 'm-14',
        path: 'turbo.json',
        content: JSON.stringify({ pipeline: { build: { dependsOn: ["^build"] } } }, null, 2),
        isBinary: false,
        size: 85,
      },
    ],
  },
];
