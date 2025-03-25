# ED Audit Tool


- Node.js 18.x or later
- npm or yarn
- A webcam (for using the filter features)
- A modern web browser

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ed-audit-tool.git
cd ed-audit-tool
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ed-audit-tool/
├── app/
│   ├── api/           # API routes
│   ├── auth/          # Authentication pages
│   ├── components/    # Reusable components
│   ├── dashboard/     # Dashboard page
│   ├── gallery/       # Photo gallery
│   └── filters/       # Filter management
├── lib/               # Utility functions and configurations
├── prisma/           # Database schema and migrations
└── public/           # Static assets
```

