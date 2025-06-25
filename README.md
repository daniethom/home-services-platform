# Home Services Platform 🏠🔧

A comprehensive microservices platform connecting homeowners with service providers in South Africa's Garden Route, with integrated B2B business management tools.

## 🎯 Vision

Transform the home services industry by creating a trusted marketplace that:
- **Connects Communities**: Leverage existing WhatsApp estate groups for service referrals
- **Empowers Providers**: Offer complete business management tools (accounting, invoicing, marketing)
- **Gamifies Quality**: Reward excellent service providers with badges and rankings
- **Scales Intelligently**: Start local (Garden Route) → Provincial → National

## 🏗️ System Architecture

**Microservices Communication Flow:**

1. **API Gateway** ← All external requests
2. **Authentication Service** ← Validates users and permissions
3. **Core Services** ← Business logic and data processing
4. **Event Bus** ← Async communication between services
5. **Databases** ← Each service has its own PostgreSQL instance

### Service Breakdown

| Service | Port | Status | Purpose | Key Features |
|---------|------|--------|---------|--------------|
| **User Service** | 3001 | ✅ **COMPLETE** | Authentication & Profiles | JWT tokens, bcrypt hashing, user registration/login |
| **Provider Service** | 3002 | 📋 Planned | Service Provider Management | Profiles, portfolios, availability, service areas |
| **Booking Service** | 3003 | 📋 Planned | Job Scheduling & Management | Requests, scheduling, status tracking |
| **Review Service** | 3004 | 📋 Planned | Ratings & Reviews | Star ratings, reviews, reputation scoring |
| **Payment Service** | 3005 | 📋 Planned | Payment Processing | PayFast integration, transactions, billing |
| **Notification Service** | 3006 | 📋 Planned | Communications | WhatsApp, SMS, email notifications |
| **Gamification Service** | 3007 | 📋 Planned | Badges & Achievements | Points, levels, leaderboards, rewards |

### Architecture Principles
- **Database per Service**: Each microservice owns its data
- **Event-Driven Communication**: Services communicate via message queues
- **API Gateway**: Single entry point with authentication and rate limiting
- **Horizontal Scaling**: Scale services independently based on demand
- **Security First**: JWT authentication, input validation, rate limiting

## 🚀 Current Status

### ✅ **COMPLETED** - User Authentication System
- [x] **Complete Development Environment**: MacBook Pro M3, Podman, TypeScript
- [x] **User Service Operational**: Full authentication system working
- [x] **User Registration API**: `POST /api/v1/auth/register` - ✅ Tested & Working
- [x] **User Login API**: `POST /api/v1/auth/login` - ✅ Tested & Working  
- [x] **JWT Token Management**: Access + refresh tokens with proper expiration
- [x] **Input Validation**: Joi schemas with security validation
- [x] **Password Security**: bcrypt hashing with salt rounds
- [x] **Database Schema**: PostgreSQL with users table, indexes, triggers
- [x] **Error Handling**: RFC 7807 Problem Details format
- [x] **Health Monitoring**: Service health checks and structured logging
- [x] **Security Foundation**: Helmet, CORS, input validation

**🎉 MILESTONE ACHIEVED**: Complete authentication system with 100% test success rate!

**✨ API Endpoints Operational**:
- `GET /health` - Service health check
- `POST /api/v1/auth/register` - User registration with validation
- `POST /api/v1/auth/login` - User authentication with JWT tokens

**🧪 All Authentication Tests Passing**:
- ✅ User registration: 201 Created + JWT tokens
- ✅ User login: 200 OK + updated last_login  
- ✅ Duplicate email prevention: 409 Conflict
- ✅ Input validation: 400 Bad Request
- ✅ Invalid credentials: 401 Unauthorized

### 🚧 **IN PROGRESS** - Next Phase Planning
- [ ] Authentication middleware for protected routes
- [ ] User profile management endpoints
- [ ] Password reset functionality
- [ ] Email verification system

### 📋 **PLANNED** - Platform Expansion
- [ ] **Provider Service**: Profiles, portfolios, availability management
- [ ] **Booking Service**: Job requests, scheduling, status tracking
- [ ] **Review System**: Ratings, reviews, reputation scoring
- [ ] **Payment Integration**: PayFast, PayGate, Ozow for South Africa
- [ ] **WhatsApp Integration**: Community group engagement
- [ ] **API Gateway**: Kong/Traefik with rate limiting and routing
- [ ] **Gamification**: Badges, levels, achievements, leaderboards

## 🛠️ Tech Stack

### Backend Services
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with security middleware
- **Database**: PostgreSQL (database per service)
- **Caching**: Redis for session and rate limiting
- **Authentication**: JWT tokens with bcrypt hashing

### Infrastructure
- **Containers**: Podman (dev), Docker (production)
- **Orchestration**: Kubernetes ready
- **API Gateway**: Kong or Traefik planned
- **Monitoring**: Prometheus + Grafana + ELK stack

### South African Integrations
- **Payments**: PayFast, PayGate, Ozow
- **Communications**: WhatsApp Business API, Clickatell SMS
- **Compliance**: POPIA data protection ready

## 🏃‍♂️ Quick Start

```bash
# Clone and setup
git clone https://github.com/daniethom/home-services-platform.git
cd home-services-platform

# Start infrastructure
podman-compose up -d postgres redis

# Start User Service
cd services/user-service
npm install
npm run dev

# Verify service health
curl http://localhost:3001/health
```

### Test Authentication System

```bash
# Register a new user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User",
    "phone": "0821234567"
  }'

# Login with credentials
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

## 📁 Project Structure

```
home-services-platform/
├── services/
│   ├── user-service/          # ✅ Authentication & profiles (COMPLETE)
│   │   ├── src/
│   │   │   ├── controllers/   # Authentication logic
│   │   │   ├── models/        # User database model
│   │   │   ├── routes/        # API endpoints
│   │   │   ├── utils/         # JWT, validation, database
│   │   │   ├── middleware/    # Security and validation
│   │   │   ├── app.ts         # Express application setup
│   │   │   └── server.ts      # Server startup and configuration
│   │   ├── package.json       # Dependencies and scripts
│   │   └── tsconfig.json      # TypeScript configuration
│   ├── provider-service/      # 📋 Service provider management
│   ├── booking-service/       # 📋 Job booking & scheduling
│   ├── review-service/        # 📋 Ratings & reviews
│   ├── notification-service/  # 📋 WhatsApp, SMS, email
│   ├── payment-service/       # 📋 PayFast integration
│   └── gamification-service/  # 📋 Badges & achievements
├── shared/
│   ├── database/             # Schemas, migrations, seeds
│   └── configs/              # Common configurations
├── docs/                     # API documentation
└── docker-compose.yml        # Infrastructure services
```

## 🇿🇦 South African Market Focus

### Geographic Strategy
- **Phase 1**: Garden Route (Plettenberg Bay, Knysna, George)
- **Phase 2**: Western Cape Province  
- **Phase 3**: National expansion

### Service Categories
- Plumbing, Electrical, Cleaning, Handyman, Garden Services
- HVAC, Pest Control, Security, Painting, Tiling

### Local Integrations
- PayFast (primary payment gateway)
- WhatsApp Business API for estate communities
- Afrikaans and English language support

## 📊 Development Progress

**Daily Documentation**: Comprehensive logs tracking:
- Technical decisions and implementation details
- Challenges encountered and solutions developed  
- Code snippets and architecture evolution
- Learning insights and best practices discovered

## 📈 Metrics & Goals

### Technical KPIs
- Service uptime: 99.9% target
- API response time: <200ms average
- Database queries: <50ms average

### Business KPIs
- Provider satisfaction: 4.5+ stars
- Booking completion rate: 95%+
- Customer retention: 80%+

---

🚀 **Status**: User authentication system complete and operational  
📅 **Last Updated**: June 25, 2025  
👨‍💻 **Developed**: MacBook Pro M3 with Podman, TypeScript, PostgreSQL

**Repository**: https://github.com/daniethom/home-services-platform
