# ---------------- ENV ----------------
from dotenv import load_dotenv
import os
import re
from collections import Counter

load_dotenv()

def clean_text(text: str) -> str:
    words = text.split()

    # remove extreme repetition
    if len(words) > 0:
        freq = Counter(words)
        most_common = freq.most_common(1)[0][1]

        if most_common > len(words) * 0.5:
            return ""

    # collapse repeated words
    return re.sub(r'\b(\w+)( \1\b)+', r'\1', text)

# ---------------- IMPORTS ----------------
import requests
import tempfile
from supabase import create_client
from transformers import pipeline

# ---------------- SUPABASE INIT ----------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ---------------- WHISPER MODEL ----------------
asr = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-tiny",
    chunk_length_s=25,
    stride_length_s=5
)

# ---------------- FETCH FILES ----------------
def fetch_room_files(room_id: str):
    res = supabase.table("recordings") \
        .select("*") \
        .eq("room_id", room_id) \
        .execute()

    print(f"[DEBUG] rows found: {len(res.data)}")

    files = []

    for row in res.data:
        url = row["file_path"]
        print("[DEBUG] downloading:", url)

        r = requests.get(url)
        if r.status_code != 200:
            print("[WARN] failed download")
            continue

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".webm")
        tmp.write(r.content)
        tmp.close()

        files.append(tmp.name)

    return files

# ---------------- TRANSCRIBE SINGLE FILE ----------------
def transcribe_file(file_path: str) -> str:

    # skip empty audio files
    if os.path.getsize(file_path) < 5000:
        print("[SKIP] too small:", file_path)
        return ""

    result = asr(
        file_path,
        return_timestamps=False
    )

    text = clean_text(result["text"])

    # filter hallucinations
    if len(text.split()) < 3:
        return ""

    return text

# ---------------- ROOM TRANSCRIPTION ----------------
def transcribe_room(room_id: str) -> str:
    files = fetch_room_files(room_id)

    if not files:
        return "NO FILES FOUND"

    full_text = []

    for f in files:
        print("[DEBUG] transcribing:", f)
        text = transcribe_file(f)
        full_text.append(text)

    return "\n".join(full_text)

# ---------------- TEST RUN ----------------
if __name__ == "__main__":
    room_id = "2a3bf5c3-3b03-40ec-a199-510a510fb744"

    print("\n========== STARTING TRANSCRIPTION ==========\n")

    output = transcribe_room(room_id)

    print("\n========== FINAL OUTPUT ==========\n")
    print(output)

