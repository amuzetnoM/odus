---
title: Features Reference
description: Complete guide to all ODUS capabilities and workflows
version: 1.4.0
last_updated: 2026-01-19
---

![Features](https://img.shields.io/badge/Features-Complete-green?style=flat-square)
![AI](https://img.shields.io/badge/AI-Native-purple?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.4.0-success?style=flat-square)

## Core Features Overview

### 1. AI-Powered Project Generation

**Natural Language Input**: Describe your goal, get a complete project board.

**Process**:
1. Enter prompt: `"Create a mobile app launch plan"`
2. AI generates 8-15 granular tasks
3. Automatic dependency detection
4. Priority distribution (20-35% high, 45-65% medium, 15-30% low)
5. Start/end date scheduling

**Advanced Features**:
- **Enforced Distribution**: AI automatically rebalances if priorities are skewed
- **Dependency Chains**: High-priority tasks get sequential dependencies
- **Smart Titles**: Strips markdown tokens, truncates to 80 chars
- **Rich Descriptions**: Preserves context, separates from title

### 2. GitHub Repository Intelligence

**Automated Analysis**: Turn codebases into actionable task lists.

**Import Process**:
1. Configure GitHub Personal Access Token
2. Select repository from list
3. AI analyzes:
   - **File Structure**: Categorized by type (source, test, config, docs)
   - **Commit History**: Recent changes inform task priorities
   - **README**: Understands project goals
   - **Config Files**: package.json, pyproject.toml, Cargo.toml, go.mod

**Generated Tasks Include**:
- Architecture setup tasks
- Feature implementation tasks
- Testing requirements
- Documentation needs
- Bug fix priorities

**File Categorization**:
```typescript
SOURCE:  .ts, .js, .py, .java, .go, .rs, .cpp, .c, .cs
TEST:    test/, spec/, __tests__/, *.test.*, *.spec.*
CONFIG:  .json, .yaml, .toml, .xml, .conf
DOCS:    .md, .txt, .rst, docs/
```

### 3. Success Roadmap (Critical Path)

**Weighted Algorithm**: Identifies the optimal delivery vector.

**Scoring Formula**:
```
Task Weight = (Priority × 10/5/2) + 
              (Focus Status × 8) + 
              (Dependents × 3) + 
              (Urgency × 5/<7d or 3/<14d)
```

**Configuration**:
- Max tasks in roadmap: 8
- Min tasks in roadmap: 3
- Target percentage: 30% of all tasks

**Visualization**:
- Neon-glowing nodes for critical tasks
- Dashed flow lines show temporal sequence
- Force-directed layout with D3.js

### 4. Focus List Management

**AI Curation**:
- Ask: `"Curate my focus list"`
- AI selects top 5 tasks based on:
  - Priority
  - Dependencies (blockers)
  - Due dates (urgency)
  - Current status

**Manual Control**:
- Toggle in task detail modal
- Tasks marked with star icon in cards
- Appears in Dashboard focus section

**Integration**:
- Success roadmap always includes focus tasks
- Calendar highlights focus deadlines
- AI agent prioritizes focus tasks in responses

### 5. Neural Mind Board

**Force-Directed Knowledge Graph**: Physics-based semantic clustering.

**Capabilities**:
- **Create Nodes**: Double-click canvas
- **AI Analysis**: Generates title, extracts tags, finds related nodes
- **Auto-Linking**: AI connects semantically similar content
- **Manual Links**: Drag between nodes
- **Markdown Editor**: Distraction-free writing with live preview
- **Properties System**: Custom key-value metadata

**Task Integration**:
- Link tasks to mind nodes via AI agent
- Task metadata stores `mindNodeId`
- Mind node properties store `taskReferences`
- Bidirectional navigation

### 6. Conversational AI Agent

**Full Workspace Control**: User-level permissions for AI.

**Available Tools**:

| Tool | Purpose | Example |
|------|---------|---------|
| `create_project` | New project | "Create marketing campaign project" |
| `delete_project` | Remove project | "Delete the test project" |
| `create_task` | Add task | "Add task: Write API docs" |
| `update_task` | Modify properties | "Update 'Deploy' priority to high" |
| `update_task_status` | Change status | "Mark 'Testing' as done" |
| `curate_focus_list` | AI selects top 5 | "Curate my focus list" |
| `add_task_to_focus` | Manual focus | "Add 'Deploy' to focus" |
| `link_task_to_mind_node` | Connect data | "Link task X to node Y" |
| `create_file` | Generate CSV/MD | "Create budget spreadsheet" |
| `create_mind_node` | Add knowledge | "Create node about API design" |
| `navigate` | Change view | "Go to calendar" |

**Physics Interaction**:
- Draggable floating bubble
- Velocity + friction simulation
- Boundary collision with bounce
- Throwable across screen

**Generative UI**:
- File previews in chat stream
- Success cards for confirmations
- Inline search results

### 7. Multi-View Project Boards

**Kanban Board**:
- Three columns: To Do, In Progress, Done
- Drag-and-drop task cards
- Color-coded by project
- Real-time metrics at top

**Gantt Chart**:
- Timeline view with start/end dates
- Task bars with dependencies
- Visual conflict detection
- Scroll to zoom

**Dependency Graph**:
- Force-directed layout
- Hover to highlight connections
- Click to focus on task
- Shows blocking relationships

### 8. Calendar & Timeline

**Monthly Calendar**:
- Tasks on start/due dates
- Color-coded by project
- Click day for details
- Overdue indicators (red)

**Daily Briefing**:
- AI-generated summary
- Day type classification:
  - FOCUS: 1-3 high-priority tasks
  - CRUNCH: 4+ tasks or multiple high-priority
  - BALANCED: Mixed priorities, moderate load
  - LIGHT: Few tasks, mostly low priority
  - REST: No tasks or all completed

**Structured Format**:
- Overview sentence
- Key priorities list
- Recommendation or insight

### 9. Data Vault (File Storage)

**File Operations**:
- Upload files (any type)
- AI-generate CSV/Markdown
- Preview in modal
- Link to tasks

**AI Generation Examples**:
- Budget spreadsheets
- Project timelines
- Meeting notes
- Technical specs

**Integration**:
- Task attachments (attach file to task)
- File count displayed on task cards
- Direct download from vault

### 10. Task Properties & Metadata

**Core Properties**:
- `id`: Unique identifier (UUID)
- `title`: Task name (max 80 chars)
- `description`: Detailed markdown content
- `status`: todo | in-progress | done
- `priority`: low | medium | high
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD (≥ startDate)
- `createdAt`: ISO timestamp

**Extended Properties**:
- `tags[]`: Categorization labels
- `dependencyIds[]`: Blocking task IDs
- `comments[]`: Discussion threads
- `attachmentIds[]`: Linked files
- `inFocusList`: Boolean flag
- `focusIndex`: Order in focus list
- `metadata`: Extensible object
  - `location`: Physical location
  - `notes`: Additional context
  - `mindNodeId`: Linked mind node

**Display**:
- Task cards show dates, dependencies, focus status
- Overdue tasks highlighted in red
- Due soon (≤3d) highlighted in yellow
- Metadata notes shown with info icon

## Advanced Workflows

### Project Planning Workflow

1. **Generate**: AI creates project from prompt OR GitHub import
2. **Review**: Examine tasks in kanban board
3. **Adjust**: Modify dependencies, dates, priorities
4. **Validate**: Check success roadmap for critical path
5. **Focus**: Set focus list (AI or manual)
6. **Monitor**: Track progress via metrics and calendar

### Daily Standup Workflow

1. **Dashboard**: Check focus list
2. **Calendar**: Read today's briefing
3. **Update**: Move tasks in kanban boards
4. **AI Report**: Ask "Generate standup report"
5. **Adjust**: Curate new focus list if needed

### Knowledge Capture Workflow

1. **Mind Board**: Double-click to create node
2. **Write**: Use markdown editor
3. **AI Links**: System auto-connects related nodes
4. **Task Creation**: Right-click node → "Create Task"
5. **Integration**: Task appears with mind node reference

### GitHub-to-Production Workflow

1. **Import**: GitHub repository
2. **Analyze**: AI generates tasks
3. **Organize**: Group by project phases
4. **Dependencies**: Review and adjust
5. **Schedule**: Set realistic dates
6. **Execute**: Track via kanban + roadmap

## Customization & Settings

### Theme Customization

**Dark/Light Mode**:
- Settings → Interface → Theme Mode
- Dark (Cyberpunk, default)
- Light (Clean, professional)

**Accent Colors**:
- Cyberpunk Cyan
- Enterprise Indigo
- Alert Red
- Nature Green
- Sunset Orange

### AI Provider Configuration

**Supported Providers**:
- **Gemini 2.0 Flash** (default, free tier available)
- **OpenAI GPT-4** (requires API key)
- **Claude 3** (Anthropic API key)
- **Ollama** (local, no API key)
- **OpenRouter** (multi-model proxy)

**Configuration**:
- Settings → AI Provider
- Enter API key for chosen provider
- Test connection before saving

### Sidebar Customization

**Width Adjustment**:
- Drag handle on sidebar edge
- Auto-collapse on mobile (<1024px)
- Icon-only mode available

**System Status Panel**:
- Hidden by default
- Click "System Status" bar to reveal
- Shows: Health, Focus Load, Critical Count

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Quick Add (Focus List) |
| `Ctrl/Cmd + /` | Toggle AI Agent |
| `Escape` | Close modals/panels |
| `Ctrl/Cmd + S` | Save (in editors) |
| `?` | Show shortcuts help |
| `1-7` | Navigate views (with Ctrl/Cmd) |

## Performance Features

### Zoneless Architecture
- No Zone.js overhead
- 15% faster initial load
- 30% less memory usage

### Lazy Loading
- D3.js loaded on-demand
- 260 KB saved on initial bundle
- Faster First Contentful Paint

### Local-First Storage
- IndexedDB for projects
- Zero network latency
- Offline-capable

### Auto-Save
- 1-second debounce
- Prevents data loss
- Non-blocking operations

## Security Features

### Data Privacy
- All data stored client-side (IndexedDB)
- API keys never transmitted to server
- No user tracking (unless analytics enabled)

### API Key Storage
- Stored in localStorage
- Never logged or exposed
- Client-side only

### Content Validation
- Date format validation (YYYY-MM-DD)
- Dependency ID validation
- Title/description sanitization

---

**Next**: [API Documentation](./04-api-reference.md)
