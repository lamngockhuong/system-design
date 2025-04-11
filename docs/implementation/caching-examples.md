---
sidebar_position: 2
---

# Caching Implementation Examples

## Redis

### Basic Caching
```python
import redis
import json

# Connect to Redis
r = redis.Redis(host='localhost', port=6379, db=0)

def get_user(user_id):
    # Try to get from cache
    cached_user = r.get(f'user:{user_id}')
    if cached_user:
        return json.loads(cached_user)

    # Get from database
    user = db.get_user(user_id)

    # Cache for 1 hour
    r.setex(
        f'user:{user_id}',
        3600,
        json.dumps(user)
    )

    return user
```

### Cache Invalidation
```python
def update_user(user_id, data):
    # Update database
    db.update_user(user_id, data)

    # Invalidate cache
    r.delete(f'user:{user_id}')
```

### Cache Patterns
```python
# Cache-aside pattern
def get_product(product_id):
    # Try cache first
    cached = r.get(f'product:{product_id}')
    if cached:
        return json.loads(cached)

    # Get from database
    product = db.get_product(product_id)

    # Update cache
    r.setex(
        f'product:{product_id}',
        3600,
        json.dumps(product)
    )

    return product

# Write-through pattern
def update_product(product_id, data):
    # Update cache
    r.setex(
        f'product:{product_id}',
        3600,
        json.dumps(data)
    )

    # Update database
    db.update_product(product_id, data)

# Write-behind pattern
def update_product_async(product_id, data):
    # Update cache immediately
    r.setex(
        f'product:{product_id}',
        3600,
        json.dumps(data)
    )

    # Queue database update
    queue.enqueue(db.update_product, product_id, data)
```

## Memcached

### Basic Caching
```python
import memcache

# Connect to Memcached
mc = memcache.Client(['127.0.0.1:11211'])

def get_data(key):
    # Try to get from cache
    data = mc.get(key)
    if data:
        return data

    # Get from database
    data = db.get_data(key)

    # Cache for 1 hour
    mc.set(key, data, time=3600)

    return data
```

### Cache Invalidation
```python
def update_data(key, value):
    # Update database
    db.update_data(key, value)

    # Invalidate cache
    mc.delete(key)
```

## CDN Caching

### CloudFront Configuration
```json
{
    "DistributionConfig": {
        "CallerReference": "my-distribution",
        "DefaultRootObject": "index.html",
        "Origins": {
            "Quantity": 1,
            "Items": [
                {
                    "Id": "S3-origin",
                    "DomainName": "my-bucket.s3.amazonaws.com",
                    "S3OriginConfig": {
                        "OriginAccessIdentity": ""
                    }
                }
            ]
        },
        "DefaultCacheBehavior": {
            "TargetOriginId": "S3-origin",
            "ForwardedValues": {
                "QueryString": false,
                "Cookies": {
                    "Forward": "none"
                }
            },
            "TrustedSigners": {
                "Enabled": false,
                "Quantity": 0
            },
            "ViewerProtocolPolicy": "redirect-to-https",
            "MinTTL": 3600
        },
        "CacheBehaviors": {
            "Quantity": 0
        },
        "CustomErrorResponses": {
            "Quantity": 0
        },
        "Comment": "My CloudFront Distribution",
        "Enabled": true
    }
}
```

### Cache Control Headers
```python
from flask import Flask, send_file

app = Flask(__name__)

@app.route('/static/<path:filename>')
def serve_static(filename):
    response = send_file(f'static/{filename}')
    response.headers['Cache-Control'] = 'public, max-age=31536000'
    return response

@app.route('/dynamic/<path:filename>')
def serve_dynamic(filename):
    response = send_file(f'dynamic/{filename}')
    response.headers['Cache-Control'] = 'no-cache'
    return response
```

## Browser Caching

### Cache Control Headers
```python
from flask import Flask, send_file

app = Flask(__name__)

@app.route('/')
def index():
    response = send_file('index.html')
    response.headers['Cache-Control'] = 'no-cache'
    return response

@app.route('/static/<path:filename>')
def serve_static(filename):
    response = send_file(f'static/{filename}')
    response.headers['Cache-Control'] = 'public, max-age=31536000'
    return response
```

### ETag Implementation
```python
import hashlib
from flask import Flask, request

app = Flask(__name__)

def get_etag(content):
    return hashlib.md5(content.encode()).hexdigest()

@app.route('/resource')
def get_resource():
    content = generate_content()
    etag = get_etag(content)

    if request.headers.get('If-None-Match') == etag:
        return '', 304

    response = app.make_response(content)
    response.headers['ETag'] = etag
    return response
```
