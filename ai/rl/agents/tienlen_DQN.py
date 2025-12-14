# Deep Q Network Tien Len agent
from collections import defaultdict
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import os
from collections import namedtuple, deque
import gymnasium as gym
import numpy as np
from tqdm import tqdm
from itertools import count
import random
import math

env = gym.make("TienLenEnv") # Figure out how to actually do this

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

Transition = namedtuple('Transition', ('state', 'action', 'next_state', 'reward')) # Define structure for transitions

class ReplayMemory(object):
    def __init__(self, capacity):
        self.memory = deque([], maxlen=capacity)

    def push(self, *args):
        self.memory.append(Transition(*args))

    def sample(self, batch_size):
        return random.sample(self.memory, batch_size) # Gets random batch to shake up training and correlation
    
    def __len__(self):
        return len(self.memory)

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
        self.tau = 0.005
        self.episode_durations = []
        self.batch_size = 128 # TODO: Don't quite understand this yet
        self.memory = ReplayMemory(10000)

        self.state, self.info = env.reset()

        # Instantiating networks
        input_size = env.observation_space.shape[0] # 52 + 52 + 3 + 4 + 4 + 4
        output_size = env.action_space.n # 53 possible actions
        hidden_size = 128
        self.online_network = QNetwork(input_size, hidden_size, output_size).to(device)
        self.target_network = QNetwork(input_size, hidden_size, output_size).to(device)
        learnable_weights = self.online_network.state_dict() # Copies all learnable weights
        self.target_network.load_state_dict(learnable_weights) # "Pastes" the weights into the target network
        # self.target_network.eval()

        self.optimizer = optim.Adam(self.online_network.parameters(), lr = self.lr) # Turns the "knobs" in the right direction to minimize and follow backpropagation


    
    def get_action(self, obs):
        sample = random.random()
        epsilon_threshold = self.final_epsilon + (self.epsilon - self.final_epsilon) * \
            math.exp(-1.0 * self.training_step_count / self.epsilon_decay)
        self.training_step_count += 1

        if sample > epsilon_threshold:
            # Exploit
            with torch.no_grad():
                q_values = self.online_network(obs)
                return q_values.max(1)[1].view(1, 1)
        else:
            # Explore
            return torch.tensor([[env.action_space.sample()]],
                            device=device, dtype=torch.long)
        
# TODO: HEAVY research on optimize function

    def optimize(self):
        if len(self.memory) < self.batch_size:
            return
        
        transitions = self.memory.sample(self.batch_size)
        batch = Transition(*zip(*transitions))

        non_final_mask = torch.tensor(
            tuple(s is not None for s in batch.next_state),
            device=device, dtype=torch.bool
        )

        non_final_next_states = torch.cat(
            [s for s in batch.next_state if s is not None]
        )

        state_batch = torch.cat(batch.state)
        action_batch = torch.cat(batch.action)
        reward_batch = torch.cat(batch.reward)

        # Q(s, a) from policy_net
        q_values = self.online_network(state_batch)
        state_action_values = q_values.gather(1, action_batch)  # fixed: gather on q_values

        # Compute V(s') for all next states using target_net
        next_state_values = torch.zeros(self.batch_size, device=device)
        with torch.no_grad():
            next_state_values[non_final_mask] = self.target_network(
                non_final_next_states
            ).max(1)[0]

        # Compute expected Q values
        expected_state_action_values = (next_state_values * self.discount_factor) + reward_batch

        # Loss
        criterion = nn.SmoothL1Loss()
        loss = criterion(state_action_values,
                        expected_state_action_values.unsqueeze(1))

        # Optimize
        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_value_(self.online_network.parameters(), 100)
        self.optimizer.step()


    def update(self, obs):
        return

    def decay_epsilon(self):
        return
    
    # Training loop

    def train(self):
        if torch.cuda.is_available() or torch.backends.mps.is_available():
            num_episodes = 600
        else:
            num_episodes = 50

        for i_episode in range(num_episodes):
            state, info = env.reset()
            state = torch.tensor(state, dtype = torch.float32, device = device).unsqueeze(0)

            for t in count():
                action =  self.get_action(state)
                observation, reward, terminated, truncated, info = env.step(action.item())
                reward = torch.tensor([reward], device = device)
                done = terminated or truncated
                
                if done:
                    next_state = None
                else:
                    next_state = torch.tensor(observation, dtype = torch.float32, device = device).unsqueeze(0)

                self.memory.push(state, action, next_state, reward)

                state = next_state

                self.optimize()

                target_net_state_dict = self.target_network.state_dict()
                policy_net_state_dict = self.online_network.state_dict()
                for key in policy_net_state_dict:
                    target_net_state_dict[key] = policy_net_state_dict[key] * self.tau + \
                        target_net_state_dict[key] * (1.0 - self.tau) # TODO: Figure out what TAU is
                self.target_network.load_state_dict(target_net_state_dict)

                if done:
                    self.episode_durations.append(t + 1)
                    plot_durations() # No plots atm
                    break


# TODO: Make an API that connects my ruleset to this agent
# TODO: Test the game rules to make sure they even work