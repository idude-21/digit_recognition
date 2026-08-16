from .train import model_education, model_exam
from .network import SimpleNet
import torch

def train_and_save():
    model = SimpleNet(784, 128, 10)
    model_education(model)
    model_exam(model)
    torch.save(model.state_dict(), "best_model.pt")
    print("Модель сохранена в best_model.pth")
