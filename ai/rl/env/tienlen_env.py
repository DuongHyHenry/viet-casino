from typing import Optional
import requests
import numpy as np
import gymnasium as gym

# Observation space:
# 
# played_cards
# agent_hand
# last_played
# opponent_card_count
# opponents_passed
# control
# game_id
# player_id

class TienLenEnv(gym.Env):
    
    def __init__(self):
        self.played_cards = 0
        
    def _get_obs(self, state):
        return
    
    def _get_info(self):
        return
        
    def step(self, action):
        if action == "PASS":
            response = requests.post('http://localhost:3000/tienlen/${game_id}/pass/${player_id}')
            data = response.json()
            self.game_id = data["gameID"]
            state = data["state"]

        elif action == "PLAY":
            payload = {
                "move": action
            }
            response = requests.post(
                'http://localhost:3000/tienlen/${game_id}/play/${player_id}'
                json = payload
            )
            data = response.json()
            self.game_id = data["gameID"]
            state = data["state"]
        obs = self._get_obs(state)
        return obs

    def reset(self, seed: Optional[int] = None, options: Optional[dict] = None):
        payload = {
            "players": ["agent", "bot1", "bot2", "bot3"]
        }

        response = requests.post(
            "http://localhost:3000/tienlen/start"
            json = payload
        )

        data = response.json()


        self.game_id = data["gameID"]
        state = data["state"]
        obs = self._get_obs(state)
        return obs