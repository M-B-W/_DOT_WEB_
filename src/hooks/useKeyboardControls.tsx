import { useEffect, useCallback } from 'react';

interface KeyboardControlsProps {
  onMove: (direction: string) => void;
  onStop: () => void;
  onEmergencyStop: () => void;
  isConnected: boolean;
}

export const useKeyboardControls = ({ 
  onMove, 
  onStop, 
  onEmergencyStop, 
  isConnected 
}: KeyboardControlsProps) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isConnected) return;
    
    // Prevent default behavior for our control keys
    const controlKeys = ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'e'];
    if (controlKeys.includes(event.key.toLowerCase())) {
      event.preventDefault();
    }

    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        onMove('forward');
        break;
      case 's':
      case 'arrowdown':
        onMove('backward');
        break;
      case 'a':
      case 'arrowleft':
        onMove('left');
        break;
      case 'd':
      case 'arrowright':
        onMove('right');
        break;
      case ' ': // Spacebar
        onStop();
        break;
      case 'e':
        onEmergencyStop();
        break;
    }
  }, [onMove, onStop, onEmergencyStop, isConnected]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!isConnected) return;
    
    // Stop movement when key is released (except for stop and emergency stop)
    const movementKeys = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];
    if (movementKeys.includes(event.key.toLowerCase())) {
      event.preventDefault();
      onStop();
    }
  }, [onStop, isConnected]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return null; // This hook doesn't render anything
};