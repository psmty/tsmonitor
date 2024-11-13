# Tempus Monitor

Tempus Monitor is a site monitoring tool designed to crawl and gather information from internal company sites, providing end users with insights into the status of licenses and other key services.
The project is built using a mix of technologies for scalability and modularity, including Vue.js, Astro, PostgreSQL, and Docker.

## Features

- **Main App**: Built with Astro and Vue.js, the main app is responsible for user interaction. It runs as a server-side rendered (SSR) application.
- **Database**: PostgreSQL stores a list of monitored sites and user configurations.
- **Crawler Service**: Periodically crawls sites (every 2-5 minutes) and saves the gathered information as files.
- **File Service**: Stores site-specific information as strings in file format for easy access.

## Getting Started

### Prerequisites

- **Node.js** (v23-alpine recommended)
- **Docker** and **Docker Compose**

### Installation

1. Clone this repository.

2. Set up environment variables in a `.env` file. Refer to `.env.example` for required variables.

3. Build and run the Docker containers:
   ```bash
   docker-compose up -d
   ```

### Development

To start the main app in development mode:
```bash
npm run dev
```

## Deployment

This repository includes GitHub Actions for continuous deployment.

### GitHub Actions

- **Build and Push Docker Image**: Automatically builds and pushes the Docker image to GitHub Container Registry on commits to the main branch.
- **Deploy to Server**: Deploys the latest Docker image to the server on workflow dispatch. Environment variables are configured for production in this action.

## Docker Configuration

The `Dockerfile` uses a multi-stage build process for efficient containerization:
- **Builder Stage**: Installs dependencies and builds the app.
- **Production Stage**: Sets up the environment for production with minimal files.

## Docker Compose Configuration

- **app**: Runs the main application on port `80` (mapped to `4321` in the container).
- **db**: Uses a PostgreSQL container to store configurations.
- **pgadmin**: Provides a web interface to manage the PostgreSQL database, accessible on port `5050`.

## Scripts

- `npm run dev`: Starts the app in development mode.
- `npm run build`: Builds the app for production.
- `npm start`: Runs the app in production.
