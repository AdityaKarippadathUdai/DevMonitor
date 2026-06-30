import si from 'systeminformation';
import { GpuMetrics } from '../../src/types';

export async function getGpuMetrics(): Promise<GpuMetrics[]> {
  try {
    const graphics = await si.graphics();
    if (!graphics || !graphics.controllers || graphics.controllers.length === 0) {
      return [];
    }

    const gpus = graphics.controllers.map((gpu) => {
      // Normalize vendor name
      const vendorRaw = (gpu.vendor || '').toUpperCase();
      const modelRaw = (gpu.model || '').toUpperCase();
      let vendor: GpuMetrics['vendor'] = 'Unknown';

      if (
        vendorRaw.includes('NVIDIA') ||
        modelRaw.includes('NVIDIA') ||
        modelRaw.includes('GEFORCE') ||
        modelRaw.includes('RTX') ||
        modelRaw.includes('GTX')
      ) {
        vendor = 'NVIDIA';
      } else if (
        vendorRaw.includes('AMD') ||
        vendorRaw.includes('ATI') ||
        modelRaw.includes('AMD') ||
        modelRaw.includes('RADEON')
      ) {
        vendor = 'AMD';
      } else if (
        vendorRaw.includes('INTEL') ||
        modelRaw.includes('INTEL') ||
        modelRaw.includes('IRIS') ||
        modelRaw.includes('XE GRAPHICS') ||
        modelRaw.includes('UHD')
      ) {
        vendor = 'Intel';
      } else if (vendorRaw.includes('APPLE') || modelRaw.includes('APPLE')) {
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

    // Sort GPUs so that high-performance discrete GPUs are listed first (index 0)
    gpus.sort((a, b) => {
      const getRank = (g: GpuMetrics) => {
        let score = 0;
        const model = (g.model || '').toUpperCase();
        if (g.vendor === 'NVIDIA') {
          score += 100;
        } else if (g.vendor === 'AMD') {
          if (model.includes('RX') || model.includes('PRO') || model.includes('XT') || model.includes('NAVY')) {
            score += 80; // Discrete AMD
          } else {
            score += 30; // Integrated AMD Radeon
          }
        } else if (g.vendor === 'Intel') {
          if (model.includes('ARC')) {
            score += 70; // Discrete Intel Arc
          } else {
            score += 20; // Integrated Intel UHD/Iris Xe
          }
        } else if (g.vendor === 'Apple') {
          score += 50;
        }
        return score;
      };

      return getRank(b) - getRank(a);
    });

    return gpus;
  } catch (error) {
    console.error('Error fetching GPU metrics:', error);
    return [];
  }
}
