type Phase =
  | { type: 'Opening'; current: PlayerID; currentCombo: Combo }
  | { type: 'Play'; current: PlayerID; currentCombo: Combo }
  | { type: 'End'; controller: PlayerID };
