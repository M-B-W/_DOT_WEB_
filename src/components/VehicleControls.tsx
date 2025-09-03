import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Square,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface VehicleControlsProps {
  onMove: (direction: string) => void;
  onStop: () => void;
  onEmergencyStop: () => void;
  onLift: () => void;
  onDown: () => void;
  isConnected: boolean;
}

export const VehicleControls = ({
  onMove,
  onStop,
  onEmergencyStop,
  onLift,
  onDown,
  isConnected,
}: VehicleControlsProps) => {
  const [activeControl, setActiveControl] = useState<string | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // 🔑 Compute direction from pressed keys
  const computeDirection = (keys: Set<string>): string | null => {
    const forward = keys.has("w") || keys.has("arrowup");
    const backward = keys.has("s") || keys.has("arrowdown");
    const left = keys.has("a") || keys.has("arrowleft");
    const right = keys.has("d") || keys.has("arrowright");

    if (forward && left) return "forward-left";
    if (forward && right) return "forward-right";
    if (backward && left) return "backward-left";
    if (backward && right) return "backward-right";
    if (forward) return "forward";
    if (backward) return "backward";
    if (left) return "left";
    if (right) return "right";
    return null;
  };

  // ✅ Handle direction changes
  const updateDirection = (keys: Set<string>) => {
    let direction = computeDirection(keys);

    if (keys.has(" ")) direction = "stop";
    if (keys.has("l")) direction = "lift";
    if (keys.has("k")) direction = "down";
    if (keys.has("e")) direction = "estop";

    if (direction) {
      setActiveControl(direction);
      if (direction === "stop") onStop();
      else if (direction === "estop") onEmergencyStop();
      else if (direction === "lift") onLift();
      else if (direction === "down") onDown();
      else onMove(direction);
    } else {
      setActiveControl(null);
      onStop();
    }
  };

  // ✅ Keyboard listener
  useEffect(() => {
    if (!isConnected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setPressedKeys((prev) => {
        const newKeys = new Set(prev);
        newKeys.add(key);
        updateDirection(newKeys);
        return newKeys;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setPressedKeys((prev) => {
        const newKeys = new Set(prev);
        newKeys.delete(key);
        updateDirection(newKeys);
        return newKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isConnected]);

  // ✅ GUI button handlers (behave like keyboard)
  const handleControlPress = (key: string) => {
    if (!isConnected) return;
    setPressedKeys((prev) => {
      const newKeys = new Set(prev);
      newKeys.add(key);
      updateDirection(newKeys);
      return newKeys;
    });
  };

  const handleControlRelease = (key: string) => {
    setPressedKeys((prev) => {
      const newKeys = new Set(prev);
      newKeys.delete(key);
      updateDirection(newKeys);
      return newKeys;
    });
  };

  // ✅ GUI control buttons mapping
  const controlButtons = [
    { direction: "forward", key: "w", icon: ArrowUp, position: "col-start-2 row-start-1", shortcut: "W" },
    { direction: "left", key: "a", icon: ArrowLeft, position: "col-start-1 row-start-2", shortcut: "A" },
    { direction: "right", key: "d", icon: ArrowRight, position: "col-start-3 row-start-2", shortcut: "D" },
    { direction: "backward", key: "s", icon: ArrowDown, position: "col-start-2 row-start-3", shortcut: "S" },
  ];

  return (
    <div className="dashboard-panel w-[340px] h-full flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Vehicle Controls
        </h3>
        <br />

        {/* Directional Control Grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-2 mb-6 max-w-48 mx-auto">
          {controlButtons.map(({ direction, key, icon: Icon, position, shortcut }) => (
            <Button
              key={direction}
              className={`
                ${position} h-12 w-16 text-xs font-mono
                ${activeControl?.includes(direction)
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-black text-white"}
                ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}
                smooth-transition
              `}
              disabled={!isConnected}
              onMouseDown={() => handleControlPress(key)}
              onMouseUp={() => handleControlRelease(key)}
              onMouseLeave={() => handleControlRelease(key)}
              onTouchStart={() => handleControlPress(key)}
              onTouchEnd={() => handleControlRelease(key)}
            >
              <div className="flex flex-col items-center gap-1">
                <Icon className="w-5 h-5" />
                <span className="text-xs opacity-70">{shortcut}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Stop + Emergency Stop */}
        <div className="flex gap-3 justify-center mb-6">
          <Button
            onClick={onStop}
            disabled={!isConnected}
            className={`
              px-6 py-3
              ${activeControl === "stop"
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-black text-white"}
              ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <Square className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="text-sm">Stop</div>
              <div className="text-xs opacity-70">Space</div>
            </div>
          </Button>

          <Button
            onClick={onEmergencyStop}
            disabled={!isConnected}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white smooth-transition"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="text-sm">E-Stop</div>
              <div className="text-xs opacity-70">E</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Dumper Lift / Down */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2 text-center">
          Dumper Lifting
        </h3>
        <div className="grid grid-cols-2 gap-20 justify-center max-w-48 mx-auto">
          <Button
            key="lift"
            className={`
              h-12 w-16 text-xs font-mono
              ${activeControl === "lift"
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-black text-white"}
              ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}
            `}
            disabled={!isConnected}
            onMouseDown={() => handleControlPress("l")}
            onMouseUp={() => handleControlRelease("l")}
            onMouseLeave={() => handleControlRelease("l")}
            onTouchStart={() => handleControlPress("l")}
            onTouchEnd={() => handleControlRelease("l")}
          >
            <div className="flex flex-col items-center gap-1">
              <ArrowUp className="w-4 h-4" />
              <span className="text-xs opacity-70">L</span>
            </div>
          </Button>

          <Button
            key="down"
            className={`
              h-12 w-16 text-xs font-mono
              ${activeControl === "down"
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-black text-white"}
              ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}
            `}
            disabled={!isConnected}
            onMouseDown={() => handleControlPress("k")}
            onMouseUp={() => handleControlRelease("k")}
            onMouseLeave={() => handleControlRelease("k")}
            onTouchStart={() => handleControlPress("k")}
            onTouchEnd={() => handleControlRelease("k")}
          >
            <div className="flex flex-col items-center gap-1">
              <ArrowDown className="w-4 h-4" />
              <span className="text-xs opacity-70">K</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Connection Warning */}
      {/* {!isConnected && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700 text-sm">
            <Zap className="w-4 h-4" />
            <span>Connect to ROS to enable controls</span>
          </div>
           
        </div>
         
      )} */}
    
    
    </div>
  );
};
