# 📊 DevMonitor

> A modern cross-platform desktop resource monitor built with **Electron**, **React**, **TypeScript**, and **systeminformation**. Monitor CPU, Memory, GPU, Storage, Network, and Processes in real time through a clean, responsive interface inspired by modern operating system resource monitors.

![Electron](https://img.shields.io/badge/Electron-Desktop-blue?logo=electron)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-Apache%202.0-green)

---

# ✨ Features

## 🖥️ Dashboard

* Real-time overview of system performance
* CPU, Memory, GPU, Disk, and Network summaries
* Live utilization indicators
* Historical performance charts
* Responsive dashboard layout

---

## ⚡ CPU Monitoring

* Overall CPU utilization
* Per-core usage visualization
* Clock speed
* Physical and logical core count
* CPU load averages
* Processor temperature (where supported)

---

## 🧠 Memory Monitoring

* Total, used, and free RAM
* Memory utilization percentage
* Swap usage
* Memory allocation visualization
* Live memory usage history

---

## 🎮 GPU Monitoring

* GPU detection
* GPU utilization
* VRAM usage
* Dedicated GPU memory statistics
* Multiple GPU support (where available)

---

## 💾 Disk Monitoring

* Storage capacity
* Used and free space
* Read/write throughput
* Mounted filesystem information
* Disk utilization graphs

---

## 🌐 Network Monitoring

* Upload speed
* Download speed
* Active network interfaces
* IPv4 addresses
* Real-time bandwidth monitoring

---

## 📋 Process Explorer

* Running processes
* CPU usage
* Memory usage
* PID
* Process owner
* Search and sorting support

---

# 🏗 Architecture

The application follows Electron's recommended secure architecture.

```text
                    ┌──────────────────────────────┐
                    │        React Renderer        │
                    │        (React + Zustand)     │
                    └──────────────┬───────────────┘
                                   │
                        Secure Electron IPC
                                   │
                    ┌──────────────▼───────────────┐
                    │        preload.ts            │
                    │       contextBridge API      │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │      Electron Main Process   │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │ systeminformation Library    │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │       Operating System       │
                    └──────────────────────────────┘
```

The renderer never accesses Node.js directly.

All system metrics are collected inside the Electron main process and exposed securely through IPC using `contextBridge`.

---

# 📂 Project Structure

```text
DevMonitor/
│
├── assets/
│
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   └── services/
│       ├── cpu.ts
│       ├── memory.ts
│       ├── gpu.ts
│       ├── disk.ts
│       ├── network.ts
│       └── system.ts
│
├── shared/
│   └── types.ts
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.electron.json
└── README.md
```

---

# 🛠 Tech Stack

### Desktop

* Electron

### Frontend

* React
* TypeScript
* Vite

### State Management

* Zustand

### Charts

* Recharts

### System Information

* systeminformation

### Styling

* Tailwind CSS

### Icons

* Lucide React

### Packaging

* Electron Builder

---

# 🔒 Security

The application follows Electron security best practices.

* Context Isolation enabled
* Node Integration disabled
* Secure IPC communication
* Renderer has no direct Node.js access
* All system calls executed in the main process

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone https://github.com/AdityaKarippadathUdai/DevMonitor
cd DevMonitor
```

## Install dependencies

```bash
npm install
```

---

# ▶ Development

Run the Electron application in development mode.

```bash
npm run electron:dev
```

---

# 📦 Build

Build the renderer and Electron processes.

```bash
npm run build
```

---

# 🚀 Package Desktop Application

Generate a native installer.

```bash
npm run dist
```

Generated installers are placed inside the `release/` directory.

Depending on the operating system used for the build, Electron Builder can generate:

* Linux AppImage
* Linux DEB
* Windows NSIS Installer
* macOS DMG

---

# 📈 Performance

The application is designed for low overhead.

* Lightweight IPC communication
* Efficient polling intervals
* Minimal React re-renders
* Sliding history buffers for charts
* Optimized Zustand state updates

---

# 🖼 Screenshots

Add screenshots here after publishing.

```text
screenshots/
├── dashboard.png
├── cpu.png
├── memory.png
├── gpu.png
├── disk.png
├── network.png
└── processes.png
```

Example:

```markdown
![Dashboard](screenshots/dashboard.png)
```

---

# 🗺 Roadmap

* Export metrics to CSV
* Theme customization
* Performance alerts
* Mini floating widget
* System tray integration
* Startup on boot
* Historical logging
* Plugin architecture
* Auto-update support
* Multi-language support

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

# 📄 License

Licensed under the Apache License 2.0.

See the `LICENSE` file for details.

---

# 👨‍💻 Author

**Aditya K U**

If you find this project useful, consider giving it a ⭐ on GitHub.
