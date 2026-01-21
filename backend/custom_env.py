import numpy as np
import gymnasium as gym

class CustomEnv(gym.Env):
    def __init__(self, grid, size):
        super().__init__()
        self.original_grid = np.array(grid).reshape(size, size)
        self.size = size

        self.action_space = gym.spaces.Discrete(4)
        self.observation_space = gym.spaces.Discrete(size * size)

    def pos_to_state(self, pos):
        r, c = pos
        return r * self.size + c

    def reset(self, seed=None, options=None):
        self.grid = self.original_grid.copy()
        self.agent_pos = tuple(np.argwhere(self.grid == 3)[0])
        return self.pos_to_state(self.agent_pos), {}

    def step(self, action):
        r, c = self.agent_pos
        nr, nc = r, c

        if action == 0: nr -= 1
        if action == 1: nr += 1
        if action == 2: nc -= 1
        if action == 3: nc += 1

        nr = np.clip(nr, 0, self.size - 1)
        nc = np.clip(nc, 0, self.size - 1)

        reward = -0.01
        done = False

        if self.grid[nr, nc] != 0:
            self.grid[r, c] = 1
            self.agent_pos = (nr, nc)

        if self.grid[self.agent_pos] == 2:
            reward = 1.0
            done = True

        self.grid[self.agent_pos] = 3

        return self.pos_to_state(self.agent_pos), reward, done, False, {}