# Backup and Recovery

## Overview

This document outlines backup and recovery strategies for the DAO Registry platform, covering database backups, application backups, and disaster recovery procedures.

## Database Backup

### PostgreSQL Backup

#### Automated Backup Script

```bash
#!/bin/bash
# backup-postgres.sh

# Configuration
BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-dao_registry}
DB_USER=${DB_USER:-postgres}

# Full database backup
echo "Starting PostgreSQL backup at $(date)"

pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --format=custom \
  --verbose \
  --file="$BACKUP_DIR/full_backup_$DATE.sql"

# Verify backup
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: $BACKUP_DIR/full_backup_$DATE.sql"
    
    # Compress backup
    gzip "$BACKUP_DIR/full_backup_$DATE.sql"
    
    # Upload to cloud storage
    aws s3 cp "$BACKUP_DIR/full_backup_$DATE.sql.gz" \
      s3://dao-registry-backups/postgres/ \
      --storage-class STANDARD_IA
    
    # Clean up local file
    rm "$BACKUP_DIR/full_backup_$DATE.sql.gz"
else
    echo "Backup failed!"
    exit 1
fi

# Clean up old backups
find $BACKUP_DIR -name "full_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed at $(date)"
```

#### Incremental Backup

```bash
#!/bin/bash
# incremental-backup.sh

# Configuration
BACKUP_DIR="/backups/postgres/incremental"
DATE=$(date +%Y%m%d_%H%M%S)
WAL_ARCHIVE_DIR="/var/lib/postgresql/wal_archive"

# Create WAL archive directory
mkdir -p $WAL_ARCHIVE_DIR

# Enable WAL archiving in PostgreSQL
# Add to postgresql.conf:
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f'

# Create base backup
pg_basebackup -h localhost -U postgres -D $BACKUP_DIR/base_$DATE \
  --format=tar \
  --gzip \
  --verbose

# Archive WAL files
rsync -av $WAL_ARCHIVE_DIR/ s3://dao-registry-backups/postgres/wal/

echo "Incremental backup completed: $BACKUP_DIR/base_$DATE"
```

#### Backup Verification

```bash
#!/bin/bash
# verify-backup.sh

BACKUP_FILE=$1
DB_NAME="dao_registry_test"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# Create test database
createdb $DB_NAME

# Restore backup to test database
pg_restore -d $DB_NAME --clean --if-exists $BACKUP_FILE

# Run verification queries
psql -d $DB_NAME -c "
SELECT 
    'DAOs' as table_name,
    COUNT(*) as record_count
FROM daos
UNION ALL
SELECT 
    'Proposals' as table_name,
    COUNT(*) as record_count
FROM proposals
UNION ALL
SELECT 
    'Users' as table_name,
    COUNT(*) as record_count
FROM users;
"

# Drop test database
dropdb $DB_NAME

echo "Backup verification completed"
```

### MongoDB Backup

#### MongoDB Backup Script

```bash
#!/bin/bash
# backup-mongo.sh

# Configuration
BACKUP_DIR="/backups/mongo"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="dao_registry"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting MongoDB backup at $(date)"

# Create backup
mongodump --db $DB_NAME \
  --out "$BACKUP_DIR/mongo_backup_$DATE" \
  --gzip \
  --verbose

# Verify backup
if [ $? -eq 0 ]; then
    echo "MongoDB backup completed successfully"
    
    # Compress backup directory
    tar -czf "$BACKUP_DIR/mongo_backup_$DATE.tar.gz" \
      -C "$BACKUP_DIR" "mongo_backup_$DATE"
    
    # Upload to cloud storage
    aws s3 cp "$BACKUP_DIR/mongo_backup_$DATE.tar.gz" \
      s3://dao-registry-backups/mongo/ \
      --storage-class STANDARD_IA
    
    # Clean up local files
    rm -rf "$BACKUP_DIR/mongo_backup_$DATE"
    rm "$BACKUP_DIR/mongo_backup_$DATE.tar.gz"
else
    echo "MongoDB backup failed!"
    exit 1
fi

echo "MongoDB backup process completed at $(date)"
```

### Redis Backup

#### Redis Backup Script

```bash
#!/bin/bash
# backup-redis.sh

# Configuration
BACKUP_DIR="/backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting Redis backup at $(date)"

# Trigger Redis backup
redis-cli BGSAVE

# Wait for backup to complete
while [ "$(redis-cli info persistence | grep rdb_bgsave_in_progress | cut -d: -f2)" = "1" ]; do
    sleep 1
done

# Copy backup file
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis_backup_$DATE.rdb"

# Verify backup
if [ $? -eq 0 ]; then
    echo "Redis backup completed successfully"
    
    # Compress backup
    gzip "$BACKUP_DIR/redis_backup_$DATE.rdb"
    
    # Upload to cloud storage
    aws s3 cp "$BACKUP_DIR/redis_backup_$DATE.rdb.gz" \
      s3://dao-registry-backups/redis/ \
      --storage-class STANDARD_IA
    
    # Clean up local file
    rm "$BACKUP_DIR/redis_backup_$DATE.rdb.gz"
else
    echo "Redis backup failed!"
    exit 1
fi

echo "Redis backup process completed at $(date)"
```

## Application Backup

### Configuration Backup

#### Configuration Backup Script

```bash
#!/bin/bash
# backup-config.sh

# Configuration
BACKUP_DIR="/backups/config"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting configuration backup at $(date)"

# Backup configuration files
tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" \
  /etc/dao-registry/ \
  /opt/dao-registry/config/ \
  /home/dao-registry/.env

# Backup SSL certificates
tar -czf "$BACKUP_DIR/ssl_backup_$DATE.tar.gz" \
  /etc/letsencrypt/ \
  /etc/ssl/certs/dao-registry/

# Upload to cloud storage
aws s3 cp "$BACKUP_DIR/config_backup_$DATE.tar.gz" \
  s3://dao-registry-backups/config/ \
  --storage-class STANDARD_IA

aws s3 cp "$BACKUP_DIR/ssl_backup_$DATE.tar.gz" \
  s3://dao-registry-backups/ssl/ \
  --storage-class STANDARD_IA

# Clean up local files
rm "$BACKUP_DIR/config_backup_$DATE.tar.gz"
rm "$BACKUP_DIR/ssl_backup_$DATE.tar.gz"

echo "Configuration backup completed at $(date)"
```

### Code Backup

#### Git Repository Backup

```bash
#!/bin/bash
# backup-code.sh

# Configuration
BACKUP_DIR="/backups/code"
REPO_DIR="/opt/dao-registry"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting code backup at $(date)"

# Create code backup
tar -czf "$BACKUP_DIR/code_backup_$DATE.tar.gz" \
  --exclude=node_modules \
  --exclude=.git \
  --exclude=logs \
  --exclude=dist \
  -C $REPO_DIR .

# Upload to cloud storage
aws s3 cp "$BACKUP_DIR/code_backup_$DATE.tar.gz" \
  s3://dao-registry-backups/code/ \
  --storage-class STANDARD_IA

# Clean up local file
rm "$BACKUP_DIR/code_backup_$DATE.tar.gz"

echo "Code backup completed at $(date)"
```

## Recovery Procedures

### Database Recovery

#### PostgreSQL Recovery

```bash
#!/bin/bash
# restore-postgres.sh

BACKUP_FILE=$1
DB_NAME=${2:-dao_registry}

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file> [database_name]"
    exit 1
fi

echo "Starting PostgreSQL recovery from: $BACKUP_FILE"

# Stop application
systemctl stop dao-registry

# Drop existing database
dropdb --if-exists $DB_NAME

# Create new database
createdb $DB_NAME

# Restore from backup
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE | pg_restore -d $DB_NAME
else
    pg_restore -d $DB_NAME $BACKUP_FILE
fi

# Verify recovery
psql -d $DB_NAME -c "
SELECT 
    'DAOs' as table_name,
    COUNT(*) as record_count
FROM daos;
"

# Start application
systemctl start dao-registry

echo "PostgreSQL recovery completed"
```

#### MongoDB Recovery

```bash
#!/bin/bash
# restore-mongo.sh

BACKUP_FILE=$1
DB_NAME=${2:-dao_registry}

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file> [database_name]"
    exit 1
fi

echo "Starting MongoDB recovery from: $BACKUP_FILE"

# Stop application
systemctl stop dao-registry

# Drop existing database
mongo $DB_NAME --eval "db.dropDatabase()"

# Restore from backup
if [[ $BACKUP_FILE == *.tar.gz ]]; then
    tar -xzf $BACKUP_FILE -C /tmp/
    mongorestore --db $DB_NAME /tmp/mongo_backup_*/$DB_NAME/
    rm -rf /tmp/mongo_backup_*
else
    mongorestore --db $DB_NAME $BACKUP_FILE
fi

# Verify recovery
mongo $DB_NAME --eval "
db.getCollectionNames().forEach(function(collection) {
    print(collection + ': ' + db[collection].count());
});
"

# Start application
systemctl start dao-registry

echo "MongoDB recovery completed"
```

#### Redis Recovery

```bash
#!/bin/bash
# restore-redis.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

echo "Starting Redis recovery from: $BACKUP_FILE"

# Stop Redis
systemctl stop redis

# Backup current Redis data
cp /var/lib/redis/dump.rdb /var/lib/redis/dump.rdb.backup

# Restore from backup
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE > /var/lib/redis/dump.rdb
else
    cp $BACKUP_FILE /var/lib/redis/dump.rdb
fi

# Set proper permissions
chown redis:redis /var/lib/redis/dump.rdb
chmod 644 /var/lib/redis/dump.rdb

# Start Redis
systemctl start redis

# Verify recovery
redis-cli ping
redis-cli dbsize

echo "Redis recovery completed"
```

### Application Recovery

#### Full Application Recovery

```bash
#!/bin/bash
# restore-application.sh

BACKUP_DATE=$1

if [ -z "$BACKUP_DATE" ]; then
    echo "Usage: $0 <backup_date>"
    exit 1
fi

echo "Starting full application recovery from: $BACKUP_DATE"

# Stop all services
systemctl stop dao-registry
systemctl stop nginx
systemctl stop redis
systemctl stop postgresql

# Download backups from S3
aws s3 cp s3://dao-registry-backups/postgres/full_backup_$BACKUP_DATE.sql.gz /tmp/
aws s3 cp s3://dao-registry-backups/mongo/mongo_backup_$BACKUP_DATE.tar.gz /tmp/
aws s3 cp s3://dao-registry-backups/config/config_backup_$BACKUP_DATE.tar.gz /tmp/
aws s3 cp s3://dao-registry-backups/code/code_backup_$BACKUP_DATE.tar.gz /tmp/

# Restore configuration
tar -xzf /tmp/config_backup_$BACKUP_DATE.tar.gz -C /

# Restore code
tar -xzf /tmp/code_backup_$BACKUP_DATE.tar.gz -C /opt/dao-registry/

# Restore databases
gunzip -c /tmp/full_backup_$BACKUP_DATE.sql.gz | pg_restore -d dao_registry
tar -xzf /tmp/mongo_backup_$BACKUP_DATE.tar.gz -C /tmp/
mongorestore --db dao_registry /tmp/mongo_backup_*/dao_registry/

# Install dependencies
cd /opt/dao-registry
npm install

# Start services
systemctl start postgresql
systemctl start redis
systemctl start dao-registry
systemctl start nginx

# Verify recovery
curl -f http://localhost/health

echo "Full application recovery completed"
```

## Disaster Recovery

### Disaster Recovery Plan

#### Recovery Time Objectives (RTO)

```javascript
const recoveryObjectives = {
  critical: {
    rto: '1 hour',
    rpo: '15 minutes',
    services: ['database', 'api', 'authentication']
  },
  important: {
    rto: '4 hours',
    rpo: '1 hour',
    services: ['frontend', 'monitoring', 'logging']
  },
  normal: {
    rto: '24 hours',
    rpo: '4 hours',
    services: ['analytics', 'backup', 'archival']
  }
};
```

#### Recovery Procedures

```javascript
const disasterRecoveryProcedures = {
  // Database failure
  databaseFailure: {
    steps: [
      'Assess failure type and scope',
      'Stop application services',
      'Restore from latest backup',
      'Verify data integrity',
      'Start application services',
      'Monitor for issues'
    ],
    estimatedTime: '30 minutes',
    rollbackPlan: 'Use previous backup if current fails'
  },
  
  // Application failure
  applicationFailure: {
    steps: [
      'Identify failure point',
      'Stop affected services',
      'Deploy from backup',
      'Verify configuration',
      'Start services',
      'Test functionality'
    ],
    estimatedTime: '15 minutes',
    rollbackPlan: 'Revert to previous deployment'
  },
  
  // Infrastructure failure
  infrastructureFailure: {
    steps: [
      'Assess infrastructure damage',
      'Activate backup infrastructure',
      'Restore from off-site backup',
      'Update DNS records',
      'Verify all services',
      'Monitor performance'
    ],
    estimatedTime: '2 hours',
    rollbackPlan: 'Return to primary infrastructure when available'
  },
  
  // Security breach
  securityBreach: {
    steps: [
      'Isolate affected systems',
      'Assess breach scope',
      'Stop compromised services',
      'Restore from clean backup',
      'Update security measures',
      'Monitor for further threats'
    ],
    estimatedTime: '4 hours',
    rollbackPlan: 'Use backup from before breach'
  }
};
```

### Backup Testing

#### Backup Testing Script

```bash
#!/bin/bash
# test-backup.sh

echo "Starting backup testing process"

# Test PostgreSQL backup
echo "Testing PostgreSQL backup..."
./verify-backup.sh /backups/postgres/full_backup_$(date +%Y%m%d).sql.gz

# Test MongoDB backup
echo "Testing MongoDB backup..."
./restore-mongo.sh /backups/mongo/mongo_backup_$(date +%Y%m%d).tar.gz dao_registry_test

# Test Redis backup
echo "Testing Redis backup..."
./restore-redis.sh /backups/redis/redis_backup_$(date +%Y%m%d).rdb.gz

# Test application recovery
echo "Testing application recovery..."
./restore-application.sh $(date +%Y%m%d)

echo "Backup testing completed"
```

#### Automated Testing

```javascript
// Automated backup testing
const testBackups = async () => {
  const testResults = {
    postgres: false,
    mongo: false,
    redis: false,
    application: false
  };
  
  try {
    // Test PostgreSQL backup
    const pgBackup = await downloadBackup('postgres', 'latest');
    const pgRestore = await restorePostgreSQL(pgBackup);
    testResults.postgres = await verifyPostgreSQL(pgRestore);
    
    // Test MongoDB backup
    const mongoBackup = await downloadBackup('mongo', 'latest');
    const mongoRestore = await restoreMongoDB(mongoBackup);
    testResults.mongo = await verifyMongoDB(mongoRestore);
    
    // Test Redis backup
    const redisBackup = await downloadBackup('redis', 'latest');
    const redisRestore = await restoreRedis(redisBackup);
    testResults.redis = await verifyRedis(redisRestore);
    
    // Test application recovery
    const appBackup = await downloadBackup('application', 'latest');
    const appRestore = await restoreApplication(appBackup);
    testResults.application = await verifyApplication(appRestore);
    
    // Log results
    logger.info('Backup testing completed', testResults);
    
    // Send alert if any test failed
    const failedTests = Object.entries(testResults)
      .filter(([key, passed]) => !passed)
      .map(([key]) => key);
    
    if (failedTests.length > 0) {
      await sendAlert('Backup testing failed', {
        failedTests,
        results: testResults
      });
    }
    
  } catch (error) {
    logger.error('Backup testing failed', error);
    await sendAlert('Backup testing error', { error: error.message });
  }
};

// Run backup testing weekly
setInterval(testBackups, 7 * 24 * 60 * 60 * 1000);
```

## Monitoring and Alerting

### Backup Monitoring

#### Backup Status Monitoring

```javascript
// Monitor backup status
const monitorBackups = async () => {
  const backupStatus = {
    lastBackup: null,
    backupAge: null,
    backupSize: null,
    backupHealth: 'unknown'
  };
  
  try {
    // Check last backup time
    const lastBackup = await getLastBackupTime();
    backupStatus.lastBackup = lastBackup;
    backupStatus.backupAge = Date.now() - lastBackup;
    
    // Check backup size
    const backupSize = await getBackupSize();
    backupStatus.backupSize = backupSize;
    
    // Determine backup health
    if (backupStatus.backupAge < 24 * 60 * 60 * 1000) { // Less than 24 hours
      backupStatus.backupHealth = 'healthy';
    } else if (backupStatus.backupAge < 48 * 60 * 60 * 1000) { // Less than 48 hours
      backupStatus.backupHealth = 'warning';
    } else {
      backupStatus.backupHealth = 'critical';
    }
    
    // Send alert if backup is old
    if (backupStatus.backupHealth === 'critical') {
      await sendAlert('Backup is too old', backupStatus);
    }
    
    // Log status
    logger.info('Backup status', backupStatus);
    
  } catch (error) {
    logger.error('Backup monitoring failed', error);
    await sendAlert('Backup monitoring error', { error: error.message });
  }
};

// Monitor backups every hour
setInterval(monitorBackups, 60 * 60 * 1000);
```

#### Recovery Time Monitoring

```javascript
// Monitor recovery time
const monitorRecoveryTime = async () => {
  const recoveryMetrics = {
    lastRecovery: null,
    recoveryDuration: null,
    recoverySuccess: null
  };
  
  try {
    // Simulate recovery test
    const startTime = Date.now();
    const recoverySuccess = await testRecovery();
    const recoveryDuration = Date.now() - startTime;
    
    recoveryMetrics.lastRecovery = new Date();
    recoveryMetrics.recoveryDuration = recoveryDuration;
    recoveryMetrics.recoverySuccess = recoverySuccess;
    
    // Alert if recovery takes too long
    if (recoveryDuration > 30 * 60 * 1000) { // More than 30 minutes
      await sendAlert('Recovery time too long', recoveryMetrics);
    }
    
    // Alert if recovery fails
    if (!recoverySuccess) {
      await sendAlert('Recovery test failed', recoveryMetrics);
    }
    
    // Log metrics
    logger.info('Recovery metrics', recoveryMetrics);
    
  } catch (error) {
    logger.error('Recovery monitoring failed', error);
    await sendAlert('Recovery monitoring error', { error: error.message });
  }
};

// Test recovery weekly
setInterval(monitorRecoveryTime, 7 * 24 * 60 * 60 * 1000);
```

---

*Last updated: July 2024*