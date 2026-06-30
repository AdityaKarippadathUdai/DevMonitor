import si from 'systeminformation';
import type { DiskInfo } from '../../shared/types.js';

export async function getDiskMetrics(): Promise<DiskInfo[]> {
  try {
    const [fsSizes, diskIO] = await Promise.all([
      si.fsSize(),
      si.disksIO(),
    ]);

    // Read and Write rates (bytes per second)
    const readRate = diskIO.rIO_sec || 0;
    const writeRate = diskIO.wIO_sec || 0;

    // Filter to only physical disks or logical partitions with valid sizes
    // We filter out pseudo filesystems like tempfs / sysfs on Linux
    const validDrives = fsSizes.filter((fs) => {
      const typeLower = (fs.type || '').toLowerCase();
      const fsLower = (fs.fs || '').toLowerCase();
      
      // Avoid docker layers or virtual loop devices
      if (fsLower.includes('overlay') || fsLower.includes('loop') || fsLower.includes('tmpfs') || fsLower.includes('shm')) {
        return false;
      }
      
      return fs.size > 0 && !typeLower.includes('devtmpfs') && !typeLower.includes('squashfs');
    });

    if (validDrives.length === 0 && fsSizes.length > 0) {
      // Fallback to first filesystem if all filtered out
      validDrives.push(fsSizes[0]);
    }

    return validDrives.map((drive) => {
      const size = drive.size || 0;
      const used = drive.used || 0;
      const available = drive.available || 0;
      const usePercentage = drive.use || (size > 0 ? (used / size) * 100 : 0);

      return {
        name: drive.mount || drive.fs || 'Primary Storage',
        type: drive.type || 'SSD',
        size,
        used,
        available,
        usePercentage,
        readRate: readRate / (validDrives.length || 1), // Apportion read speed among active drives
        writeRate: writeRate / (validDrives.length || 1), // Apportion write speed among active drives
      };
    });
  } catch (error) {
    console.error('Error fetching disk metrics:', error);
    return [];
  }
}
