import si from 'systeminformation';
import { MemoryMetrics } from '../../src/types';

export async function getMemoryMetrics(): Promise<MemoryMetrics> {
  try {
    const mem = await si.mem();
    
    const total = mem.total || 0;
    const free = mem.free || 0;
    const used = mem.used || 0;
    const available = mem.available || 0;
    const cached = mem.cached || 0;
    const buffers = mem.buffers || 0;
    const swapTotal = mem.swaptotal || 0;
    const swapUsed = mem.swapused || 0;

    // Calculate percentage (used vs total)
    const percentage = total > 0 ? (used / total) * 100 : 0;

    return {
      total,
      free,
      used,
      available,
      cached,
      buffers,
      swapUsed,
      swapTotal,
      percentage,
    };
  } catch (error) {
    console.error('Error fetching memory metrics:', error);
    return {
      total: 0,
      free: 0,
      used: 0,
      available: 0,
      cached: 0,
      buffers: 0,
      swapUsed: 0,
      swapTotal: 0,
      percentage: 0,
    };
  }
}
