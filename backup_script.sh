#!/bin/sh

TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="/backups/db_backup_$TIMESTAMP.sql"

echo "Starting backup at $TIMESTAMP"
PGPASSWORD=$PG_PASSWORD pg_dump -h $PG_HOST -U $PG_USER -d $PG_DB -Fc -f $BACKUP_FILE

echo "Backup saved to $BACKUP_FILE"
