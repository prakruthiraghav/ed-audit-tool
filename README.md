# ED Audit Tool

A Next.js application for educational audit management with webcam integration and AI-powered features.

## Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- npm or yarn package manager

## Setup Instructions

1. Clone the repository:

```bash
git clone <repository-url>
cd ed-audit-tool
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up your environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ed_audit_db?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

Replace the values with your own:

- `username` and `password` with your PostgreSQL credentials
- `your-secret-key-here` with a secure random string

4. Set up the database:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database 
npm run seed
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Features

- User authentication
- Audit creation and management
- Webcam integration with filters
- Photo gallery
- Dashboard with analytics
- Public/Private audit visibility

## Tech Stack

- Next.js 14
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js
- TailwindCSS
- Framer Motion
- TensorFlow.js
- MediaPipe

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed the database

## License

[Your License Here]
