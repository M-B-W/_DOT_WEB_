import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Terminal } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface SystemLogsProps {
  isConnected: boolean;
  connectionError?: string | null;
}

export const SystemLogs = ({ isConnected, connectionError }: SystemLogsProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message,
      type
    };
    
    setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100 logs
  }, []);

  // Monitor connection status changes
  useEffect(() => {
    if (isConnected) {
      addLog('Successfully connected to ROS bridge', 'success');
    } else if (connectionError) {
      addLog(`Connection error: ${connectionError}`, 'error');
    }
  }, [isConnected, connectionError, addLog]);

  // Initialize logs
  useEffect(() => {
    addLog('ROS2 Bridge Control Center initialized', 'success');
    addLog('Ready to connect to ROS bridge', 'info');
  }, [addLog]);

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared', 'info');
  };

  const getLogTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-destructive';
      case 'info':
      default: return 'text-info';
    }
  };

  return (

      <div className="grid grid-cols-1 gap-4">
        <br />
        <Card className="h-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5">
          <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          System Logs
          </CardTitle>
          <Button
          variant="outline"
          size="sm"
          onClick={clearLogs}
          className="h-8 px-2"
          >
          <Trash2 className="w-3 h-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto bg-muted/20 rounded-md p-3 font-mono text-xs space-y-1">
          {logs.map((log) => (
            <div key={log.id} className={`${getLogTypeColor(log.type)} leading-relaxed`}>
            <span className="text-muted-foreground">
              [{log.timestamp.toLocaleTimeString()}]
            </span>{' '}
            {log.message}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-muted-foreground text-center py-8">
            No logs available
            </div>
          )}
          </div>
        </CardContent>
        </Card>
      </div>
    
  );
};