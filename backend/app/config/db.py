# In app/config/db.py
from pymongo import MongoClient, TEXT
from motor.motor_asyncio import AsyncIOMotorClient
import os

import torch
import gc


MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://vinciis2018:212Matpu6na@clusterai.0fzws.mongodb.net/")
# MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")

MONGO_DB = os.getenv("MONGO_DB", "professor")


MONGO_URI_SHEEPMATE = os.getenv("MONGO_URI_SHEEPMATE", "mongodb+srv://vinciis2018:212Matpu6na@clusterai.0fzws.mongodb.net/")
# MONGO_URI_SHEEPMATE = os.getenv("MONGO_URI_SHEEPMATE", "mongodb://localhost:27017/")

MONGO_DB_SHEEPMATE = os.getenv("MONGO_DB_SHEEPMATE", "sheepmate")




# Create a global client
client = AsyncIOMotorClient(MONGO_URI)
sheepmate_client = AsyncIOMotorClient(MONGO_URI_SHEEPMATE)
# Get the database
db = client.get_database(MONGO_DB)
sheepmate_db = sheepmate_client.get_database(MONGO_DB_SHEEPMATE)

# Create a sync client for index operations
sync_client = None
sync_db = None

sheepmate_sync_client = None
sheepmate_sync_db = None


def clear_memory():
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
    gc.collect()


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
            "kb_teacher": ["chunk_text"],
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


# sheepmate db
def get_sync_db_sheepmate():
    """Get a synchronous database client for admin operations"""
    global sheepmate_sync_client, sheepmate_sync_db
    if sheepmate_sync_client is None:
        sheepmate_sync_client = MongoClient(MONGO_URI_SHEEPMATE)
        sheepmate_sync_db = sheepmate_sync_client[MONGO_DB_SHEEPMATE]
    return sheepmate_sync_db

def get_db_sheepmate():
    return sheepmate_db

def get_collection_sheepmate(collection_name: str):
    """Get a collection from the database."""
    return get_db_sheepmate()[collection_name]


# Create indexes when this module is imported
if __name__ != "__main__":
    import asyncio
    asyncio.create_task(ensure_indexes())