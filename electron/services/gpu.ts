import si from 'systeminformation';
import { GpuMetrics } from '../../src/types';

export async function getGpuMetrics(): Promise<GpuMetrics[]> {
  try {
    const graphics = await si.graphics();
    if (!graphics || !graphics.controllers || graphics.controllers.length === 0) {
      return [];
    }

    return graphics.controllers.map((gpu) => {
      // Normalize vendor name
      const vendorRaw = (gpu.vendor || '').toUpperCase();
      let vendor: GpuMetrics['vendor'] = 'Unknown';

      if (vendorRaw.includes('NVIDIA')) {
        vendor = 'NVIDIA';
      } else if (vendorRaw.includes('AMD') || vendorRaw.includes('ATI')) {
        vendor = 'AMD';
      } else if (vendorRaw.includes('INTEL')) {
        vendor = 'Intel';
      } else if (vendorRaw.includes('APPLE')) {
        vendor = 'Apple';
      }

      const vramTotalBytes = Number(gpu.vram || 0) * 1024 * 1024; // systeminformation vram is usually in MB
      const vramUsedBytes = Number(gpu.vramDynamic || gpu.memoryUsed || 0) * 1024 * 1024;
      const vramPercentage = vramTotalBytes > 0 ? (vramUsedBytes / vramTotalBytes) * 100 : 0;

      // Handle nulls and default conversions safely
      return {
        vendor,
        model: gpu.model || 'Unknown GPU',
        utilization: gpu.utilizationGpu !== undefined && gpu.utilizationGpu !== null ? gpu.utilizationGpu : 0,
        vramUsed: vramUsedBytes,
        vramTotal: vramTotalBytes,
        vramPercentage,
        temperature: gpu.temperatureGpu !== undefined && gpu.temperatureGpu !== null && gpu.temperatureGpu !== -1 ? gpu.temperatureGpu : null,
        fanSpeed: gpu.fanSpeed !== undefined && gpu.fanSpeed !== null && gpu.fanSpeed !== -1 ? gpu.fanSpeed : null,
        powerDraw: gpu.powerDraw !== undefined && gpu.powerDraw !== null && gpu.powerDraw !== -1 ? gpu.powerDraw : null,
        gpuClock: gpu.clockCore !== undefined && gpu.clockCore !== null && gpu.clockCore !== -1 ? gpu.clockCore : null,
        memoryClock: gpu.clockMemory !== undefined && gpu.clockMemory !== null && gpu.clockMemory !== -1 ? gpu.clockMemory : null,
      };
    });
  } catch (error) {
    console.error('Error fetching GPU metrics:', error);
    return [];
  }
}
