import React, { useEffect, useRef } from "react";
import { Board, GameInfo } from "../Interfaces/Game";
import { FactionToColor, TypeToColor } from "../Utils/TypeToColor";

interface Props {
  info: GameInfo;
}

function MapVisualiser({ info }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const map = info.map;
    if (map === null || map.squares === null || map.squares.length === 0) {
      return;
    }
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }
    ctx.imageSmoothingEnabled = false;

    const cellSizeX = ctx.canvas.width / map.squares.length;
    const cellSizeY = ctx.canvas.height / map.squares[0].length;

    const smallDiffX = cellSizeX * 0.1;
    const smallDiffY = cellSizeY * 0.1;
    const restX = cellSizeX * 0.8;
    const restY = cellSizeY * 0.8;

    for (var x = 0; x < map.squares.length; x++) {
      for (var y = 0; y < map.squares[x].length; y++) {
        ctx.fillStyle = TypeToColor(map.squares[x][y].type);

        ctx.fillRect(x * cellSizeX, y * cellSizeY, cellSizeX, cellSizeY);

        if (map.squares[x][y].bonus !== "None") {
          ctx.fillStyle = "#FF8DC7";
          ctx.beginPath();
          ctx.arc(
            (x + 0.5) * cellSizeX,
            (y + 0.5) * cellSizeY,
            restX / 4,
            0,
            2 * Math.PI,
            false
          );
          ctx.fill();
        }
      }
    }

    for (var x = 0; x < map.squares.length; x++) {
      for (var y = 0; y < map.squares[x].length; y++) {
        ctx.fillStyle = "#000000";

        ctx.fillRect(x * cellSizeX, y * cellSizeY, cellSizeX, 0.5);
        ctx.fillRect(x * cellSizeX, y * cellSizeY, 0.5, cellSizeY);
      }
    }

    info.homes.map((home) => {
      drawImage(
        "/Art/House.png",
        home.x * cellSizeX + smallDiffX,
        home.y * cellSizeY + smallDiffY,
        restX,
        ctx,
        FactionToColor(home.faction),
        () => {
          if (!home.alive) {
            ctx.fillStyle = TypeToColor("Land");
            ctx.fillRect(
              home.x * cellSizeX + smallDiffX * 2,
              home.y * cellSizeY + smallDiffY * 2,
              restX - smallDiffX * 2,
              restY - smallDiffY * 2
            );
          }
        }
      );
    });

    info.players.map((player) => {
      drawImage(
        "/Art/Player.png",
        player.x * cellSizeX + smallDiffX,
        player.y * cellSizeY + smallDiffY,
        restX,
        ctx,
        FactionToColor(player.faction),
        () => {
          drawImage(
            "/Art/Glasses.png",
            player.x * cellSizeX + smallDiffX,
            player.y * cellSizeY + smallDiffY,
            restX,
            ctx,
            "#000000"
          );
        }
      );
    });

    if (info.target.visible) {
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(
        (info.target.coord.x + 0.5) * cellSizeX,
        (info.target.coord.y + 0.5) * cellSizeY,
        restX / 2,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(
        (info.target.coord.x + 0.5) * cellSizeX,
        (info.target.coord.y + 0.5) * cellSizeY,
        restX / 3,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(
        (info.target.coord.x + 0.5) * cellSizeX,
        (info.target.coord.y + 0.5) * cellSizeY,
        restX / 4,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();
    }

    drawImage(
      "/Art/House.png",
      cellSizeX + smallDiffX,
      cellSizeX + smallDiffY,
      restX,
      ctx,
      "#ffff00"
    );
  }, [info]);

  const drawImage = (
    name: string,
    x: number,
    y: number,
    size: number,
    ctx: CanvasRenderingContext2D,
    color: string,
    callback?: () => void
  ) => {
    function hexToRgb(hex: string) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    }

    const img = new Image();
    img.src = name;

    img.onload = () => {
      ctx.drawImage(img, x, y, size, size);

      const data = ctx.getImageData(x, y, size, size, {
        colorSpace: "srgb",
      });
      for (var i = 0; i < data.data.length; i += 4) {
        if (
          data.data[i] === 255 &&
          data.data[i + 1] === 255 &&
          data.data[i + 2] === 255
        ) {
          const val = hexToRgb(color) || { b: 0, g: 0, r: 0 };
          data.data[i + 0] = val.r;
          data.data[i + 1] = val.g;
          data.data[i + 2] = val.b;
          data.data[i + 3] = 255;
        }
      }
      ctx.putImageData(data, x, y);

      if (callback) {
        callback();
      }
    };
  };

  return (
    <div className="h-full aspect-square bg-blue-200">
      <canvas
        style={{
          imageRendering: "pixelated",
        }}
        className="w-full"
        ref={canvasRef}
        width={1000}
        height={1000}
      />
    </div>
  );
}

export default MapVisualiser;
