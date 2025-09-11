# OGCIO Unleash Server

This directory contains a customized [Unleash](https://www.getunleash.io/) feature flag server specifically configured for OGCIO (Office of the Government Chief Information Officer) with OIDC (OpenID Connect) authentication integration.

## Purpose

The OGCIO Unleash server provides:

- **Feature Flag Management**: Enable/disable features across applications without code deployments
- **OIDC Authentication**: Secure access using OpenID Connect authentication protocol
- **Custom Integration**: Tailored configuration for OGCIO's authentication infrastructure
- **Containerized Deployment**: Docker-based setup for consistent deployment across environments

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │───▶│  Unleash Server  │───▶│   PostgreSQL    │
│                 │    │   (OGCIO Auth)   │    │    Database     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   OIDC Provider  │
                       │   (AUTH_HOST)    │
                       └──────────────────┘
```

## Key Components

### 1. Custom Unleash Server (`index.js`)
- Extends the base Unleash server with OIDC authentication
- Configures database connection and logging
- Integrates custom authentication handler

### 2. OIDC Authentication Hook (`ogcio/oidc-auth-hook.js`)
- Implements OpenID Connect authentication strategy
- Handles user login without password (SSO)
- Secures API endpoints with authentication middleware

### 3. Database Utilities (`ogcio/create-db.js`)
- Automated database creation script
- Validates database names for security
- Handles PostgreSQL connection and setup

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)
- PostgreSQL (managed via Docker)

Important! Make sure that Host Networking is enabled in Docker: go to Docker Network Resources Settings and Enable Host Networking

### Quick Start with Docker Compose

1. **Clone the repository** and navigate to the project root
2. **Set up environment variables** (see [Environment Variables](#environment-variables) section)
3. **Start the services**:
   ```bash
   docker-compose -f docker-compose-ogcio.yml up
   ```
4. **Access the application**:
   - Unleash UI: http://localhost:4242
   - The application will redirect to OIDC login when accessing protected endpoints

### Environment Variables

The following environment variables are required:

#### Authentication (Required)
```bash
AUTH_APP_ID=your_oidc_client_id           # OIDC Client ID
AUTH_APP_SECRET=your_oidc_client_secret   # OIDC Client Secret  
AUTH_HOST=https://your-oidc-provider.com  # OIDC Provider base URL
```

#### Database Configuration
```bash
POSTGRES_USER=postgres              # Database username
POSTGRES_PASSWORD=unleash           # Database password  
POSTGRES_HOST=localhost             # Database host
POSTGRES_PORT=5432                  # Database port
POSTGRES_DB_NAME=db                 # Database name
DATABASE_SSL=false                  # SSL connection (false for local dev)
```

#### Application Settings
```bash
NODE_ENV=production                 # Application environment
LOG_LEVEL=warn                      # Logging level (debug, info, warn, error)
CONTEXT_PATH=""                     # Base path for the application (optional)
```

#### API Tokens (Development)
```bash
INIT_FRONTEND_API_TOKENS=default:development.unleash-insecure-frontend-api-token
INIT_CLIENT_API_TOKENS=default:development.unleash-insecure-api-token
```

### Manual Deployment

#### 1. Build the Docker Image
```bash
docker build -f Dockerfile.ogcio -t unleash-ogcio .
```

#### 2. Start PostgreSQL Database
```bash
docker run -d \
  --name unleash-db \
  -e POSTGRES_DB=db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=unleash \
  -p 5432:5432 \
  postgres:15
```

#### 3. Run the Unleash Server
```bash
docker run -d \
  --name unleash-ogcio \
  --link unleash-db:postgres \
  -p 4242:4242 \
  -e POSTGRES_HOST=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=unleash \
  -e POSTGRES_DB_NAME=db \
  -e AUTH_APP_ID=your_client_id \
  -e AUTH_APP_SECRET=your_client_secret \
  -e AUTH_HOST=https://your-oidc-provider.com \
  unleash-ogcio
```

## Development

### Local Development Setup

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Set environment variables** in a `.env` file

3. **Start the server**:
   ```bash
   yarn start
   ```

### Project Structure

```
ogcio/
├── index.js                 # Main application entry point
├── package.json            # Dependencies and scripts
├── yarn.lock              # Dependency lock file
├── .yarnrc.yml            # Yarn configuration
└── ogcio/
    ├── oidc-auth-hook.js   # OIDC authentication implementation
    ├── create-db.js        # Database creation utility
    └── database.json       # Database configuration
```

## OIDC Authentication Flow

1. **User Access**: User attempts to access Unleash UI
2. **Authentication Check**: Server checks for authenticated session
3. **Redirect to OIDC**: Unauthenticated users redirected to OIDC provider
4. **OIDC Login**: User authenticates with OIDC provider
5. **Callback Processing**: OIDC provider redirects back with authorization code
6. **User Creation**: Server creates/updates user account based on OIDC profile
7. **Session Creation**: User session established, access granted

## API Endpoints

- `GET /api/admin/login` - Initiates OIDC authentication
- `GET /api/auth/callback` - OIDC callback endpoint
- `GET /health` - Health check endpoint
- `/api/*` - All API endpoints require authentication

## Security Considerations

- **Environment Variables**: Store sensitive values (secrets, passwords) securely
- **HTTPS**: Use HTTPS in production environments
- **Database Security**: Ensure PostgreSQL is properly secured
- **Network Security**: Restrict network access as appropriate
- **Token Security**: Rotate API tokens regularly

## Troubleshooting

### Common Issues

1. **OIDC Configuration Errors**
   - Verify `AUTH_APP_ID`, `AUTH_APP_SECRET`, and `AUTH_HOST` are correct
   - Check OIDC provider configuration and callback URLs

2. **Database Connection Issues**
   - Ensure PostgreSQL is running and accessible
   - Verify database credentials and connection parameters

3. **Port Conflicts**
   - Default port 4242 may be in use, modify docker-compose.yml if needed

### Logs

View application logs:
```bash
docker-compose -f docker-compose-ogcio.yml logs -f web
```

View database logs:
```bash
docker-compose -f docker-compose-ogcio.yml logs -f db
```

## Production Deployment

### Security Checklist

- [ ] Use secure, randomly generated passwords
- [ ] Enable SSL/TLS for database connections
- [ ] Use production-grade OIDC provider
- [ ] Implement proper network security (firewalls, VPNs)
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategies for the database
- [ ] Use secrets management system for environment variables

### Performance Considerations

- Configure appropriate database connection pooling
- Set up database monitoring and optimization
- Consider using read replicas for high-traffic scenarios
- Implement caching strategies if needed

## Support

For issues related to:
- **Unleash Core**: Refer to [Unleash Documentation](https://docs.getunleash.io/)
- **OGCIO Integration**: Contact the OGCIO development team
- **OIDC Authentication**: Check OIDC provider documentation

## License

This project follows the same license as the main Unleash project. 