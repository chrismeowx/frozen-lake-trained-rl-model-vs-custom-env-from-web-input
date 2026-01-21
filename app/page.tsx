"use client"

import { useState } from "react"
import ComponentSelector from "./components/ComponentSelector"
import GridBoard from "./components/GridBoard"
import AgentAnimation from "./components/AgentAnimation"
import { TILE } from "../lib/tiles"
import Image from "next/image"
import human from "../public/boy.png"

export default function Page() {
  const [gridSize, setGridSize] = useState(4)
  const [selectedTile, setSelectedTile] = useState(TILE.GRASS)
  const [grid, setGrid] = useState<number[]>(Array(16).fill(TILE.GRASS))

  const [qFrames, setQFrames] = useState<number[][]>([])
  const [dqnFrames, setDqnFrames] = useState<number[][]>([])
  const [loading, setLoading] = useState(false)

  const sendEnvToBackend = async () => {
    try {
      setLoading(true)

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

      console.log("Backend response:", data)

      setQFrames(data.qlearning_frames || [])
      setDqnFrames(data.dqn_frames || [])

    } catch (err) {
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-20">

      <div className="flex items-center gap-5 font-bold text-4xl mt-10 ml-5">
        <Image src={human} width={40} height={40} alt="logo" />
        <h1 className="text-4xl font-bold mb-6">custenv</h1>
      </div>

      <div className="flex mt-10 justify-center">
        <GridBoard grid={grid} setGrid={setGrid} gridSize={gridSize} selectedTile={selectedTile}/>
      </div>

      <div className="mt-10 flex justify-center items-center">
        <button onClick={sendEnvToBackend} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-900 disabled:bg-gray-400">
          {loading ? "Running models..." : "Send Environment to Run Models"}
        </button>
      </div>

      <ComponentSelector setSelectedTile={setSelectedTile} />

      <div className="mt-50">
        <AgentAnimation qFrames={qFrames} dqnFrames={dqnFrames} gridSize={gridSize}/>
      </div>

    </div>
  )
}