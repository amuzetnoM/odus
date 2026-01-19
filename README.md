# ODUS - AI-First Project Management

![Angular](https://img.shields.io/badge/Angular-21.1-dd0031?style=flat-square&logo=angular)
![AI](https://img.shields.io/badge/AI-Gemini_2.0_Flash-8e75b2?style=flat-square&logo=google-gemini)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Version](https://img.shields.io/badge/Version-1.4.0-success?style=flat-square)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)

<div align="center">

</div>

**ODUS** is a comprehensive, AI-native project management suite that reimagines how teams plan, execute, and visualize work. Built with a zoneless Angular architecture and powered by Google's Gemini 2.0 AI, ODUS generates project structures, detects dependencies, and provides intelligent insights—all while keeping your data local-first.

---

## 🚀 Key Features

### 🧠 **Generative AI Core**
- **One-Prompt Projects**: Describe your goal, get a complete project board with tasks, dependencies, and scheduling
- **GitHub Intelligence**: Import repositories and auto-generate project plans from code analysis
- **AI Agent**: Conversational interface with physics-based floating UI—create tasks, files, and navigate by voice

### 📊 **Smart Visualizations**
- **Success Roadmap**: D3.js-powered critical path visualization with temporal flow
- **Dependency Graphs**: Interactive force-directed graphs showing task relationships
- **Gantt Charts**: Timeline views with automatic conflict detection
- **Mind Board**: Neural knowledge graph with AI-powered semantic linking

### 🎯 **Intelligent Task Management**
- **Auto-Dependency Generation**: AI creates logical task chains (setup → implementation → testing)
- **Priority Distribution**: Enforced 20-35% high, 45-65% medium, 15-30% low priority tasks
- **Smart Routing**: Natural language task input automatically sorted to correct projects
- **Focus Curation**: AI selects your top 5 most impactful tasks daily

### 🔐 **Local-First Architecture**
- **IndexedDB Storage**: All data persists locally—zero server dependencies
- **Privacy-First**: API keys never leave your browser
- **Offline Capable**: Full functionality without internet (after initial load)
- **Zoneless Design**: Angular Signals for reactive state without Zone.js overhead

---

## 📦 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Gemini API Key** ([Get Free Key](https://makersuite.google.com/app/apikey))

### Installation

```bash
# Clone repository
git clone https://github.com/amuzetnoM/ODUS.git
cd ODUS

# Install dependencies
npm install

# Start development server
npm run dev
```

Application runs at **http://localhost:3000**

### First-Time Setup
1. Open ODUS in your browser
2. Navigate to **Settings** → **API Configuration**
3. Enter your **Gemini API Key**
4. (Optional) Add **GitHub Personal Access Token** for repo import

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Getting Started](./docs/getting-started.md)** - Walkthrough and key concepts
- **[Feature Guide](./docs/features.md)** - Complete feature reference
- **[Architecture](./docs/architecture.md)** - Technical deep-dive
- **[API Reference](./docs/api-reference.md)** - Service and component APIs
- **[Deployment Guide](./docs/deployment.md)** - Production deployment instructions
- **[Developer Guide](./README-DEV.md)** - System documentation for developers

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Angular 21 (Standalone Components, Signals) |
| **State Management** | Angular Signals (Zoneless) |
| **AI Engine** | Google Gemini 2.0 Flash |
| **Styling** | Tailwind CSS 3 + Custom CSS Variables |
| **Visualizations** | D3.js (Force Simulations, Graphs) |
| **Storage** | IndexedDB (via native API) |
| **Build** | Angular CLI with Vite |
| **Language** | TypeScript 5.9 |

---

## 🎨 Core Modules

### 1. Dashboard (Scope)
Command center with Focus List and Success Roadmap visualization. Smart Quick Add routes tasks via AI.

### 2. Timeline (Calendar)
Gantt charts, calendar views, and deadline tracking with predictive risk analysis.

### 3. Projects
Multi-view project boards (Kanban, Gantt, Dependency Graph) with real-time metrics.

### 4. Mind Board
Force-directed knowledge graph for unstructured thinking. AI auto-links related concepts.

### 5. Data Vault (Drive)
File generation and storage. AI can create CSV/Markdown files on demand.

### 6. GitHub Intelligence
Import repositories, analyze code structure, and generate actionable project plans.

### 7. AI Agent
Floating, physics-driven conversational interface with tool calling for autonomous actions.

---

## 🚢 Deployment

### Production Build
```bash
npm run build
```

Outputs optimized bundle to `dist/` directory (~260 KB gzipped).

### Deployment Platforms

- **Vercel**: `vercel --prod` (Recommended for SPA)
- **Google Cloud**: `gcloud app deploy` (App Engine/Cloud Run)
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: Use `landing.html` for landing page

See **[Deployment Guide](./docs/deployment.md)** for detailed instructions.

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Angular style guide
- Use Angular Signals for state
- Write self-documenting code
- Test with `npm run build` before PR

---

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/amuzetnoM/ODUS/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/amuzetnoM/ODUS/discussions)
- **Documentation**: `/docs` directory

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Landing Page**: [landing.html](./landing.html) (Standalone GitHub Pages ready)
- **Documentation**: [/docs](./docs)
- **API Reference**: [docs/api-reference.md](./docs/api-reference.md)

---

## 🎯 Roadmap

### Version 1.4 (Current)
- ✅ Unified workspace context service
- ✅ AI memory persistence
- ✅ Enhanced dependency generation
- ✅ Cross-view relationship detection

### Version 1.5 (Planned)
- [ ] Multi-user collaboration (WebRTC)
- [ ] Export to PDF/CSV
- [ ] Custom AI model support (Ollama, Claude)
- [ ] Mobile app (Capacitor)
- [ ] Plugin system

---

## 🙏 Acknowledgments

- **Google Gemini** for powerful AI capabilities
- **Angular Team** for zoneless architecture
- **D3.js Community** for visualization tools
- **Open Source Community** for inspiration and support

---

<div align="center">

**Made with 💜 by the ODUS Team**

[Website](https://amuzetnoM.github.io/ODUS/landing.html) • [GitHub](https://github.com/amuzetnoM/ODUS) • [Documentation](./docs)

</div>
