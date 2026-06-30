/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useMetricsStore } from './store/useMetricsStore';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { CPU } from './pages/CPU';
import { Memory } from './pages/Memory';
import { GPU } from './pages/GPU';
import { Disk } from './pages/Disk';
import { Network } from './pages/Network';
import { Processes } from './pages/Processes';

export default function App() {
  const { activeTab, startListening } = useMetricsStore();

  // Initialize the real-time background push updates
  useEffect(() => {
    const unsubscribe = startListening();
    return () => {
      unsubscribe();
    };
  }, [startListening]);

  // Tab switcher router
  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'cpu':
        return <CPU />;
      case 'memory':
        return <Memory />;
      case 'gpu':
        return <GPU />;
      case 'disk':
        return <Disk />;
      case 'network':
        return <Network />;
      case 'processes':
        return <Processes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout>
      {renderActivePage()}
    </AppLayout>
  );
}

