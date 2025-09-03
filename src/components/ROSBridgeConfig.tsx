import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw, Wifi, WifiOff } from "lucide-react";

interface Topic {
  name: string;
  messageType: string;
  status: "online" | "offline";
}

interface ROSBridgeConfigProps {
  isConnected: boolean;
  cmdVelTopic?: string;
  onTopicChange?: (topic: string) => void;
}

export const ROSBridgeConfig = ({
  isConnected,
  cmdVelTopic = "/ackerman_controller/reference",
  onTopicChange,
}: ROSBridgeConfigProps) => {
  const [localCmdVelTopic, setLocalCmdVelTopic] = useState(cmdVelTopic);
  const [odomTopic, setOdomTopic] = useState("/ackerman_controller/odometry");
  const [publishRate, setPublishRate] = useState(10);

  // ✅ your actual available topics from `ros2 topic list`
  const availableTopics = [
    "/ackerman_controller/controller_state",
    "/ackerman_controller/odometry",
    "/ackerman_controller/reference",
    "/ackerman_controller/tf_odometry",
    "/ackerman_controller/transition_event",
    "/client_count",
    "/clock",
    "/connected_clients",
    "/depth_camera/depth_camera/camera_info",
    "/depth_camera/depth_camera/depth/camera_info",
    "/depth_camera/depth_camera/depth/image_raw",
    "/depth_camera/depth_camera/depth/image_raw/compressed",
    "/depth_camera/depth_camera/depth/image_raw/compressedDepth",
    "/depth_camera/depth_camera/image_raw",
    "/depth_camera/depth_camera/image_raw/compressed",
    "/depth_camera/depth_camera/image_raw/compressedDepth",
    "/depth_camera/depth_camera/points",
    "/dumper_box_controller/commands",
    "/dumper_box_controller/transition_event",
    "/dynamic_joint_states",
    "/gps/fix",
    "/gps_controller/vel",
    "/imu",
    "/joint_state_broadcaster/transition_event",
    "/joint_states",
    "/parameter_events",
    "/performance_metrics",
    "/robot_description",
    "/rosout",
    "/scan",
    "/tf",
    "/tf_static",
  ];

  const [topics, setTopics] = useState<Topic[]>([]);

  // 🔄 Refresh and update status
  const refreshBridges = () => {
    const updatedTopics = availableTopics.map((topic): Topic => ({
      name: topic,
      messageType: guessMessageType(topic),
      status: isConnected ? "online" : "offline", // ✅ online if connected
    }));
    setTopics(updatedTopics);
  };

  // 🧠 Guess message type based on topic name (simple mapping)
  const guessMessageType = (topic: string): string => {
    if (topic.includes("odom")) return "nav_msgs/Odometry";
    if (topic.includes("scan")) return "sensor_msgs/LaserScan";
    if (topic.includes("image")) return "sensor_msgs/CompressedImage";
    if (topic.includes("camera_info")) return "sensor_msgs/CameraInfo";
    if (topic.includes("tf")) return "tf2_msgs/TFMessage";
    if (topic.includes("joint")) return "sensor_msgs/JointState";
    if (topic.includes("commands")) return "std_msgs/Float64MultiArray";
    return "std_msgs/String"; // fallback
  };

  useEffect(() => {
    refreshBridges();
  }, [isConnected]);

  const handleApplyChanges = () => {
    onTopicChange?.(localCmdVelTopic);
  };

  const getStatusIcon = (status: "online" | "offline") => {
    return status === "online" ? (
      <Wifi className="w-4 h-4 text-success" />
    ) : (
      <WifiOff className="w-4 h-4 text-muted-foreground" />
    );
  };

  const getStatusBadge = (status: "online" | "offline") => {
    return status === "online" ? (
      <Badge variant="default" className="bg-success/20 text-success border-success/30">
        Online
      </Badge>
    ) : (
      <Badge variant="outline" className="text-muted-foreground border-muted-foreground/30">
        Offline
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4" />
          ROS Bridge Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Topic Config */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-success">Topic Configuration</h4>

            <div className="space-y-2">
              <Label htmlFor="cmdVelTopic" className="text-xs">
                Command Velocity Topic
              </Label>
              <Input
                id="cmdVelTopic"
                value={localCmdVelTopic}
                onChange={(e) => setLocalCmdVelTopic(e.target.value)}
                placeholder="/ackerman_controller/reference"
                className="h-8 text-xs font-mono"
                disabled={isConnected}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="odomTopic" className="text-xs">
                Odometry Topic
              </Label>
              <Input
                id="odomTopic"
                value={odomTopic}
                onChange={(e) => setOdomTopic(e.target.value)}
                placeholder="/ackerman_controller/odometry"
                className="h-8 text-xs font-mono"
                disabled={isConnected}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishRate" className="text-xs">
                Publish Rate (Hz)
              </Label>
              <Input
                id="publishRate"
                type="number"
                value={publishRate}
                onChange={(e) => setPublishRate(Number(e.target.value))}
                min="1"
                max="100"
                className="h-8 text-xs"
                disabled={isConnected}
              />
            </div>

            <Button onClick={handleApplyChanges} size="sm" className="h-8" disabled={isConnected}>
              Apply Changes
            </Button>
          </div>

          {/* Active Bridges */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-success">Active Bridges</h4>
              <Button variant="ghost" size="sm" onClick={refreshBridges} className="h-6 px-2">
                <RefreshCw className="w-3 h-3" />
              </Button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto bg-muted/20 rounded-md p-3">
              {topics.length > 0 ? (
                topics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-foreground truncate">{topic.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {topic.messageType}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {getStatusIcon(topic.status)}
                      {getStatusBadge(topic.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground text-center">No topics available</div>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Showing {topics.filter((t) => t.status === "online").length} of {topics.length} bridges online
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
