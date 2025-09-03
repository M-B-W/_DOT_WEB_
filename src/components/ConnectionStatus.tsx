import { Wifi, WifiOff, AlertTriangle, Clock, MessageCircle, Gauge, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  url: string;
  messagesSent: number;
  lastMessageTime: number;
}

export const ConnectionStatus = ({ 
  isConnected, 
  error, 
  url,
  messagesSent,
  lastMessageTime
}: ConnectionStatusProps) => {
  const [uptime, setUptime] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // ✅ Connection info
  const getStatusInfo = () => {
    if (error) {
      return {
        icon: AlertTriangle,
        text: 'Error',
        className: 'bg-destructive/10 text-destructive border-destructive/30 glow-emergency',
        details: error
      };
    }
    if (isConnected) {
      return {
        icon: Wifi,
        text: 'Connected',
        className: 'status-connected glow-success',
        details: `Connected to ${url}`
      };
    }
    return {
      icon: WifiOff,
      text: 'Disconnected',
      className: 'status-disconnected',
      details: 'Attempting to connect...'
    };
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  // ✅ Helpers for SystemStatus
  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getLastMessageStatus = () => {
    if (!lastMessageTime) return 'No messages sent';
    const timeDiff = Date.now() - lastMessageTime;
    if (timeDiff < 1000) return 'Just now';
    if (timeDiff < 60000) return `${Math.floor(timeDiff / 1000)}s ago`;
    return `${Math.floor(timeDiff / 60000)}m ago`;
  };

  const getVehicleMode = () => {
    if (!isConnected) return 'Offline';
    if (lastMessageTime && Date.now() - lastMessageTime < 5000) return 'Active';
    return 'Standby';
  };

  const statusItems = [
    {
      icon: Zap,
      label: 'Connection',
      value: isConnected ? 'Online' : 'Offline',
      className: isConnected ? 'text-success' : 'text-destructive'
    },
    {
      icon: Gauge,
      label: 'Vehicle Mode',
      value: getVehicleMode(),
      className: getVehicleMode() === 'Active' ? 'text-primary' : 'text-muted-foreground'
    },
    {
      icon: Clock,
      label: 'Uptime',
      value: formatUptime(uptime),
      className: 'text-muted-foreground'
    },
    // {
    //   icon: MessageCircle,
    //   label: 'Messages Sent',
    //   value: messagesSent.toString(),
    //   className: messagesSent > 0 ? 'text-primary' : 'text-muted-foreground'
    // }
  ];

  return (
    <div className="dashboard-panel w-[375px] items-center">
      {/* ✅ Connection Section */}
      <div className="flex items-center justify-between mb-3 ">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          ROS Connection
        </h3>
        <Badge className={`${status.className} smooth-transition`}>
          <Icon className="w-3 h-3 mr-1" />
          {status.text}
        </Badge>
      </div>
      
      <div className="space-y-2 mb-6">
        <div className="text-xs text-muted-foreground">
          <span className="block">Endpoint: {url}</span>
          <span className="block mt-1">{status.details}</span>
        </div>
        
        {isConnected && (
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-success">Active Connection</span>
          </div>
        )}
      </div>
      <br />
      {/* ✅ System Status Section (below connection) */}
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
        System Status
      </h3>
      
      <div className="space-y-3">
        {statusItems.map(({ icon: StatusIcon, label, value, className }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <StatusIcon className="w-4 h-4" />
              <span>{label}</span>
            </div>
            <span className={`text-sm font-mono ${className}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {lastMessageTime > 0 && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Last Message</span>
            <span className="text-primary font-mono">{getLastMessageStatus()}</span>
          </div>
        </div>
      )}
    </div>
  );
};
