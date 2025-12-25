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
        self.opponent1_card_count = np.array([1.0], dtype=np.float32)
        self.opponent2_card_count = np.array([1.0], dtype=np.float32)
        self.opponent3_card_count = np.array([1.0], dtype=np.float32)
        self.opponents_passed = np.zeros(4) # Making it all consistent, using a mask to represent all passed opponents
        self.current_controller = np.zeros(4) 
        self.current_player = np.zeros(4) # Making it all consistent, using a mask to represent current player
        self.player_order = ["agent", "bot1", "bot2", "bot3"]
        self.roundNumber = 0
        self.round_status = None
        obs_dimensions = 52 + 52 + 1 + 1 + 1 + 4 + 4 + 4
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
        
    def get_action_mask(self, state):
        mask = np.zeros(self.action_space.n, dtype=np.uint8)

        phase = state.get("phase", {}).get("type")

        if phase == "FirstPlay":
            if state["phase"].get("starter") == self.player_id:
                mask[2 + 1] = 1
            return mask
        
        if phase != "Round":
            return mask
        
        if state["phase"]["round"].get("currentPlayer") != self.player_id:
            return mask
        
        if state["phase"]["round"].get("lastComboPlayed"):
            mask[0] = 1

        url = f"{self.server_url}/{self.game_id}/legal-actions/{self.player_id}"
        response = requests.get(url)
        data = response.json()
        legal_cards = data["legalActions"]
        for card in data.get("legalActions", []):
            mask[card + 1] = 1

        return mask

    def _get_obs(self, state):

        self.last_played = np.zeros(52)
        self.agent_hand = self._convert_hand(state["players"]["agent"]["hand"])
        self.opponent1_card_count = np.array([len(state["players"]["bot1"]["hand"]) / 13], dtype=np.float32)
        self.opponent2_card_count = np.array([len(state["players"]["bot2"]["hand"]) / 13], dtype=np.float32)
        self.opponent3_card_count = np.array([len(state["players"]["bot3"]["hand"]) / 13], dtype=np.float32)
        self.current_controller = np.zeros(4)
        self.current_player = np.zeros(4)
        self.players_in = np.zeros(4)
            
        if state["phase"]["type"] == "FirstPlay":
            self.current_controller = self._convert_player(state["phase"]["starter"])
            self.current_player = self._convert_player(state["phase"]["starter"])
            self.players_in = np.ones(4)

        elif state["phase"]["type"] == "Round":
            if not state["phase"]["round"].get("lastComboPlayed"): # Someone has control, no last played
                self.last_played = np.zeros(52)
            else: 
                self.last_played = self._convert_hand(state["phase"]["round"]["lastComboPlayed"]["cards"])

            self.agent_hand = self._convert_hand(state["players"]["agent"]["hand"])
            self.opponent1_card_count = np.array([len(state["players"]["bot1"]["hand"]) / 13], dtype=np.float32)
            self.opponent2_card_count = np.array([len(state["players"]["bot2"]["hand"]) / 13], dtype=np.float32)
            self.opponent3_card_count = np.array([len(state["players"]["bot3"]["hand"]) / 13], dtype=np.float32)
            self.current_controller = self._convert_player(state["phase"]["round"]["controller"])
            self.current_player = self._convert_player(state["phase"]["round"]["currentPlayer"])
            self.players_in = self._convert_table(state["phase"]["round"]["playersIn"])     

        # TODO: Figure out a way to calculate how many opponents have passed(opponents_passed) 
        obs = np.concatenate([
            self.agent_hand, 
            self.last_played, 
            self.opponent1_card_count,
            self.opponent2_card_count,
            self.opponent3_card_count,
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
        reward = 0
        if move_type == "PASS":
            url = f"{self.server_url}/{self.game_id}/pass/{self.player_id}"
            requests.post(url, timeout = 5)
            reward -= 0.01
        else:
            url = f"{self.server_url}/{self.game_id}/play/{self.player_id}"
            payload = {"type": "Single", "cards": [card_id]}
            response = requests.post(url, json=payload, timeout = 5)
            
            if "error" in response.json().get("state", {}) or "error" in response.json():
                reward -= 0.2
                url = f"{self.server_url}/{self.game_id}/pass/{self.player_id}"
                requests.post(url, timeout = 5)

        url = f"{self.server_url}/{self.game_id}/botstep"
        response = requests.post(url, timeout = 5)
        data = response.json()
        self.game_id = data["gameID"]
        state = data["state"]

        terminated = False
        self.round_status = state["phase"]["type"]
        if self.round_status == "End":
            terminated = True
            ranking = state["phase"]["ranking"]
            if ranking[0] == "agent":
                reward += 1
            elif ranking[1] == "agent":
                reward += 0.5
            elif ranking[2] == "agent":
                reward -= 0.5
            else:
                reward -= 1

        truncated = False
        obs = self._get_obs(state)
        info = state
        self.last_state = state
        return obs, reward, terminated, truncated, info

    def reset(self, seed: Optional[int] = None, options: Optional[dict] = None):
        super().reset(seed=seed)
        
        url = f"{self.server_url}/start"
        payload = {"players": ["agent", "bot1", "bot2", "bot3"]}
        response = requests.post(url, json=payload, timeout = 5)

        data = response.json()
        self.game_id = data["gameID"]

        url = f"{self.server_url}/{self.game_id}/botstep"
        response = requests.post(url, timeout = 5)
        data = response.json()
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