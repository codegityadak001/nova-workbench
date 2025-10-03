# Nova - Node Versatility Desktop App

Nova is a powerful Electron-based desktop application for creating, managing, and running Node.js projects. It provides a beautiful GUI for scaffolding Express, Next.js, Nuxt.js, and other Node.js applications with built-in project management capabilities.

## Features

- 🚀 **Project Scaffolding**: Create new projects from built-in templates (Express, Next.js, Nuxt.js)
- 🎮 **Project Management**: Start, stop, restart, and monitor your Node.js applications
- 📊 **Real-time Monitoring**: Live logs and status updates for running projects
- 🔧 **Port Management**: Automatic port detection and management
- 📁 **File System Integration**: Browse and open project directories
- 🎨 **Modern UI**: Beautiful interface built with React, Tailwind CSS, and shadcn/ui
- 💾 **Local Database**: SQLite-based project metadata storage
- 🔒 **Secure**: Safe IPC communication between renderer and main processes

## Tech Stack

- **Electron**: Desktop application framework
- **React**: Frontend UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI components
- **SQLite**: Local database for project metadata
- **Vite**: Fast development and build tool

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nova
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development mode:
   ```bash
   npm run dev:nova
   ```

This will:
- Start the Vite dev server for the React frontend
- Compile TypeScript files for Electron
- Launch the Electron application in development mode

### Available Scripts

- `npm run dev:nova` - Start Nova in development mode
- `npm run dev` - Start only the Vite dev server
- `npm run compile` - Compile Electron TypeScript files
- `npm run build` - Build the application for production
- `npm run electron:pack` - Package the application with electron-builder

## Project Structure

```
nova/
├── electron/                  # Electron main process
│   ├── main.ts               # Main Electron process
│   ├── preload.ts            # Preload script (IPC bridge)
│   └── ipcHandlers/          # IPC request handlers
├── backend/                  # Shared backend modules
│   ├── db.ts                 # SQLite database manager
│   ├── projectManager.ts    # Project lifecycle management
│   ├── templateManager.ts   # Template handling
│   └── utils/                # Utility functions
├── src/                      # React frontend
│   ├── components/           # UI components
│   ├── hooks/                # React hooks
│   ├── pages/                # Application pages
│   └── types/                # TypeScript definitions
├── templates/                # Built-in project templates
│   ├── express-basic/        # Express.js template
│   ├── next-basic/           # Next.js template
│   └── nuxt-basic/           # Nuxt.js template
└── resources/                # Application resources
```

## Architecture

Nova follows a secure Electron architecture:

1. **Main Process**: Handles system operations, file system access, and process management
2. **Renderer Process**: React-based UI running in a sandboxed environment
3. **Preload Script**: Secure bridge between main and renderer processes using `contextBridge`
4. **IPC Communication**: Type-safe communication channels for all operations

## Security

- No `nodeIntegration` in renderer process
- Context isolation enabled
- Secure IPC channels with input validation
- Safe command execution with argument arrays (no shell injection)
- Path sanitization for file operations

## Templates

Nova includes built-in templates for:

- **Express Basic**: Minimal Express.js server with basic routing
- **Next.js Basic**: Next.js application with TypeScript and Tailwind CSS
- **Nuxt.js Basic**: Nuxt.js application with TypeScript and Tailwind CSS

Templates support token replacement for project names, ports, and descriptions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [ ] Custom template support
- [ ] Package manager integration (yarn, pnpm)
- [ ] Environment variable management
- [ ] Log filtering and search
- [ ] Project import/export
- [ ] Plugin system
- [ ] Cloud synchronization
- [ ] Docker integration