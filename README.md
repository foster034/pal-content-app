# Pop-A-Lock Franchise Management Application

A comprehensive marketing content management system for Pop-A-Lock franchise operations, built with Next.js 15 and TypeScript.

## 🔐 Overview

This application serves three main user types:
- **Administrators**: Manage franchises, users, and system-wide analytics
- **Franchisees**: Manage their technicians and territory operations
- **Technicians**: Submit marketing content and photos from the field

## ✨ Features

### 📱 Mobile-Optimized Photography
- **Smart Camera Positioning Guide**: Visual instructions for optimal photo capture
- **Device-Specific Instructions**: iOS and Android camera optimization
- **Social Media Optimization**: Auto-format for Instagram (1:1) and Facebook (16:9)
- **Real-time Photo Processing**: Canvas-based image compression and resizing

### 🚗 Service Categories
- **Residential**: Home lockout, lock installation, rekey services
- **Automotive**: Car lockout, key programming, duplicate keys
- **Commercial**: Office lockout, access control, master key systems
- **Roadside**: Emergency assistance, mobile key services

### 🎯 Marketing Content Management
- **Photo Submission**: Technicians submit work photos with context
- **Vehicle Information**: Year, make, model tracking for automotive services
- **Customer Permission**: Built-in consent tracking for marketing use
- **Content Approval**: Workflow for approving marketing materials

### 🔗 Authentication System
- **Magic Links**: Franchisees generate secure login links for techs
- **Login Codes**: 6-digit time-limited authentication codes
- **Dedicated URLs**: Each technician has their own dashboard URL

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd PAL-CONTENT-APP
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/           # Administrator portal
│   ├── franchisee/      # Franchisee management
│   ├── tech/           # Technician dashboards
│   │   ├── [techId]/   # Individual tech portals
│   │   ├── login/      # Tech authentication
│   │   └── dashboard/  # General tech dashboard
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
└── components/         # Reusable components
```

## 🎨 Technology Stack

- **Framework**: Next.js 15.5.2 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Processing**: HTML5 Canvas API
- **Authentication**: Custom magic link system
- **Deployment**: Vercel (configured)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

#### Camera Guide System
Located in `/src/app/tech/[techId]/page.tsx`:
- Visual phone positioning guide
- Device-specific camera settings
- Social media format optimization
- Professional photography tips

#### Service Category Dependencies
```typescript
const serviceCategories = {
  'Residential': ['Home Lockout', 'Lock Installation', ...],
  'Automotive': ['Car Lockout', 'Duplicate Key Service', ...],
  // ...
};
```

#### Mobile Image Optimization
```typescript
const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Auto-detects best format (Instagram square vs Facebook landscape)
  // Compresses to optimal quality (88%) with high-end smoothing
  // Maintains aspect ratio while hitting social media specs
};
```

## 📸 Photo Optimization Features

### Social Media Formats
- **Instagram**: 1080x1080 square format
- **Facebook**: 1200x630 landscape format
- **Auto-detect**: Chooses best format based on original photo orientation

### Camera Guidelines
- **Distance**: Hold phone 3-4 feet from subject
- **Orientation**: Keep phone level and centered
- **Focus**: Tap to focus on main subject
- **Lighting**: Use natural light when possible

## 🚀 Deployment

This project is configured for deployment on Vercel with automatic CI/CD through GitHub Actions.

### Environment Variables
Set these in your deployment platform:
- `VERCEL_TOKEN` - Vercel deployment token
- `ORG_ID` - Vercel organization ID  
- `PROJECT_ID` - Vercel project ID

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Pop-A-Lock franchise operations.

## 📞 Support

For technical support or feature requests, please contact the development team.

---

Built with ❤️ for Pop-A-Lock franchise success