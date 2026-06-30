import si from 'systeminformation';
import os from 'os';
import { CpuMetrics, ProcessInfo } from '../../src/types';

let cachedStaticCpu: {
  brand: string;
  physicalCores: number;
  logicalCores: number;
} | null = null;

export async function getCpuStaticInfo() {
  if (cachedStaticCpu) return cachedStaticCpu;

  try {
    const cpuInfo = await si.cpu();
    cachedStaticCpu = {
      brand: `${cpuInfo.manufacturer} ${cpuInfo.brand}`,
      physicalCores: cpuInfo.physicalCores || 1,
      logicalCores: cpuInfo.cores || 1,
    };
  } catch (error) {
    console.error('Error fetching CPU static info:', error);
    cachedStaticCpu = {
      brand: 'Unknown CPU',
      physicalCores: 1,
      logicalCores: 1,
    };
  }
  return cachedStaticCpu;
}

export async function getCpuMetrics(): Promise<CpuMetrics> {
  const staticInfo = await getCpuStaticInfo();

  try {
    const [currentLoad, cpuSpeed, temp, processes] = await Promise.all([
      si.currentLoad(),
      si.cpuCurrentSpeed(),
      si.cpuTemperature(),
      si.processes(),
    ]);

    // Format top 10 processes by CPU usage
    const topProcesses: ProcessInfo[] = (processes.list || [])
      .sort((a, b) => b.cpu - a.cpu)
      .slice(0, 10)
      .map((proc) => ({
        pid: proc.pid,
        name: proc.name,
        cpu: proc.cpu,
        mem: proc.mem,
        memBytes: proc.memVsz ? proc.memVsz * 1024 : 0, // VsZ or RSS in systeminformation
        user: proc.user || 'system',
      }));

    // Handle per-core utilization safely
    const coreLoads = (currentLoad.cpus || []).map((core) => core.load);

    return {
      usage: currentLoad.currentLoad,
      cores: coreLoads.length > 0 ? coreLoads : [currentLoad.currentLoad],
      frequency: cpuSpeed.avg || 0,
      temperature: temp.main !== -1 && temp.main !== null ? temp.main : null,
      physicalCores: staticInfo.physicalCores,
      logicalCores: staticInfo.logicalCores,
      threads: staticInfo.logicalCores, // Usually threads equals logical cores
      loadAverage: os.loadavg() || [0, 0, 0],
      brand: staticInfo.brand,
      processes: topProcesses,
    };
  } catch (error) {
    console.error('Error fetching CPU metrics:', error);
    return {
      usage: 0,
      cores: Array(staticInfo.logicalCores).fill(0),
      frequency: 0,
      temperature: null,
      physicalCores: staticInfo.physicalCores,
      logicalCores: staticInfo.logicalCores,
      threads: staticInfo.logicalCores,
      loadAverage: [0, 0, 0],
      brand: staticInfo.brand,
      processes: [],
    };
  }
}
