#!/bin/bash

# Setup ECS infrastructure for School Backend
set -e

AWS_REGION="us-east-1"
CLUSTER_NAME="school-cluster"
SERVICE_NAME="school-backend-service"
TASK_FAMILY="school-backend-task"

echo "🏗️  Setting up ECS infrastructure..."

# Step 1: Create ECS cluster
echo "📦 Creating ECS cluster..."
aws ecs create-cluster \
  --cluster-name ${CLUSTER_NAME} \
  --capacity-providers FARGATE \
  --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
  --region ${AWS_REGION} || echo "Cluster already exists"

# Step 2: Create CloudWatch log group
echo "📊 Creating CloudWatch log group..."
aws logs create-log-group \
  --log-group-name "/ecs/school-backend" \
  --region ${AWS_REGION} || echo "Log group already exists"

# Step 3: Check if IAM roles exist, create if needed
echo "🔐 Checking IAM roles..."

# Check if ecsTaskExecutionRole exists
if ! aws iam get-role --role-name ecsTaskExecutionRole >/dev/null 2>&1; then
  echo "Creating ecsTaskExecutionRole..."
  aws iam create-role \
    --role-name ecsTaskExecutionRole \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "ecs-tasks.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }'
  
  aws iam attach-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
  
  # Add Secrets Manager permissions
  aws iam put-role-policy \
    --role-name ecsTaskExecutionRole \
    --policy-name SecretsManagerAccess \
    --policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "secretsmanager:GetSecretValue"
          ],
          "Resource": [
            "arn:aws:secretsmanager:us-east-1:248830756685:secret:school-backend/*"
          ]
        }
      ]
    }'
else
  echo "ecsTaskExecutionRole already exists"
fi

# Check if ecsTaskRole exists
if ! aws iam get-role --role-name ecsTaskRole >/dev/null 2>&1; then
  echo "Creating ecsTaskRole..."
  aws iam create-role \
    --role-name ecsTaskRole \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "ecs-tasks.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    }'
else
  echo "ecsTaskRole already exists"
fi

# Step 4: Get default VPC and subnets
echo "🌐 Getting VPC information..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text --region ${AWS_REGION})
SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${VPC_ID}" --query 'Subnets[*].SubnetId' --output text --region ${AWS_REGION})

echo "VPC ID: ${VPC_ID}"
echo "Subnet IDs: ${SUBNET_IDS}"

# Step 5: Create security group
echo "🔒 Creating security group..."
SECURITY_GROUP_ID=$(aws ec2 create-security-group \
  --group-name school-backend-sg \
  --description "Security group for School Backend ECS service" \
  --vpc-id ${VPC_ID} \
  --region ${AWS_REGION} \
  --query 'GroupId' \
  --output text 2>/dev/null || \
  aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=school-backend-sg" "Name=vpc-id,Values=${VPC_ID}" \
    --query 'SecurityGroups[0].GroupId' \
    --output text \
    --region ${AWS_REGION})

echo "Security Group ID: ${SECURITY_GROUP_ID}"

# Add inbound rules to security group
aws ec2 authorize-security-group-ingress \
  --group-id ${SECURITY_GROUP_ID} \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0 \
  --region ${AWS_REGION} 2>/dev/null || echo "Inbound rule already exists"

# Step 6: Create Application Load Balancer
echo "⚖️  Creating Application Load Balancer..."
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name school-backend-alb \
  --subnets ${SUBNET_IDS} \
  --security-groups ${SECURITY_GROUP_ID} \
  --region ${AWS_REGION} \
  --query 'LoadBalancers[0].LoadBalancerArn' \
  --output text 2>/dev/null || \
  aws elbv2 describe-load-balancers \
    --names school-backend-alb \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text \
    --region ${AWS_REGION})

echo "ALB ARN: ${ALB_ARN}"

# Step 7: Create target group
echo "🎯 Creating target group..."
TARGET_GROUP_ARN=$(aws elbv2 create-target-group \
  --name school-backend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id ${VPC_ID} \
  --target-type ip \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --region ${AWS_REGION} \
  --query 'TargetGroups[0].TargetGroupArn' \
  --output text 2>/dev/null || \
  aws elbv2 describe-target-groups \
    --names school-backend-tg \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text \
    --region ${AWS_REGION})

echo "Target Group ARN: ${TARGET_GROUP_ARN}"

# Step 8: Request SSL certificate
echo "🔐 Requesting SSL certificate..."
DOMAIN_NAME="school-backend-${RANDOM}.aws-demo.com"
CERT_ARN=$(aws acm request-certificate \
  --domain-name ${DOMAIN_NAME} \
  --validation-method DNS \
  --region ${AWS_REGION} \
  --query 'CertificateArn' \
  --output text 2>/dev/null || echo "")

if [ -n "$CERT_ARN" ]; then
  echo "Certificate requested: ${CERT_ARN}"
  echo "⚠️  Note: You'll need to validate the certificate via DNS before HTTPS will work"
fi

# Step 9: Create HTTP listener (redirect to HTTPS if certificate exists)
echo "👂 Creating ALB listeners..."
if [ -n "$CERT_ARN" ]; then
  # Create HTTPS listener
  aws elbv2 create-listener \
    --load-balancer-arn ${ALB_ARN} \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=${CERT_ARN} \
    --default-actions Type=forward,TargetGroupArn=${TARGET_GROUP_ARN} \
    --region ${AWS_REGION} 2>/dev/null || echo "HTTPS listener already exists"
  
  # Create HTTP listener that redirects to HTTPS
  aws elbv2 create-listener \
    --load-balancer-arn ${ALB_ARN} \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=redirect,RedirectConfig='{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}' \
    --region ${AWS_REGION} 2>/dev/null || echo "HTTP redirect listener already exists"
else
  # Create HTTP listener only
  aws elbv2 create-listener \
    --load-balancer-arn ${ALB_ARN} \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=${TARGET_GROUP_ARN} \
    --region ${AWS_REGION} 2>/dev/null || echo "HTTP listener already exists"
fi

# Step 10: Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns ${ALB_ARN} \
  --query 'LoadBalancers[0].DNSName' \
  --output text \
  --region ${AWS_REGION})

echo "✅ ECS infrastructure setup completed!"
echo "📋 Summary:"
echo "  Cluster: ${CLUSTER_NAME}"
echo "  VPC: ${VPC_ID}"
echo "  Security Group: ${SECURITY_GROUP_ID}"
echo "  Load Balancer: ${ALB_DNS}"
echo "  Target Group: ${TARGET_GROUP_ARN}"
echo ""
echo "🌐 Your backend will be available at: http://${ALB_DNS}"
echo "📊 Health check endpoint: http://${ALB_DNS}/health"
echo "📚 API documentation: http://${ALB_DNS}/api/docs"

# Save configuration for deployment script
cat > ecs-config.env << EOF
VPC_ID=${VPC_ID}
SUBNET_IDS="${SUBNET_IDS}"
SECURITY_GROUP_ID=${SECURITY_GROUP_ID}
TARGET_GROUP_ARN=${TARGET_GROUP_ARN}
ALB_DNS=${ALB_DNS}
EOF

echo "💾 Configuration saved to ecs-config.env"