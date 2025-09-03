import React, { useState, useCallback } from 'react';
import { useROS } from '@/hooks/useROS';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { VehicleControls } from '@/components/VehicleControls';
import { JoystickControl } from '@/components/JoystickControl';
import { TelemetryDisplay } from '@/components/TelemetryDisplay';
import { SystemLogs } from '@/components/SystemLogs';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  const [rosUrl, setRosUrl] = useState('ws://localhost:9090');
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentSteering, setCurrentSteering] = useState(0);
  const [dumpPos, setDumpPos] = useState(0.0);
  const [controlMode, setControlMode] = useState<"vehicle" | "joystick">("vehicle");

  const {
    connection,
    connect,
    disconnect,
    publishTwist,
    publishDumperBox,
    ros,
    subscribeToImage,
  } = useROS(rosUrl);

  // ✅ Dumper command
  const sendDumpCommand = useCallback((pos: number) => {
    publishDumperBox([pos]);
  }, [publishDumperBox]);

  // ✅ Movement control
  const handleMove = useCallback((direction: string) => {
    let linear = 0;
    let angular = 0;
    const moveSpeed = 1.0;
    const turnSpeed = 1.0;

    switch (direction) {
      case "forward": linear = moveSpeed; break;
      case "backward": linear = -moveSpeed; break;
      case "left": angular = turnSpeed; break;
      case "right": angular = -turnSpeed; break;
      case "forward-left": linear = moveSpeed; angular = turnSpeed; break;
      case "forward-right": linear = moveSpeed; angular = -turnSpeed; break;
      case "backward-left": linear = -moveSpeed; angular = turnSpeed; break;
      case "backward-right": linear = -moveSpeed; angular = -turnSpeed; break;
    }

    const twist = { linear: { x: linear, y: 0, z: 0 }, angular: { x: 0, y: 0, z: angular } };
    publishTwist(twist);
    setCurrentSpeed(linear);
    setCurrentSteering(angular);
  }, [publishTwist]);

  // ✅ Dumper Lift / Down
  const handleLift = useCallback(() => {
    setDumpPos(prev => {
      const newPos = Math.min(prev + 0.0001, -0.785);
      sendDumpCommand(newPos);
      return newPos;
    });
  }, [sendDumpCommand]);

  const handleDown = useCallback(() => {
    setDumpPos(prev => {
      const newPos = Math.max(prev - 0.0001, 0.0);
      sendDumpCommand(newPos);
      return newPos;
    });
  }, [sendDumpCommand]);

  // ✅ Joystick control
  const handleJoystickMove = useCallback((linear: number, angular: number) => {
    const maxLinear = 2.0;
    const maxAngular = 2.0;
    const scaledLinear = linear * maxLinear;
    const scaledAngular = angular * maxAngular;

    const twist = { linear: { x: scaledLinear, y: 0, z: 0 }, angular: { x: 0, y: 0, z: scaledAngular } };
    publishTwist(twist);
    setCurrentSpeed(scaledLinear);
    setCurrentSteering(scaledAngular);
  }, [publishTwist]);

  // ✅ Stop
  const handleStop = useCallback(() => {
    const twist = { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } };
    publishTwist(twist);
    setCurrentSpeed(0);
    setCurrentSteering(0);
  }, [publishTwist]);

  const handleEmergencyStop = useCallback(() => handleStop(), [handleStop]);

  // ✅ Keyboard controls
  useKeyboardControls({
    onMove: handleMove,
    onStop: handleStop,
    onEmergencyStop: handleEmergencyStop,
    isConnected: connection.isConnected
  });

  const handleUrlChange = (newUrl: string) => setRosUrl(newUrl);
  const rtspIp = `192.168.1.238:8889`;
  // ✅ Camera feeds config
  const cameraFeeds = [
    { url: `http://${rtspIp}/front_cam`, title: "Front Camera" },
    { url: `http://${rtspIp}/back_cam`, title: "Rear Camera" },
    { url: `http://${rtspIp}/left_cam`, title: "Left Camera" },
    { url: `http://${rtspIp}/right_cam`, title: "Right Camera" },
  ];

  return (
    <>
      <div className="min-h-screen p-4 bg-dashboard-bg relative">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 border border-primary/90">
                <img src="/images/dot.png" alt="Dotworld Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground leading-tight">
                  Dotworld Technologies Private Limited
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Dumper Simulation Control Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ws://localhost:9090"
                value={rosUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full sm:w-48 h-8 text-xs font-mono"
              />
              <Button
                onClick={connection.isConnected ? disconnect : connect}
                size="sm"
                variant={connection.isConnected ? "destructive" : "default"}
                className="h-8 px-3"
              >
                {connection.isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <ConnectionStatus 
              isConnected={connection.isConnected} 
              error={connection.error} 
              url={rosUrl}
              messagesSent={connection.messagesSent}
              lastMessageTime={connection.lastMessageTime}
            />

            <TelemetryDisplay 
              currentSpeed={currentSpeed} 
              currentSteering={currentSteering} 
              isConnected={connection.isConnected} 
            />
          </div>

          {/* Center Column: Controls + Dashboard Cam */}
          <div className="flex flex-col items-center justify-start h-full gap-6">
            {/* Controls */}
            <div className="w-full max-w-[340px] h-[500px] flex flex-col">
              {/* Toggle Buttons */}
              <div className="flex gap-2 mb-4 justify-center">
                <Button
                  variant={controlMode === "vehicle" ? "default" : "outline"}
                  onClick={() => setControlMode("vehicle")}
                  size="sm"
                >
                  Vehicle Controls
                </Button>
                <Button
                  variant={controlMode === "joystick" ? "default" : "outline"}
                  onClick={() => setControlMode("joystick")}
                  size="sm"
                >
                  Joystick Control
                </Button>
              </div>

              {controlMode === "vehicle" ? (
                <VehicleControls
                  onMove={handleMove}
                  onStop={handleStop}
                  onEmergencyStop={handleEmergencyStop}
                  onLift={handleLift}
                  onDown={handleDown}
                  isConnected={connection.isConnected}
                />
              ) : (
                <JoystickControl
                  onMove={handleJoystickMove}
                  isConnected={connection.isConnected}
                />
              )}
            </div>

            {/* ✅ Dashboard Camera just below controls */}
            <div className="w-full max-w-[340px] bg-black rounded-xl overflow-hidden shadow-lg h-[250px]">
              <div className="p-2 bg-gray-800 text-white text-sm font-medium">
                Dashboard Camera
              </div>
              <iframe
                src={`http://${rtspIp}/dash_cam`}
                title="Dashboard Camera"
                className="w-full h-full object-contain"
                allowFullScreen
              />
            </div>
          </div>

          {/* Right Column: Camera feeds preview (2x2 grid) */}
          <div className="xl:col-span-2">
            <div className="grid grid-cols-2 gap-4 h-full">
              {cameraFeeds.map((camera, index) => (
                <div key={index} className="bg-black rounded-xl overflow-hidden shadow-lg">
                  <div className="p-2 bg-gray-800 text-white text-sm font-medium">
                    {camera.title}
                  </div>
                  <iframe
                    src={camera.url}
                    title={camera.title}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Logs */}
          <div className="xl:col-span-4">
            <SystemLogs 
              isConnected={connection.isConnected} 
              connectionError={connection.error} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;
