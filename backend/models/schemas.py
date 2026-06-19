from pydantic import BaseModel
from typing import List, Optional

class CodeInput(BaseModel):
    code: str
    filename: str = "paste.py"

class ChatMessage(BaseModel):
    message: str
    history: List[dict] = []
    # Optional scan context — when provided the AI responds based on real data
    scan_context: Optional[dict] = None

class Finding(BaseModel):
    file: str
    line: int
    code_snippet: str
    algorithm: str
    severity: str
    description: str
    recommendation: dict
