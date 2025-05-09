from fastapi import FastAPI
from routes.user import user
from fastapi.middleware.cors import CORSMiddleware
import sys
sys.tracebacklimit = 1
api_escu = FastAPI()

api_escu.include_router(user)

api_escu.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
