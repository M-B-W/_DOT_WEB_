// src/components/CameraFeed.tsx
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CameraFeedProps {
  ros: any;
  topic: string;
  title?: string;
  subscribeToImage?: (topic: string, callback: (msg: any) => void) => any;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  ros,
  topic,
  title = "Camera Feed",
  subscribeToImage,
}) => {
  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    if (!ros || !subscribeToImage) return;

    const subscription = subscribeToImage(topic, (msg: any) => {
      // ✅ Directly render JPEG/PNG from ROS2
      setImgSrc(`data:image/jpeg;base64,${msg.data}`);
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
        console.log(`🛑 Unsubscribed from ${topic}`);
      }
    };
  }, [ros, topic, subscribeToImage]);

  return (
    <Card className="w-[600px] h-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center w-full h-full bg-black">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt="camera"
            className="max-h-[600px] w-auto object-contain"  
            
            // ✅ keeps original aspect ratio
          />
        ) : (
          <p className="text-muted-foreground">Waiting for image...</p>
        )}
      </CardContent>
    </Card>


  );
};
