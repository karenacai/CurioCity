# Full-Stack Implementation Plan for Daily Trivia App

This document outlines a complete full-stack implementation plan for a daily trivia app that queries for trivia questions based on a specified category. The app will allow users to answer questions, view their answer history, and mark questions as favorites. Future features and enhancements are also discussed.

---

## 1. System Architecture Overview

- **Frontend:**  
  - **Framework:** React with Next.js for server-side rendering and routing.  
  - **Styling:** TailwindCSS for a modern, responsive design.  
  - **Pages:**  
    - **Daily Trivia Page:** Displays the trivia question, provides an input for answer submission, and gives immediate feedback (correct/incorrect).  
    - **History Page:** Lists all past trivia attempts with details on user responses and results.  
    - **Favorites Page:** Shows trivia questions the user has marked as favorites.  
    - **User Auth:** Login and registration pages using Supabase Auth.

- **Backend:**  
  - **Database:** Supabase (PostgreSQL) will store users, trivia questions, user answer history, and favorites.  
  - **API Routes:** Next.js API routes for handling trivia generation, answer submission, and fetching data for history and favorites.

- **AI Integration:**  
  - **Models:** OpenAI GPT-4, Gemini, or DeepSeek can be used to generate trivia questions based on a given category.  
  - **Integration:** A dedicated API endpoint fetches the appropriate category (queried on the frontend) and calls the selected AI service to generate a trivia question.

---

## 2. Database Schema Design

Below are the tables with columns, keys, and datatypes, illustrating how the data relates across tables.

### Users Table

| Column Name | Key Type    | Data Type           | Description                                             |
|-------------|-------------|---------------------|---------------------------------------------------------|
| user_id     | Primary Key | UUID (or SERIAL)    | Unique identifier for each user                         |
| email       | —           | VARCHAR             | User email address                                      |
| password    | —           | VARCHAR             | Hashed password (managed via Supabase Auth)             |
| created_at  | —           | TIMESTAMP           | Account creation timestamp                              |

### Trivia Table

| Column Name    | Key Type     | Data Type           | Description                                                        |
|----------------|--------------|---------------------|--------------------------------------------------------------------|
| trivia_id      | Primary Key  | UUID (or SERIAL)    | Unique identifier for each trivia question                         |
| question_text  | —            | TEXT                | The trivia question text                                           |
| correct_answer | —            | TEXT                | The correct answer for the trivia question                         |
| category       | —            | VARCHAR             | Category of the trivia question (e.g., History, Science, etc.)       |
| generated_at   | —            | TIMESTAMP           | Date/time when the trivia was generated                            |

### User History Table

| Column Name | Key Type     | Data Type           | Description                                                 |
|-------------|--------------|---------------------|-------------------------------------------------------------|
| history_id  | Primary Key| UUID (or SERIAL)    | Unique identifier for the history record                  |
| user_id     | Foreign Key| UUID                | References Users (`user_id`)                                |
| trivia_id   | Foreign Key| UUID                | References Trivia (`trivia_id`)                             |
| user_answer | —          | TEXT                | The answer provided by the user                             |
| is_correct  | —          | BOOLEAN             | Indicates if the answer was correct                         |
| answered_at | —          | TIMESTAMP           | Timestamp when the user answered the trivia question        |

### Favorites Table

| Column Name  | Key Type    | Data Type           | Description                                               |
|--------------|-------------|---------------------|-----------------------------------------------------------|
| favorite_id  | Primary Key | UUID (or SERIAL)    | Unique identifier for the favorite record                 |
| user_id      | Foreign Key | UUID                | References Users (`user_id`)                              |
| trivia_id    | Foreign Key | UUID                | References Trivia (`trivia_id`)                           |
| favorited_at | —           | TIMESTAMP           | Timestamp when the trivia was marked as a favorite        |

---

## 3. API Routes & Server-side Logic

- **/api/generateTrivia:**  
  - Receives a category query from the frontend.  
  - Calls the selected AI model to generate a trivia question tailored to the provided category.  
  - Saves the new trivia question in the Trivia table.

- **/api/submitAnswer:**  
  - Accepts the user’s submitted answer.  
  - Compares the answer to the stored correct answer (using direct matching or a flexible evaluation approach).  
  - Records the attempt in the User History table.

- **/api/history:**  
  - Retrieves all past trivia attempts for the authenticated user.

- **/api/favorites & /api/toggleFavorite:**  
  - Allows users to mark or unmark trivia questions as favorites.  
  - Retrieves the list of favorited trivia from the Favorites table.

---

## 4. Frontend Components & Pages

- **Daily Trivia Component:**  
  - On load, the component queries a trivia question for a specific category via **/api/generateTrivia**.  
  - It renders the question, provides an input for answers, and displays feedback upon submission.

- **History & Favorites Pages:**  
  - Use client-side fetching or Next.js server-side rendering to display data from **/api/history** and **/api/favorites**.  
  - Implement pagination or card layouts using TailwindCSS.

- **User Authentication UI:**  
  - Implement login and sign-up pages using Supabase Auth.

---

## 5. Future Feature Enhancements

Consider the following additional features for future releases:

- **Social Sharing:**  
  - Allow users to share interesting trivia questions or their results on social media platforms.

- **Leaderboards:**  
  - Introduce a point system and display leaderboards to create a competitive environment among users.

- **Achievements & Badges:**  
  - Reward users with badges or achievements for milestones (e.g., streaks, high accuracy, number of trivia answered).

- **User-Generated Trivia:**  
  - Enable users to submit their own trivia questions, which can be reviewed and added to the trivia pool.

- **Commenting and Discussions:**  
  - Add a commenting feature under each trivia question so users can discuss the trivia and share fun facts.

- **Daily Challenges:**  
  - Introduce special trivia challenges or timed quizzes to keep the app engaging.

- **Advanced AI Evaluations:**  
  - Implement more sophisticated AI-based answer evaluation that can handle partial matches or alternative correct answers.

---

## Summary

This plan outlines a streamlined implementation for your daily trivia app that:
- Queries for trivia questions based on a specific category.
- Allows users to answer questions and view immediate feedback.
- Records each trivia attempt in a history log.
- Enables users to mark questions as favorites.

The database schema clearly defines tables with relationships using primary and foreign keys along with specific datatypes. The API routes manage trivia generation, answer submission, and data retrieval, while the frontend leverages Next.js and TailwindCSS to provide a smooth and responsive user experience. Future feature enhancements are also provided to expand the app’s functionality over time.
