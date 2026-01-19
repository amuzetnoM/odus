---
title: Quick Start Guide
description: Get up and running with ODUS in 5 minutes
version: 1.0.0-beta
last_updated: 2026-01-19
---

![Angular](https://img.shields.io/badge/Angular-21.1-dd0031?style=flat-square&logo=angular)
![AI](https://img.shields.io/badge/AI-Provider_Agnostic-8e75b2?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0--beta-success?style=flat-square)

## Prerequisites

Before starting, ensure you have:

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Modern Browser** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **AI Provider Key** (Gemini/OpenAI/Anthropic/OpenRouter/Ollama). See Settings → API Configuration in-app.
- (Optional) **GitHub Personal Access Token** for repository import

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/amuzetnoM/ODUS.git
cd ODUS
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Angular 21.1
- Google Generative AI SDK
- D3.js for visualizations
- Tailwind CSS for styling

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:4200**

### 4. Build for Production (Optional)

```bash
npm run build
```

Output directory: `dist/` (~1.22 MB, gzipped: ~263 KB)

## First-Time Setup

### Configure AI Integration

1. **Open ODUS** in your browser (http://localhost:4200)
2. **Click "INITIALIZE SYSTEM"** on the landing page
3. **Navigate to Settings** (gear icon in sidebar)
4. **API Configuration Tab**:
   - Enter your **Gemini API Key**
   - (Optional) Choose AI provider (Gemini/OpenAI/Claude/Ollama)
   - Click **Save**

### Verify Connection

The system will display a green indicator when the API key is valid.

## Your First Project

### Method 1: AI-Generated Project

1. **Click the "+" button** in the sidebar
2. **Type your goal**: `"Create a mobile app launch plan"`
3. **Press Enter**
4. **Watch ODUS generate**:
   - 8-12 granular tasks
   - Automatic dependencies
   - Priority distribution
   - Start/end dates
   - Color-coded project board

### Method 2: GitHub Repository Import

1. **Navigate to GitHub View** (third icon in sidebar)
2. **Configure GitHub Token**:
   - Settings → GitHub Integration
   - Paste your [Personal Access Token](https://github.com/settings/tokens)
   - Required scopes: `repo` (read)
3. **Click the repository list button**
4. **Select a repository**
5. **Click "ADD"**
6. **AI analyzes**:
   - File structure (categorized by type)
   - Recent commits
   - README and config files
   - Generates actionable tasks

### Method 3: Manual Project Creation

1. **Click "+" → "Manual Project"**
2. **Enter**:
   - Project name
   - Description
3. **Add tasks manually**:
   - Click "+ Task" in the board
   - Fill in title, description, priority
   - Set start/end dates
   - Add dependencies

## Core Features Walkthrough

### Dashboard (Scope View)

**Location**: First icon in sidebar

**Components**:
- **Focus List**: AI-curated top 5 most important tasks
- **Success Roadmap**: Critical path visualization (right panel)
- **Quick Add**: Natural language task input with auto-routing

**Try It**:
1. Type in Quick Add: `"Fix login bug"`
2. AI automatically routes to correct project
3. Press Enter to create

### Projects View

**Location**: Second icon in sidebar

**Capabilities**:
- **Kanban Board**: Drag-and-drop task cards
- **Gantt Chart**: Timeline view with dependencies
- **Dependency Graph**: Force-directed visualization
- **Multi-Project**: Toggle projects on/off

**Try It**:
1. Open a project
2. Drag a task from "To Do" to "In Progress"
3. Click task card to see details
4. Add dependencies from task detail modal

### Mind Board

**Location**: Fourth icon in sidebar

**Features**:
- **Force-Directed Graph**: Physics-based node clustering
- **AI Auto-Linking**: Analyzes content to connect related nodes
- **Markdown Editor**: Click node to edit with live preview
- **Manual Links**: Drag from node to node to connect

**Try It**:
1. **Double-click** canvas to create node
2. Type content in markdown editor
3. **Save** - AI generates title and tags
4. Create another node
5. AI automatically links if content is related

### AI Agent

**Location**: Floating white bubble (bottom-right by default)

**Capabilities**:
- **Full Workspace Control**: Create/update/delete projects, tasks, files
- **Focus List Curation**: Ask "Curate my focus list"
- **File Generation**: Request "Create a budget CSV"
- **Navigation**: Say "Go to calendar view"
- **Task Updates**: Command "Mark 'Deploy frontend' as done"

**Try It**:
1. **Click the floating bubble**
2. Type: `"What are my high-priority tasks?"`
3. AI responds with context-aware list
4. Try: `"Create a new task: Write API documentation"`
5. Task appears in relevant project

### Calendar View

**Location**: Fifth icon in sidebar

**Features**:
- **Monthly Calendar**: Tasks displayed on start/due dates
- **Daily Briefing**: Click any day for AI-generated summary
- **Color Coding**: Projects have unique colors
- **Overdue Warnings**: Red indicators for past-due tasks

**Try It**:
1. Click today's date
2. View AI briefing with day type (FOCUS/CRUNCH/BALANCED)
3. See starting tasks, due tasks, ongoing tasks

### Data Vault (Drive)

**Location**: Sixth icon in sidebar

**Capabilities**:
- **File Storage**: Upload files or AI-generate CSV/Markdown
- **File Linking**: Attach files to tasks
- **Preview**: View file contents in modal

**Try It**:
1. Click "+" to upload a file
2. Or ask AI: `"Generate a project timeline CSV"`
3. File appears in vault
4. Link to task from task detail modal

## Advanced Features

### Focus List Management

**AI Curation**:
- Ask AI Agent: `"Curate my focus list"`
- AI selects top 5 tasks based on priority, dependencies, urgency
- Updates automatically

**Manual Control**:
- In task detail modal, toggle "Add to Focus List"
- Tasks marked with star icon in cards

### Task Dependencies

**Creating Dependencies**:
1. Open task detail modal
2. "Blockers & Dependencies" section
3. Select existing task OR create new dependency
4. Task cards show dependency count

**Dependency Visualization**:
- Projects → Dependency Graph tab
- Force-directed layout shows relationships
- Hover to highlight connected tasks

### Success Roadmap

**How It Works**:
- Weighted algorithm scores tasks:
  - Priority: High (+10), Medium (+5), Low (+2)
  - Focus status: (+8)
  - Blocking power: (+3 × dependents)
  - Urgency: Due <7d (+5), <14d (+3)
- Selects top 30% of tasks
- Visualizes optimal delivery vector

**Using It**:
- Dashboard → Right panel
- Nodes glow based on importance
- Dashed lines show temporal flow

### GitHub Intelligence

**Analysis Process**:
1. Fetches file structure (categorized)
2. Reads recent commits
3. Parses README, package.json, pyproject.toml, etc.
4. AI generates:
   - Architecture tasks (setup, core modules)
   - Feature tasks (implementations)
   - Testing tasks
   - Documentation tasks

**Enhanced Context**:
- Tasks reference specific files
- Dependencies follow logical order (setup → build → test)
- Priorities distributed correctly

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick Add (Focus List) |
| `Ctrl/Cmd + /` | Toggle AI Agent |
| `Escape` | Close modals |
| `Ctrl/Cmd + S` | Save task (in detail modal) |
| `?` | Show shortcuts help |

## Common Workflows

### Daily Standup Workflow

1. **Open Dashboard**
2. **Check Focus List** (top 5 tasks)
3. **Click Calendar → Today**
4. **Read AI briefing**
5. **Update task statuses** in kanban boards
6. **Ask AI**: `"Generate standup report"`

### Project Planning Workflow

1. **AI Generate** OR **GitHub Import** project
2. **Review tasks** in kanban view
3. **Adjust dependencies** in task details
4. **Check Success Roadmap** for critical path
5. **Set focus list** (manual or AI-curated)
6. **Monitor Calendar** for upcoming deadlines

### Knowledge Capture Workflow

1. **Mind Board → Double-click** canvas
2. **Write notes** in markdown editor
3. **AI auto-links** related nodes
4. **Create task from node** (right-click → "Create Task")
5. **Task appears** with mind node reference in metadata

## Troubleshooting

### AI Not Responding

**Symptom**: "Connection Error" messages  
**Solution**:
1. Verify API key in Settings
2. Check browser console for errors
3. Test API key: `curl -H "Authorization: Bearer YOUR_KEY" https://generativelanguage.googleapis.com/v1/models`

### Tasks Not Saving

**Symptom**: Tasks disappear after refresh  
**Solution**:
1. Check browser storage quota
2. Open DevTools → Application → IndexedDB
3. Verify `artifact_projects` and `artifact_personal` exist
4. Try Settings → Hard Reset (WARNING: deletes all data)

### Calendar Showing Empty

**Symptom**: No tasks on calendar despite having tasks  
**Solution**:
1. Ensure tasks have start/end dates set
2. Dates must be in YYYY-MM-DD format
3. Check task detail modal → Timeline section

### GitHub Import Fails

**Symptom**: "Analysis sequence failed"  
**Solution**:
1. Verify GitHub token has `repo` scope
2. Check repository isn't private (unless token has access)
3. Try public repository first
4. Check browser console for 403/404 errors

## Next Steps

- **[Architecture Guide](./02-architecture.md)** - Understand the technical stack
- **[Features Reference](./03-features.md)** - Deep dive into all capabilities
- **[API Documentation](./04-api-reference.md)** - Service and component APIs
- **[Deployment Guide](./05-deployment.md)** - Production deployment instructions

## Support

- **Documentation**: `/docs` directory
- **Issues**: [GitHub Issues](https://github.com/amuzetnoM/ODUS/issues)
- **Discussions**: [GitHub Discussions](https://github.com/amuzetnoM/ODUS/discussions)

---

**You're ready to start!** Open ODUS and create your first AI-generated project.
