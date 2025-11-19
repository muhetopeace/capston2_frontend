# Medium Clone - Blogging Platform

A full-stack blogging platform built with Next.js, featuring user authentication, post creation, comments, likes, claps, and social features like following users.

##  Project Overview

This is a modern blogging platform inspired by Medium, where users can:
- Create and publish blog posts with rich text editing
- Interact with posts through likes and claps
- Comment on posts with nested reply support
- Follow other users
- Search and filter posts by tags
- View user profiles and their published content

##  Technology 

### Frontend
- **Next.js 16.0.3** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Jodit React** - Rich text editor for post creation
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **TanStack Query (React Query)** - Server state management
- **React Markdown** - Markdown rendering

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js 4.24.13** - Authentication system
- **Prisma 6.19.0** - ORM for database operations
- **PostgreSQL** - Relational database
- **bcryptjs** - Password hashing
- **Cloudinary** - Image upload and management (configured)

 ## Development Tools
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Vercel Analytics** - Analytics integration

## Project Structure

```
capston2_frontend/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── posts/         # Post CRUD operations
│   │   ├── search/        # Search functionality
│   │   └── users/         # User operations
│   ├── auth/              # Authentication pages
│   ├── blog/              # Blog listing page
│   ├── editor/            # Post editor page
│   ├── posts/             # Individual post pages
│   ├── profile/           # User profile pages
│   ├── search/            # Search page
│   ├── tags/              # Tag pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # React Query & Session providers
├── components/            # Reusable React components
│   ├── CommentsSection.tsx
│   ├── FollowButton.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── PostActions.tsx
│   └── PostContent.tsx
├── hooks/                 # Custom React hooks
│   └── useDebounce.ts
├── lib/                   # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client instance
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Helper functions
├── prisma/               # Database schema
│   └── schema.prisma
└── types/                # TypeScript type definitions

```

## Database Schema

The application uses PostgreSQL with the following main models:

- **User** - User accounts with authentication
- **Post** - Blog posts with content, metadata, and publishing status
- **Tag** - Post categorization tags
- **PostTag** - Many-to-many relationship between posts and tags
- **Comment** - Post comments with nested reply support
- **Like** - Post likes (one per user per post)
- **Clap** - Post claps with count (one per user per post)
- **Follow** - User following relationships
- **Account** & **Session** - NextAuth authentication tables

##  Key Features

### 1. Authentication System
- Email/password authentication
- Secure password hashing with bcryptjs
- JWT-based session management
- Protected routes and API endpoints

### 2. Post Management
- Rich text editor (Jodit) for content creation
- Draft and publish workflow
- Cover image support
- Tag system for categorization
- Slug-based URLs for SEO

### 3. Social Interactions
- Like posts (binary like/unlike)
- Clap posts (incremental claps)
- Comment system with nested replies
- Follow/unfollow users
- User profiles with published posts

### 4. Content Discovery
- Home page with latest posts
- Tag-based filtering
- Search functionality
- User profile pages
- Blog listing page

### 5. User Experience
- Responsive design (mobile-friendly)
- Dark mode support (CSS variables)
- Optimistic UI updates with React Query
- Form validation with Zod
- Loading states and error handling

##  Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <https://github.com/muhetopeace/capston2_frontend.git>
cd capston2_frontend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:Peamb%40987@localhost:5432/medium_clone?schema=public"
NEXTAUTH_SECRET="Peamb-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database
```bash
npx prisma generate
npx prisma migrate dev
```

5. Run the development server
```bash
npm run dev
```

6. Open [https://github.com/muhetopeace/capston2_frontend.git](https://github.com/muhetopeace/capston2_frontend.git)

##  Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

##  Authentication Flow

1. User signs up with email/password
2. Password is hashed with bcryptjs
3. User account is created in database
4. User is automatically signed in
5. Session is managed via NextAuth with JWT strategy
6. Protected routes check authentication status

##  API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Posts
- `GET /api/posts` - List posts (with filters)
- `POST /api/posts` - Create new post
- `GET /api/posts/[slug]` - Get single post
- `PUT /api/posts/[slug]` - Update post
- `POST /api/posts/[slug]/like` - Toggle like
- `POST /api/posts/[slug]/clap` - Add clap
- `GET /api/posts/[slug]/comments` - Get comments
- `POST /api/posts/[slug]/comments` - Create comment

### Users
- `POST /api/users/[id]/follow` - Follow/unfollow user

### Search
- `GET /api/search` - Search posts and users

##  Styling

The project uses Tailwind CSS 4 with:
- Custom CSS variables for theming
- Dark mode support via `prefers-color-scheme`
- Prose styles for markdown content
- Responsive design utilities
- Custom utility functions (`cn` for class merging)

##  Testing

The project includes Jest configuration for testing:
- Test files should be placed alongside components
- Uses `@testing-library/react` for component testing
- Jest environment configured for React

##  Deployment

The application is ready for deployment on platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS**
- Any Node.js hosting platform

Ensure environment variables are set in your deployment platform.

##  Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected API routes
- Input validation with Zod
- SQL injection prevention via Prisma ORM
- XSS protection through React's built-in escaping

##  License

This project is for educational purposes.

##  Contributing

This is a capstone project. For questions or issues, please contact the project maintainer.


