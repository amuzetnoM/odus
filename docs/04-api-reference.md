---
title: API Reference
description: Complete TypeScript API documentation for services and components
version: 1.0.0-beta
last_updated: 2026-01-19
---

![API](https://img.shields.io/badge/API-Documentation-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)
![Version](https://img.shields.io/badge/Version-1.0.0--beta-green?style=flat-square)

## Core Services API

### WorkspaceService

**Purpose**: Unified workspace context for AI and cross-view integration.

#### Signals

```typescript
readonly workspaceSnapshot: Signal<WorkspaceSnapshot>
```
Computed snapshot of entire workspace. Auto-updates on any data change.

#### Methods

##### `getAIContext(): string`
Returns compact JSON string for AI consumption.

**Returns**: Stringified `WorkspaceSnapshot`

**Example**:
```typescript
const workspace = inject(WorkspaceService);
const context = workspace.getAIContext();
await gemini.chatWithAgent(message, context, history, user);
```

##### `getFullSnapshot(): WorkspaceSnapshot`
Returns complete workspace object.

**Returns**: `WorkspaceSnapshot` with projects, tasks, mind nodes, files, timeline, relationships

##### `storeAIMemory(context: string, reasoning: string, outcome: string): Promise<void>`
Persists AI interaction to IndexedDB.

**Parameters**:
- `context`: Interaction context
- `reasoning`: AI's decision process
- `outcome`: Result of interaction

##### `getAIMemory(): Promise<any[]>`
Retrieves all stored AI memories.

**Returns**: Array of memory objects

---

### ProjectService

**Purpose**: Project and task CRUD operations with dependency tracking.

#### Signals

```typescript
readonly projects: Signal<Project[]>
readonly activeProjectIds: Signal<string[]>
readonly personalTasks: Signal<Task[]>
readonly allTasks: Signal<Task[]>
readonly metrics: Signal<Metrics>
```

#### Methods

##### `addProject(title: string, description: string, tasks: Partial<Task>[]): Promise<Project>`

Creates new project with tasks. Preserves task IDs if provided.

**Parameters**:
- `title`: Project name
- `description`: Project description
- `tasks`: Array of task objects (partial allowed)

**Returns**: Created project with generated IDs

**Example**:
```typescript
const project = await projectService.addProject(
  'Mobile App',
  'iOS and Android launch',
  [
    { title: 'Setup repo', priority: 'high', startDate: '2024-01-15' },
    { title: 'Design UI', priority: 'medium', dependencyIds: [task1.id] }
  ]
);
```

##### `updateTask(projectId: string, taskId: string, updates: Partial<Task>): void`

Updates task with partial data.

**Parameters**:
- `projectId`: Project containing task
- `taskId`: Task to update
- `updates`: Partial task object (only changed fields)

**Example**:
```typescript
projectService.updateTask('proj-123', 'task-456', {
  status: 'in-progress',
  priority: 'high',
  endDate: '2024-02-01'
});
```

##### `deleteTask(projectId: string, taskId: string): void`

Permanently removes task.

##### `addComment(projectId: string, taskId: string, text: string): void`

Adds comment with current user info.

##### `normalizeTask(task: Partial<Task>): Partial<Task>` (Private)

Sanitizes task fields:
- Strips markdown from titles
- Truncates long titles (80 chars)
- Validates dates (YYYY-MM-DD)
- Ensures endDate ≥ startDate

---

### GeminiService

**Purpose**: AI operations with multi-provider support.

#### Methods

##### `generateProjectStructure(userPrompt: string): Promise<any>`

Generates complete project from natural language.

**Parameters**:
- `userPrompt`: User's description

**Returns**: `{ title, description, tasks: Task[] }`

**Features**:
- Enforced priority distribution
- Automatic dependencies
- Date scheduling
- Task normalization

**Example**:
```typescript
const project = await gemini.generateProjectStructure(
  'Create a SaaS marketing campaign'
);
// project.tasks.length >= 8
// Dependencies created automatically
```

##### `analyzeRepoAndPlan(repoName: string, fileStructure: string, commitHistory: string, readme: string | null, packageJson: string | null, additionalContext?: RepoAnalysisContext): Promise<Task[]>`

Analyzes GitHub repository and generates tasks.

**Parameters**:
- `repoName`: Repository name
- `fileStructure`: Categorized file tree
- `commitHistory`: Recent commits
- `readme`: README content (optional)
- `packageJson`: package.json content (optional)
- `additionalContext`: Additional config files, language, stars

**Returns**: Array of tasks with dependencies, priorities, scheduling

**Example**:
```typescript
const tasks = await gemini.analyzeRepoAndPlan(
  'my-app',
  fileStructure,
  commits,
  readme,
  packageJson,
  {
    language: 'TypeScript',
    stars: 150,
    pyproject: null,
    cargoToml: null,
    goMod: null
  }
);
```

##### `chatWithAgent(message: string, contextData: string, history: Content[], userName: string): Promise<AgentResponse>`

Conversational interface with tool calling.

**Parameters**:
- `message`: User message
- `contextData`: Workspace context JSON
- `history`: Previous conversation
- `userName`: Current user

**Returns**: `AgentResponse` with text or tool call

**Tool Call Example**:
```typescript
const response = await gemini.chatWithAgent(
  'Create a new task for API documentation',
  workspace.getAIContext(),
  chatHistory,
  'John'
);

if (response.toolCall) {
  // response.toolCall = { type: 'create_task', data: {...} }
}
```

##### `curateFocusList(allTasks: any[]): Promise<{ taskIds: string[], reasoning: string }>`

AI selects top 5 most important tasks.

**Parameters**:
- `allTasks`: Array of all non-done tasks

**Returns**: Task IDs and reasoning

##### `getDailyBriefing(dayTasks: any, metrics: any): Promise<DayBriefing>`

Generates structured daily summary.

**Parameters**:
- `dayTasks`: Tasks for the day (starting, due, ongoing)
- `metrics`: Workspace metrics

**Returns**: `{ briefing: string, dayType: 'FOCUS' | 'CRUNCH' | ... }`

---

### MindService

**Purpose**: Knowledge graph management.

#### Signals

```typescript
readonly nodes: Signal<MindNode[]>
```

#### Methods

##### `addNode(content: string, position?: {x: number, y: number}): Promise<void>`

Creates mind map node with AI analysis.

**Parameters**:
- `content`: Node content
- `position`: Optional coordinates

**AI Features**:
- Generates title from content
- Extracts tags
- Auto-links to related nodes
- Stores properties

##### `updateNode(id: string, updates: Partial<MindNode>): void`

Updates node properties.

##### `connectNodesManual(sourceId: string, targetId: string): void`

Creates bidirectional manual link.

---

### GithubService

**Purpose**: GitHub API integration.

#### Methods

##### `setToken(token: string): void`

Stores GitHub Personal Access Token.

##### `getUserRepos(): Promise<any[]>`

Fetches user's repositories (sorted by updated, 100 max).

##### `getRepoCommits(owner: string, repo: string): Promise<any[]>`

Gets recent commits (20 max).

##### `getRepoTree(owner: string, repo: string, branch?: string): Promise<any>`

Fetches file tree (recursive).

##### `getFileContent(owner: string, repo: string, path: string): Promise<string | null>`

Retrieves file content (base64 decoded).

---

### PersistenceService

**Purpose**: IndexedDB wrapper for local-first storage.

#### Stores

- `repos`: GitHub cache
- `drive_files`: File storage
- `ai_memory`: AI interactions
- `repo_dependency_index`: Dependency graphs

#### Methods

##### `saveRepoData(repoId: number, data: any): Promise<void>`

Stores repository snapshot.

##### `logAiReasoning(context: string, reasoning: string, outcome: string): Promise<void>`

Persists AI decision-making.

##### `getAllFiles(): Promise<any[]>`

Retrieves all stored files.

##### `resetDatabase(): Promise<void>`

**WARNING**: Wipes all IndexedDB data.

---

## Type Definitions

### Task

```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  startDate?: string;       // YYYY-MM-DD
  endDate?: string;         // YYYY-MM-DD
  createdAt: string;        // ISO timestamp
  tags?: string[];
  metadata?: TaskMetadata;
  dependencyIds?: string[];
  comments?: Comment[];
  attachmentIds?: string[];
  inFocusList?: boolean;
  focusIndex?: number;
}
```

### TaskMetadata

```typescript
interface TaskMetadata {
  location?: string;
  notes?: string;
  dueDate?: string;
  mindNodeId?: string;  // Linked mind node reference
}
```

### Project

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  createdAt: string;
  isArchived?: boolean;
  color?: string;  // Hex color code
}
```

### WorkspaceSnapshot

```typescript
interface WorkspaceSnapshot {
  timestamp: string;
  projects: ProjectSummary[];
  mindMap: {
    nodeCount: number;
    nodes: MindNodeSummary[];
  };
  files: FileSummary[];
  timeline: {
    today: string;
    upcomingTasks: TaskSummary[];
    overdueTasks: TaskSummary[];
  };
  metrics: Metrics;
  relationships: {
    taskToMindMap: Relationship[];
    projectToFiles: Relationship[];
  };
}
```

### MindNode

```typescript
interface MindNode {
  id: string;
  title: string;
  content: string;
  tags: string[];
  properties: Record<string, string>;
  linkedTo: string[];
  manualLinks: string[];
  position?: { x: number, y: number };
  createdAt: string;
}
```

### RepoAnalysisContext

```typescript
interface RepoAnalysisContext {
  language?: string;
  stars?: number;
  pyproject?: string | null;
  cargoToml?: string | null;
  goMod?: string | null;
  filesByType?: Record<string, string[]>;
}
```

---

## Constants

### Priority Distribution

```typescript
const PRIORITY_DISTRIBUTION = {
  HIGH: { MIN: 0.20, MAX: 0.35, TARGET: 0.25 },
  MEDIUM: { MIN: 0.45, MAX: 0.65, TARGET: 0.55 },
  LOW: { MIN: 0.15, MAX: 0.30, TARGET: 0.20 }
} as const;
```

### Critical Path Config

```typescript
const CRITICAL_PATH_CONFIG = {
  MAX_TASKS: 8,
  MIN_TASKS: 3,
  PERCENTAGE_OF_TOTAL: 0.3
} as const;
```

### File Patterns

```typescript
const FILE_PATTERNS = {
  SOURCE: /\.(ts|js|tsx|jsx|py|java|go|rs|cpp|c|cs)$/,
  TEST: /(test|spec|__tests__|tests)\//i,
  CONFIG: /\.(json|yaml|yml|toml|xml|conf|config|env)$/,
  DOCS: /\.(md|txt|rst|adoc)$/i
} as const;
```

---

## Utility Functions

### Date Utilities (`src/utils/date-utils.ts`)

##### `isValidDate(dateStr: string | undefined): boolean`

Validates YYYY-MM-DD format.

```typescript
isValidDate('2024-01-15') // true
isValidDate('01/15/2024') // false
isValidDate(undefined)    // false
```

##### `normalizeDate(dateStr: string | undefined): string | undefined`

Converts to YYYY-MM-DD.

```typescript
normalizeDate('2024-01-15T10:00:00') // '2024-01-15'
normalizeDate('invalid')             // undefined
```

##### `daysBetween(date1: Date, date2: Date): number`

Calculates days between dates.

```typescript
const days = daysBetween(new Date('2024-01-01'), new Date('2024-01-15'));
// days = 14
```

**Constant**:
```typescript
const MS_PER_DAY = 1000 * 60 * 60 * 24;
```

---

## Error Handling

All async methods return Promises. Handle with try/catch:

```typescript
try {
  const project = await projectService.addProject(title, desc, tasks);
} catch (error) {
  console.error('Failed to create project:', error);
  // Show user-friendly error message
}
```

---

## Best Practices

1. **Use WorkspaceService for AI**: Provides unified, relationship-aware context
2. **Preserve Task IDs**: Dependencies rely on consistent IDs across operations
3. **Leverage Signals**: Don't mutate state directly, use service methods
4. **Store AI Interactions**: Use `WorkspaceService.storeAIMemory` for learning
5. **Validate Dates**: Use `isValidDate()` and `normalizeDate()` from utils
6. **Handle Async Properly**: All AI and persistence calls are asynchronous

---

**Next**: [Deployment Guide](./05-deployment.md)
