from langchain_community.chat_message_histories import ChatMessageHistory

_session_storage = {}

def get_session_history(session_id: str) -> ChatMessageHistory:
    if session_id not in _session_storage:
        _session_storage[session_id] = ChatMessageHistory()
    return _session_storage[session_id]