import json
from typing import List

from fastapi import WebSocket


class ConnectionManager:
    """Tracks connected dashboard clients and broadcasts events to all of them.

    Kept deliberately simple (in-memory list) since this runs as a single
    process. If you needed to scale the backend horizontally, you'd swap
    the broadcast() call for a pub/sub layer (e.g. Redis) that every
    instance subscribes to.
    """

    def __init__(self) -> None:
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict) -> None:
        payload = json.dumps(message, default=str)
        stale: List[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                stale.append(connection)
        for conn in stale:
            self.disconnect(conn)


manager = ConnectionManager()
