from fastapi import FastAPI, UploadFile
from .model import upload_image, load_model
from PIL import Image
import io
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_headers=["*"],
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
)

@app.on_event('startup')
async def startup_event():
    global model
    model = load_model()


class PredictionResponse(BaseModel):
    prediction: int


@app.post(
    path = "/upload_picture",
    response_model = PredictionResponse)
async def upload_picture(file: UploadFile):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    digit = upload_image(model, image)
    return PredictionResponse(prediction = digit)


