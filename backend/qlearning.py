import gymnasium as gym
import numpy as np
import json

env = gym.make("FrozenLake-v1", is_slippery=False)

num_states = env.observation_space.n
num_actions = env.action_space.n

Q = np.zeros((num_states, num_actions))

alpha = 0.1
gamma = 0.99
epsilon = 1.0
epsilon_min = 0.01
epsilon_decay = 0.995

episodes = 50000
max_steps = 100

for ep in range(episodes):
    state, _ = env.reset()

    for step in range(max_steps):
        if np.random.rand() < epsilon:
            action = env.action_space.sample()
        else:
            action = np.argmax(Q[state])

        next_state, reward, terminated, truncated, _ = env.step(action)
        done = terminated or truncated

        Q[state, action] += alpha * (
            reward + gamma * np.max(Q[next_state]) - Q[state, action]
        )

        state = next_state
        if done:
            break

    epsilon = max(epsilon_min, epsilon * epsilon_decay)


def evaluate_q_learning(env, Q, episodes=100, max_steps=100):
    successes = 0
    steps_list = []
    returns_list = []

    for ep in range(episodes):
        state, _ = env.reset()
        total_reward = 0

        for step in range(max_steps):
            action = np.argmax(Q[state])
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated

            total_reward += reward
            state = next_state

            if done:
                if reward > 0:
                    successes += 1
                    steps_list.append(step + 1)
                returns_list.append(total_reward)
                break
        else:
            returns_list.append(total_reward)

    success_rate = successes / episodes
    avg_steps = np.mean(steps_list) if steps_list else None
    avg_return = np.mean(returns_list)

    return {
        "success_rate": success_rate,
        "avg_steps": avg_steps,
        "avg_return": avg_return
    }


results = evaluate_q_learning(env, Q, episodes=100)

print("Evaluation Results: Q-Learning")
print(f"Success rate: {results['success_rate']*100:.2f}%")
print(f"Average steps to goal: {results['avg_steps']}")
print(f"Average return: {results['avg_return']}")

with open("models/q_learning.json", "w") as f:
    json.dump({
        "Q": Q.tolist(),
        "alpha": alpha,
        "gamma": gamma,
        "epsilon_decay": epsilon_decay,
        "episodes": episodes
    }, f)


print("The q learning table has been saved!")
