import { GameState, Actions } from "../game-state.js"

export interface Bot {
    decide(state: GameState): Actions | Promise<Actions> | null
}