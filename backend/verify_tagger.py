import asyncio
import sys
import os
from unittest.mock import MagicMock, patch
from datetime import datetime

# Add project root to path
sys.path.append(os.getcwd())

# Mocking dependencies before importing the node
# Patch asyncio.create_task to avoid RuntimeError in app.config.db module level code
with patch('asyncio.create_task'), \
     patch('app.config.db.get_collection') as mock_get_collection, \
     patch('app.core.llm_manager.call_llm') as mock_get_llm:

    # Setup Mocks
    mock_collection = MagicMock()
    mock_get_collection.return_value = mock_collection
    
    # Mock LLM Response
    mock_llm_response = '''
    ```json
    {
        "subject": "Physics",
        "chapter": "Rotation",
        "topic": "Torque",
        "micro_concept": "Definition",
        "interaction_type": "Conceptual Doubt"
    }
    ```
    '''
    mock_get_llm.return_value = mock_llm_response

    # Import the node (now that mocks are set up if it imports them at top level, 
    # but here imports are inside function or safe)
    from app.mylanggraph.nodes.chat_to_concept_node import node_chat_to_concept

    async def run_test():
        print("Running Chat-to-Concept Node Verification...")
        
        state = {
            "query": "What is torque?",
            "user_id": "test_student_123",
            "conversation_id": "conv_123",
            "answer": "Torque is the rotational equivalent of force."
        }
        
        # Run the node
        new_state = await node_chat_to_concept(state)
        
        # Verify LLM was called
        print("\n[Check 1] LLM Call:")
        if mock_get_llm.called:
            print("PASS: LLM was called.")
            # print(f"Prompt used: {mock_get_llm.call_args[0][0]}")
        else:
            print("FAIL: LLM was not called.")
            
        # Verify DB Insertion
        print("\n[Check 2] DB Insertion:")
        if mock_collection.insert_one.called:
            print("PASS: insert_one was called.")
            inserted_doc = mock_collection.insert_one.call_args[0][0]
            print(f"Inserted Document: {inserted_doc}")
            
            # Assertions
            assert inserted_doc['student_id'] == "test_student_123"
            assert inserted_doc['subject'] == "Physics"
            assert inserted_doc['topic'] == "Torque"
            assert inserted_doc['interaction_type'] == "Conceptual Doubt"
            print("PASS: Document fields match expected values.")
        else:
            print("FAIL: insert_one was not called.")

    if __name__ == "__main__":
        asyncio.run(run_test())
