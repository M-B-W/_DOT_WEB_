// types/roslib.d.ts
declare module "roslib" {
  export interface ROSOptions {
    url?: string;
  }

  export interface TopicOptions {
    ros: Ros;
    name: string;
    messageType: string;
  }

  export interface Message {
    [key: string]: any;
  }

  export class Ros {
    constructor(options?: ROSOptions);
    connect(url: string): void;
    on(event: string, callback: (data?: any) => void): void;
    close(): void;
  }

  export class Topic {
    constructor(options: TopicOptions);
    publish(message: Message): void;
    subscribe(callback: (message: Message) => void): void;
    unsubscribe(): void;
  }
}
