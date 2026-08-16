import torch
from torchvision import transforms

# ============ ПАРАМЕТРЫ МОДЕЛИ ============
INPUT_SIZE = 784
HIDDEN_SIZE = 128
OUTPUT_SIZE = 10

# ============ ГИПЕРПАРАМЕТРЫ ОБУЧЕНИЯ ============
BATCH_SIZE = 64
LEARNING_RATE = 0.001
NUM_EPOCHS = 10

# ============ ПУТИ К ФАЙЛАМ ============
BEST_MODEL_PATH = './best_model.pt'

# ============ ТРАНСФОРМАЦИИ ============
TRAIN_TRANSFORM = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,))
])

INFERENCE_TRANSFORM = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((28, 28)),
    transforms.ToTensor(),
    transforms.Normalize((0.1307,), (0.3081,))
])

# ============ УСТРОЙСТВО ============
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")