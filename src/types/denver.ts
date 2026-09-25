export interface SystemTelemetry {
  cpu: number;
  memory: {
    usedGB: number;
    totalGB: number;
    percentage: number;
  };
  gpu: number;
  network: {
    downloadMbps: number;
    uploadMbps: number;
  };
  os: string;
  activeProfile: string;
}

export interface ConnectionStatus {
  aiModel: 'online' | 'connecting' | 'offline';
  desktopAgent: 'connected' | 'connecting' | 'offline' | 'emulated';
  microphone: 'active' | 'listening' | 'muted' | 'unsupported';
}

export interface ActionCard {
  type: 'launch_app' | 'file_create' | 'file_read' | 'file_search' | 'schedule_task' | 'system_control' | 'vision_scan' | 'general';
  target: string;
  details: string;
  payload?: any;
  status?: 'success' | 'executing' | 'error';
  timestamp?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'denver';
  text: string;
  timestamp: string;
  actionCard?: ActionCard;
  isInitialWelcome?: boolean;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  path: string;
  extension: string;
  size: string;
  content: string;
  updatedAt: string;
  isRealLocal?: boolean;
}

export interface ScheduledTask {
  id: string;
  title: string;
  dueTime: number; // timestamp
  dueString: string;
  completed: boolean;
  recurring?: 'daily' | 'hourly' | 'none';
  voiceNotified?: boolean;
}

export interface WindowsAppItem {
  id: string;
  name: string;
  iconName: string;
  command: string;
  category: 'productivity' | 'system' | 'media' | 'development';
  isRunning: boolean;
  description: string;
}

export interface VaultSecret {
  id: string;
  label: string;
  category: 'api_key' | 'password' | 'credential' | 'note';
  cipherText: string;
  iv: string;
  plainPreview?: string;
  updatedAt: string;
}
