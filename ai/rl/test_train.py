from ai.rl.env.tienlen_env import TienLenEnv
from ai.rl.agents.tienlen_DQN import TienLenDQNAgent
import matplotlib.pyplot as plt

def main():
    plt.ion()

    env = TienLenEnv()

    agent = TienLenDQNAgent(
        env,
        learning_rate=1e-3,
        intial_epsilon=1.0,
        epsilon_decay=50_000,
        final_epsilon=0.05
    )

    agent.train()

    plt.ioff()
    plt.show()


if __name__ == "__main__":
    main()