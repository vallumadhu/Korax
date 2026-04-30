from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
import os
import uuid
load_dotenv(dotenv_path="backend__\.env")

# --- ENV ---
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IN-MEMORY ROOM MANAGEMENT ---
rooms = {}  # room_id -> set of websockets


# --- WEBSOCKET (SIGNALING) ---
@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()

    if room_id not in rooms:
        rooms[room_id] = set()
    rooms[room_id].add(websocket)

    # notify others
    for client in rooms[room_id]:
        if client != websocket:
            await client.send_json({"type": "user-joined"})

    try:
        while True:
            data = await websocket.receive_json()

            # relay signaling messages
            for client in rooms[room_id]:
                if client != websocket:
                    await client.send_json(data)

    except WebSocketDisconnect:
        rooms[room_id].remove(websocket)

        for client in rooms[room_id]:
            await client.send_json({"type": "user-left"})


# --- FILE UPLOAD (TO SUPABASE) ---
@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    roomId: str = Form(...)
):
    try:
        content = await file.read()

        filename = f"{roomId}/{uuid.uuid4()}.webm"

        # IMPORTANT: correct MIME type
        supabase.storage.from_("recordings").upload(
            path=filename,
            file=content,
            file_options={"content-type": "video/webm"}
        )

        file_url = supabase.storage.from_("recordings").get_public_url(filename)

        supabase.table("recordings").insert({
            "room_id": roomId,
            "file_path": file_url
        }).execute()

        return JSONResponse({
            "success": True,
            "url": file_url
        })

    except Exception as e:
        return JSONResponse({
            "success": False,
            "error": str(e)
        }, status_code=500)


# --- HEALTH CHECK ---
@app.get("/")
def root():
    return {"status": "running"}


# --- RUN ---
# uvicorn server:app --reload --port 3000