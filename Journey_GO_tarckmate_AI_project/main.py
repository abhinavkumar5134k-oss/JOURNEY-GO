import os
import base64
import re
import json
from io import BytesIO
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from groq import Groq
from gtts import gTTS

from database import get_session_history
from tools import (
    get_business_info, 
    escalate_to_human, 
    get_weather_info,
    get_train_timing,
    calculate_fare,
    get_navigation_route
)

load_dotenv()

app = FastAPI(title="Trackmate Virtual Assistant")

BASE_DIR = Path(__file__).resolve().parent
app.mount("/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_INSTRUCTIONS = """You are Trackmate, the official AI Virtual Assistant for the 'Journey Go' transit and mapping application. You help users with travel, routes, trains, fares, and local info.

CORE BEHAVIORS:
1. When you need real-world data, choose the single most appropriate tool tag from below:
   - TRAIN INFO: <function-get_train_timing>{"train_number": "XYZ", "destination": "CityName"}</function-get_train_timing>
   - FARES: <function-calculate_fare>{"start_location": "Point A", "end_location": "Point B", "transport_type": "train"}</function-calculate_fare>
   - MAP LINKS: <function-get_navigation_route>{"current_location": "Point A", "destination": "Point B"}</function-get_navigation_route>
   - WEATHER: <function-get_weather_info>{"city": "CityName"}</function-get_weather_info>
   - LOCAL STORES: <function-get_business_info>{"category": "pricing_inquiry"}</function-get_business_info>
2. Output ONLY the tool tag when triggering functions. Do not introduce it.
3. If a "Result: ..." block is provided to you by the system, look at that data and present it in a warm, friendly, natural way to the passenger. Do not show raw codes to the user."""

AVAILABLE_TOOLS = {
    "get_business_info": get_business_info,
    "escalate_to_human": escalate_to_human,
    "get_weather_info": get_weather_info,
    "get_train_timing": get_train_timing,
    "calculate_fare": calculate_fare,
    "get_navigation_route": get_navigation_route
}

class ChatPayload(BaseModel):
    session_id: str
    message: Optional[str] = ""
    audio_base64: Optional[str] = None

@app.get("/")
async def serve_ui(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.post("/chat")
async def handle_chat_session(payload: ChatPayload):
    try:
        user_text = payload.message or ""
        if payload.audio_base64:
            audio_data = base64.b64decode(payload.audio_base64)
            audio_file = BytesIO(audio_data)
            audio_file.name = "input.webm"
            transcription = client.audio.transcriptions.create(file=audio_file, model="whisper-large-v3", prompt="Transcribe.")
            user_text = transcription.text

        history_manager = get_session_history(payload.session_id)
        messages = [{"role": "system", "content": SYSTEM_INSTRUCTIONS}]
        for msg in history_manager.messages:
            role = "assistant" if msg.__class__.__name__ == "AIMessage" else "user"
            messages.append({"role": role, "content": msg.content})
        messages.append({"role": "user", "content": user_text})
        
        response = client.chat.completions.create(model="llama-3.3-70b-versatile", messages=messages, temperature=0.0)
        raw_output = response.choices[0].message.content

        # Execute and return data back to LLM context
        tool_match = re.search(r'<function-(\w+)>(.*?)</function-\1>', raw_output, re.DOTALL)
        if tool_match:
            tool_name = tool_match.group(1)
            raw_args = tool_match.group(2).strip()
            
            if tool_name in AVAILABLE_TOOLS:
                try:
                    tool_args = json.loads(raw_args)
                    tool_result = AVAILABLE_TOOLS[tool_name](**tool_args)
                    
                    # Update message loop with context evaluation
                    messages.append({"role": "assistant", "content": raw_output})
                    messages.append({"role": "user", "content": f"Result: {tool_result}"})
                    
                    second_response = client.chat.completions.create(model="llama-3.3-70b-versatile", messages=messages, temperature=0.0)
                    clean_output = second_response.choices[0].message.content
                except Exception as e:
                    clean_output = "I ran into a temporary error accessing our mapping database."
            else:
                clean_output = raw_output
        else:
            clean_output = raw_output

        # Final pass clean up
        clean_output = re.sub(r'<function-\w+>.*?</function-\w+>', '', clean_output, flags=re.DOTALL).strip()

        history_manager.add_user_message(user_text)
        history_manager.add_ai_message(clean_output)

        audio_b64 = None
        if clean_output:
            try:
                tts = gTTS(text=clean_output, lang='en')
                fp = BytesIO()
                tts.write_to_fp(fp)
                fp.seek(0)
                audio_b64 = base64.b64encode(fp.read()).decode('utf-8')
            except Exception as e:
                print(f"TTS Error: {e}")
        
        return {"response": clean_output, "audio": audio_b64}

    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)