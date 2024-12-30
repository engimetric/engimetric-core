# Engimetric Monorepo

Welcome to the **Engimetric Monorepo** – the core repository for the Engimetric platform. This monorepo houses both the **backend** and **frontend** services, providing a scalable architecture for team collaboration, integrations, and AI-powered insights.

## 🚀 Overview

Engimetric is an open-source platform designed to offer:

- Seamless integrations with tools like **GitHub**, **Jira**, and **Zoom** (more to come!)
- AI-powered summaries and insights for team performance and productivity
- Modular architecture with clear separation of **backend** and **frontend** services
- Self-hosted and cloud-hosted deployment options

## 📂 Monorepo Structure

```
engimetric-core/
├── backend/       # Backend services (Node.js + Express)
├── frontend/      # Frontend services (Next.js + React)
├── .github/       # GitHub workflows and CI/CD configuration
├── package.json   # Root dependencies and scripts
└── README.md      # Project documentation
```

### Backend

- **Framework:** Node.js with Express
- **Language:** TypeScript
- **Port:** Runs on `http://localhost:1050`
- **Environment Files:** `.env.development`, `.env.production`
- **Key Features:** Authentication, API services, cron jobs, caching

Example `.env.development`:

```env
PORT=1050
JWT_EXPIRES_IN="1y"
JWT_SECRET="some-secret"
NODE_ENV=development
DB_USER="engimetric_user"
DB_PASSWORD="some-password"
DB_HOST="localhost"
DB_PORT=5432
DB_NAME="engimetric"
SERVER_ROUTE='/api'
FRONTEND_URL="http://localhost:3000"
```

### Frontend

- **Framework:** Next.js with React
- **Language:** TypeScript
- **Port:** Runs on `http://localhost:3000`
- **Environment Files:** `.env.development`, `.env.production`
- **Key Features:** Responsive UI, dynamic dashboards, integration configurations

Example `.env.development`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:1050/api
```

## 🛠️ Setup & Installation

### Prerequisites

Make sure you have the following installed:

- **Node.js** (>=16.x)
- **npm** (>=8.x)
- **PostgreSQL** (if using the backend locally)

### Installation Steps

Clone the repository:

```bash
git clone https://github.com/engimetric/engimetric-core.git
cd engimetric-core
```

#### Backend Installation

```bash
cd backend
npm install
npm run dev
```

Backend will run on `http://localhost:1050/api`

#### Frontend Installation

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🚦 Scripts

### Backend

- **Start in development:** `npm run dev`
- **Build for production:** `npm run build`
- **Start in production:** `npm run start`

### Frontend

- **Start in development:** `npm run dev`
- **Build for production:** `npm run build`
- **Start in production:** `npm run start`

## 🧠 AI Summaries

Engimetric supports AI-generated insights powered by **LLama** (self-hosted) or **OpenAI** integrations. Summaries are available for both team-wide and individual user performance.

## 📚 Documentation

- **Wiki:** [Engimetric GitHub Wiki](https://github.com/engimetric/engimetric-core/wiki)
- **Discussions:** [Engimetric GitHub Discussions](https://github.com/engimetric/engimetric-core/discussions)

## 📝 Contributing

We welcome contributions! Please open an issue or pull request on our GitHub repository.

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m "Add new feature"`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

## 📜 License

This project is licensed under the **AGPL-3.0** License.

## 📞 Support

- **Website:** [engimetric.com](https://engimetric.com)
- **Issues:** [GitHub Issues](https://github.com/engimetric/engimetric-core/issues)
- **Email:** <support@engimetric.com>

Happy coding! 🚀✨
