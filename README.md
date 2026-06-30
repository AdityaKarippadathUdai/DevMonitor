# 📊 Cross-Platform Desktop Resource Monitor

A modern, high-fidelity, and lightweight system resource monitor modeled after the Windows Task Manager's Performance tab and GNOME Resources. Built from the ground up for high-performance telemetry tracking, it operates as a native desktop Electron application, with a fallback Express + Vite full-stack server streaming real-time diagnostics via Server-Sent Events (SSE) for remote dashboarding.

---

## 🚀 Key Features

*   **🖥️ Unified Dashboard**:
    *   Real-time system health summary for CPU, Memory, GPU, Storage Volumes, and Network Interfaces.
    *   Sliding 60-second historical performance graphs displaying utilization vectors.
    *   Dynamic load indicators classifying metrics under **Optimal**, **Elevated**, or **Heavy Load** operational bounds.
*   **⚡ CPU Performance Diagnostics**:
    *   Per-logical-core heatmaps showcasing distribution across multi-threaded cores.
    *   Load averages monitoring ($1\text{ min}$, $5\text{ min}$, and $15\text{ min}$ loads).
    *   Real-time speed clock calculation, core counts (logical & physical), and package temperatures.
*   **🧠 Memory Allocation Analytics**:
    *   Segmented horizontal memory stack bar classifying Volatile RAM: Active, System Cache, Kernel Buffers, and Free address spaces.
    *   Dedicated paging swap-file buffer utilization tracking.
*   **🎮 GPU Diagnostic Suite**:
    *   Multivendor GPU hardware detection (NVIDIA, AMD, Intel, Apple Silicon).
    *   Dedicated VRAM allocation graphing alongside core execution engine workload telemetry.
    *   Platform-resilient fallback drivers for virtualized and containerized environments.
*   **💾 Storage Volume Controllers**:
    *   Tracks all mounted active file systems with read/write speed tracking (MB/s).
    *   Calculates disk capacity bounds: Total, Used, and Free percentages.
*   **🌐 Network Bandwidth Telemetry**:
    *   Real-time socket packet counters tracking ingress (download) and egress (upload) speeds.
    *   Detailed active interface properties including specific IPv4 mapping addresses.
*   **📋 Task Explorer & Process Manager**:
    *   Live sortable and filterable task manager listing system processes.
    *   Classifies PID, CPU utilization, Memory allocation, execution owners, and estimated physical memory impact (MB).

---

## 🛠️ Architecture Overview

The system runs on a **dual-adapter bridge mode** which detects the environment and automatically establishes the telemetry streams.

```
                  ┌───────────────────────────────────────────────┐
                  │            Client Browser Interface           │
                  │             (React + Zustand)                 │
                  └──────────────────────┬────────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼ (Desktop Mode)                          ▼ (Web Remote Mode)
        ┌───────────────────────┐                 ┌───────────────────────┐
        │   Electron IPC Channel│                 │  Server-Sent Events   │
        │   (secure preload.js) │                 │     (SSE Router)      │
        └───────────┬───────────┘                 └───────────┬───────────┘
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼
                  ┌───────────────────────────────────────────────┐
                  │           System Information Engine           │
                  │       (Node.js + systeminformation API)       │
                  └───────────────────────────────────────────────┘
```

### 1. The IPC & SSE Telemetry Adapters
*   **Electron Native Bridge**: Operates inside an Electron secure context. Telemetry is queried at the main thread level and pushed directly to the renderer via asynchronous IPC.
*   **Web Server Fallback (SSE)**: When deployed as a web dashboard, the server boots up an HTTP Express app, binds a Server-Sent Events `/api/metrics/stream` endpoint, and pipes sliding JSON streams over HTTP keeping network overhead minimal compared to traditional polling.

### 2. State & Sliding Histograms
*   The React client leverages **Zustand** for state orchestration.
*   Metrics are captured in sliding buffers. As new data points arrive, older points shift out, maintaining an exact **60-sample sliding timeline** for smooth rendering in Recharts SVG visualizers.

---

## 📦 Tech Stack

*   **Desktop App Wrapper**: Electron
*   **Backend Runtime**: Node.js, Express, `systeminformation`
*   **Frontend Library**: React (with TypeScript Functional Hooks)
*   **State Management**: Zustand
*   **Plotting Engine**: Recharts (fully customized SVGs with custom tooltip overlays)
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Compilers & Bundlers**: Vite, esbuild, tsx
*   **Package Manager**: npm

---

## 📁 Directory Structure

```text
├── electron/
│   ├── main.ts                # Electron Main Process (IPC & background polling loop)
│   ├── preload.ts             # Secure Sandbox context bridge exposing window.electronAPI
│   └── services/
│       ├── cpu.ts             # CPU utilization, load, core levels, and thermal metrics
│       ├── memory.ts          # Volatile memory indexes, caches, and swap buffers
│       ├── gpu.ts             # Hardware adapters bindings (NVML, Intel, Apple graphics)
│       ├── disk.ts            # Active partitions, file systems, and read/write bandwidth
│       ├── network.ts         # Network sockets throughput metrics
│       └── system.ts          # Static hardware specs caching & builders
│
├── src/                       # React Renderer / Client Dashboard App
│   ├── components/
│   │   ├── graphs/            # Optimized, responsive Recharts area charts & sparklines
│   │   └── layout/            # Main sidebar layout, routing tabs, and theme indicators
│   ├── pages/
│   │   ├── Dashboard.tsx      # System health summary bento grids
│   │   ├── CPU.tsx            # Logical core charts, thermal status, and load averages
│   │   ├── Memory.tsx         # RAM usage distribution stacks, buffers, and swap performance
│   │   ├── GPU.tsx            # Dedicated core and memory visualizers
│   │   ├── Disk.tsx           # Disk throughput, partition maps, and read/write charts
│   │   ├── Network.tsx        # Bandwidth speed meters and interfaces tracker
│   │   └── Processes.tsx      # Searchable, sortable interactive process explorer
│   ├── store/
│   │   └── useMetricsStore.ts  # Zustand global state (handles SSE and IPC seamlessly)
│   ├── types.ts               # Strict TypeScript schema interfaces for API payloads
│   ├── App.tsx                # Client route manager & initialization logic
│   └── main.tsx               # Client DOM entry point
│
├── server.ts                  # Production Express server (SSE streaming bridge on Port 3000)
├── tsconfig.json              # Client TypeScript configuration
├── tsconfig.electron.json     # Compiler rules for Electron main and preload processes
└── vite.config.ts             # Vite bundler configuration
```

---

## 🚀 Getting Started

### 1. Install Dependencies

Install all project packages:

```bash
npm install
```

### 2. Run the Web Server (Remote Web Dashboard)

This runs the system in full-stack web-server mode. The backend collects platform metrics and streams them to the browser on port **3000**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run the Desktop Application (Electron)

To run the application inside a native desktop frame on your local development machine:

```bash
npm run electron:dev
```

---

## 🏗️ Production Building & Packaging

### 1. Build & Run Web Application

To package the client into optimized static assets and bundle the Express server code into a self-contained Node payload:

```bash
# Build static assets & compile server.ts
npm run build

# Start the optimized production server
npm run start
```

### 2. Package the Electron Desktop Application

To generate standalone installer files for macOS (`.dmg`/`.app`), Windows (`.exe`/NSIS), or Linux (`.AppImage`) through `electron-builder`:

```bash
npm run electron:build
```

The compiled installers are written to the `/release` directory.

---

## 🔧 Performance & Optimization Notes

To ensure high-performance execution without freezing the CPU thread being monitored, the monitor implements the following rules:
1.  **Passive Thermal Sensors**: Queries hardware temperatures sequentially to avoid thermal sensor command queue blocks on specific architectures.
2.  **State Flattening**: Avoids heavy deep-cloning or deep-comparisons during State updates. Data structures are kept as flat arrays to keep rendering pipelines efficient.
3.  **No Socket Memory Leaks**: Express Server-Sent Events (SSE) automatically release resources and clear internal telemetry polling intervals immediately when client socket connections terminate.

---

## 🚦 Troubleshooting

### Missing Thermal / Speed Sensors
*   **Symptom**: Temperature displays "Sensor Blocked" or Core speeds show `0 GHz`.
*   **Cause**: Virtualized servers (like Docker or Cloud Run containers) do not expose native physical hardware sensor endpoints directly to the guest environment.
*   **Solution**: Run the application natively on the bare-metal OS or configure hypervisor-level pass-through parameters.

### macOS Core Dumps or Sandbox Warnings
*   **Cause**: Modern versions of macOS impose strict security boundaries on process queries.
*   **Solution**: Ensure you sign the binary with local developer keys or run the app with escalated permissions if testing low-level systems.

---

## 📜 License

This project is licensed under the Apache 2.0 License. See the LICENSE file for details.
