# Fuego Desktop Wallet (Tauri)

🔥 **Fuego Desktop Wallet** - A modern, secure, and lightweight desktop cryptocurrency wallet built with Tauri.

## Overview

This is a complete rewrite of the Fuego Desktop Wallet using modern technologies:
- **Backend**: Rust with Tauri framework
- **Frontend**: TypeScript/HTML/CSS
- **Architecture**: Secure, cross-platform desktop application

## Features

- 🔒 **Secure**: Built with Rust for memory safety and security
- 🚀 **Fast**: Native performance with web-based UI
- 📦 **Lightweight**: ~10MB bundle size (vs ~100MB+ Qt version)
- 🌐 **Cross-platform**: Windows, macOS, and Linux support
- 💰 **Full Wallet Functionality**: Send, receive, transactions, messaging
- 🔄 **Real-time Sync**: Live blockchain synchronization
- 🎨 **Modern UI**: Clean, responsive interface

## Development Status

🚧 **Phase 1**: Foundation & Core Integration (In Progress)
- [x] Tauri project setup
- [x] Basic Rust backend structure
- [x] Mock wallet operations
- [x] Basic frontend interface
- [ ] CryptoNote C++ integration via FFI
- [ ] Real wallet operations

## Technology Stack

### Backend (Rust)
- **Tauri**: Desktop app framework
- **Serde**: Serialization
- **Tokio**: Async runtime
- **CryptoNote**: Blockchain integration (via FFI)

### Frontend (Web)
- **TypeScript**: Type-safe JavaScript
- **HTML5/CSS3**: Modern web standards
- **Vite**: Build tool and dev server

## Getting Started

### Prerequisites

- Rust (latest stable)
- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/colinritman/fuego-wallet-tauri.git
cd fuego-wallet-tauri
```

2. Install dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run tauri dev
```

### Building

Build for production:
```bash
npm run tauri build
```

## Project Structure

```
fuego-wallet-tauri/
├── src/                    # Frontend source
│   ├── main.ts            # Main application logic
│   └── styles.css         # Application styles
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── lib.rs         # Main library entry
│   │   ├── main.rs        # Application entry point
│   │   └── commands/      # Tauri commands
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
└── package.json           # Node.js dependencies
```

## Migration from Qt

This project represents a complete migration from the Qt-based Fuego Wallet to a modern Tauri-based architecture. Key improvements:

- **Bundle Size**: Reduced from ~100MB+ to ~10MB
- **Security**: Rust backend provides memory safety
- **Performance**: Native performance with web UI flexibility
- **Maintenance**: Modern tooling and easier maintenance
- **Cross-platform**: Better platform integration

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Development Phases

### Phase 1: Foundation (Weeks 1-3) - Current
- [x] Project setup and structure
- [x] Basic Tauri integration
- [x] Mock wallet operations
- [ ] CryptoNote C++ FFI integration
- [ ] Core wallet functionality

### Phase 2: UI Migration (Weeks 4-8)
- [ ] Complete UI migration from Qt
- [ ] All wallet features implementation
- [ ] Modern responsive design
- [ ] Dark/light theme support

### Phase 3: Advanced Features (Weeks 9-12)
- [ ] System tray integration
- [ ] Native notifications
- [ ] Auto-updater
- [ ] Advanced security features

### Phase 4: Testing & Launch (Weeks 13-16)
- [ ] Comprehensive testing
- [ ] Security audit
- [ ] Distribution packages
- [ ] Production release

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original Fuego Wallet Qt implementation
- CryptoNote protocol
- Tauri framework team
- Rust community

## Support

- GitHub Issues: [Report bugs or request features](https://github.com/colinritman/fuego-wallet-tauri/issues)
- Documentation: [Coming soon]
- Community: [Join our Discord](https://discord.gg/fuego)

---

**Note**: This is a work in progress. The application is currently in Phase 1 development with mock implementations. Real wallet functionality will be added in subsequent phases.