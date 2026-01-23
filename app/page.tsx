"use client"

import { useState } from "react"
import ComponentSelector from "./components/ComponentSelector"
import GridBoard from "./components/GridBoard"
import AgentAnimation from "./components/AgentAnimation"
import { TILE } from "../lib/tiles"
import Image from "next/image"
import human from "../public/boy.png"

type TileType = typeof TILE[keyof typeof TILE]

type EnvResult = {
  qlearning_frames: number[][]
  dqn_frames: number[][]
  q_steps: number
  dqn_steps: number
  q_return: number
  dqn_return: number
  q_success: boolean
  dqn_success: boolean
}

export default function Page() {
  const [gridSize, setGridSize] = useState(4)
  const [selectedTile, setSelectedTile] = useState<TileType>(TILE.GRASS)
  const [grid, setGrid] = useState<number[]>(Array(16).fill(TILE.GRASS))

  const [envQueue, setEnvQueue] = useState<EnvResult[]>([])
  const [loading, setLoading] = useState(false)

  const sendEnvToBackend = async () => {
    if (envQueue.length >= 5) return
    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/train-env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gridSize,
          grid,
          envType: "custom_env"
        })
      })

      const data = await res.json()
      const envResult: EnvResult = {
        qlearning_frames: data.qlearning_frames,
        dqn_frames: data.dqn_frames,
        q_steps: data.q_steps,
        dqn_steps: data.dqn_steps,
        q_return: data.q_return,
        dqn_return: data.dqn_return,
        q_success: data.q_success,
        dqn_success: data.dqn_success
      }

      setEnvQueue((prev) => [...prev, envResult])
    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const globalMetrics = envQueue.length
    ? {
        qlearning: {
          average_steps: envQueue.reduce((sum, e) => sum + e.q_steps, 0) / envQueue.length,
          average_return: envQueue.reduce((sum, e) => sum + e.q_return, 0) / envQueue.length,
          success_rate: envQueue.filter((e) => e.q_success).length / envQueue.length,
        },
        dqn: {
          average_steps: envQueue.reduce((sum, e) => sum + e.dqn_steps, 0) / envQueue.length,
          average_return: envQueue.reduce((sum, e) => sum + e.dqn_return, 0) / envQueue.length,
          success_rate: envQueue.filter((e) => e.dqn_success).length / envQueue.length,
        }
      }
    : null

  return (
    <div className="pb-20">
      <div className="flex items-center gap-5 font-bold text-4xl mt-10 ml-5">
        <Image src={human} width={40} height={40} alt="logo" />
        <h1 className="text-4xl font-bold mb-6">custenv</h1>
      </div>

      <div className="flex mt-10 justify-center">
        <GridBoard grid={grid} setGrid={setGrid} gridSize={gridSize} selectedTile={selectedTile}/>
      </div>

      <div className="mt-10 flex justify-center items-center gap-3">
        <button onClick={sendEnvToBackend} disabled={loading || envQueue.length >= 5} className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-900 disabled:bg-gray-400">
          {loading ? "Running model..." : envQueue.length >= 5 ? `Collected (5/5)` : `Environment (${envQueue.length}/5)`}
        </button>
      </div>

      <ComponentSelector setSelectedTile={setSelectedTile} />

      {globalMetrics && (
        <div className="mt-10 p-4 rounded shadow">
          <h3 className="font-bold text-lg mb-2 text-center">Metrics Global dari 5 Environment</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <strong>Q-learning</strong>
              <p>Success Rate: {(globalMetrics.qlearning.success_rate * 100).toFixed(2)}%</p>
              <p>Average Steps: {globalMetrics.qlearning.average_steps.toFixed(2)}</p>
              <p>Average Return: {globalMetrics.qlearning.average_return.toFixed(2)}</p>
            </div>
            <div>
              <strong>DQN</strong>
              <p>Success Rate: {(globalMetrics.dqn.success_rate * 100).toFixed(2)}%</p>
              <p>Average Steps: {globalMetrics.dqn.average_steps.toFixed(2)}</p>
              <p>Average Return: {globalMetrics.dqn.average_return.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

    <div className="mt-6 space-y-6">
      {envQueue.map((env, idx) => (
        <div key={idx} className="flex justify-center">
          
          <div className="w-full max-w-4xl p-6 rounded shadow flex flex-col items-center">
            
            <h2 className="text-xl font-bold mb-4 text-center">
              Environment {idx + 1}
            </h2>

            <AgentAnimation
              qFrames={env.qlearning_frames}
              dqnFrames={env.dqn_frames}
              gridSize={gridSize}
            />

          </div>
        </div>
      ))}
    </div>
    </div>
  )
}
