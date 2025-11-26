from typing import Optional
import requests
import numpy as np
import gymnasium as gym

class TienLenEnv(gym.Env):
    
    def __init__(self):
        self.played_cards = 0
        self.server_url = "http://localhost:5000/tienlen"
        self.player_id = "agent"
        self.card_counting = np.zeros(52)
        for i in range (0, 52):
            if i == 0:
                self.actions[i] = ("PASS", None)
            else:
                self.actions[i] = ("SINGLE", i-1)
        self.agent_hand = None
        self.last_played = None
        self.game_id = None
        self.players_in = None
        self.opponent1_card_count = None
        self.opponent2_card_count = None
        self.opponent3_card_count = None
        self.opponents_passed = None
        self.current_controller = None
        self.current_player = None
        self.roundNumber = None

        
    def _get_obs(self, state):
        self.agent_hand = state["players"][0]["hand"]
        self.last_played = state["phase"]["lastComboPlayed"]
        self.opponent1_card_count = state["players"][1]["hand"].length
        self.opponent2_card_count = state["players"][2]["hand"].length
        self.opponent3_card_count = state["players"][3]["hand"].length
        self.current_controller = state["phase"]["controller"]
        self.current_player = state["phase"]["currentPlayer"]
        self.players_in = state["phase"]["playersIn"]
        obs = [
            self.agent_hand, 
            self.last_played, 
            self.opponent1_card_count,
            self.opponent2_card_count,
            self.opponent3_card_count,
            self.current_controller,
            self.current_player,
            self.players_in
            ]
        return obs
    
    def _get_info(self):
        return
        
    def step(self, action):
        if action == "PASS":
            response = requests.post('${self.server_url}/${self.game_id}/pass/${self.player_id}')
            data = response.json()
            self.game_id = data["gameID"]
            state = data["state"]

        elif action == "PLAY":
            payload = {
                "move": action
            }
            response = requests.post(
                '${self.server_url}/${self.game_id}/play/${self.player_id}'
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
            "${self.server_url}/start"
            json = payload
        )

        data = response.json()


        self.game_id = data["gameID"]
        state = data["state"]
        obs = self._get_obs(state)
        return obs