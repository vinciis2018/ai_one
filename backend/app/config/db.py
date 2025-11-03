# In app/config/db.py
from pymongo import MongoClient, TEXT
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://vinciis2018:212Matpu6na@clusterai.0fzws.mongodb.net/")
MONGO_DB = os.getenv("MONGO_DB", "professor")


# Create a global client
client = AsyncIOMotorClient(os.getenv("MONGODB_URI", "mongodb+srv://vinciis2018:212Matpu6na@clusterai.0fzws.mongodb.net/"))
# Get the database
db = client.get_database(os.getenv("MONGODB_DB", "professor"))

# Create a sync client for index operations
sync_client = None
sync_db = None

def get_sync_db():
    """Get a synchronous database client for admin operations"""
    global sync_client, sync_db
    if sync_client is None:
        sync_client = MongoClient(MONGO_URI)
        sync_db = sync_client[MONGO_DB]
    return sync_db

def get_db():
    return db

def get_collection(collection_name: str):
    """Get a collection from the database."""
    return get_db()[collection_name]


async def ensure_indexes():
    """Ensure all required indexes exist"""
    try:
        # Get sync client for index operations
        sync_db = get_sync_db()
        
        # Create text indexes
        collections = {
            "kb_student": ["chunk_text"],
            "kb_coaching": ["chunk_text"],
            "kb_general": ["chunk_text"]
        }
        
        for coll_name, fields in collections.items():
            for field in fields:
                sync_db[coll_name].create_index([(field, TEXT)])
                print(f"✅ Created text index on {coll_name}.{field}")
                
    except Exception as e:
        print(f"⚠️ Error creating indexes: {e}")
        # Don't raise, as the app can still function without some indexes


# Create indexes when this module is imported
if __name__ != "__main__":
    import asyncio
    asyncio.create_task(ensure_indexes())