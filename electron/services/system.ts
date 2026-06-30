import si from 'systeminformation';
import { SystemSpecs, SystemAllMetrics } from '../../src/types';
import { getCpuMetrics, getCpuStaticInfo } from './cpu';
import { getMemoryMetrics } from './memory';
import { getGpuMetrics } from './gpu';
import { getDiskMetrics } from './disk';
import { getNetworkMetrics } from './network';

let cachedSpecs: SystemSpecs | null = null;

export async function getSystemSpecs(): Promise<SystemSpecs> {
  if (cachedSpecs) {
    try {
      // Keep uptime updated even for cached specs
      const timeInfo = si.time();
      cachedSpecs.uptime = timeInfo.uptime || 0;
      return cachedSpecs;
    } catch {
      return cachedSpecs;
    }
  }

  try {
    const [osInfo, system, timeInfo, cpuStatic, mem] = await Promise.all([
      si.osInfo(),
      si.system(),
      si.time(),
      getCpuStaticInfo(),
      si.mem(),
    ]);

    cachedSpecs = {
      hostname: osInfo.hostname || 'localhost',
      platform: osInfo.platform || process.platform,
      distro: osInfo.distro || 'Unknown OS',
      kernel: osInfo.kernel || 'Unknown Kernel',
      uptime: timeInfo.uptime || 0,
      arch: osInfo.arch || process.arch,
      cpuBrand: cpuStatic.brand,
      memTotal: mem.total || 0,
    };
  } catch (error) {
    console.error('Error fetching system specifications:', error);
    cachedSpecs = {
      hostname: 'localhost',
      platform: process.platform,
      distro: 'Unknown OS',
      kernel: 'Unknown Kernel',
      uptime: 0,
      arch: process.arch,
      cpuBrand: 'Unknown CPU',
      memTotal: 0,
    };
  }

  return cachedSpecs;
}

export async function getAllMetrics(): Promise<SystemAllMetrics> {
  const [cpu, memory, gpus, disks, network, system] = await Promise.all([
    getCpuMetrics(),
    getMemoryMetrics(),
    getGpuMetrics(),
    getDiskMetrics(),
    getNetworkMetrics(),
    getSystemSpecs(),
  ]);

  return {
    timestamp: Date.now(),
    cpu,
    memory,
    gpus,
    disks,
    network,
    system,
  };
}
