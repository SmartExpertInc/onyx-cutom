# ✅ Solution: Migrate to Database-Backed Job Storage

## 🎯 Recommended Fix

Migrate from **in-memory dictionary** to **PostgreSQL database** for persistent, scalable, and fault-tolerant job storage.

---

## 📋 Solution Overview

### **3-Level Solution**

1. **Level 1:** Simple SQLite database (Quick fix) ⭐ START HERE
2. **Level 2:** PostgreSQL with proper indexing (Production-ready)
3. **Level 3:** Redis cache + PostgreSQL (High performance)

---

## ⭐ Level 1: SQLite Database (QUICK START)

### **Why SQLite First?**
- ✅ Zero configuration required
- ✅ File-based (simple backup/restore)
- ✅ No external dependencies
- ✅ Perfect for single-server deployments
- ✅ Can migrate to PostgreSQL later

### **Implementation**

#### **Step 1: Create Database Model**

**File:** `backend/app/models/presentation_job.py`

```python
from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from typing import List, Optional

Base = declarative_base()

class PresentationJobModel(Base):
    """Database model for presentation jobs."""
    __tablename__ = "presentation_jobs"
    
    # Primary key
    job_id = Column(String(50), primary_key=True, index=True)
    
    # Status fields
    status = Column(String(20), nullable=False, index=True)  # queued, processing, completed, failed
    progress = Column(Float, default=0.0)
    error = Column(Text, nullable=True)
    
    # URLs
    video_url = Column(String(500), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    slide_image_path = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.now, nullable=False, index=True)
    completed_at = Column(DateTime, nullable=True)
    last_heartbeat = Column(DateTime, nullable=True)
    
    # File tracking (as JSON array)
    created_files = Column(JSON, nullable=True, default=list)
    
    # Indexes for common queries
    __table_args__ = (
        Index('idx_status_created', 'status', 'created_at'),
        Index('idx_created_at', 'created_at'),
    )
```

#### **Step 2: Create Database Manager**

**File:** `backend/app/db/database.py`

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)

# SQLite database path
DATABASE_URL = "sqlite:///./presentation_jobs.db"

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite specific
    echo=False  # Set to True for SQL logging
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initialize database tables."""
    from app.models.presentation_job import Base
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database initialized")

@contextmanager
def get_db() -> Session:
    """Get database session with automatic cleanup."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        db.close()
```

#### **Step 3: Create Repository Layer**

**File:** `backend/app/repositories/presentation_job_repository.py`

```python
from sqlalchemy.orm import Session
from app.models.presentation_job import PresentationJobModel
from app.services.presentation_service import PresentationJob
from datetime import datetime
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class PresentationJobRepository:
    """Repository for presentation job persistence."""
    
    @staticmethod
    def create(db: Session, job: PresentationJob) -> PresentationJobModel:
        """Create a new job in database."""
        db_job = PresentationJobModel(
            job_id=job.job_id,
            status=job.status,
            progress=job.progress,
            error=job.error,
            video_url=job.video_url,
            thumbnail_url=job.thumbnail_url,
            slide_image_path=job.slide_image_path,
            created_at=job.created_at,
            completed_at=job.completed_at,
            last_heartbeat=job.last_heartbeat,
            created_files=job.created_files or []
        )
        db.add(db_job)
        db.commit()
        db.refresh(db_job)
        logger.info(f"💾 [DB] Created job: {job.job_id}")
        return db_job
    
    @staticmethod
    def get(db: Session, job_id: str) -> Optional[PresentationJobModel]:
        """Get job by ID."""
        return db.query(PresentationJobModel).filter(
            PresentationJobModel.job_id == job_id
        ).first()
    
    @staticmethod
    def update(db: Session, job_id: str, **kwargs) -> Optional[PresentationJobModel]:
        """Update job fields."""
        db_job = PresentationJobRepository.get(db, job_id)
        if not db_job:
            logger.warning(f"💾 [DB] Job not found for update: {job_id}")
            return None
        
        for key, value in kwargs.items():
            if hasattr(db_job, key):
                setattr(db_job, key, value)
        
        db.commit()
        db.refresh(db_job)
        logger.info(f"💾 [DB] Updated job: {job_id} - {kwargs}")
        return db_job
    
    @staticmethod
    def get_all(db: Session, status: Optional[str] = None, limit: int = 100) -> List[PresentationJobModel]:
        """Get all jobs, optionally filtered by status."""
        query = db.query(PresentationJobModel)
        
        if status:
            query = query.filter(PresentationJobModel.status == status)
        
        query = query.order_by(PresentationJobModel.created_at.desc())
        query = query.limit(limit)
        
        return query.all()
    
    @staticmethod
    def delete_old_jobs(db: Session, days: int = 7) -> int:
        """Delete jobs older than specified days."""
        from datetime import timedelta
        cutoff_date = datetime.now() - timedelta(days=days)
        
        deleted = db.query(PresentationJobModel).filter(
            PresentationJobModel.created_at < cutoff_date
        ).delete()
        
        db.commit()
        logger.info(f"💾 [DB] Deleted {deleted} old jobs (>{days} days)")
        return deleted
    
    @staticmethod
    def to_dataclass(db_job: PresentationJobModel) -> PresentationJob:
        """Convert database model to dataclass."""
        return PresentationJob(
            job_id=db_job.job_id,
            status=db_job.status,
            progress=db_job.progress,
            error=db_job.error,
            video_url=db_job.video_url,
            thumbnail_url=db_job.thumbnail_url,
            slide_image_path=db_job.slide_image_path,
            created_at=db_job.created_at,
            completed_at=db_job.completed_at,
            last_heartbeat=db_job.last_heartbeat,
            created_files=db_job.created_files or []
        )
```

#### **Step 4: Update PresentationService**

**File:** `presentation_service.py`

```python
from app.db.database import get_db, init_db
from app.repositories.presentation_job_repository import PresentationJobRepository

class ProfessionalPresentationService:
    def __init__(self):
        # ... existing code ...
        
        # ❌ REMOVE: In-memory storage
        # self.jobs: Dict[str, PresentationJob] = {}
        
        # ✅ NEW: Initialize database
        init_db()
        logger.info("✅ Database-backed job storage initialized")
    
    async def create_presentation(self, request: PresentationRequest) -> str:
        """Create a new video presentation."""
        job_id = str(uuid.uuid4())
        
        # Create job
        job = PresentationJob(
            job_id=job_id,
            status="queued"
        )
        
        # ✅ NEW: Save to database instead of memory
        with get_db() as db:
            PresentationJobRepository.create(db, job)
        
        logger.info(f"💾 [DB] Created presentation job: {job_id}")
        
        # Start background processing
        loop = asyncio.get_event_loop()
        loop.create_task(self._process_presentation_detached(job_id, request))
        
        return job_id
    
    async def _update_job_status(self, job_id: str, **kwargs):
        """Update job status in database."""
        try:
            with get_db() as db:
                PresentationJobRepository.update(db, job_id, **kwargs)
        except Exception as e:
            logger.error(f"💾 [DB] Error updating job {job_id}: {e}")
    
    async def get_job_status(self, job_id: str) -> Optional[PresentationJob]:
        """Get job status from database."""
        try:
            with get_db() as db:
                db_job = PresentationJobRepository.get(db, job_id)
                if db_job:
                    return PresentationJobRepository.to_dataclass(db_job)
                return None
        except Exception as e:
            logger.error(f"💾 [DB] Error getting job {job_id}: {e}")
            return None
```

#### **Step 5: Add Database Initialization**

**File:** `backend/app/main.py`

```python
from app.db.database import init_db

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    logger.info("🚀 Starting application...")
    init_db()
    logger.info("✅ Database ready")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("👋 Shutting down...")
```

---

## 🚀 Level 2: PostgreSQL (Production-Ready)

### **Why PostgreSQL?**
- ✅ Production-grade reliability
- ✅ ACID compliance
- ✅ Supports multiple concurrent connections
- ✅ Better for horizontal scaling
- ✅ Advanced querying capabilities

### **Implementation**

#### **Step 1: Update Database URL**

```python
# Development
DATABASE_URL = "sqlite:///./presentation_jobs.db"

# Production
DATABASE_URL = "postgresql://user:password@localhost:5432/presentations"

# From environment variable
import os
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./presentation_jobs.db")
```

#### **Step 2: Add Connection Pooling**

```python
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Check connections before use
    pool_recycle=3600,   # Recycle connections after 1 hour
    echo=False
)
```

#### **Step 3: Add Migrations (Alembic)**

```bash
# Install Alembic
pip install alembic

# Initialize
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Create presentation_jobs table"

# Apply migration
alembic upgrade head
```

**File:** `alembic/versions/001_create_presentation_jobs.py`

```python
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

def upgrade():
    op.create_table(
        'presentation_jobs',
        sa.Column('job_id', sa.String(50), primary_key=True),
        sa.Column('status', sa.String(20), nullable=False, index=True),
        sa.Column('progress', sa.Float, default=0.0),
        sa.Column('error', sa.Text, nullable=True),
        sa.Column('video_url', sa.String(500), nullable=True),
        sa.Column('thumbnail_url', sa.String(500), nullable=True),
        sa.Column('slide_image_path', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, index=True),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('last_heartbeat', sa.DateTime, nullable=True),
        sa.Column('created_files', postgresql.JSON, nullable=True),
    )
    
    # Create indexes
    op.create_index('idx_status_created', 'presentation_jobs', ['status', 'created_at'])

def downgrade():
    op.drop_table('presentation_jobs')
```

---

## 🔥 Level 3: Redis Cache + PostgreSQL (High Performance)

### **Architecture**

```
┌────────────┐
│   Request  │
└──────┬─────┘
       │
       ▼
┌──────────────────────┐
│  Check Redis Cache   │ ← Fast (1-5ms)
└──────┬───────────────┘
       │
       ├─ Hit → Return from cache ✅
       │
       └─ Miss ─┐
                │
                ▼
       ┌────────────────────┐
       │  Query PostgreSQL  │ ← Slower (10-50ms)
       └────────┬───────────┘
                │
                ▼
       ┌────────────────────┐
       │  Cache in Redis    │ ← TTL: 1 hour
       └────────┬───────────┘
                │
                ▼
       ┌────────────────────┐
       │  Return to client  │
       └────────────────────┘
```

### **Implementation**

```python
import redis
from typing import Optional

class CachedPresentationJobRepository:
    def __init__(self):
        self.redis = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        self.cache_ttl = 3600  # 1 hour
    
    def get(self, db: Session, job_id: str) -> Optional[PresentationJobModel]:
        """Get job with Redis caching."""
        # Try cache first
        cache_key = f"job:{job_id}"
        cached = self.redis.get(cache_key)
        
        if cached:
            logger.info(f"💾 [CACHE] Hit for job: {job_id}")
            return json.loads(cached)
        
        # Cache miss - query database
        db_job = PresentationJobRepository.get(db, job_id)
        
        if db_job:
            # Cache the result
            self.redis.setex(
                cache_key,
                self.cache_ttl,
                json.dumps(db_job, cls=DateTimeEncoder)
            )
            logger.info(f"💾 [CACHE] Stored job: {job_id}")
        
        return db_job
    
    def invalidate(self, job_id: str):
        """Invalidate cache when job updates."""
        cache_key = f"job:{job_id}"
        self.redis.delete(cache_key)
        logger.info(f"💾 [CACHE] Invalidated: {job_id}")
```

---

## 📊 Comparison Table

| Feature | In-Memory (Current) | SQLite (Level 1) | PostgreSQL (Level 2) | Redis + PostgreSQL (Level 3) |
|---------|---------------------|------------------|----------------------|------------------------------|
| **Persistence** | ❌ None | ✅ File-based | ✅ Database | ✅ Database + Cache |
| **Survives restart** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Horizontal scaling** | ❌ No | ⚠️ Limited | ✅ Yes | ✅ Yes |
| **Setup complexity** | Low | Low | Medium | High |
| **Performance** | Very fast | Fast | Fast | Very fast |
| **Concurrent access** | Single process | Limited | Excellent | Excellent |
| **Backup** | ❌ None | ✅ File copy | ✅ pg_dump | ✅ pg_dump |
| **Query capabilities** | Basic | Good | Excellent | Excellent |
| **Production ready** | ❌ No | ⚠️ Small scale | ✅ Yes | ✅ High traffic |

---

## 🎯 Migration Strategy

### **Phase 1: Add Database (No Downtime)**

```python
class ProfessionalPresentationService:
    def __init__(self):
        # Keep existing in-memory for reads
        self.jobs: Dict[str, PresentationJob] = {}
        
        # Add database for writes
        init_db()
    
    async def create_presentation(self, request):
        job_id = str(uuid.uuid4())
        job = PresentationJob(job_id=job_id, status="queued")
        
        # Write to BOTH
        self.jobs[job_id] = job  # Old way
        with get_db() as db:  # New way
            PresentationJobRepository.create(db, job)
        
        return job_id
    
    async def get_job_status(self, job_id):
        # Try memory first (fast)
        if job_id in self.jobs:
            return self.jobs[job_id]
        
        # Fall back to database (persistent)
        with get_db() as db:
            db_job = PresentationJobRepository.get(db, job_id)
            if db_job:
                return PresentationJobRepository.to_dataclass(db_job)
        
        return None
```

### **Phase 2: Transition Period (1 week)**

- Monitor database performance
- Verify all writes go to database
- Test server restarts (jobs should persist)

### **Phase 3: Remove In-Memory (Deploy)**

```python
class ProfessionalPresentationService:
    def __init__(self):
        # ❌ REMOVE: self.jobs = {}
        init_db()  # Database only
    
    async def get_job_status(self, job_id):
        # Only database
        with get_db() as db:
            db_job = PresentationJobRepository.get(db, job_id)
            return PresentationJobRepository.to_dataclass(db_job) if db_job else None
```

---

## ✅ Testing Strategy

### **Test 1: Persistence After Restart**

```python
# Create job
job_id = await service.create_presentation(request)

# Verify in database
with get_db() as db:
    job = PresentationJobRepository.get(db, job_id)
    assert job is not None
    assert job.status == "queued"

# RESTART SERVICE (simulate server restart)
service = ProfessionalPresentationService()

# Job should still exist
status = await service.get_job_status(job_id)
assert status is not None  # ✅ Survives restart!
```

### **Test 2: Concurrent Access**

```python
# Create jobs in parallel
job_ids = await asyncio.gather(*[
    service.create_presentation(request)
    for _ in range(100)
])

# All should be in database
with get_db() as db:
    jobs = PresentationJobRepository.get_all(db)
    assert len(jobs) == 100
```

### **Test 3: Performance**

```python
import time

# Measure query performance
start = time.time()
for i in range(1000):
    await service.get_job_status(job_id)
elapsed = time.time() - start

# Should be fast (<1ms per query with caching)
assert elapsed < 1.0  # 1000 queries in <1 second
```

---

## 🎉 Expected Results

### Before (In-Memory)
```
Server restart → ALL jobs lost ❌
Scale to 2 servers → Random 404s ❌
1000 jobs → Memory leak risk ❌
Deployment → User access lost ❌
```

### After (Database)
```
Server restart → ALL jobs persist ✅
Scale to 10 servers → Shared state ✅
100,000 jobs → No memory issues ✅
Deployment → Zero downtime ✅
```

---

## 📚 Dependencies

```bash
# SQLite (included in Python)
# No additional dependencies

# PostgreSQL
pip install psycopg2-binary

# SQLAlchemy (ORM)
pip install sqlalchemy

# Alembic (migrations)
pip install alembic

# Redis (optional, Level 3)
pip install redis
```

---

## 🎯 Recommendation

**Implement Level 1 (SQLite) immediately:**
- ✅ Low complexity
- ✅ High impact (fixes critical issue)
- ✅ Can be done in 2-4 hours
- ✅ Can migrate to PostgreSQL later

**Plan Level 2 (PostgreSQL) for production:**
- Better for multiple servers
- Better performance at scale
- Industry standard

**Consider Level 3 (Redis) if:**
- Very high traffic (>1000 req/sec)
- Need <5ms response times
- Running multiple servers

---

**Status:** Solution Proposed  
**Complexity:** Medium (Level 1), High (Level 2-3)  
**Effort:** 2-4 hours (Level 1), 1-2 days (Level 2)  
**Risk:** Low (phased migration possible)  
**Recommended:** ⭐ Start with Level 1 (SQLite) immediately  

