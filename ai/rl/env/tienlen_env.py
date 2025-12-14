from typing import Optional
import requests
import numpy as np
import gymnasium as gym
from pprint import pformat

class TienLenEnv(gym.Env):
    metadata = {"render_modes": ["ansi"]}

    def __init__(self, render_mode = "None"):
        self.render_mode = render_mode
        self.played_cards = 0
        self.server_url = "http://localhost:5000/tienlen"
        self.player_id = "agent"
        self.card_counting = np.zeros(52)
        self.action = []
        for i in range (0, 53):
            if i == 0:
                self.action.append(("PASS", None))
            else:
                self.action.append(("SINGLE", i-1))
        self.action_space = gym.spaces.Discrete(len(self.action))
        self.agent_hand = np.zeros(52) # Needs to be able to represent all cards in the game
        self.last_played = np.zeros(52)
        self.game_id = None
        self.players_in = np.zeros(4)
        self.opponent_card_count = np.zeros(3)
        self.opponents_passed = np.zeros(4) # Making it all consistent, using a mask to represent all passed opponents
        self.current_controller = np.zeros(4) 
        self.current_player = np.zeros(4) # Making it all consistent, using a mask to represent current player
        self.player_order = ["agent", "bot1", "bot2", "bot3"]
        self.roundNumber = 0
        self.round_status = None
        obs_dimensions = 52 + 52 + 3 + 4 + 4 + 4
        self.observation_space = gym.spaces.Box(
            low=0.0,
            high=1.0,
            shape=(obs_dimensions,),
            dtype=np.float32,
        )
        self.last_state = []

    def _convert_hand(self, card_ids):
        mask = np.zeros(52)
        for card_id in card_ids:
            mask[card_id] = 1
        return mask
    
    def _convert_table(self, player_ids):
        mask = np.zeros(4)
        for player_id in player_ids:
            index = self.player_order.index(player_id)
            mask[index] = 1
        return mask
        
    def _convert_player(self, player_id):
        mask = np.zeros(4)
        index = self.player_order.index(player_id)
        mask[index] = 1
        return mask
        
    def _get_obs(self, state):
        self.agent_hand = self._convert_hand(state["players"][0]["hand"])
        self.last_played = self._convert_hand(state["phase"]["lastComboPlayed"]["cards"])
        self.opponent_card_count[0] = len(state["players"][1]["hand"])
        self.opponent_card_count[1] = len(state["players"][2]["hand"])
        self.opponent_card_count[2] = len(state["players"][3]["hand"])
        self.current_controller = self._convert_player(state["phase"]["round"]["controller"])
        self.current_player = self._convert_player(state["phase"]["round"]["currentPlayer"])
        self.players_in = self._convert_table(state["phase"]["round"]["playersIn"])
        # TODO: Figure out a way to calculate how many opponents have passed(opponents_passed) 
        obs = np.concatenate([
            self.agent_hand, 
            self.last_played, 
            self.opponent_card_count,
            self.current_controller,
            self.current_player,
            self.players_in
            ]).astype(np.float32)
        self.last_obs = obs
        return obs
    
    # def _get_info(self, state):
        # info = state
        # return info
        
    def step(self, action_id: int):
        move_type, card_id = self.action[action_id]
        if move_type == "PASS":
            url = f"{self.server_url}/{self.game_id}/pass/{self.player_id}"
            response = requests.post(url)
            data = response.json()
            self.game_id = data["gameID"]
            state = data["state"]

        else:
            url = f"{self.server_url}/{self.game_id}/play/{self.player_id}"
            payload = {"type": "Single", "cards": [card_id]}
            response = requests.post(url, json=payload)
            data = response.json()
            self.game_id = data["gameID"]
            state = data["state"]
        terminated = False
        self.round_status = data["phase"]["type"]
        if self.round_status == "End":
            terminated = True
        reward = 0
        truncated = False
        obs = self._get_obs(state)
        info = state
        self.last_state = state
        return obs, reward, terminated, truncated, info

    def reset(self, seed: Optional[int] = None, options: Optional[dict] = None):
        url = f"{self.server_url}/start"
        payload = {"players": ["agent", "bot1", "bot2", "bot3"]}
        response = requests.post(url, json=payload)

        data = response.json()
        self.card_counting = np.zeros(52)
        self.opponent_card_count[:] = 13
        self.opponents_passed = np.zeros(4)
        self.current_controller = np.zeros(4)
        self.current_player = np.zeros(4)
        self.roundNumber = None
        self.agent_hand = self._convert_hand(data["state"]["players"][0]["hand"])

        self.game_id = data["gameID"]
        state = data["state"]
        obs = self._get_obs(state)
        info = state
        self.last_state = state
        return obs, info
    
    def render(self):
        if self.render_mode == None:
            return
        else:
            return pformat(self.last_state, sort_dicts=False)