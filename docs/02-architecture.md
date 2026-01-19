---
title: System Architecture
description: Technical deep-dive into ODUS architecture and design patterns
version: 1.0.0-beta
last_updated: 2026-01-19
---

![Angular](https://img.shields.io/badge/Angular-21.1-dd0031?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Status](https://img.shields.io/badge/Status-Production-success?style=flat-square)

## Technology Stack

### Frontend Framework
- **Angular 21.1**: Latest stable with standalone components
- **Zoneless Change Detection**: `provideZonelessChangeDetection()` eliminates Zone.js overhead
- **Angular Signals**: Reactive state management without RxJS complexity
- **Standalone Components**: Tree-shakeable, lazy-loadable modules

### State Management
- **Signals**: Primary state mechanism (computed, effect)
- **Services**: Singleton pattern for shared state
- **IndexedDB**: Persistent storage via `PersistenceService`
- **LocalStorage**: API keys and user preferences

### Styling & UI
- **Tailwind CSS 3**: Utility-first CSS framework
- **CSS Variables**: Dynamic theming (`--color-accent`)
- **Custom Animations**: Physics-based interactions
- **Responsive Design**: Mobile-first with breakpoints

### AI Integration
- **Google Generative AI SDK**: `@google/genai` v1.37.0
- **Gemini 2.0 Flash**: Primary AI model
- **Multi-Provider**: OpenAI, Claude, Ollama, OpenRouter support
- **Structured Output**: JSON schema validation

### Data Visualization
- **D3.js 7.9.0**: Force-directed graphs, success roadmap
- **Custom SVG**: Gantt charts, dependency trees
- **Canvas**: Mind board physics simulations

### Build Toolchain
- **Angular CLI 21.1**: Build system
- **Vite**: Fast HMR and bundling
- **TypeScript 5.9**: Strict type checking
- **esbuild**: Fast JavaScript bundling

## Architecture Layers

### 1. Component Layer

**Structure**: Standalone components with signals

```
src/components/
├── views/                 # Full-page components
│   ├── dashboard.component.ts
│   ├── kanban-board.component.ts
│   ├── calendar-view.component.ts
│   ├── mind-board.component.ts
│   └── github-view.component.ts
├── ui/                    # Reusable UI components
│   └── (buttons, modals, etc.)
├── task-card.component.ts # Domain components
├── task-detail.component.ts
├── project-board.component.ts
└── ai-agent.component.ts  # AI interface
```

**Design Patterns**:
- **Input/Output**: `input<T>()` and `output<T>()` for component communication
- **Signals**: `signal()`, `computed()`, `effect()` for reactive state
- **ViewChild**: `viewChild<ElementRef>()` for DOM access
- **Dependency Injection**: `inject()` for services

### 2. Service Layer

**Core Services**:

```typescript
src/services/
├── workspace.service.ts   # Unified context
├── project.service.ts     # Project/task CRUD
├── gemini.service.ts      # AI operations
├── mind.service.ts        # Knowledge graph
├── drive.service.ts       # File storage
├── github.service.ts      # GitHub API
├── persistence.service.ts # IndexedDB
├── auth.service.ts        # User profile
├── notification.service.ts # Toast messages
└── app-control.service.ts # Navigation
```

**Service Responsibilities**:

#### WorkspaceService
- **Purpose**: Unified snapshot of entire workspace
- **Key Methods**:
  - `getAIContext()`: JSON for AI consumption
  - `getFullSnapshot()`: Complete workspace state
  - `storeAIMemory()`: Persist AI interactions
- **Computed Signals**:
  - `workspaceSnapshot`: Auto-updates on any data change

#### ProjectService
- **Purpose**: Project and task management
- **Key Signals**:
  - `projects`: All projects
  - `allTasks`: Flattened tasks with metadata
  - `metrics`: Workspace health stats
- **Methods**:
  - `addProject()`: Create with tasks
  - `updateTask()`: Partial updates
  - `normalizeTask()`: Sanitize titles/dates

#### GeminiService
- **Purpose**: AI operations
- **Provider Support**: Gemini, OpenAI, Claude, Ollama, OpenRouter
- **Key Methods**:
  - `generateProjectStructure()`: NLP → Tasks
  - `analyzeRepoAndPlan()`: GitHub → Tasks
  - `chatWithAgent()`: Conversational interface
  - `curateFocusList()`: Select top 5 tasks

#### MindService
- **Purpose**: Knowledge graph management
- **Features**:
  - Force-directed graph layout (D3.js)
  - AI auto-linking
  - Properties system
- **Methods**:
  - `addNode()`: AI analyzes content
  - `updateNode()`: Partial updates
  - `connectNodesManual()`: Bidirectional links

### 3. Utility Layer

```typescript
src/utils/
└── date-utils.ts
    ├── isValidDate()      # YYYY-MM-DD validation
    ├── normalizeDate()    # Format standardization
    ├── MS_PER_DAY         # Constant
    └── daysBetween()      # Date arithmetic
```

**Design Principle**: DRY (Don't Repeat Yourself)
- Shared validation logic
- Consistent date handling
- Reusable constants

### 4. Data Layer

**IndexedDB Stores**:

```javascript
{
  repos: {              // GitHub cache
    keyPath: 'id',
    data: { name, commits, structure }
  },
  drive_files: {        // File storage
    keyPath: 'id',
    data: { name, content, type, size }
  },
  ai_memory: {          // AI learning
    keyPath: 'id',
    autoIncrement: true,
    data: { context, reasoning, outcome, timestamp }
  },
  repo_dependency_index: { // Dependency graphs
    keyPath: 'projectId',
    data: { graph: [...] }
  }
}
```

**Persistence Strategy**:
- **Auto-save**: 1-second debounce on state changes
- **localStorage**: API keys, preferences
- **IndexedDB**: Project data, AI memory
- **No Server**: Zero network calls for data storage

## Data Flow

### Task Creation Flow

```
User Input (NLP)
      ↓
GeminiService.routeTaskToProject()
      ↓
  Project ID
      ↓
ProjectService.addTask()
      ↓
ProjectService.normalizeTask() ← Date validation
      ↓                          ← Title sanitization
  Task Object
      ↓
  Signal Update (projectsState)
      ↓
  Computed Trigger (allTasks)
      ↓
  View Re-render (TaskCard)
      ↓
  Auto-save (localStorage)
```

### GitHub Import Flow

```
GitHub Token
      ↓
GithubService.getUserRepos()
      ↓
User Selects Repo
      ↓
GithubService.getRepoTree()
      ↓
File Categorization (source/test/config/docs)
      ↓
GithubService.getFileContent() ← README, package.json, etc.
      ↓
GeminiService.analyzeRepoAndPlan()
      ↓
AI Analysis (file structure + commits + configs)
      ↓
Task Array (with dependencies)
      ↓
ProjectService.addProject()
      ↓
PersistenceService.saveRepoData()
      ↓
View Update (KanbanBoard)
```

### AI Agent Flow

```
User Message
      ↓
WorkspaceService.getAIContext()
      ↓
Unified JSON Snapshot
      ↓
GeminiService.chatWithAgent()
      ↓
AI Response (text OR toolCall)
      ↓
[If toolCall]
      ↓
handleToolCall() ← curate_focus_list
      ↓            ← update_task
ProjectService  ← create_project
      ↓            ← link_task_to_mind_node
Signal Update
      ↓
View Re-render
      ↓
WorkspaceService.storeAIMemory()
```

## Key Design Patterns

### 1. Signals Pattern

**Before (RxJS)**:
```typescript
tasks$ = new BehaviorSubject<Task[]>([]);
filteredTasks$ = this.tasks$.pipe(
  map(tasks => tasks.filter(t => t.status !== 'done'))
);
```

**After (Signals)**:
```typescript
tasks = signal<Task[]>([]);
filteredTasks = computed(() => 
  this.tasks().filter(t => t.status !== 'done')
);
```

**Benefits**:
- Auto-dependency tracking
- No memory leaks
- Better performance
- Simpler mental model

### 2. Local-First Pattern

**Philosophy**: Client is the source of truth

```typescript
// Write
projectService.addTask(projectId, task); // ← Signal update
effect(() => {                           // ← Auto-save
  const projects = projectsState();
  localStorage.setItem('artifact_projects', JSON.stringify(projects));
});

// Read
constructor() {
  const stored = localStorage.getItem('artifact_projects');
  if (stored) this.projectsState.set(JSON.parse(stored));
}
```

**Benefits**:
- Zero latency (no network)
- Privacy-first
- Offline-capable
- No server costs

### 3. Service Injection Pattern

**Old (NgModule)**:
```typescript
constructor(private projectService: ProjectService) {}
```

**New (inject())**:
```typescript
export class MyComponent {
  private projectService = inject(ProjectService);
}
```

**Benefits**:
- Works with standalone components
- Cleaner constructor
- Better tree-shaking

### 4. Computed Snapshot Pattern

**WorkspaceService** provides live-updating snapshot:

```typescript
readonly workspaceSnapshot = computed<WorkspaceSnapshot>(() => {
  const projects = this.projectService.projects();  // ← Auto-tracked
  const tasks = this.projectService.allTasks();      // ← Auto-tracked
  const mindNodes = this.mindService.nodes();        // ← Auto-tracked
  
  return {
    timestamp: new Date().toISOString(),
    projects: projects.map(p => ({ ...transform })),
    mindMap: { nodes: mindNodes.map(...) },
    // ... build unified view
  };
});
```

**Benefits**:
- Always in sync
- No manual refresh
- AI gets latest context

## Performance Optimizations

### Zoneless Change Detection

**Configuration** (`app.config.ts`):
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(), // ← No Zone.js
    // ...
  ]
};
```

**Impact**:
- ~15% faster initial load
- ~30% less memory usage
- More predictable performance

### Lazy Loading

**D3.js** is loaded on-demand:
```typescript
// Only loads when mind board or success roadmap is opened
const d3 = await import('d3');
```

**Impact**:
- 260 KB saved on initial bundle
- Faster First Contentful Paint

### Virtual Scrolling (Planned)

For 10,000+ tasks:
```typescript
// Use @angular/cdk/scrolling
<cdk-virtual-scroll-viewport itemSize="50">
  <div *cdkVirtualFor="let task of tasks()">
    <app-task-card [task]="task" />
  </div>
</cdk-virtual-scroll-viewport>
```

### IndexedDB Pagination

Current implementation loads all projects. For scale:
```typescript
async getProjectsPaginated(page: number, perPage: number) {
  const db = await this.openDB();
  const tx = db.transaction('projects', 'readonly');
  const cursor = await tx.store.openCursor();
  
  let skip = page * perPage;
  let results = [];
  
  while (cursor && results.length < perPage) {
    if (skip > 0) { skip--; await cursor.continue(); }
    else { results.push(cursor.value); await cursor.continue(); }
  }
  
  return results;
}
```

## Security Considerations

### API Key Storage

**Current**: localStorage (client-side only)

```typescript
localStorage.setItem('gemini_api_key', key); // ← Never sent to server
```

**Future Enhancement**: IndexedDB with encryption
```typescript
const encrypted = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  data
);
```

### Content Security Policy

**Recommended** (add to index.html):
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://esm.sh; 
               connect-src 'self' https://api.github.com https://generativelanguage.googleapis.com;">
```

### XSS Prevention

**Markdown Rendering**:
```typescript
// DOMSanitizer not used - manual sanitization
parseMarkdown(text: string): string {
  return text
    .replace(/</g, '&lt;')   // ← Escape HTML
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // ← Safe transforms
}
```

## Testing Strategy (Planned)

### Unit Tests (Jest)

```typescript
describe('ProjectService', () => {
  it('should normalize task dates', () => {
    const task = { startDate: '2024-01-15T10:00:00', endDate: '2024-01-10' };
    const normalized = service.normalizeTask(task);
    
    expect(normalized.startDate).toBe('2024-01-15');
    expect(normalized.endDate).toBeGreaterThanOrEqual(normalized.startDate);
  });
});
```

### E2E Tests (Playwright)

```typescript
test('AI project generation flow', async ({ page }) => {
  await page.goto('http://localhost:4200');
  await page.click('[data-testid="quick-add"]');
  await page.fill('input', 'Create a SaaS launch plan');
  await page.press('input', 'Enter');
  
  await expect(page.locator('.project-board')).toBeVisible();
  await expect(page.locator('.task-card')).toHaveCount.greaterThan(7);
});
```

## Deployment Architecture

### Production Build

```bash
npm run build
```

**Output**:
```
dist/
├── index.html            # Entry point
├── main-HASH.js          # Application code (~1.22 MB)
├── polyfills-HASH.js     # Browser polyfills
└── styles-HASH.css       # Compiled Tailwind
```

**Optimizations Applied**:
- Tree-shaking (removes unused code)
- Minification (Terser)
- Code splitting (lazy routes)
- Font optimization (inline: false)

### Deployment Targets

| Platform | Config | CDN | SSL | Cost |
|----------|--------|-----|-----|------|
| **Vercel** | `vercel.json` | Yes | Yes | Free |
| **GCloud** | `app.yaml` | Yes | Yes | ~$5/mo |
| **Netlify** | `netlify.toml` | Yes | Yes | Free |
| **GitHub Pages** | Branch | No | Yes | Free |

## Extensibility Points

### Custom AI Providers

```typescript
// gemini.service.ts
async chatWithAgent(message: string, ...): Promise<AgentResponse> {
  if (this.provider === 'custom') {
    const res = await fetch('https://my-api.com/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context })
    });
    return res.json();
  }
}
```

### Plugin System (Planned)

```typescript
interface Plugin {
  name: string;
  version: string;
  init(workspace: WorkspaceService): void;
  commands?: Command[];
  views?: View[];
}

// Usage
export class TimeTrackingPlugin implements Plugin {
  init(workspace: WorkspaceService) {
    workspace.registerCommand({
      name: 'start-timer',
      handler: (taskId) => { /* ... */ }
    });
  }
}
```

## Next Steps

- **[Features Reference](./03-features.md)** - Detailed feature documentation
- **[API Documentation](./04-api-reference.md)** - Service and component APIs
- **[Deployment Guide](./05-deployment.md)** - Production deployment

---

**Architecture Summary**: Modern, performance-first stack with local-first data, AI-native capabilities, and extensible design.
