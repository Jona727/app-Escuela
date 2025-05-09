from fastapi import APIRouter

payment = APIRouter()

@payment.get("/payment")
def pay():
    return "Cuota Paga"