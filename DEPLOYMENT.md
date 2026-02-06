# School Backend Deployment Guide

## Overview

This document describes the deployment process for the School Backend API using AWS ECS, API Gateway, and GitHub Actions CI/CD.

## Architecture

- **Application**: NestJS backend with TypeScript
- **Database**: AWS RDS MySQL
- **Container**: Docker container running on AWS ECS Fargate
- **Load Balancer**: Application Load Balancer (ALB)
- **API Gateway**: AWS API Gateway for public SSL endpoint
- **CI/CD**: GitHub Actions for automated deployment

## Current Deployment

### Production URLs
- **API Gateway**: https://uaxzcqapol.execute-api.us-east-1.amazonaws.com/prod
- **Health Check**: https://uaxzcqapol.execute-api.us-east-1.amazonaws.com/prod/health
- **API Documentation**: https://uaxzcqapol.execute-api.us-east-1.amazonaws.com/prod/api/docs

### AWS Resources
- **ECS Cluster**: school-cluster
- **ECS Service**: school-backend-service
- **ALB**: school-backend-alb-207722203.us-east-1.elb.amazonaws.com
- **API Gateway**: uaxzcqapol (REST API)
- **ECR Repository**: school-backend

## Manual Deployment

### Prerequisites
- AWS CLI configured with appropriate permissions
- Docker installed
- Node.js 18+ installed

### Steps

1. **Deploy ECS Infrastructure** (one-time setup):
   ```bash
   ./setup-ecs.sh
   ```

2. **Deploy Application**:
   ```bash
   ./deploy-service.sh
   ```

3. **Setup API Gateway** (one-time setup):
   ```bash
   ./setup-api-gateway-http.sh
   ```

## GitHub Actions CI/CD

### Setup

1. **Add GitHub Secrets**:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

2. **Workflow Triggers**:
   - Push to `main` or `master` branch
   - Changes in `school-backend/` directory

### Workflow Steps

1. **Test Phase**:
   - Install dependencies
   - Run linter (`npm run lint`)
   - Run tests (`npm test`)
   - Build application (`npm run build`)

2. **Deploy Phase** (only on main/master):
   - Build Docker image
   - Push to ECR
   - Update ECS task definition
   - Deploy to ECS service
   - Wait for service stability

### Monitoring Deployment

- Check GitHub Actions tab for workflow status
- Monitor ECS service in AWS Console
- Test API endpoints after deployment

## Environment Variables

The following environment variables are configured in the ECS task definition:

- `NODE_ENV=production`
- `PORT=3000`
- `DB_HOST`: RDS endpoint
- `DB_PORT=3306`
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_DATABASE=sigalame`
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN=24h`
- `AT_USERNAME`: Africa's Talking username
- `AT_API_KEY`: Africa's Talking API key
- `AT_ENVIRONMENT=production`
- `USSD_SESSION_TIMEOUT=300000`
- `USSD_MAX_CONCURRENT_SESSIONS=1000`

## Rollback Process

If a deployment fails or causes issues:

1. **Revert to previous task definition**:
   ```bash
   aws ecs update-service \
     --cluster school-cluster \
     --service school-backend-service \
     --task-definition school-backend-task:PREVIOUS_REVISION
   ```

2. **Or deploy a specific image**:
   ```bash
   ./deploy-service.sh --image PREVIOUS_IMAGE_TAG
   ```

## Scaling

To scale the service:

```bash
aws ecs update-service \
  --cluster school-cluster \
  --service school-backend-service \
  --desired-count NEW_COUNT
```

## Logs

View application logs:

```bash
aws logs tail /ecs/school-backend --follow
```

## Health Checks

- **Application Health**: GET /health
- **ECS Health Check**: Configured in task definition
- **ALB Health Check**: Configured in target group

## Security

- API Gateway provides SSL termination with AWS certificates
- ALB uses self-signed certificate (internal only)
- ECS tasks run in private subnets
- Security groups restrict access to necessary ports only

## Troubleshooting

### Common Issues

1. **Deployment Stuck**: Check ECS service events and task logs
2. **Health Check Failures**: Verify application is listening on port 3000
3. **Database Connection**: Check RDS security groups and credentials
4. **API Gateway 5xx Errors**: Check ALB health and connectivity

### Useful Commands

```bash
# Check service status
aws ecs describe-services --cluster school-cluster --services school-backend-service

# View task logs
aws logs tail /ecs/school-backend --follow

# Test ALB directly
curl -k https://school-backend-alb-207722203.us-east-1.elb.amazonaws.com/health

# Test API Gateway
curl https://uaxzcqapol.execute-api.us-east-1.amazonaws.com/prod/health
```