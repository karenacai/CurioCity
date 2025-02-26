# Product Requirements Document (PRD)

## 1. Overview

### 1.1 Product Name
AI Trivia App

### 1.2 Description
The AI Trivia App is a web-based application that generates personalized trivia questions daily based on user interests. Users can log in, receive trivia questions, save their favorite trivia, and track their trivia history. The app will integrate AI APIs (OpenAI, Gemini, or DeepSeek) to dynamically generate trivia questions and answers.

### 1.3 Objectives
- Provide an engaging and fun trivia experience using AI
- Personalize trivia based on user-selected categories
- Allow users to save and review past trivia
- Implement authentication and user data storage
- Enforce rate limits for API calls to control daily trivia access

## 2. Features

### 2.1 Core Features

**User Authentication**
- Users can sign up and log in using Supabase Auth (Google, Email/Password)
- User profile includes email and sign-up date

**Trivia Generation**
- Users select trivia categories (e.g., Science, History, Pop Culture)
- AI generates a trivia question and answer based on the selected category
- Trivia is stored in the database to track history

**User Trivia History**
- Users can view past trivia questions they have received
- Prevent duplicate trivia questions

**Favorites System**
- Users can save favorite trivia questions
- Saved trivia is stored and displayed on the profile page

**Rate Limiting**
- Users can generate up to 3 trivia questions per day
- Enforced via Supabase database queries

### 2.2 Future Enhancements
- Trivia Streaks: Users get rewards for playing daily
- Leaderboard: Shows top users who answer the most trivia correctly
- Multiplayer Mode: Users can challenge friends to trivia
- Premium Tier: Paid users can get unlimited trivia questions

## 3. Technical Specifications

### 3.1 Tech Stack
**Frontend:**
- Framework: Next.js (React)
- Styling: TailwindCSS

**Backend:**
- Authentication & Database: Supabase (PostgreSQL)
- API Functions: Next.js API Routes or Supabase Edge Functions
- AI API Integration: OpenAI, Gemini, or DeepSeek for trivia generation

### 3.2 Database Schema (Supabase)

**users (stores user accounts)**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique user ID |
| email | TEXT (Unique) | User email |
| created_at | TIMESTAMP | Signup date |

**trivia_questions (stores AI-generated trivia)**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Unique trivia ID |
| difficulty | INT (FK) | difficulty level of trivia from 1-10 (easy-hard) |
| question | TEXT | Trivia question |
| choices | TEXT | Trivia multiple choice answers |
| answer | TEXT | Trivia correct answer |
| category | TEXT | Category of trivia |
| created_at | TIMESTAMP | Date generated |
| user_id | UUID (FK) | User reference |

**user_trivia_history (tracks user-trivia interactions)**
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL (PK) | Unique record ID |
| user_id | UUID (FK) | User reference |
| trivia_id | INT (FK) | Trivia reference |
| created_at | TIMESTAMP | Date received |

**favorites (tracks user's saved trivia)**
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL (PK) | Unique favorite ID |
| user_id | UUID (FK) | User reference |
| trivia_id | INT (FK) | Trivia reference |
| created_at | TIMESTAMP | Date saved |

## 4. User Workflow
1. User logs in (Supabase Auth)
2. User selects a trivia category (Frontend UI)
3. Backend checks rate limit (3 questions max per day)
4. AI generates trivia, saves it in trivia_questions
5. Trivia is displayed to the user
6. User can save trivia to favorites
7. User can view saved trivia in their profile

## 5. Deployment Plan

### 5.1 Development Environment
- Local development using Next.js, Supabase, and Edge Functions
- API testing using Postman

### 5.2 Deployment Strategy
- Frontend: Deploy to Vercel (Next.js auto-deployment)
- Backend: Supabase Edge Functions or Next.js API Routes
- Database: Supabase PostgreSQL (auto-scaling)

## 6. Risks & Mitigation
| Risk | Mitigation Strategy |
|------|-------------------|
| High API costs due to AI calls | Limit daily API requests per user (e.g., 3/day) |
| Duplicate trivia questions | Store past trivia and avoid repeating |
| User abuse (spam accounts) | Require authentication and limit free users |

## 7. Next Steps
1. Set up Next.js project with Supabase integration
2. Implement authentication using Supabase Auth
3. Create Next.js API routes (or Supabase Edge Functions) for AI calls
4. Develop frontend UI (Trivia selection, display, favorites)
5. Deploy and test rate limits to prevent API overuse
6. Launch MVP and gather feedback

Would you like help setting up Supabase Edge Functions or API routes next? 🚀

