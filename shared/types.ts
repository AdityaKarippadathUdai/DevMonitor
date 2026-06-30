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
  frequency: number;
  temperature: number | null;
  physicalCores: number;
  logicalCores: number;
  threads: number;
  loadAverage: number[];
  brand: string;
  processes: ProcessInfo[];
}

export interface MemoryMetrics {
  total: number;
  free: number;
  used: number;
  active: number;
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
  utilization: number;
  vramUsed: number;
  vramTotal: number;
  vramPercentage: number;
  temperature: number | null;
  fanSpeed: number | null;
  powerDraw: number | null;
  gpuClock: number | null;
  memoryClock: number | null;
}

export interface DiskInfo {
  name: string;
  type: string;
  size: number;
  used: number;
  available: number;
  usePercentage: number;
  readRate: number;
  writeRate: number;
}

export interface NetworkInterfaceInfo {
  name: string;
  ip4: string;
  rxRate: number;
  txRate: number;
}

export interface SystemSpecs {
  hostname: string;
  platform: string;
  distro: string;
  kernel: string;
  uptime: number;
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
