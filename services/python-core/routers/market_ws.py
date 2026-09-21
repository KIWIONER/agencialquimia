from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json

router = APIRouter(prefix="/ws", tags=["MarketStream"])

@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    print("LOG: Handshake recibido")
    await websocket.accept()
    print("LOG: Handshake aceptado")
    try:
        while True:
            tick = {
                "type": "tick",
                "symbol": "btcusdt",
                "candle": {
                    "time": 1726838400000,
                    "open": 81000,
                    "high": 81200,
                    "low": 80900,
                    "close": 81100,
                    "volume": 100,
                },
                "consensus": {
                    "direction": "LONG",
                    "score": 85
                }
            }
            await websocket.send_text(json.dumps(tick))
            print("LOG: Tick enviado")
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        print("LOG: Cliente desconectado")
    except Exception as e:
        print(f"LOG: Error fatal: {e}")
