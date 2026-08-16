import torch
from .config import BEST_MODEL_PATH, INPUT_SIZE, HIDDEN_SIZE, OUTPUT_SIZE, INFERENCE_TRANSFORM, DEVICE
from .train_script import train_and_save
import os
from .network import SimpleNet

def load_model():
    model = SimpleNet(INPUT_SIZE, HIDDEN_SIZE, OUTPUT_SIZE)
    if os.path.exists(BEST_MODEL_PATH):
        state_dict = torch.load('best_model.pt', map_location=DEVICE)
    else:
        train_and_save()
        state_dict = torch.load('best_model.pt', map_location=DEVICE)
    model.load_state_dict(state_dict)
    model.eval()
    return model

def upload_image(model, image) -> int:
    try:
        input_tensor = INFERENCE_TRANSFORM(image)
        input_batch = input_tensor.unsqueeze(0)
        with torch.no_grad():
            output = model(input_batch)
            _, predicted_idx = torch.max(output, 1)
        return (predicted_idx.item())
    except Exception as e:
        raise ValueError(f"Ошибка обработки изображения: {e}")

