import { useState, useEffect } from 'react';
import { Gauge, Navigation } from 'lucide-react';

interface TelemetryDisplayProps {
  currentSpeed: number;
  currentSteering: number;
  maxSpeed?: number;
  isConnected: boolean;
}

export const TelemetryDisplay = ({ 
  currentSpeed, 
  currentSteering, 
  maxSpeed = 5.0,
  isConnected 
}: TelemetryDisplayProps) => {
  const [displaySpeed, setDisplaySpeed] = useState(0);
  const [displaySteering, setDisplaySteering] = useState(0);

  // Smooth animation for values
  useEffect(() => {
    const speedAnimation = setInterval(() => {
      setDisplaySpeed(prev => {
        const diff = currentSpeed - prev;
        if (Math.abs(diff) < 0.01) return currentSpeed;
        return prev + diff * 0.1;
      });
    }, 16);

    return () => clearInterval(speedAnimation);
  }, [currentSpeed]);

  useEffect(() => {
    const steeringAnimation = setInterval(() => {
      setDisplaySteering(prev => {
        const diff = currentSteering - prev;
        if (Math.abs(diff) < 0.01) return currentSteering;
        return prev + diff * 0.1;
      });
    }, 16);

    return () => clearInterval(steeringAnimation);
  }, [currentSteering]);

  // Calculate gauge angles
  const speedAngle = (displaySpeed / maxSpeed) * 180 - 90; // -90 to 90 degrees
  const steeringAngle = displaySteering * 90; // -90 to 90 degrees

  const SpeedGauge = () => (
    <div className="relative">
      <div className="w-24 h-24 relative">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
            pathLength="180"
            strokeDasharray="180"
          />
          
          {/* Speed arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            pathLength="180"
            strokeDasharray={`${Math.abs(displaySpeed) / maxSpeed * 180} 180`}
            className="smooth-transition"
            style={{ 
              filter: isConnected && Math.abs(displaySpeed) > 0.1 ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : 'none' 
            }}
          />
        </svg>
        
        {/* Speed indicator needle */}
        <div 
          className="absolute top-1/2 left-1/2 w-px h-8 bg-primary origin-bottom smooth-transition"
          style={{ 
            transform: `translate(-50%, -100%) rotate(${speedAngle}deg)`,
            transformOrigin: 'bottom center'
          }}
        />
      </div>
      
      <div className="text-center mt-2">
        <div className="text-lg font-mono font-bold text-primary">
          {Math.abs(displaySpeed).toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground">m/s</div>
        <div className="text-xs text-muted-foreground">
          {displaySpeed > 0.1 ? 'FWD' : displaySpeed < -0.1 ? 'REV' : 'STOP'}
        </div>
      </div>
    </div>
  );

  const SteeringIndicator = () => (
    <div className="relative">
      <div className="w-20 h-16 relative">
        {/* Steering wheel background */}
        <svg className="w-full h-full" viewBox="0 0 80 64">
          <rect 
            x="10" 
            y="28" 
            width="60" 
            height="8" 
            rx="4" 
            fill="hsl(var(--muted))"
          />
          
          {/* Center indicator */}
          <circle 
            cx="40" 
            cy="32" 
            r="2" 
            fill="hsl(var(--muted-foreground))" 
          />
          
          {/* Steering indicator */}
          <rect 
            x="36" 
            y="20" 
            width="8" 
            height="24" 
            rx="4" 
            fill="hsl(var(--primary))"
            className="smooth-transition"
            style={{ 
              transformOrigin: '40px 32px',
              transform: `rotate(${steeringAngle}deg)`,
              filter: isConnected && Math.abs(displaySteering) > 0.1 ? 'drop-shadow(0 0 6px hsl(var(--primary)))' : 'none'
            }}
          />
        </svg>
      </div>
      
      <div className="text-center mt-2">
        <div className="text-lg font-mono font-bold text-primary">
          {(displaySteering * 90).toFixed(0)}°
        </div>
        <div className="text-xs text-muted-foreground">
          {Math.abs(displaySteering) > 0.1 
            ? displaySteering > 0 
              ? 'RIGHT' 
              : 'LEFT'
            : 'CENTER'
          }
        </div>
      </div>
    </div>
  );

 return (

  <div className="dashboard-panel w-[375px] flex flex-col items-center p-4">
    {/* Speed */}
    <div className="dashboard-panel w-full flex flex-col items-center p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Speed</span>
      </div>
      <SpeedGauge />
    </div>

    {/* Steering */}
    <div className="dashboard-panel w-full flex flex-col items-center p-4">
      <div className="flex items-center gap-2 mb-3">
        <Navigation className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Steering</span>
      </div>
      <SteeringIndicator />
    </div>
  </div>




);
};