# Deployment Guide

## Prerequisites
- Node.js 20+ installed
- Git repository connected to Vercel/Netlify
- Environment variables configured

## Vercel Deployment

### 1. Install Vercel CLI (opcional)
```bash
npm i -g vercel
```

### 2. Deploy desde CLI
```bash
vercel --prod
```

### 3. Deploy desde GitHub
1. Push código a GitHub
2. Conectar repositorio en [Vercel Dashboard](https://vercel.com)
3. Configurar variables de entorno:
   - `VITE_API_BASE_URL`
   - `VITE_SENTRY_DSN` (opcional)

### 4. Variables de Entorno Requeridas
```
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_ENV=production
VITE_ENABLE_WEBSOCKETS=true
VITE_ENABLE_ANALYTICS=true
```

## Netlify Deployment

### 1. Install Netlify CLI (opcional)
```bash
npm i -g netlify-cli
```

### 2. Deploy desde CLI
```bash
netlify deploy --prod
```

### 3. Deploy desde GitHub
1. Push código a GitHub
2. Conectar repositorio en [Netlify Dashboard](https://netlify.com)
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## Docker Deployment

### 1. Build imagen
```bash
docker build -t invoices-frontend .
```

### 2. Run contenedor
```bash
docker run -p 3000:80 -e VITE_API_BASE_URL=https://api.yourdomain.com/api invoices-frontend
```

### 3. Docker Compose
```bash
docker-compose up -d
```

## Build Optimization

### Analyze bundle size
```bash
npm run build
npx vite-bundle-visualizer
```

### Performance checks
- Lighthouse CI
- Bundle analyzer
- Source map explorer

## Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test production build locally: `npm run preview`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Check Sentry error tracking
- [ ] Verify API connectivity
- [ ] Test authentication flow
- [ ] Verify all routes work
- [ ] Check mobile responsiveness
- [ ] Monitor initial bundle size
- [ ] Set up CI/CD pipeline

## Rollback Strategy

### Vercel
```bash
vercel rollback
```

### Netlify
Use Netlify Dashboard → Deploys → Restore deploy

### Docker
```bash
docker pull invoices-frontend:previous-version
docker-compose up -d
```

## Monitoring

- **Vercel Analytics**: Automatically enabled
- **Sentry**: Error tracking and performance
- **Google Analytics**: User behavior (if enabled)

## Troubleshooting

### Build fails
1. Check Node version (20+)
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check TypeScript errors: `npm run build`

### API not connecting
1. Verify `VITE_API_BASE_URL` environment variable
2. Check CORS settings on backend
3. Verify SSL certificates

### 404 on refresh
- Ensure SPA rewrites are configured (vercel.json / netlify.toml)
