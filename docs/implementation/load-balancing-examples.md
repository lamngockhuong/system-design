---
sidebar_position: 1
---

# Load Balancing Implementation Examples

## Nginx Configuration

### Basic Load Balancing
```nginx
http {
    upstream backend {
        server backend1.example.com;
        server backend2.example.com;
        server backend3.example.com;
    }

    server {
        listen 80;
        location / {
            proxy_pass http://backend;
        }
    }
}
```

### Load Balancing with Health Checks
```nginx
http {
    upstream backend {
        server backend1.example.com max_fails=3 fail_timeout=30s;
        server backend2.example.com max_fails=3 fail_timeout=30s;
        server backend3.example.com max_fails=3 fail_timeout=30s;

        check interval=5000 rise=2 fall=3 timeout=1000;
    }

    server {
        listen 80;
        location / {
            proxy_pass http://backend;
            health_check;
        }
    }
}
```

## AWS ELB Setup

### Classic Load Balancer
```bash
# Create load balancer
aws elb create-load-balancer \
    --load-balancer-name my-load-balancer \
    --listeners "Protocol=HTTP,LoadBalancerPort=80,InstanceProtocol=HTTP,InstancePort=80" \
    --subnets subnet-12345678 subnet-87654321

# Configure health check
aws elb configure-health-check \
    --load-balancer-name my-load-balancer \
    --health-check Target=HTTP:80/health,Interval=30,UnhealthyThreshold=2,HealthyThreshold=2,Timeout=5
```

### Application Load Balancer
```bash
# Create target group
aws elbv2 create-target-group \
    --name my-target-group \
    --protocol HTTP \
    --port 80 \
    --vpc-id vpc-12345678 \
    --health-check-protocol HTTP \
    --health-check-path /health

# Create load balancer
aws elbv2 create-load-balancer \
    --name my-alb \
    --subnets subnet-12345678 subnet-87654321 \
    --security-groups sg-12345678
```

## HAProxy Configuration

### Basic Load Balancing
```haproxy
frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    server server1 192.168.1.1:80 check
    server server2 192.168.1.2:80 check
    server server3 192.168.1.3:80 check
```

### SSL Termination
```haproxy
frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/server.pem
    default_backend http_back

backend http_back
    balance roundrobin
    server server1 192.168.1.1:80 check
    server server2 192.168.1.2:80 check
    server server3 192.168.1.3:80 check
```

## Kubernetes Ingress

### Basic Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: example-ingress
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /app1
        pathType: Prefix
        backend:
          service:
            name: app1
            port:
              number: 80
      - path: /app2
        pathType: Prefix
        backend:
          service:
            name: app2
            port:
              number: 80
```

### Ingress with SSL
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-example-ingress
spec:
  tls:
  - hosts:
    - example.com
    secretName: example-tls
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
```
