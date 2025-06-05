# Paragaujam.lt - Lithuanian Recipe Website

A modern, mobile-optimized recipe website built with Next.js, featuring interactive recipes, user accounts, and SEO optimization for Lithuanian cuisine.

## 🚀 Features

### Phase 1 (Current)
- **Interactive Recipes**
  - ✅ Click ingredients to cross them out
  - ✅ Add ingredients to shopping list
  - ✅ Scrollable step-by-step cooking instructions
  - ✅ Progress bar indicator
  - ✅ Dynamic serving size adjustment
  - ✅ Save recipes to user account

- **AI-Powered Features**
  - ✅ Ingredient swap suggestions
  - ✅ Auto-generated nutrition information
  - ✅ Recipe suggestions based on available ingredients
  - ✅ Voice playback for recipe steps (optional)

- **User Engagement**
  - ✅ Comments and star ratings
  - ✅ "I cooked this" button
  - ✅ Social media sharing
  - ✅ User accounts with Google/Facebook login

### Phase 2 (Planned)
- Social authentication for user-generated content
- Food/recipe blogs for SEO
- Multilingual support (/lt, /en)
- Ezoic ads integration
- Advanced search and filtering

## 🛠 Tech Stack

- **Frontend**: React.js with Next.js
- **Styling**: Tailwind CSS + DaisyUI
- **Backend**: Next.js API Routes (serverless)
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Email**: Mailgun
- **Hosting**: Vercel
- **Images**: AWS S3 + CloudFront
- **Analytics**: Google Analytics

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/paragaujam-lt.git
   cd paragaujam-lt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   - MongoDB connection string
   - NextAuth configuration
   - OAuth provider credentials
   - AWS S3 credentials
   - Email service credentials

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗂 Project Structure

```
├── components/          # Reusable React components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   ├── RecipeCard.tsx  # Recipe preview card
│   └── ...
├── pages/              # Next.js pages and API routes
│   ├── api/           # Backend API endpoints
│   ├── auth/          # Authentication pages
│   ├── recipes/       # Recipe pages
│   └── index.tsx      # Homepage
├── lib/               # Utility libraries
│   ├── mongodb.ts     # MongoDB connection
│   ├── mongoose.ts    # Mongoose connection
│   └── ...
├── models/            # Database models
│   ├── Recipe.ts      # Recipe schema
│   ├── User.ts        # User schema
│   └── ...
├── types/             # TypeScript type definitions
├── utils/             # Helper functions
├── styles/            # Global styles
└── public/            # Static assets
```

## 🔧 Configuration

### Database Setup
1. Create a MongoDB Atlas cluster
2. Add your connection string to `.env.local`
3. The app will automatically create collections on first run

### Authentication Setup
1. Configure Google OAuth in Google Cloud Console
2. Configure Facebook OAuth in Facebook Developers
3. Add client IDs and secrets to `.env.local`

### AWS S3 Setup
1. Create an S3 bucket for image storage
2. Configure CloudFront distribution
3. Add AWS credentials to `.env.local`

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 📱 Mobile Optimization

The website is built with mobile-first design principles:
- Responsive grid layouts
- Touch-friendly interactive elements
- Optimized images with Next.js Image component
- Progressive Web App capabilities

## 🔍 SEO Features

- **Structured Data**: Recipe schema markup for Google
- **Meta Tags**: Dynamic Open Graph and Twitter cards
- **Sitemap**: Automatic sitemap generation
- **Performance**: Optimized Core Web Vitals
- **Internationalization**: Ready for multiple languages

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email info@paragaujam.lt or create an issue in this repository.

## 🎯 Roadmap

- [ ] User-generated recipe submissions
- [ ] Advanced recipe filtering
- [ ] Meal planning features
- [ ] Mobile app development
- [ ] API for third-party integrations
- [ ] Multi-language support
- [ ] Recipe video integration
