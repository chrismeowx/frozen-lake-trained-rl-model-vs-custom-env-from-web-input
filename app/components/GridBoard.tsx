import { TILE } from "../../lib/tiles"

type Props = {
  grid: number[]
  setGrid: (g: number[]) => void
  gridSize: number
  selectedTile: number
}

export default function GridBoard({ grid, setGrid, gridSize, selectedTile }: Props) {
  const handleDrop = (index: number, tileType: number) => {
    const newGrid = [...grid];
    newGrid[index] = tileType;
    setGrid(newGrid);
  };

  return (
    <div className="grid gap-2 mt-5" style={{ gridTemplateColumns: `repeat(${gridSize}, 80px)` }}>
      {grid.map((cell, i) => (
        <div key={i} className="w-20 h-20 border border-gray-800 relative" onClick={() => handleDrop(i, selectedTile)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const tileType = Number(e.dataTransfer.getData("tileType")); handleDrop(i, !isNaN(tileType) ? tileType : selectedTile);}}>
          <img src="/grass.png" className="absolute top-0 left-0 w-full h-full object-cover z-0" />

          {cell === TILE.WALL && <img src="/wall.png" className="absolute top-0 left-0 w-full h-full object-cover z-10" />}
          {cell === TILE.CANDY && <img src="/goal.png" className="absolute top-0 left-0 w-full h-full object-cover z-20" />}
          {cell === TILE.AGENT && <img src="/boy.png" className="absolute top-0 left-0 w-full h-full object-cover z-30" />}
        </div>
      ))}
    </div>
  );
}
