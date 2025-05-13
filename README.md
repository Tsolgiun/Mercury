# Mercury

Mercury is a monochrome content platform that blends the clean, long-form publishing feel of Medium with the social conversational structure of Threads. The platform acts like a digital library, where users can post short content ("threads") or long blog-style posts. Content is organized using a unified block-based model.

## 🛠️ Tech Stack

- **Frontend**: React 18 + React Router v6 + Tailwind CSS
- **Editor**: TipTap v2 (block editor with paragraph, heading, image, quote, code)
- **Backend**: Node.js + Express + Firebase Admin SDK + Mongoose
- **Database**: MongoDB Atlas
- **Auth**: Firebase Authentication (Google + Email)
- **Storage**: Firebase Storage (for image uploads)

## 📦 Data Models

- **posts**: { type: "short" | "long", blocks: [], authorId, tags, parentId?, metadata: { coverImage, readingTime } }
- **users**: { firebaseUid, name, avatar, bio }
- **comments**: { postId, userId, parentId?, content, createdAt }
- **bookmarks**: { userId, postIds[] }
- **follows**: { followerId, followingId }

## 🌐 Routes / Pages

- **/** — Home feed (shows both short and long posts)
- **/login** — Firebase login
- **/editor** — Create/edit a post with TipTap
- **/post/:id** — View a post
- **/profile/:uid** — User profile page
- **/bookmarks** — Saved content

## 🎨 UI Design (Black & White Minimalism)

The UI is pure monochrome, elegant, minimal, and highly readable. Like Threads, short posts appear as thread cards, while long posts use a full reading layout like Medium.

### Color Tokens

```css
--c-bg: #FFFFFF;
--c-fg: #000000;
--c-muted: #9A9A9A;
--c-outline: #E6E6E6;
--c-hover: rgba(0,0,0,0.05);
```

### Typography

- **Font**: system stack with Inter fallback
- **Sizes**: 16px body, 18px content, 20px titles, 24px cover titles
- **Line height**: 1.6 (long), 1.4 (threads)

### Layout

- Centered column layout (max-w-[720px])
- Thread-style post cards: avatar left, border-b, hover:bg
- Article: full-width image, large title, rendered blocks

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- Firebase account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/mercury.git
   cd mercury
   ```

2. Install dependencies
   ```bash
   npm run install-all
   ```

3. Set up environment variables
   - Create a `.env` file in the root directory
   - Add the required environment variables (see `.env.example`)

4. Seed the database
   ```bash
   npm run seed
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Features

- **Authentication**: Sign up, sign in, and sign out using Firebase Authentication
- **Content Creation**: Create and edit short and long-form content using TipTap editor
- **Social Interactions**: Follow users, like posts, and comment on posts
- **Bookmarking**: Save posts for later reading
- **Profiles**: View user profiles and their posts
- **Feed**: View a feed of posts from users you follow or discover new content

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
