// src/hooks/useROS.tsx
import { useState, useEffect, useCallback, useRef } from "react";

interface ROSConnection {
  isConnected: boolean;
  error: string | null;
  ros: any | null;
  lastMessageTime: number;
  messagesSent: number;
}

interface TwistMessage {
  linear: { x: number; y: number; z: number };
  angular: { x: number; y: number; z: number };
}

export const useROS = (
  url: string = "ws://localhost:9090",
  options?: { autoConnect?: boolean }
) => {
  const autoConnect = options?.autoConnect ?? false;
  const [connection, setConnection] = useState<ROSConnection>({
    isConnected: false,
    error: null,
    ros: null,
    lastMessageTime: 0,
    messagesSent: 0,
  });

  const rosRef = useRef<any>(null);
  const roslibRef = useRef<any>(null);
  const cmdVelPublisherRef = useRef<any>(null);
  const dumperBoxPublisherRef = useRef<any>(null);

  // 🔌 Connect to ROSBridge
  const connect = useCallback(async () => {
    try {
      const ROSLIB = (await import("roslib")).default ?? (await import("roslib"));
      roslibRef.current = ROSLIB;

      if (rosRef.current) {
        try {
          rosRef.current.close();
        } catch {}
        rosRef.current = null;
      }

      const ros = new ROSLIB.Ros({ url });
      rosRef.current = ros;

      ros.on("connection", () => {
        console.log("✅ Connected to ROS WebSocket server");

        cmdVelPublisherRef.current = new ROSLIB.Topic({
          ros,
          name: "/ackerman_controller/reference",
          messageType: "geometry_msgs/TwistStamped",
        });

        dumperBoxPublisherRef.current = new ROSLIB.Topic({
          ros,
          name: "/dumper_box_controller/commands",
          messageType: "std_msgs/Float64MultiArray",
        });

        setConnection((prev) => ({
          ...prev,
          isConnected: true,
          error: null,
          ros,
          lastMessageTime: Date.now(),
        }));
      });

      ros.on("error", (error: any) => {
        console.error("❌ ROSBridge Error:", error);
        setConnection((prev) => ({
          ...prev,
          isConnected: false,
          error: error.message || "ROSBridge connection error",
          ros: null,
        }));
      });

      ros.on("close", () => {
        console.warn("⚠️ ROSBridge connection closed");
        setConnection((prev) => ({ ...prev, isConnected: false, ros: null }));
      });
    } catch (error) {
      console.error("Failed to connect:", error);
      setConnection((prev) => ({
        ...prev,
        isConnected: false,
        error: "Failed to connect",
        ros: null,
      }));
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (rosRef.current) {
      try {
        rosRef.current.close();
      } catch {}
      rosRef.current = null;
    }
    setConnection((prev) => ({ ...prev, isConnected: false, ros: null }));
  }, []);

  // 📡 Publishers
  const publishTwist = useCallback(
    (twist: TwistMessage) => {
      if (!cmdVelPublisherRef.current || !connection.isConnected) return;
      cmdVelPublisherRef.current.publish({
        header: {
          stamp: {
            sec: Math.floor(Date.now() / 1000),
            nanosec: (Date.now() % 1000) * 1e6,
          },
          frame_id: "base_link",
        },
        twist,
      });
    },
    [connection.isConnected]
  );

  const publishDumperBox = useCallback(
    (values: number[]) => {
      if (!dumperBoxPublisherRef.current || !connection.isConnected) return;
      dumperBoxPublisherRef.current.publish({
        layout: { dim: [], data_offset: 0 },
        data: values,
      });
    },
    [connection.isConnected]
  );

  // 📷 Subscribe to CompressedImage
  const subscribeToImage = useCallback(
    (topic: string, callback: (msg: { data: string }) => void) => {
      if (!rosRef.current || !roslibRef.current || !connection.isConnected)
        return null;

      const TopicClass = roslibRef.current.Topic;
      const imageTopic = new TopicClass({
        ros: rosRef.current,
        name: topic,
        messageType: "sensor_msgs/CompressedImage",
        throttle_rate: 66, // ~15 fps
      });

      imageTopic.subscribe(callback);
      console.log(`📡 Subscribed to ${topic}`);
      return imageTopic;
    },
    [connection.isConnected]
  );

  useEffect(() => {
    if (autoConnect) connect();
    return () => disconnect();
  }, [autoConnect, connect, disconnect]);

  return {
    connection,
    connect,
    disconnect,
    publishTwist,
    publishDumperBox,
    ros: rosRef.current,
    subscribeToImage,
  };
};
