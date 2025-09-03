import {useState, useRef, useCallback, useEffect} from 'react';
import { Move } from 'lucide-react';

interface JoystickControlProps {
  onMove: (linear: number, angular: number) => void;
  isConnected: boolean;
}

export const JoystickControl = ({ onMove, isConnected }: JoystickControlProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current || !isConnected) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 20;

    const deltaX = clientX - rect.left - centerX;
    const deltaY = clientY - rect.top - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const constrainedDistance = Math.min(distance, maxRadius);
    const angle = Math.atan2(deltaY, deltaX);

    const constrainedX = constrainedDistance * Math.cos(angle);
    const constrainedY = constrainedDistance * Math.sin(angle);

    setPosition({ x: constrainedX, y: constrainedY });

    const linearX = -constrainedY / maxRadius;
    const angularZ = -constrainedX / maxRadius;

    onMove(linearX, angularZ);
  }, [onMove, isConnected]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!isConnected) return;
    setIsDragging(true);
    handleMove(clientX, clientY);
  }, [handleMove, isConnected]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onMove(0, 0);
  }, [onMove]);

  // Mouse & Touch Events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX, e.clientY);
    };
    const handleMouseUp = () => handleEnd();
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  const knobStyle = {
    transform: `translate(${position.x}px, ${position.y}px)`,
  };

  return (
    <div className="dashboard-panel w-[340px] h-full flex flex-col justify-between">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        Joystick Control

      </h3>
      <br></br>
      {/* Joystick + Instructions */}
      <div className="flex flex-col items-center gap-4 flex-grow">
        <div 
          ref={joystickRef}
          className={`
            relative w-60 h-60 rounded-full border-2 border-border/50
            bg-gradient-to-br from-muted/50 to-muted
            ${!isConnected ? 'opacity-50 cursor-not-allowed' : 'cursor-grab'}
            ${isDragging ? 'cursor-grabbing' : ''}
            select-none touch-none
          `}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        >
          {/* Crosshairs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-border/30"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-px bg-border/30"></div>
          </div>

          {/* Knob */}
          <div 
            className={`
              absolute top-1/2 left-1/2 w-8 h-8 -ml-4 -mt-4
              rounded-full border-2 smooth-transition
              ${isConnected 
                ? isDragging 
                  ? 'bg-primary border-primary control-active' 
                  : 'bg-accent border-border hover:bg-primary/20'
                : 'bg-muted border-muted-foreground/30'
              }
            `}
            style={knobStyle}
          >
            <Move className="w-4 h-4 m-1 opacity-70" />
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <div>Drag or touch to control vehicle</div>
          <div className="flex gap-4 justify-center">
            <span>↑↓ Forward/Reverse</span>
            <span>←→ Turn</span>
          </div>
        </div>
      </div>

      {/* ✅ Status Indicators pinned at bottom */}
      <div className="mt-4 flex gap-6 text-xs font-mono justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Linear</div>
          <div className={`${isDragging ? 'text-primary' : 'text-muted-foreground'}`}>
            {(-position.y / 80).toFixed(2)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Angular</div>
          <div className={`${isDragging ? 'text-primary' : 'text-muted-foreground'}`}>
            {(-position.x / 80).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
    
  );
};
