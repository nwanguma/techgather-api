# **TechGather API**

## **Overview**

**TechGather** is a platform designed to connect developers, creators, and professionals with collaborators who can help bring their ideas to life. Beyond simple networking, TechGather provides tools for real-time feedback, professional growth, and a vibrant community to support innovation and success.

**Mission**: To empower developers and professionals by bridging the gap between ideas and execution, fostering connections that drive career-defining opportunities.

---

## **Features**

- **Professional Profiles**: Showcase your expertise, skills, and achievements.
- **Post and read articles from top authors**: Share your ideas and find collaborators to make them a reality.
- **Create and discover seismic tech events**: Discover ground-breaking tech events, meet and collaborate with top professionals.
- **JWT Authentication**: Secure access and user management.
- **Notifications**: Stay updated with in-app and email notifications.
- **File Uploads**: Seamlessly manage avatars, banners, and resumes with AWS S3 integration.
- **Caching**: Fast and efficient data handling with Redis.

### **Upcoming Features**

- **OAuth Integration**: Simplified login with Google and LinkedIn.
- **Comprehensive Documentation**: Explore APIs through Swagger.

---

## **Tech Stack**

- **Frontend**: [Next.js](https://nextjs.org/)
- **Backend**: [NestJS](https://nestjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: JWT
- **Deployment**: Vercel / Fly.io
- **Caching**: Redis

---

## **Installation**

A live demo is available at [TechGather](https://www.loom.com/share/9e345ca374074a60b66897a76a4483bc?sid=37c72849-18c7-46ea-9aba-bcb13d36af17).

### **Prerequisites**

- **Node.js** (>= 14.x)
- **NPM**
- **Redis** (>= 6.x)

### **Steps to Set Up Locally**

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/nwanguma/techgather-api.git
   cd techgather-api
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:

   - Create a `.env` file in the root directory and populate it based on `env.example`.

4. **Seed the Database**:

   ```bash
   npm run seed:db
   ```

5. **Start the Development Server**:

   ```bash
   npm run start:dev
   ```

6. **Access the Application**:  
   Visit [http://localhost:{{PORT}}](http://localhost:{{PORT}}).

7. **Run Tests (Optional)**:
   ```bash
   npm run test:watch
   ```

---

## **Usage**

### **For Users**

1. Sign up using your email.
2. Complete your profile to unlock all features.
3. Share your projects, list required skills, and start collaborating.

---

## **Core API Endpoints**

### **Authentication**

- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Log in and receive a JWT.

### **Profiles**

- `GET /profiles/{id}`: View a specific profile.
- `PUT /profiles/{id}`: Update profile details.

### **Articles**

- `GET /articles`: List all articles.
- `GET /articles/public`: List all articles without auth.
- `GET /articles/{id}/public`: Get specific article by id without auth.
- `POST /articles`: Create an article.
- `GET /articles/{id}`: Get specific article by id.
- `PUT /articles/{id}`: Update an article.
- `DELETE /articles/{id}`: Remove an article.
- `POST /articles/{articleId}/comments`: Comment on article.
- `DELETE /articles/{articleId}/{commentId}/comments`: Delete article comment.
- `POST /articles/{articleId}/reactions`: Article reaction (limited to liking at the moment).

### **Notifications**

- `GET /notifications`: View all notifications.

### **Events**

- `GET /events`: List all events.
- `GET /events/public`: List all events without auth.
- `GET /events/{id}/public`: Get specific event by id without auth.
- `POST /events`: Create an event.
- `GET /events/{id}`: Get specific event by id.
- `PUT /events/{id}`: Update an event.
- `DELETE /events/{id}`: Remove an event.
- `POST /events/{eventId}/comments`: Comment on event.
- `DELETE /events/{eventId}/{commentId}/comments`: Comment on event.
- `POST /events/{eventId}/reactions`: Event reaction (limited to liking at the moment).
- `POST /events/{eventId}/feedbacks`: Share event feedback.
- `DELETE /events/{eventId}/{feedbackId}/feedbacks`: Delete event feedback.

### **Jobs**

- `GET /jobs`: List all jobs.
- `GET /jobs/public`: List all jobs without auth.
- `GET /jobs/{id}/public`: Get specific job by id without auth.
- `POST /jobs`: Create an job.
- `GET /jobs/{id}`: Get specific job by id.
- `PUT /jobs/{id}`: Update an job.
- `DELETE /jobs/{id}`: Remove an job.
- `POST /jobs/{jobId}/comments`: Comment on job.
- `DELETE /jobs/{jobId}/{commentId}/comments`: Comment on job.
- `POST /jobs/{jobId}/reactions`: Job reaction (limited to liking at the moment).

---

## **Contributing**

Contributions are currently not open as TechGather is actively being developed to showcase its core capabilities. Future updates will welcome community contributions.

---

## **Contact**

For inquiries or feedback, contact [nwangumat@gmail.com](mailto:nwangumat@gmail.com).

---

This **README.md** provides everything needed to explore, set up, and review the **TechGather API** project. Let us know if you have questions!
