from tienlen_env import TienLenEnv

def main():
    env = TienLenEnv()
    obs, info = env.reset()
    print("reset obs shape:", obs.shape)

    for i in range(50):
        phase = info.get("phase", {}).get("type")

        if phase == "FirstPlay" and info["phase"]["starter"] == "agent":
            a = 3 
            print("agent started")
        else:
            a = env.action_space.sample()        
        obs, r, term, trunc, info = env.step(a)

        phase = info.get("phase", {}).get("type")
        beat = info.get("phase", {}).get("round", {}).get("playerToBeat")
        last = info.get("phase", {}).get("round", {}).get("lastComboPlayed")
        control = info.get("phase", {}).get("round", {}).get("controller")
        print(i, "a=", a, "r=", r, "phase=", phase, "playerToBeat=", beat, "lastComboPlayed=", last, "controller=", control)

        if term or trunc:
            rankings = info.get("phase", {}).get("ranking")
            print("episode ended:", "terminated" if term else "truncated", "rankings:", rankings)
            break

if __name__ == "__main__":
    main()
