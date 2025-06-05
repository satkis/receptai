# 🚀 Paragaujam.lt Setup Guide

Welcome to your Lithuanian recipe website! Follow these steps to get your website up and running.

## 📋 Prerequisites

Make sure you have the following installed:
- Node.js (version 18 or higher)
- npm or yarn
- Git

## 🛠 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy the example environment file and fill in your credentials:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:

#### Required for basic functionality:
```env
# Database (MongoDB Atlas - free tier available)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/paragaujam?retryWrites=true&w=majority

# NextAuth (generate a random secret)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Site Configuration
SITE_URL=http://localhost:3000
SITE_NAME=Paragaujam.lt
```

#### Optional (for full functionality):
```env
# Google OAuth (for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (for social login)
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-client-secret

# AWS S3 (for image uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-central-1
AWS_S3_BUCKET=paragaujam-images

# Email (Mailgun for notifications)
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-mailgun-domain

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 3. Start Development Server
```bash
npm run dev
```

Your website will be available at [http://localhost:3000](http://localhost:3000)

## 🗄 Database Setup

### MongoDB Atlas (Recommended - Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add it to your `.env.local` file

### Local MongoDB (Alternative)
If you prefer to run MongoDB locally:
```bash
# Install MongoDB locally
# Then use this connection string:
MONGODB_URI=mongodb://localhost:27017/paragaujam
```

## 🔐 Authentication Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add client ID and secret to `.env.local`

### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add redirect URI: `http://localhost:3000/api/auth/callback/facebook`
5. Add app ID and secret to `.env.local`

## 📁 Project Structure Overview

```
├── components/          # React components
│   ├── Layout.tsx      # Main layout
│   ├── Header.tsx      # Navigation
│   ├── RecipeCard.tsx  # Recipe cards
│   └── ...
├── pages/              # Next.js pages
│   ├── api/           # API endpoints
│   ├── index.tsx      # Homepage
│   └── ...
├── models/            # Database schemas
├── lib/               # Database connections
├── utils/             # Helper functions
├── types/             # TypeScript types
└── styles/            # CSS styles
```

## 🎨 Customization

### Colors and Branding
Edit `tailwind.config.js` to customize your brand colors:
```javascript
colors: {
  primary: {
    500: '#f2750a', // Your main brand color
    // ... other shades
  },
}
```

### Content
- Edit homepage content in `pages/index.tsx`
- Modify navigation in `components/Header.tsx`
- Update footer in `components/Footer.tsx`

## 📱 Features Included

### ✅ Phase 1 Features (Ready to use)
- Responsive design (mobile-first)
- Recipe browsing and search
- User authentication (Google, Facebook, Email)
- Recipe saving and shopping lists
- Interactive recipe features
- SEO optimization with structured data
- Performance optimized

### 🔄 Phase 2 Features (To be implemented)
- User-generated recipes
- Blog functionality
- Multilingual support
- Ads integration (Ezoic)
- Advanced filtering

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can also be deployed to:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📊 Analytics & SEO

### Google Analytics
1. Create a Google Analytics 4 property
2. Get your measurement ID (G-XXXXXXXXXX)
3. Add it to your `.env.local`

### Search Console
1. Add your site to [Google Search Console](https://search.google.com/search-console)
2. Verify ownership
3. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

## 🆘 Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
npm install
```

**Database connection issues:**
- Check your MongoDB URI
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify username/password

**Authentication not working:**
- Check OAuth redirect URIs
- Verify client IDs and secrets
- Ensure NEXTAUTH_URL is correct

**Build errors:**
```bash
npm run type-check
npm run lint
```

## 📞 Support

If you need help:
1. Check the troubleshooting section above
2. Review the README.md file
3. Check the Next.js documentation
4. Create an issue in the repository

## 🎯 Next Steps

1. Set up your database and environment variables
2. Customize the design and content
3. Add your first recipes
4. Set up analytics and search console
5. Deploy to production
6. Start adding Phase 2 features

Happy cooking! 🍳
