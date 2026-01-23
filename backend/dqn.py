import gymnasium as gym
import numpy as np
import matplotlib.pyplot as plt
import time
import sys
from stable_baselines3 import DQN
from stable_baselines3.common.env_util import make_vec_env

env_dqn = make_vec_env("FrozenLake-v1", n_envs=1, env_kwargs={"is_slippery": False})

model = DQN(
    "MlpPolicy",
    env_dqn,
    learning_rate=0.0001,
    buffer_size=100000,
    learning_starts=1000,
    batch_size=32,
    gamma=0.99,
    exploration_fraction=0.2,
    exploration_final_eps=0.05,
    verbose=1,
    policy_kwargs=dict(net_arch=[64, 64])
)

model.learn(total_timesteps=50000)

def evaluate_dqn(model, episodes=100, max_steps=100):
    env = model.get_env()

    successes = 0
    steps_list = []
    returns_list = []

    for _ in range(episodes):
        obs = env.reset()
        total_reward = 0

        for step in range(max_steps):
            action, _ = model.predict(obs, deterministic=True)

            obs, reward, done, info = env.step(action)

            reward_val = reward[0]
            total_reward += reward_val

            if done[0]:
                if reward_val > 0:
                    successes += 1
                    steps_list.append(step + 1)
                returns_list.append(total_reward)
                break
        else:
            returns_list.append(total_reward)

    return {
        "success_rate": successes / episodes,
        "avg_steps": np.mean(steps_list) if steps_list else None,
        "avg_return": np.mean(returns_list)
    }

dqn_results = evaluate_dqn(model, episodes=100)

print("Evaluation Results: DQN")
print(f"Success rate: {dqn_results['success_rate']*100:.2f}%")
print(f"Average steps to goal: {dqn_results['avg_steps']}")
print(f"Average return: {dqn_results['avg_return']}")

model.save("models/dqn")
print("Model DQN that has been trained with Frozen Lake has been saved!")
