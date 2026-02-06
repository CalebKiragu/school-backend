#!/bin/bash
set -e

# AWS API Gateway Setup using HTTP backend for School Backend
# Creates a REST API Gateway that connects to ALB via HTTP

REGION="${AWS_REGION:-us-east-1}"
API_NAME="school-backend-api"
STAGE_NAME="prod"

echo "🚀 Setting up AWS API Gateway (HTTP backend) for School Backend"
echo "==============================================================="

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
    --names school-backend-alb \
    --query 'LoadBalancers[0].DNSName' \
    --output text \
    --region $REGION)

if [ "$ALB_DNS" == "None" ] || [ -z "$ALB_DNS" ]; then
    echo "❌ ALB not found. Please ensure the ECS service is deployed first."
    exit 1
fi

echo "📍 Found ALB: $ALB_DNS"

# Test ALB HTTP connectivity
echo "🔍 Testing ALB HTTP connectivity..."
if curl -s --max-time 10 "http://$ALB_DNS/health" > /dev/null; then
    echo "✅ ALB HTTP is accessible"
else
    echo "❌ ALB HTTP is not accessible. Please check ALB configuration."
    exit 1
fi

# Create REST API
echo "🔧 Creating API Gateway REST API..."
API_ID=$(aws apigateway create-rest-api \
    --name $API_NAME \
    --description "School Backend REST API Gateway (HTTP backend)" \
    --endpoint-configuration types=REGIONAL \
    --region $REGION \
    --query 'id' \
    --output text)

echo "✅ API created with ID: $API_ID"

# Get the root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id $API_ID \
    --region $REGION \
    --query 'items[?path==`/`].id' \
    --output text)

# Create a proxy resource
PROXY_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_RESOURCE_ID \
    --path-part "{proxy+}" \
    --region $REGION \
    --query 'id' \
    --output text)

# Create ANY method for proxy resource
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method ANY \
    --authorization-type NONE \
    --request-parameters method.request.path.proxy=true \
    --region $REGION > /dev/null

# Create integration for proxy resource using HTTP
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method ANY \
    --type HTTP_PROXY \
    --integration-http-method ANY \
    --uri "http://$ALB_DNS/{proxy}" \
    --request-parameters integration.request.path.proxy=method.request.path.proxy \
    --region $REGION > /dev/null

# Create ANY method for root resource
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $ROOT_RESOURCE_ID \
    --http-method ANY \
    --authorization-type NONE \
    --region $REGION > /dev/null

# Create integration for root resource using HTTP
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $ROOT_RESOURCE_ID \
    --http-method ANY \
    --type HTTP_PROXY \
    --integration-http-method ANY \
    --uri "http://$ALB_DNS/" \
    --region $REGION > /dev/null

# Deploy the API
echo "🚀 Deploying API..."
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name $STAGE_NAME \
    --region $REGION > /dev/null

# Get the API Gateway URL
API_URL="https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE_NAME"

echo ""
echo "🎉 API Gateway setup complete!"
echo "================================"
echo "API ID: $API_ID"
echo "API URL: $API_URL"
echo ""
echo "🌐 Your API is now accessible at:"
echo "  Base URL: $API_URL"
echo "  Health Check: $API_URL/health"
echo "  API Docs: $API_URL/api/docs"
echo "  Login: $API_URL/auth/login"
echo ""

# Test the API Gateway endpoint
echo "🔍 Testing API Gateway endpoint..."
if curl -s --max-time 10 "$API_URL/health" | grep -q "status"; then
    echo "✅ API Gateway is working correctly!"
else
    echo "⚠️  API Gateway test failed, but it may still work"
fi

echo ""
echo "✅ This URL has proper AWS SSL certificates and works everywhere!"
echo ""

# Save configuration
cat > api-gateway-config.env << EOF
API_ID=$API_ID
API_URL=$API_URL
ALB_DNS=$ALB_DNS
STAGE_NAME=$STAGE_NAME
EOF

echo "💾 Configuration saved to api-gateway-config.env"
echo ""
echo "🔧 To update your mobile app, change the baseURL to:"
echo "   $API_URL"