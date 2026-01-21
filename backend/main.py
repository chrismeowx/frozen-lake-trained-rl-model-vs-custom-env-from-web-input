from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import json
from stable_baselines3 import DQN
from custom_env import CustomEnv
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

origins = ["http://localhost:3000",  "http://127.0.0.1:3000"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],     
    allow_headers=["*"],     
)

with open("models/q_learning.json", "r") as f:
    data = json.load(f)

q_table = np.array(data["Q"])

dqn_model = DQN.load("models/dqn.zip")

class EnvRequest(BaseModel):
    gridSize: int
    grid: List[int]
    envType: str


def run_qlearning(env, q_table, max_steps=200):
    obs, _ = env.reset()
    traj = [obs]

    for _ in range(max_steps):
        if obs in q_table:
            action = max(q_table[obs], key=q_table[obs].get)
        else:
            action = env.action_space.sample()

        obs, reward, done, _, _ = env.step(action)
        traj.append(obs)
        if done:
            break

    return traj


def run_dqn(env, model, max_steps=200):
    obs, _ = env.reset()
    traj = [obs]

    for _ in range(max_steps):
        action, _ = model.predict(obs, deterministic=True)
        obs, reward, done, _, _ = env.step(action)
        traj.append(obs)
        if done:
            break

    return traj


def trajectory_to_frames(grid, traj, size):
    frames = []
    for state in traj:
        r, c = divmod(state, size)
        frame = grid.copy()
        frame = [1 if x == 3 else x for x in frame] 
        frame[r * size + c] = 3
        frames.append(frame)
    return frames


@app.post("/train-env")
def simulate_env(req: EnvRequest):
    env = CustomEnv(req.grid, req.gridSize)

    q_traj = run_qlearning(env, q_table)
    dqn_traj = run_dqn(env, dqn_model)

    return {
        "message": "Simulation finished",
        "qlearning_frames": trajectory_to_frames(req.grid, q_traj, req.gridSize),
        "dqn_frames": trajectory_to_frames(req.grid, dqn_traj, req.gridSize),
    }
