---
title: Documentation Index
description: Complete ODUS documentation navigation
version: 1.4.0
last_updated: 2026-01-19
---

![ODUS](https://img.shields.io/badge/ODUS-AI_Project_Manager-8e75b2?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkw0IDZWMTJDNCAxNi40IDE3LjIgMjIgMTIgMjJDMTcuMiAyMiAyMCAxNi40IDIwIDEyVjZMMTIgMloiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=)

![Version](https://img.shields.io/badge/Version-1.4.0-success?style=flat-square)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)

## ODUS Documentation

**AI-Native Project Management Platform** with local-first architecture, cross-workspace connectivity, and intelligent automation.

---

## 📚 Documentation Structure

### Getting Started

1. **[Overview](./00-overview.md)** - System introduction, philosophy, and capabilities
2. **[Quick Start](./01-quick-start.md)** - 5-minute setup and first project guide

### Technical Documentation

3. **[Architecture](./02-architecture.md)** - Technical deep-dive, stack, and design patterns
4. **[Features](./03-features.md)** - Complete feature reference and workflows
5. **[API Reference](./04-api-reference.md)** - Service and component APIs
6. **[Deployment](./05-deployment.md)** - Production deployment instructions

---

## 🚀 Quick Links

### For Users
- **First Time?** → [Quick Start Guide](./01-quick-start.md)
- **Feature Guide** → [Features Reference](./03-features.md)
- **Need Help?** → [GitHub Issues](https://github.com/amuzetnoM/ODUS/issues)

### For Developers
- **Architecture** → [System Architecture](./02-architecture.md)
- **API Docs** → [API Reference](./04-api-reference.md)
- **Deploy** → [Deployment Guide](./05-deployment.md)

---

## 📖 Documentation Highlights

### What Makes ODUS Unique

- **Local-First**: All data in browser (IndexedDB), zero server dependencies
- **AI-Native**: Gemini 2.0 for project generation, task analysis, and automation
- **Cross-Connected**: Tasks ↔ Mind Nodes ↔ Files with bidirectional relationships
- **Success Roadmap**: Weighted algorithm identifies critical path through projects
- **GitHub Intelligence**: Analyzes codebases and generates actionable tasks

### Core Capabilities

✅ **AI Project Generation** - Natural language → complete project boards  
✅ **GitHub Import** - Analyze repos → categorized tasks with dependencies  
✅ **Focus List Curation** - AI selects top 5 most important tasks  
✅ **Mind Map** - Force-directed knowledge graph with auto-linking  
✅ **Conversational Agent** - Full workspace control via chat interface  
✅ **Multi-View Boards** - Kanban, Gantt, dependency graphs, calendar  

### Tech Stack

- **Framework**: Angular 21.1 (zoneless, signals)
- **AI**: Google Generative AI SDK (Gemini 2.0 Flash)
- **Visualization**: D3.js (force-directed graphs)
- **Storage**: IndexedDB (local-first)
- **Styling**: Tailwind CSS 3

---

## 🔍 Documentation Navigation

### By Topic

**Installation & Setup**
- [Prerequisites](./01-quick-start.md#prerequisites)
- [Installation](./01-quick-start.md#installation)
- [First-Time Setup](./01-quick-start.md#first-time-setup)

**Core Features**
- [AI Project Generation](./03-features.md#1-ai-powered-project-generation)
- [GitHub Repository Intelligence](./03-features.md#2-github-repository-intelligence)
- [Success Roadmap](./03-features.md#3-success-roadmap-critical-path)
- [Focus List Management](./03-features.md#4-focus-list-management)
- [Neural Mind Board](./03-features.md#5-neural-mind-board)
- [Conversational AI Agent](./03-features.md#6-conversational-ai-agent)

**Technical Details**
- [Architecture Layers](./02-architecture.md#architecture-layers)
- [Data Flow](./02-architecture.md#data-flow)
- [Service Layer](./02-architecture.md#2-service-layer)
- [Performance Optimizations](./02-architecture.md#performance-optimizations)

**API Documentation**
- [WorkspaceService](./04-api-reference.md#workspaceservice)
- [ProjectService](./04-api-reference.md#projectservice)
- [GeminiService](./04-api-reference.md#geminiservice)
- [Type Definitions](./04-api-reference.md#type-definitions)

**Deployment**
- [Build Configuration](./05-deployment.md#build-configuration)
- [Vercel Deployment](./05-deployment.md#option-1-vercel-recommended)
- [Google Cloud Platform](./05-deployment.md#option-2-google-cloud-platform)
- [Netlify Deployment](./05-deployment.md#option-3-netlify)

---

## 💡 Quick Examples

### Create AI Project

```bash
# In app: Click "+" button
"Create a mobile app launch plan"
# AI generates 8-12 tasks with dependencies
```

### Import GitHub Repo

```typescript
// 1. Configure GitHub token (Settings)
// 2. Navigate to GitHub view
// 3. Select repository
// 4. Click "ADD"
// AI analyzes: files, commits, configs → generates tasks
```

### Curate Focus List

```typescript
// Ask AI Agent:
"Curate my focus list"

// AI selects top 5 tasks based on:
// - Priority, dependencies, urgency
```

### Link Task to Mind Node

```typescript
// Via AI Agent:
"Link task 'Deploy Frontend' to mind node 'Release Planning'"

// Creates bidirectional reference:
// - task.metadata.mindNodeId = nodeId
// - node.properties.taskReferences = taskId
```

---

## 🎯 Common Use Cases

### Daily Standup

1. Open Dashboard → Check Focus List
2. Calendar → Read today's briefing
3. Update task statuses in Kanban
4. Ask AI: `"Generate standup report"`

### Project Planning

1. AI Generate OR GitHub Import
2. Review tasks in Kanban
3. Adjust dependencies
4. Check Success Roadmap
5. Set focus list
6. Monitor Calendar

### Knowledge Capture

1. Mind Board → Double-click canvas
2. Write notes in markdown
3. AI auto-links related nodes
4. Create task from node
5. Task appears with node reference

---

## 🛠️ Development

### Local Development

```bash
git clone https://github.com/amuzetnoM/ODUS.git
cd ODUS
npm install
npm run dev
```

Open `http://localhost:4200`

### Build for Production

```bash
npm run build
# Output: dist/ (~1.22 MB, gzipped: ~263 KB)
```

### Run Tests (Planned)

```bash
npm run test        # Unit tests (Jest)
npm run test:e2e    # E2E tests (Playwright)
```

---

## 📊 Version History

### v1.4.0 (Current)
- ✅ Enhanced GitHub import with file categorization
- ✅ Improved success roadmap algorithm (weighted scoring)
- ✅ AI focus list curation
- ✅ Task-to-mind-node linking
- ✅ Date validation and normalization
- ✅ Markdown rendering improvements
- ✅ Code quality refactoring (shared utilities)

### v1.3.0
- Theme customization (dark/light modes)
- Accent color selection
- Sidebar resizing
- Zen mode (particle physics)
- System status panel

### v1.2.0
- Mind board force-directed graph
- AI auto-linking
- Dependency graph visualization
- Success roadmap

### v1.1.0
- GitHub repository import
- AI project generation
- Kanban boards
- Calendar view

### v1.0.0
- Initial release
- Basic project management
- AI integration (Gemini)

---

## 🤝 Contributing

We welcome contributions! See our [GitHub repository](https://github.com/amuzetnoM/ODUS) for:

- [Issues](https://github.com/amuzetnoM/ODUS/issues) - Bug reports and feature requests
- [Discussions](https://github.com/amuzetnoM/ODUS/discussions) - Questions and ideas
- [Pull Requests](https://github.com/amuzetnoM/ODUS/pulls) - Code contributions

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) file

---

## 🔗 Resources

- **GitHub**: [amuzetnoM/ODUS](https://github.com/amuzetnoM/ODUS)
- **Documentation**: `/docs` directory
- **Demo**: [Live Demo](https://odus.vercel.app) _(if deployed)_
- **Support**: [GitHub Discussions](https://github.com/amuzetnoM/ODUS/discussions)

---

**Built with ❤️ using Angular 21, Gemini AI, and local-first architecture.**

Last Updated: 2026-01-19 | Version 1.4.0
