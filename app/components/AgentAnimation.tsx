"use client"

import { useEffect, useState } from "react"
import { TILE } from "../../lib/tiles"

type Props = {
  qFrames: number[][]
  dqnFrames: number[][]
  gridSize: number
}

export default function AgentAnimation({ qFrames, dqnFrames, gridSize }: Props) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)

  const maxFrames = Math.max(qFrames.length, dqnFrames.length)

  useEffect(() => {
    if (!playing || maxFrames === 0) return

    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev + 1 >= maxFrames) return prev
        return prev + 1
      })
    }, 300) 

    return () => clearInterval(interval)
  }, [playing, maxFrames])

  const replay = () => {
    setIndex(0)
    setPlaying(true)
  }

  const renderGrid = (grid: number[]) => {
    if (!grid || grid.length === 0) return null

    return (
      <div className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 80px)` }}
      >
        {grid.map((cell, i) => (
          <div key={i} className="w-20 h-20 relative">
            <img src="/grass.png" alt="grass tile" className="absolute top-0 left-0 w-full h-full object-cover z-0" />

            {cell === TILE.WALL && ( <img src="/wall.png" alt="wall tile" className="absolute top-0 left-0 w-full h-full object-cover z-10" /> )}
            {cell === TILE.CANDY && ( <img src="/goal.png" alt="candy tile" className="absolute top-0 left-0 w-full h-full object-cover z-20" /> )}
            {cell === TILE.AGENT && ( <img src="/boy.png" alt="Agent" className="absolute top-0 left-0 w-full h-full object-cover z-30" /> )}
          </div>
        ))}
      </div>
    )
  }

  if (maxFrames === 0) return null

  return (
    <div className="mt-12 px-6">

      <div className="flex justify-center gap-12">

        <div className="text-center">
          <h3 className="font-semibold text-2xl mb-7">Q-Learning</h3>
          {renderGrid(qFrames[index] ?? qFrames[qFrames.length - 1])}
        </div>

        <div className="text-center">
          <h3 className="font-semibold text-2xl mb-7">DQN</h3>
          {renderGrid(dqnFrames[index] ?? dqnFrames[dqnFrames.length - 1])}
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-8">
        <button onClick={() => setPlaying(false)} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
          Pause
        </button>

        <button onClick={() => setPlaying(true)} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Continue
        </button>

        <button onClick={replay} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Replay
        </button>
      </div>

      <p className="text-center mt-4 text-gray-600">
        Step {index + 1} / {maxFrames}
      </p>
    </div>
  )
}
