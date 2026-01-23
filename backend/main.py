from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import json
from stable_baselines3 import DQN
from custom_env import CustomEnv
import numpy as np
from huggingface_hub import hf_hub_download
from fastapi.middleware.cors import CORSMiddleware

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

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

zip_path = hf_hub_download(repo_id="tinemeowx/dqn-model", filename="dqn.zip")
dqn_model = DQN.load(zip_path)

class EnvRequest(BaseModel):
    gridSize: int
    grid: List[int]
    envType: str

def run_qlearning(env, q_table, max_steps=99):
    obs, _ = env.reset()
    traj = [obs]
    total_reward = 0
    done = False

    for _ in range(max_steps):
        if obs < len(q_table) and not np.all(q_table[obs] == 0):
            action = int(np.argmax(q_table[obs]))
        else:
            action = env.action_space.sample()

        obs, reward, done, _, _ = env.step(action)
        total_reward += reward
        traj.append(obs)

        if done:
            break

    success = done
    return traj, total_reward, success

def run_dqn(env, model, max_steps=99):
    obs, _ = env.reset()
    traj = [obs]
    total_reward = 0
    done = False

    for _ in range(max_steps):
        action, _ = model.predict(obs, deterministic=True)
        obs, reward, done, _, _ = env.step(action)
        total_reward += reward
        traj.append(obs)

        if done:
            break

    success = done
    steps = len(traj)
    return traj, total_reward, success

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

    q_traj, q_return, q_success = run_qlearning(env, q_table)
    dqn_traj, dqn_return, dqn_success = run_dqn(env, dqn_model)

    return {
        "message": "Simulation finished",
        "qlearning_frames": trajectory_to_frames(req.grid, q_traj, req.gridSize),
        "dqn_frames": trajectory_to_frames(req.grid, dqn_traj, req.gridSize),
        "q_steps": len(q_traj),
        "dqn_steps": len(dqn_traj),
        "q_return": q_return,
        "dqn_return": dqn_return,
        "q_success": q_success,
        "dqn_success": dqn_success
    }
