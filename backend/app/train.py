import torch
import torch.nn as nn
import torch.optim as optim
import torchvision
from torch.utils.data import DataLoader
from .config import TRAIN_TRANSFORM, LEARNING_RATE, NUM_EPOCHS, BATCH_SIZE

def model_education(model):
    train_dataset = torchvision.datasets.MNIST(
        root = "./data",
        train = True,
        download = True,
        transform=TRAIN_TRANSFORM
    )
    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True
    )
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    for epoch in range (NUM_EPOCHS):
        for batch_idx, (data, targets) in enumerate(train_loader):
            output = model(data)
            loss = criterion(output, targets)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
        print(f'Epoch {epoch+1}; Loss: {loss.item()}')
    model_exam(model)

def model_exam(model):
    test_dataset = torchvision.datasets.MNIST(
        root = "./data",
        train=False,
        download=True,
        transform=TRAIN_TRANSFORM
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False
    )
    total = 0
    correct = 0
    model.eval()
    with torch.no_grad():
        for batch_idx, (data, targets) in enumerate(test_loader):
            outputs = model(data)
            _, predicted = torch.max(outputs, 1)
            total += targets.size(0)
            correct += (predicted == targets).sum().item()
        print(f'Точность на тесте: {100 * correct / total:.2f}%')
