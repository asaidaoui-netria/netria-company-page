# Netria - Company Landing Page

A minimalistic, modern landing page for Netria, a software company focused on improving digital services in Morocco.

## 🎯 Mission

Netria develops solutions to help businesses tackle the most pertinent points of friction in their journey towards financial and social success, with a specific focus on the Moroccan market.

## ✨ Features

- **Minimalistic Design**: Clean, modern aesthetic with tech-focused visuals
- **Fast Loading**: Optimized for performance with minimal dependencies
- **Responsive**: Fully responsive design that works on all devices
- **Single Page**: All information presented in one seamless experience
- **Contact Form**: Interactive contact form with validation
- **Smooth Animations**: Subtle animations and transitions
- **SEO Optimized**: Proper meta tags and semantic HTML

## 🎨 Design

- **Primary Color**: #57a634 (Netria Green)
- **Secondary Color**: #ffffff (White)
- **Typography**: Inter font family
- **Layout**: Modern grid-based design with clean spacing

## 📁 Project Structure

```
netria-company-page/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── assets/             # Images and media files
│   ├── Netria_logo.png           # Original logo (2MB)
│   ├── netria-logo-navbar.png    # Optimized navbar logo (120×80px, 3KB)
│   └── netria-logo-footer.png    # Optimized footer logo (90×60px, 2KB)
└── README.md           # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- A local web server (optional, for development)

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. For development, you can use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

## 🛠️ Customization

### Updating Content

1. **Company Information**: Edit the content in `index.html`
2. **Contact Details**: Update email and location in the contact section
3. **Services**: Modify the services offered in the services section
4. **Colors**: Update CSS variables in `styles.css` for brand colors

### Key Sections to Customize

- **Hero Section**: Main headline and value proposition
- **About Section**: Company mission and benefits
- **Services**: Current service offerings
- **Contact**: Contact information and form

### Styling Changes

The design uses CSS custom properties (variables) for easy customization:

```css
:root {
    --primary-color: #57a634;    /* Main brand color */
    --primary-dark: #4a8a2b;     /* Darker shade for hover states */
    --secondary-color: #ffffff;  /* White background */
    /* ... other variables */
}
```

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔧 Technical Details

### Performance Optimizations

- Minimal external dependencies (only Google Fonts)
- Optimized CSS with efficient selectors
- **Optimized logo images** (reduced from 2MB to ~5KB total, maintaining 3:2 aspect ratio)
- Lazy loading support for images
- Smooth scrolling and animations
- Mobile-first responsive design

### Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

### SEO Features

- Semantic HTML structure
- Meta tags for description and keywords
- Proper heading hierarchy
- Alt text support for images
- Fast loading times

## 📧 Contact Form

The contact form includes:
- Form validation (client-side)
- Email format validation
- Success/error notifications
- Responsive design

**Note**: The form currently simulates submission. For production use, you'll need to integrate with a backend service or form handling service like:
- Netlify Forms
- Formspree
- EmailJS
- Custom backend API

## 🚀 Deployment

### Static Hosting Options

1. **Netlify**: Drag and drop the folder to deploy
2. **Vercel**: Connect your repository for automatic deployments
3. **GitHub Pages**: Push to a GitHub repository and enable Pages
4. **AWS S3**: Upload files to an S3 bucket with static website hosting
5. **Traditional Web Hosting**: Upload files via FTP

### Custom Domain

After deployment, you can configure a custom domain (e.g., `netria.ma`) through your hosting provider.

## 📈 Analytics & Tracking

Consider adding analytics to track visitor behavior:
- Google Analytics
- Google Tag Manager
- Hotjar for heatmaps
- Custom event tracking

## 🔒 Security Considerations

- Form validation (implemented)
- HTTPS deployment (recommended)
- Content Security Policy (consider adding)
- Regular updates and maintenance

## 🤝 Contributing

This is a company website, but if you have suggestions for improvements:
1. Review the current implementation
2. Suggest specific improvements
3. Consider the minimalistic design philosophy
4. Ensure changes maintain fast loading times

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions about this landing page or Netria's services, contact:
- Email: hello@netria.ma
- Location: Kenitra, Morocco

---

**Built with ❤️ for Netria** 