# __PROJECT_NAME__

A basic Express.js application created with Nova.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and visit `http://localhost:__PORT__`

## Project Structure

```
__PROJECT_NAME__/
├── server.js          # Main application file
├── package.json       # Project configuration and dependencies
├── .env              # Environment variables (not tracked by git)
└── README.md         # This file
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm start` - Start the production server

## Environment Variables

Create a `.env` file in the root directory to configure your application:

```
PORT=__PORT__
NODE_ENV=development
```

## Next Steps

- Add more routes in `server.js`
- Create a `public/` directory for static files
- Add middleware for authentication, logging, etc.
- Set up a database connection
- Add tests

## Learn More

- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs/)