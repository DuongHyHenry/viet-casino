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
import matplotlib
import matplotlib.pyplot as plt
import requests
from ..env.tienlen_env import TienLenEnv

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

is_ipython = 'inline' in matplotlib.get_backend()
if is_ipython:
    from IPython import display

Transition = namedtuple('Transition', ('state', 'action', 'next_state', 'reward', 'next_mask')) # Define structure for transitions

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
        self.episode_rewards = []
        self.episode_wins = []
        self.discount_factor = 0.95
        self.buffer_capacity = 50_000
        self.training_step_count = 0
        self.tau = 0.005
        self.episode_durations = []
        self.batch_size = 128 # TODO: Don't quite understand this yet
        self.memory = ReplayMemory(10000)

        self.state, self.info = self.env.reset()

        # Instantiating networks
        input_size = self.env.observation_space.shape[0] # 52 + 52 + 3 + 4 + 4 + 4
        output_size = self.env.action_space.n # 53 possible actions
        hidden_size = 128
        self.online_network = QNetwork(input_size, hidden_size, output_size).to(device)
        self.target_network = QNetwork(input_size, hidden_size, output_size).to(device)
        learnable_weights = self.online_network.state_dict() # Copies all learnable weights
        self.target_network.load_state_dict(learnable_weights) # "Pastes" the weights into the target network
        # self.target_network.eval()

        self.optimizer = optim.Adam(self.online_network.parameters(), lr = self.lr) # Turns the "knobs" in the right direction to minimize and follow backpropagation
    
    def get_action(self, obs, action_mask):
        sample = random.random()
        epsilon_threshold = self.final_epsilon + (self.epsilon - self.final_epsilon) * \
            math.exp(-1.0 * self.training_step_count / self.epsilon_decay)
        self.training_step_count += 1

        legal = np.flatnonzero(action_mask)
        if legal.size == 0:
            return torch.tensor([[0]], device=device, dtype=torch.long)

        if sample > epsilon_threshold:
            with torch.no_grad():
                q = self.online_network(obs)
                mask_t = torch.from_numpy(action_mask.astype(np.bool_)).to(device).unsqueeze(0)
                q = q.masked_fill(~mask_t, -1e9)
                return q.argmax(dim=1).view(1, 1)
        else:
            a = int(np.random.choice(legal))
            return torch.tensor([[a]], device=device, dtype=torch.long)
        
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

        state_batch = torch.cat(batch.state)
        action_batch = torch.cat(batch.action)
        reward_batch = torch.cat(batch.reward)

        q_values = self.online_network(state_batch)
        state_action_values = q_values.gather(1, action_batch)

        next_state_values = torch.zeros(self.batch_size, device=device)

        non_final_pairs = [(s, m) for (s, m) in zip(batch.next_state, batch.next_mask) if s is not None]
        if non_final_pairs:
            non_final_next_states = torch.cat([p[0] for p in non_final_pairs]) 
            non_final_next_masks = torch.stack([
                torch.from_numpy(p[1].astype(np.bool_)) for p in non_final_pairs
            ], dim=0).to(device)            

            with torch.no_grad():
                q_next = self.target_network(non_final_next_states)                      
                q_next = q_next.masked_fill(~non_final_next_masks, -1e9)
                best_next = q_next.max(1)[0]                                              
                next_state_values[non_final_mask] = best_next


        expected_state_action_values = reward_batch + (self.discount_factor * next_state_values)

        loss = nn.SmoothL1Loss()(state_action_values, expected_state_action_values.unsqueeze(1))

        self.optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_value_(self.online_network.parameters(), 100)
        self.optimizer.step()

    def update(self, obs):
        return

    def decay_epsilon(self):
        return
    
    # Training loop

    def plot(self, show_result=False):
        plt.figure(1)
        rewards_t = torch.tensor(self.episode_rewards, dtype=torch.float)
        wins_t = torch.tensor(self.episode_wins, dtype=torch.float)
        if show_result:
            plt.title('Result')
        else:
            plt.clf()
            plt.title('Training...')
        plt.xlabel('Episode')
        plt.ylabel('Rewards')
        plt.plot(rewards_t.numpy())  # fixed: durations_t

        # Plot 100-episode moving average
        if len(rewards_t) >= 100:
            means = rewards_t.unfold(0, 100, 1).mean(1).view(-1)
            means = torch.cat((torch.zeros(99), means))
            plt.plot(means.numpy())

        plt.pause(0.001)
        if is_ipython:  # fixed: is_ipython
            if not show_result:
                display.display(plt.gcf())
                display.clear_output(wait=True)
            else:
                display.display(plt.gcf())


    def train(self):
        if torch.cuda.is_available() or torch.backends.mps.is_available():
            num_episodes = 4000
        else:
            num_episodes = 50

        for i_episode in range(num_episodes):
            state, info = self.env.reset()
            mask = self.env.get_action_mask(info)
            state = torch.tensor(state, dtype = torch.float32, device = device).unsqueeze(0)

            episode_return = 0

            for t in count():
                action =  self.get_action(state, mask)
                observation, reward, terminated, truncated, info = self.env.step(action.item())

                episode_return += float(reward)
                reward = torch.tensor([reward], device = device)
                done = terminated or truncated
                
                if done:
                    next_state = None
                    next_mask = np.zeros(self.env.action_space.n, dtype=np.uint8)
                else:
                    next_state = torch.tensor(observation, dtype = torch.float32, device = device).unsqueeze(0)
                    next_mask = self.env.get_action_mask(info)

                self.memory.push(state, action, next_state, reward, next_mask)

                state = next_state
                mask = next_mask if next_mask is not None else mask

                self.optimize()

                target_net_state_dict = self.target_network.state_dict()
                policy_net_state_dict = self.online_network.state_dict()
                for key in policy_net_state_dict:
                    target_net_state_dict[key] = policy_net_state_dict[key] * self.tau + \
                        target_net_state_dict[key] * (1.0 - self.tau) # TODO: Figure out what TAU is
                self.target_network.load_state_dict(target_net_state_dict)

                if done:
                    self.episode_durations.append(t + 1)
                    self.episode_rewards.append(episode_return)
                    ranking = info["phase"].get("ranking", [])

                    print(f"episode {i_episode} finished at t={t+1} reward={reward.item():.3f} ranking={ranking}")
                    self.plot()
                    break


# TODO: Make an API that connects my ruleset to this agent
# TODO: Test the game rules to make sure they even work