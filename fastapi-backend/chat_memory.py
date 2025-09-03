# memory.py

import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
from langchain_community.chat_message_histories import RedisChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
import os
import redis
import logging

# Use the environment variable if set, otherwise default to localhost
REDIS_URL = os.getenv("REDIS_URL", "redis://127.0.0.1:6379")
logging.info(f"Connecting to Redis at: {REDIS_URL}")

# Initialize a Redis client
redis_client = redis.StrictRedis.from_url(REDIS_URL)

APP_PREFIX = "aicure:chat:"  # Prefix for App 1 keys
# APP_PREFIX = ""

def clear_chat_history_in_redis():
    """Clear only chat-related entries in Redis without dropping the schema."""
    try:
        # Assuming the keys for chat entries follow APP_PREFIX
        keys = redis_client.keys(f"{APP_PREFIX}*")  # Get all chat keys
        logging.debug(f'Keys found: {keys}')
        if keys:
            redis_client.delete(*keys)  # Delete only chat keys
            logging.info(f"Deleted {len(keys)} chat-related keys for OSDR app.")
        else:
            logging.info("No chat-related keys found for OSDR.")
    except Exception as e:
        logging.error(f"Error clearing chat-related entries in Redis: {e}")

logging.info('Clearing chat history in Redis at startup...')
clear_chat_history_in_redis()


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    """Get or create a Redis-based session history and add initial messages if empty."""
    history = RedisChatMessageHistory(session_id=session_id, key_prefix=APP_PREFIX,  url=REDIS_URL) 
    return history

def add_chat_message(history: BaseChatMessageHistory, message: str, role: str):
    """Add a chat message to the Redis-based session history."""
    
    if role.lower() == 'user':
        history.add_user_message(message)
    elif role.lower() in ['assistant', 'ai']:
        history.add_ai_message(message)
    else:
        raise ValueError(f"Invalid role: {role}. Must be 'user' or 'assistant'")



