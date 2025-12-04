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

    ):
        self.env = env

        # Hyperparameters
        self.lr = learning_rate
        self.epsilon = intial_epsilon
        self.epsilon_decay = epsilon_decay
        self.final_epsilon = final_epsilon
        self.discount_factor = 0.95
        self.buffer_capacity = 50_000
        self.training_step_count = 0

        self.replay_buffer = [] # Stores MANY tuples of (state, action, reward, next_state, done)  

        # Instantiating networks
        input_size = env.observation_space.shape[0] # 52 + 52 + 3 + 4 + 4 + 4
        output_size = env.action_space.n # 53 possible actions
        hidden_size = 128
        self.online_network = QNetwork(input_size, hidden_size, output_size)
        self.target_network = QNetwork(input_size, hidden_size, output_size)
        learnable_weights = self.online_network.state_dict() # Copies all learnable weights
        self.target_network.load_state_dict(learnable_weights) # "Pastes" the weights into the target network
        # self.target_network.eval()

        self.optimizer = optim.Adam(self.online_network.parameters(), lr = self.lr) # Turns the "knobs" in the right direction to minimize and follow backpropagation


    
    def get_action(self, obs):
        
    def update(self, obs):

    def decay_epsilon(self):

        
# TODO: Make an API that connects my ruleset to this agent
# TODO: Test the game rules to make sure they even work