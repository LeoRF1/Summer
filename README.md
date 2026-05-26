# Summer

A full-stack application for clinical query processing with AI-powered assistance.

**Live Demo:** https://summer-my6c.vercel.app/

## 📋 Project Overview

Summer is a comprehensive solution designed to handle clinical queries with intelligent backend processing and a modern frontend interface. The project is built with:

- **Backend:** Express.js with Node.js
- **Frontend:** React with Vite
- **Database:** PostgreSQL with Prisma ORM
- **AI Integration:** Anthropic Claude API
- **Language:** 98.8% JavaScript, 1.2% HTML

## 🏗️ Project Structure

```
Summer/
├── Server/              # Express.js backend server
│   └── package.json    # Server dependencies
├── Client/             # Frontend application
│   └── clinicalQuery/  # React + Vite application
│       └── package.json
├── .postman/           # Postman collection files
├── postman/            # API documentation files
├── package.json        # Root dependencies
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Anthropic API key (for Claude integration)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LeoRF1/Summer.git
   cd Summer
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install server dependencies:**
   ```bash
   cd Server
   npm install
   cd ..
   ```

4. **Install client dependencies:**
   ```bash
   cd Client/clinicalQuery
   npm install
   cd ../..
   ```

### Configuration

Create a `.env` file in the Server directory:

```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=your_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 🛠️ Development

### Start the Server

```bash
cd Server
npm run dev        # Development mode with hot reload
# or
npm start          # Production mode
```

The server will run on `http://localhost:5000`

### Start the Client

```bash
cd Client/clinicalQuery
npm run dev        # Development server with Vite
```

The client will be available at `http://localhost:5173`

### Build for Production

**Server:**
```bash
cd Server
npm start
```

**Client:**
```bash
cd Client/clinicalQuery
npm run build
npm run preview    # Preview production build
```

## 📦 Key Dependencies

### Server
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **postgresql** - Database
- **Anthropic SDK** - AI integration
- **Axios** - HTTP client
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Client
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **ESLint** - Code linting

## 🧪 Testing & Linting

### Server
```bash
cd Server
npm test
```

### Client
```bash
cd Client/clinicalQuery
npm run lint       # Run ESLint
```

## 📡 API Documentation

API documentation and testing files are available in the `postman` and `.postman` directories. Import these into Postman to explore available endpoints.

## 🤖 AI Integration

This project integrates with the **Anthropic Claude API** for intelligent clinical query processing. Ensure your `ANTHROPIC_API_KEY` is properly configured in the environment variables.

## 🗄️ Database

The project uses **Postgresql** with **Prisma** as the ORM. Database initialization happens automatically on server startup through the `postinstall` script.

## 📝 Scripts

### Root Level
```bash
npm install        # Install all dependencies
```

### Server
```bash
npm run start      # Start server with Prisma generation
npm run dev        # Development mode with hot reload
```

### Client
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## 📄 License

ISC

## 👤 Author

[LeoRF1](https://github.com/LeoRF1)

## 🔗 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Anthropic API Documentation](https://docs.anthropic.com/)

## 📞 Support

For issues and questions, please use the [GitHub Issues](https://github.com/LeoRF1/Summer/issues) page.
