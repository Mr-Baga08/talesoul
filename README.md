# TaleSoul - Mentorship & Learning Platform

A self-hosted, Docker Compose-based MVP for a mentorship and learning platform. Built with FastAPI (Python), React, PostgreSQL, and NGINX.

## 🎯 Architecture Overview

This project uses a **Docker Compose MVP Architecture** that's simple to deploy on a single server but structured for future scalability.

### Services

1. **nginx-proxy** - Web server & reverse proxy
   - Serves React frontend (static files)
   - Proxies API requests to backend
   - Serves uploaded files (profile pictures, videos, etc.)

2. **backend-api** - FastAPI Python backend
   - RESTful API with modular routers
   - JWT-based authentication
   - File upload handling
   - Database models and schemas

3. **db** - PostgreSQL database
   - Persistent data storage
   - User accounts, bookings, courses, community data

## 📂 Project Structure

```
talesoul/
├── docker-compose.yml          # Master orchestration file
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── README.md                   # This file
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── __init__.py
│       ├── main.py             # Main FastAPI app
│       ├── database.py         # DB connection logic
│       ├── models.py           # SQLAlchemy models
│       ├── schemas.py          # Pydantic schemas
│       ├── routers/            # Modular API endpoints
│       │   ├── auth.py         # Authentication & user management
│       │   ├── bookings.py     # Mentor booking system
│       │   ├── courses.py      # Course management
│       │   ├── community.py    # Forum/discussion groups
│       │   └── admin.py        # Admin panel & approvals
│       └── uploads/            # File uploads directory
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       └── App.css
│
└── nginx/
    ├── Dockerfile
    └── default.conf            # NGINX configuration
```

## 🚀 Quick Start

### Prerequisites

- Docker (20.x or higher)
- Docker Compose (2.x or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd talesoul
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and change SECRET_KEY and database credentials
   nano .env
   ```

3. **Build and start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost
   - API Docs: http://localhost/docs
   - Backend Health: http://localhost/api/v1/health

### First-Time Setup

1. **Create an admin user**

   You need to manually create the first admin user in the database:

   ```bash
   # Connect to the database
   docker-compose exec db psql -U talesoul -d talesoul

   # Create admin user (password: "admin123" hashed with bcrypt)
   INSERT INTO users (email, full_name, hashed_password, role, is_active)
   VALUES (
     'admin@talesoul.com',
     'Admin User',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqNqz6Xx0K',
     'admin',
     true
   );
   ```

2. **Login and start using the platform**
   - Email: admin@talesoul.com
   - Password: admin123

## 🛠️ Development

### Running in Development Mode

The docker-compose.yml is already configured for development with hot-reload:

```bash
docker-compose up
```

- Backend changes will auto-reload (uvicorn --reload)
- Frontend changes require rebuild or local development

### Local Frontend Development

For faster React development:

```bash
cd frontend
npm install
npm start
```

This runs the React dev server on http://localhost:3000 with hot-reload.

### Database Migrations

To reset the database:

```bash
docker-compose down -v  # Remove volumes
docker-compose up --build
```

For production, consider using Alembic for migrations:

```bash
# Inside backend container
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 📋 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `GET /me` - Get current user profile
- `POST /mentor/apply` - Apply to become a mentor
- `GET /mentor/profile` - Get own mentor profile
- `POST /upload-profile-picture` - Upload profile picture

### Bookings (`/api/v1/bookings`)
- `GET /mentors` - List approved mentors
- `GET /mentors/{id}` - Get mentor profile
- `POST /availability` - Create availability slot (mentors)
- `GET /availability/{mentor_id}` - Get mentor availability
- `POST /book` - Book a session with mentor
- `GET /my-bookings` - Get user's bookings
- `GET /mentor-bookings` - Get mentor's bookings
- `PATCH /{booking_id}` - Update booking
- `DELETE /{booking_id}` - Cancel booking

### Courses (`/api/v1/courses`)
- `POST /` - Create course (mentors only)
- `GET /` - List published courses
- `GET /my-courses` - Get own courses
- `GET /{course_id}` - Get course details
- `PATCH /{course_id}` - Update course
- `DELETE /{course_id}` - Delete course
- `POST /{course_id}/upload-video` - Upload course video
- `POST /{course_id}/upload-thumbnail` - Upload thumbnail
- `POST /enroll` - Enroll in course
- `GET /my-enrollments` - Get enrollments
- `PATCH /enrollments/{id}/progress` - Update progress

### Community (`/api/v1/community`)
- `POST /groups` - Create discussion group
- `GET /groups` - List groups
- `GET /groups/{id}` - Get group details
- `POST /posts` - Create post
- `GET /posts` - List posts
- `GET /posts/{id}` - Get post
- `PATCH /posts/{id}` - Update post
- `DELETE /posts/{id}` - Delete post
- `POST /replies` - Create reply
- `GET /posts/{id}/replies` - Get post replies
- `DELETE /replies/{id}` - Delete reply

### Admin (`/api/v1/admin`)
- `GET /pending-mentors` - List pending mentor applications
- `POST /approve-mentor` - Approve/reject mentor
- `GET /mentors` - List all mentors
- `GET /users` - List all users
- `PATCH /users/{id}/deactivate` - Deactivate user
- `PATCH /users/{id}/activate` - Activate user
- `PATCH /users/{id}/role` - Change user role
- `GET /stats` - Get platform statistics
- `GET /bookings` - List all bookings
- `GET /courses` - List all courses

## 🎯 MVP Roadmap

### Phase 1: Core Foundation ✅
- [x] Docker Compose setup
- [x] Database models
- [x] Authentication with JWT
- [x] User registration & login
- [x] Mentor application system
- [x] Admin approval workflow

### Phase 2: Mentor Booking System
- [ ] Frontend: Mentor profile pages
- [ ] Frontend: Booking flow UI
- [ ] Payment integration (Stripe/Razorpay)
- [ ] Email notifications
- [ ] Meeting link generation

### Phase 3: Course Marketplace
- [ ] Frontend: Course upload UI
- [ ] Frontend: Course marketplace
- [ ] Video player integration
- [ ] Course enrollment UI
- [ ] Payment processing

### Phase 4: Community Features
- [ ] Frontend: Discussion groups UI
- [ ] Frontend: Post creation & replies
- [ ] Optional: Real-time updates (WebSockets)
- [ ] Moderation tools

### Phase 5: B2B Features
- [ ] Institute admin dashboard
- [ ] Company admin dashboard
- [ ] Bulk user invitations
- [ ] Progress tracking & analytics

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
POSTGRES_USER=talesoul
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=talesoul

# Backend
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=/app/uploads

# Database URL
DATABASE_URL=postgresql://talesoul:your_secure_password@db:5432/talesoul
```

### Security Considerations

1. **Change default credentials** in `.env`
2. **Use strong SECRET_KEY** (generate with `openssl rand -hex 32`)
3. **Enable HTTPS** in production (use Let's Encrypt with NGINX)
4. **Set CORS origins** in `backend/app/main.py`
5. **Implement rate limiting** for APIs
6. **Add input validation** for all endpoints

## 🚀 Deployment

### Deploy to VPS (DigitalOcean, Linode, etc.)

1. **Provision a server**
   - Ubuntu 22.04 LTS recommended
   - Minimum 2GB RAM, 2 CPUs

2. **Install Docker and Docker Compose**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Clone and configure**
   ```bash
   git clone <your-repo>
   cd talesoul
   cp .env.example .env
   nano .env  # Update credentials
   ```

4. **Start services**
   ```bash
   docker-compose up -d
   ```

5. **Set up domain and SSL**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx

   # Get SSL certificate
   sudo certbot --nginx -d yourdomain.com
   ```

### Deploy with Docker Swarm (Optional)

For high availability:

```bash
docker swarm init
docker stack deploy -c docker-compose.yml talesoul
```

## 🌥️ Migration to Cloud (Future)

When you're ready to scale, migrate services individually:

### 1. Frontend → Cloud Storage + CDN
- Upload React build to Cloud Storage (AWS S3, Google Cloud Storage)
- Point CDN to storage bucket
- Update NGINX to serve from CDN

### 2. Database → Managed Database
- Export data: `pg_dump`
- Import to Cloud SQL, RDS, or managed PostgreSQL
- Update `DATABASE_URL` in backend

### 3. Backend → Cloud Run / Container Service
- Build Docker image
- Push to container registry
- Deploy to Cloud Run, AWS ECS, or Google Cloud Run

### 4. File Uploads → Object Storage
- Change upload logic in `auth.py` and `courses.py`
- Use Cloud Storage SDK instead of local filesystem

### 5. Real-time Features → Managed Service
- Refactor `community.py` to use Firestore or similar
- Add WebSocket support for live chat

## 🧪 Testing

### Run Backend Tests

```bash
docker-compose exec backend-api pytest
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ for the TaleSoul community**
