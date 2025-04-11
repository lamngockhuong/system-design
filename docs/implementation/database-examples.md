---
sidebar_position: 3
---

# Database Implementation Examples

## MySQL

### Table Design
```sql
-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Posts table
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Comments table
CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
);
```

### Sharding Example
```sql
-- Shard by user_id range
CREATE TABLE users_0 (
    -- Same as users table
) PARTITION BY RANGE (id) (
    PARTITION p0 VALUES LESS THAN (1000000),
    PARTITION p1 VALUES LESS THAN (2000000),
    PARTITION p2 VALUES LESS THAN (3000000),
    PARTITION p3 VALUES LESS THAN MAXVALUE
);
```

## MongoDB

### Schema Design
```javascript
// User Schema
{
  _id: ObjectId,
  username: String,
  email: String,
  profile: {
    name: String,
    bio: String,
    location: String
  },
  posts: [{
    _id: ObjectId,
    title: String,
    content: String,
    created_at: Date,
    comments: [{
      _id: ObjectId,
      user_id: ObjectId,
      content: String,
      created_at: Date
    }]
  }],
  created_at: Date,
  updated_at: Date
}

// Indexes
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "posts.created_at": -1 });
```

### Sharding Configuration
```javascript
// Enable sharding
sh.enableSharding("mydb");

// Shard collection
sh.shardCollection("mydb.users", { _id: "hashed" });

// Add shards
sh.addShard("shard1/mongodb1:27017");
sh.addShard("shard2/mongodb2:27017");
```

## Cassandra

### Table Design
```sql
-- Keyspace
CREATE KEYSPACE my_keyspace
WITH replication = {
    'class': 'NetworkTopologyStrategy',
    'datacenter1': 3
};

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    username TEXT,
    email TEXT,
    created_at TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
    post_id UUID,
    user_id UUID,
    title TEXT,
    content TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (user_id, created_at, post_id)
) WITH CLUSTERING ORDER BY (created_at DESC);

-- Comments table
CREATE TABLE comments (
    comment_id UUID,
    post_id UUID,
    user_id UUID,
    content TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (post_id, created_at, comment_id)
) WITH CLUSTERING ORDER BY (created_at DESC);
```

### Indexes and Materialized Views
```sql
-- Secondary index
CREATE INDEX ON users (email);

-- Materialized view
CREATE MATERIALIZED VIEW posts_by_date AS
    SELECT * FROM posts
    WHERE post_id IS NOT NULL AND created_at IS NOT NULL
    PRIMARY KEY (created_at, post_id);
```

## Redis

### Data Structures
```python
# String
r.set('user:1:name', 'John')
r.setex('user:1:session', 3600, 'token123')

# Hash
r.hset('user:1', mapping={
    'name': 'John',
    'email': 'john@example.com',
    'age': '30'
})

# List
r.lpush('user:1:posts', 'post1', 'post2', 'post3')

# Set
r.sadd('user:1:followers', 'user2', 'user3', 'user4')

# Sorted Set
r.zadd('leaderboard', {
    'user1': 100,
    'user2': 200,
    'user3': 150
})
```

### Redis Cluster
```bash
# Create cluster
redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 \
    127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
    --cluster-replicas 1
```
