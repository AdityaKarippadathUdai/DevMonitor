export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  mem: number;
  memBytes: number;
  user: string;
}

export interface CpuMetrics {
  usage: number;
  cores: number[];
  frequency: number; // in GHz
  temperature: number | null; // in °C
  physicalCores: number;
  logicalCores: number;
  threads: number;
  loadAverage: number[];
  brand: string;
  processes: ProcessInfo[];
}

export interface MemoryMetrics {
  total: number; // in bytes
  free: number;
  used: number;
  active: number; // in bytes
  available: number;
  cached: number;
  buffers: number;
  swapUsed: number;
  swapTotal: number;
  percentage: number;
}

export interface GpuMetrics {
  vendor: 'NVIDIA' | 'AMD' | 'Intel' | 'Apple' | 'Unknown';
  model: string;
  utilization: number; // overall %
  vramUsed: number; // in bytes
  vramTotal: number; // in bytes
  vramPercentage: number;
  temperature: number | null; // in °C
  fanSpeed: number | null; // in %
  powerDraw: number | null; // in Watts
  gpuClock: number | null; // in MHz
  memoryClock: number | null; // in MHz
}

export interface DiskInfo {
  name: string;
  type: string;
  size: number; // in bytes
  used: number;
  available: number;
  usePercentage: number;
  readRate: number; // in bytes/sec
  writeRate: number; // in bytes/sec
}

export interface NetworkInterfaceInfo {
  name: string;
  ip4: string;
  rxRate: number; // bytes/sec download
  txRate: number; // bytes/sec upload
}

export interface SystemSpecs {
  hostname: string;
  platform: string; // win32, linux, darwin
  distro: string; // Ubuntu, Windows 11, etc.
  kernel: string;
  uptime: number; // in seconds
  arch: string;
  cpuBrand: string;
  memTotal: number;
}

export interface SystemAllMetrics {
  timestamp: number;
  cpu: CpuMetrics;
  memory: MemoryMetrics;
  gpus: GpuMetrics[];
  disks: DiskInfo[];
  network: NetworkInterfaceInfo[];
  system: SystemSpecs;
}

export interface ElectronAPI {
  getSystemMetrics: () => Promise<SystemAllMetrics>;
  getSystemSpecs: () => Promise<SystemSpecs>;
  onMetricsUpdate: (callback: (metrics: SystemAllMetrics) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
