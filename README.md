# Cross-Platform Desktop Resource Monitor

A modern, lightweight, and high-fidelity system resource monitor modeled after Windows Task Manager's Performance tab and GNOME Resources. It operates as a native desktop Electron application, with a responsive Express + Vite web-based preview server for remote dashboarding.

## Features
- **Dashboard**: Real-time overview of CPU, RAM, GPU, Disks, and Active Networks with rolling 60-second history graphs, status indicators, and thermal stats.
- **CPU Performance**: Tracking overall CPU load, per-logical-core heatmaps, load averages (1, 5, 15 min), speed clocks, and core temps.
- **Memory Analytics**: Segmented progress bars showcasing active RAM allocations vs system cache indexes, swap buffers, and total capacities.
- **GPU Diagnostics**: Dynamic vendor classification (NVIDIA, AMD, Intel, Apple), VRAM framebuffer graphing, core clock rates, thermal bounds, and power draws.
- **Storage Volumes**: Disk filesystem tracking (reads/writes in MB/s), partition sizes, mount points, and drive types.
- **Network Bandwidth**: Instantaneous download and upload speed trackers in KB/s and MB/s.
- **Task Explorer**: Sortable and filterable task manager listing active system processes by processor percentage, memory footprint, user executing, and PID.

---

## Tech Stack
- **Desktop Host**: Electron
- **Backend Services**: Node.js & `systeminformation`
- **Frontend UI**: React (functional hooks), TypeScript, Tailwind CSS, Lucide React
- **Charting Engine**: Recharts (optimized rolling lines)
- **State Store**: Zustand (sliding historical buffers)
- **Compilers**: Vite, esbuild, tsx
- **Packaging**: Electron Builder

---

## Project Directory Structure

```text
├── electron/
│   ├── main.ts               # Electron Main Process (IPC & background polling loop)
│   ├── preload.ts            # Secure Sandbox context bridge exposing electronAPI
│   └── services/
│       ├── cpu.ts            # CPU utilization, thermal, core logs & process monitors
│       ├── memory.ts         # Volatile memory indexes & paging buffers
│       ├── gpu.ts            # NVIDIA NVML, AMD ROCm, Intel graphics bindings
│       ├── disk.ts           # Mounted partitions, file systems, and read/write I/O
│       ├── network.ts        # Dynamic packet download/upload socket trackers
│       └── system.ts         # Static hardware specs caching & specs builders
│
├── src/                      # React Renderer / Client Application
│   ├── components/
│   │   ├── graphs/           # Highly optimized sliding Recharts area charts
│   │   └── layout/           # AppLayout main responsive chrome
│   ├── pages/
│   │   ├── Dashboard.tsx     # resource dashboard summaries
│   │   ├── CPU.tsx           # detailed core and processes visualizers
│   │   ├── Memory.tsx        # volatile RAM & swap visualizer
│   │   ├── GPU.tsx           # graphics diagnostics & driver fallbacks
│   │   ├── Disk.tsx          # disk storage arrays
│   │   ├── Network.tsx       # network socket rates
│   │   └── Processes.tsx     # sortable active system processes explorer
│   ├── store/
│   │   └── useMetricsStore.ts # Zustand global store (Auto Electron IPC vs Express SSE)
│   ├── types.ts              # Unified type-safe schemas
│   ├── App.tsx               # Client router & lifecycle triggers
│   └── main.tsx              # Web entry point
│
├── server.ts                 # Full-stack Express server (SSE streaming bridge on Port 3000)
├── tsconfig.json             # Core TypeScript compiler instructions
├── tsconfig.electron.json    # Dedicated compilation instructions for Electron processes
└── vite.config.ts            # Vite compiler configurations
```

---

## Getting Started

### 1. Installation

Install all required packages and system libraries:

```bash
npm install
```

### 2. Running in Web Preview (Express + Vite Server)

This launches the full-stack web app on port **3000**. The Express backend retrieves OS metrics (via `systeminformation` from your container) and streams live diagnostics directly to the browser using **Server-Sent Events (SSE)**.

```bash
npm run dev
```

### 3. Running in Native Desktop Mode (Electron Application)

To boot up the native cross-platform desktop wrapper with Electron on your local machine:

```bash
npm run electron:dev
```

---

## Production Packaging & Building

### 1. Building the Web Application
Compiles the static client assets and packs the server code into a single, optimized node file:
```bash
npm run build
```
Run the production build:
```bash
npm run start
```

### 2. Packaging the Electron Application (Cross-Platform)
To package the app into a standalone desktop executable (macOS `.dmg`/`.app`, Windows `.exe`/NSIS, Linux `.AppImage`) using `electron-builder`:

```bash
npm run electron:build
```

The resulting executables will be generated in the `/release` folder.
