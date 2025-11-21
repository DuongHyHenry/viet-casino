# Deep Q Network Tien Len agent
from collections import defaultdict
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import os
import gymnasium as gym
import numpy as np
from tqdm import tqdm

class QNetwork(nn.Module):
    def __init__(self, input_size, hidden_size, output_size):
        super().__init__()
        self.linear1 = nn.Linear(input_size, hidden_size)
        self.linear2 = nn.Linear(hidden_size, hidden_size)
        self.linear3 = nn.Linear(hidden_size, output_size)
    
    def forward(self, x):
        x = F.relu(self.linear1(x))
        x = F.relu(self.linear2(x))
        x = self.linear3(x)
        return x

class TienLenDQNAgent:
    def __init__(
            self,
            env: gym.Env,
            learning_rate: float,
            intial_epsilon: float,
            epsilon_decay: float,
            final_epsilon: float,
            discount_factor: float = 0.95,

    ):
        self.env = env

        self.lr = learning_rate
        self.discount_factor = discount_factor

        self.epsilon = intial_epsilon
        self.epsilon_decay = epsilon_decay
        self.final_epsilon = final_epsilon

        
# TODO: Make an API that connects my ruleset to this agent
# TODO: Test the game rules to make sure they even work