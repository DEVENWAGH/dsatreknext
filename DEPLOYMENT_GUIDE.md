# DSATrek Docker Deployment Guide

## 🚀 Complete Deployment Process

### 1. Server Setup (Ubuntu 25)

```bash
# Run the server setup script
chmod +x server-setup.sh
./server-setup.sh
```

### 2. Domain Configuration

Point your domain `dsatrek.com` to your server IP:

- A record: `dsatrek.com` → `YOUR_SERVER_IP`
- A record: `www.dsatrek.com` → `YOUR_SERVER_IP`

### 3. Clone Repository

```bash
cd /home/ubuntu/dsatrek
git clone https://github.com/yourusername/dsatrek.git .
```

### 4. Environment Setup

```bash
# Copy and configure environment variables
cp .env.production.example .env.production
nano .env.production
```

Fill in all required environment variables:

- Database URLs
- API keys (OpenAI, Gemini, etc.)
- Authentication secrets
- Third-party service keys

### 5. SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d dsatrek.com -d www.dsatrek.com
```

### 6. Deploy Application

```bash
# Make deploy script executable
chmod +x deploy.sh

# Deploy
./deploy.sh
```

## 🔄 Auto-Deployment Setup

### GitHub Secrets Configuration

Add these secrets to your GitHub repository:

1. `HOST` - Your server IP address
2. `USERNAME` - Server username (ubuntu)
3. `SSH_KEY` - Your private SSH key

### SSH Key Setup

```bash
# Generate SSH key on your local machine
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy public key to server
ssh-copy-id ubuntu@YOUR_SERVER_IP

# Add private key to GitHub secrets
cat ~/.ssh/id_rsa
```

## 📊 Performance Specifications

**Server Configuration:**

- 2 vCPUs, 8GB RAM, 30GB storage
- Ubuntu 25

**Expected Performance:**

- **Concurrent Users**: 800-1200
- **Response Time**: 180-350ms (Mumbai)
- **Memory Usage**: ~4-6GB under load
- **Container Startup**: 10-15 seconds

## 🔧 Management Commands

```bash
# View logs
docker-compose logs -f dsatrek

# Restart containers
docker-compose restart

# Scale application (if needed)
docker-compose up -d --scale dsatrek=2

# Check container status
docker-compose ps

# Monitor resources
docker stats

# Update application
./deploy.sh
```

## 🏥 Health Monitoring

Health check endpoint: `https://dsatrek.com/api/health`

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "DSATrek"
}
```

## 🔒 Security Features

- SSL/TLS encryption
- Security headers (HSTS, CSP, etc.)
- Rate limiting on API endpoints
- Firewall configuration
- Container isolation
- Non-root user in containers

## 🚨 Troubleshooting

### Container Won't Start

```bash
docker-compose logs dsatrek
```

### SSL Issues

```bash
sudo certbot renew --dry-run
```

### High Memory Usage

```bash
docker stats --no-stream
```

### Database Connection Issues

```bash
# Check environment variables
docker-compose exec dsatrek env | grep DATABASE
```

## 📈 Scaling Options

For higher traffic, consider:

- Increase server resources (4 vCPUs, 16GB RAM)
- Add load balancer
- Database read replicas
- CDN for static assets
- Redis for caching

## 🔄 Backup Strategy

```bash
# Database backup (if using PostgreSQL)
docker-compose exec postgres pg_dump -U username dbname > backup.sql

# Application files backup
tar -czf dsatrek-backup.tar.gz /home/ubuntu/dsatrek
```

## 📞 Support

For deployment issues:

1. Check container logs
2. Verify environment variables
3. Test health endpoint
4. Check SSL certificate status
5. Monitor server resources
