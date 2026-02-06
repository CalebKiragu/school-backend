#!/bin/bash
set -e

# School Backend ECS Service Deployment Script
# Deploys single school-backend service to ECS with ALB

usage() {
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --force           Force new deployment even if no changes"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 --force"
    exit 1
}

# Parse arguments
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            echo "Unknown option: $1"
            usage
            ;;
    esac
done

# Configuration
CLUSTER_NAME="school-cluster"
SERVICE_NAME="school-backend-service"
TASK_FAMILY="school-backend-task"
REGION="${AWS_REGION:-us-east-1}"
ECR_REPOSITORY="school-backend"
IMAGE_TAG="latest"
CPU="512"
MEMORY="1024"
DESIRED_COUNT="1"
LOG_GROUP="/ecs/school-backend"
SECRETS_ARN_PREFIX="school-backend"

echo "🚀 School Backend Service Deployment"
echo "===================================="

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

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"
IMAGE_URI="${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}"

echo "📍 Cluster: $CLUSTER_NAME"
echo "📍 Service: $SERVICE_NAME"
echo "📍 Image: $IMAGE_URI"
echo "📍 Desired Count: $DESIRED_COUNT"
echo ""

# Get execution role ARN
EXECUTION_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole"
TASK_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskRole"

# Get secrets ARN
SECRETS_ARN="arn:aws:secretsmanager:${REGION}:${ACCOUNT_ID}:secret:${SECRETS_ARN_PREFIX}/app"

# Create task definition
echo "📝 Creating task definition..."
cat > /tmp/school-task-definition.json <<EOF
{
    "family": "${TASK_FAMILY}",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "${CPU}",
    "memory": "${MEMORY}",
    "executionRoleArn": "${EXECUTION_ROLE_ARN}",
    "taskRoleArn": "${TASK_ROLE_ARN}",
    "containerDefinitions": [
        {
            "name": "school-backend",
            "image": "${IMAGE_URI}",
            "essential": true,
            "portMappings": [
                {
                    "containerPort": 3000,
                    "hostPort": 3000,
                    "protocol": "tcp"
                }
            ],
            "environment": [
                {"name": "NODE_ENV", "value": "production"},
                {"name": "PORT", "value": "3000"},
                {"name": "DB_HOST", "value": "master-sql.cc1zpwoqvmxn.us-east-1.rds.amazonaws.com"},
                {"name": "DB_PORT", "value": "3306"},
                {"name": "DB_USERNAME", "value": "master"},
                {"name": "DB_PASSWORD", "value": "UdTbIgzmIzU4O6LoqTvB"},
                {"name": "DB_DATABASE", "value": "sigalame"},
                {"name": "JWT_SECRET", "value": "b944661d-c765-4911-919f-e109778c050c"},
                {"name": "JWT_EXPIRES_IN", "value": "24h"},
                {"name": "AT_USERNAME", "value": "basilndonga"},
                {"name": "AT_API_KEY", "value": "6fa096242bba3e97dd55e88929f4ed5b5557f01df1f8d1900d359735d00b1534"},
                {"name": "AT_ENVIRONMENT", "value": "production"},
                {"name": "USSD_SESSION_TIMEOUT", "value": "300000"},
                {"name": "USSD_MAX_CONCURRENT_SESSIONS", "value": "1000"}
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "${LOG_GROUP}",
                    "awslogs-region": "${REGION}",
                    "awslogs-stream-prefix": "ecs"
                }
            },
            "healthCheck": {
                "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1"],
                "interval": 30,
                "timeout": 5,
                "retries": 3,
                "startPeriod": 60
            }
        }
    ]
}
EOF

# Create CloudWatch log group if it doesn't exist
echo "📊 Creating CloudWatch log group..."
aws logs create-log-group --log-group-name "${LOG_GROUP}" --region ${REGION} 2>/dev/null || echo "Log group already exists"

TASK_DEF_ARN=$(aws ecs register-task-definition \
    --cli-input-json file:///tmp/school-task-definition.json \
    --region $REGION \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)

echo "✅ Task definition registered: $TASK_DEF_ARN"

# Check if service exists
echo ""
echo "🔍 Checking service status..."
if aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION --query "services[?status=='ACTIVE']" --output text | grep -q $SERVICE_NAME; then
    echo "ℹ️  Service exists, updating..."
    
    UPDATE_ARGS="--cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition $TASK_DEF_ARN --desired-count $DESIRED_COUNT --region $REGION"
    
    if [ "$FORCE" = true ]; then
        UPDATE_ARGS="$UPDATE_ARGS --force-new-deployment"
    fi
    
    aws ecs update-service $UPDATE_ARGS
    echo "✅ Service updated: $SERVICE_NAME"
else
    echo "📦 Creating new service..."
    
    # Get network configuration from existing infrastructure
    VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text --region ${REGION})
    SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${VPC_ID}" --query 'Subnets[*].SubnetId' --output text --region ${REGION} | tr '\t' ',')
    SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=school-backend-sg" "Name=vpc-id,Values=${VPC_ID}" --query 'SecurityGroups[0].GroupId' --output text --region ${REGION})
    TARGET_GROUP_ARN=$(aws elbv2 describe-target-groups --names school-backend-tg --query 'TargetGroups[0].TargetGroupArn' --output text --region ${REGION})
    
    if [ -z "$SUBNET_IDS" ] || [ -z "$SECURITY_GROUP_ID" ] || [ -z "$TARGET_GROUP_ARN" ]; then
        echo "❌ Network configuration not found. Please run setup-ecs.sh first."
        exit 1
    fi
    
    # Create the service
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name $SERVICE_NAME \
        --task-definition $TASK_DEF_ARN \
        --desired-count $DESIRED_COUNT \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SECURITY_GROUP_ID],assignPublicIp=ENABLED}" \
        --load-balancers "targetGroupArn=$TARGET_GROUP_ARN,containerName=school-backend,containerPort=3000" \
        --deployment-configuration "maximumPercent=200,minimumHealthyPercent=100,deploymentCircuitBreaker={enable=true,rollback=true}" \
        --region $REGION
    
    echo "✅ Service created: $SERVICE_NAME"
fi

# Wait for service stability
echo ""
echo "⏳ Waiting for service to stabilize..."
aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $REGION

echo "✅ Service is stable!"

# Cleanup
rm -f /tmp/school-task-definition.json

echo ""
echo "===================================="
echo "✅ Deployment complete!"
echo ""
echo "Service: $SERVICE_NAME"
echo "Cluster: $CLUSTER_NAME"
echo "Task Definition: $TASK_DEF_ARN"
echo ""
echo "To check service status:"
echo "  aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $REGION"
echo ""