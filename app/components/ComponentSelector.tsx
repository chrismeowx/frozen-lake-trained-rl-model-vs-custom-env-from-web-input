import { TILE } from "../../lib/tiles"

type TileType = typeof TILE[keyof typeof TILE]

type Props = {
  setSelectedTile: (tile: TileType) => void
}

export default function ComponentSelector({ setSelectedTile }: Props) {
  const tiles = [
    { type: TILE.AGENT, src: "/boy.png", label: "Agent" },
    { type: TILE.GRASS, src: "/grass.png", label: "Grass" },
    { type: TILE.WALL, src: "/wall.png", label: "Wall" },
    { type: TILE.CANDY, src: "/goal.png", label: "Candy" },
  ];

  return (
    <div className="flex gap-3 justify-center mt-10">
      {tiles.map(tile => (
        <img key={tile.type} src={tile.src} alt={tile.label} width={80} height={80} className="cursor-pointer" draggable onClick={() => setSelectedTile(tile.type)} onDragStart={(e) => e.dataTransfer.setData("tileType", tile.type.toString())} />
      ))}
    </div>
  );
}
