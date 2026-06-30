import si from 'systeminformation';
import { NetworkInterfaceInfo } from '../../src/types';

export async function getNetworkMetrics(): Promise<NetworkInterfaceInfo[]> {
  try {
    const [interfaces, stats] = await Promise.all([
      si.networkInterfaces(),
      si.networkStats(),
    ]);

    if (!interfaces || interfaces.length === 0) {
      return [];
    }

    // Filter interfaces to find active ones (non-virtual, non-loopback, having ip4)
    const activeInterfaces = interfaces.filter((iface) => {
      return !iface.virtual && iface.ip4 && iface.ip4 !== '127.0.0.1' && iface.ip4 !== '::1';
    });

    const targetInterfaces = activeInterfaces.length > 0 ? activeInterfaces : interfaces.slice(0, 3);

    return targetInterfaces.map((iface) => {
      // Find matching traffic statistics
      const ifaceStat = stats.find((s) => s.iface === iface.iface);
      
      const rxRate = ifaceStat ? ifaceStat.rx_sec || 0 : 0;
      const txRate = ifaceStat ? ifaceStat.tx_sec || 0 : 0;

      return {
        name: iface.ifaceName || iface.iface || 'Ethernet',
        ip4: iface.ip4 || 'No IP',
        rxRate,
        txRate,
      };
    });
  } catch (error) {
    console.error('Error fetching network metrics:', error);
    return [];
  }
}
