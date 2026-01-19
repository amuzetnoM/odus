# API Reference

![API](https://img.shields.io/badge/API-Documentation-blue?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.4.0-green?style=flat-square)

Complete API reference for ODUS services and components.

---

## Core Services

### WorkspaceService

Provides unified workspace context for AI and cross-view integration.

#### Methods

##### `getAIContext(): string`
Returns a compact JSON string containing the complete workspace state for AI consumption.

**Returns:** JSON string with projects, tasks, mind map nodes, files, timeline, and relationships.

**Example:**
```typescript
const workspaceService = inject(WorkspaceService);
const context = workspaceService.getAIContext();
// Use in AI prompts
```

##### `getFullSnapshot(): WorkspaceSnapshot`
Returns the complete computed workspace snapshot.

**Returns:** `WorkspaceSnapshot` object with all workspace data.

##### `storeAIMemory(context: string, reasoning: string, outcome: string): Promise<void>`
Stores AI interaction in IndexedDB for future learning.

**Parameters:**
- `context`: The context of the interaction
- `reasoning`: AI's reasoning process
- `outcome`: Result of the interaction

##### `getAIMemory(): Promise<any[]>`
Retrieves all stored AI memories from IndexedDB.

**Returns:** Array of AI memory objects.

---

### ProjectService

Manages projects and tasks with dependency tracking.

#### Signals

##### `projects: Signal<Project[]>`
Read-only signal containing all projects.

##### `activeProjectIds: Signal<string[]>`
IDs of currently active (visible) projects.

##### `allTasks: Signal<Task[]>`
Computed signal containing all tasks across all projects with metadata.

##### `metrics: Signal<Metrics>`
Computed workspace metrics (health, completion rate, etc.).

#### Methods

##### `addProject(title: string, description: string, tasks: Partial<Task>[]): Promise<Project>`
Creates a new project with tasks.

**Parameters:**
- `title`: Project name
- `description`: Project description
- `tasks`: Array of task objects (with optional fields)

**Returns:** The created project with generated IDs.

**Important:** Task IDs and `dependencyIds` are preserved if provided.

##### `updateTask(projectId: string, taskId: string, updates: Partial<Task>): void`
Updates a task with partial data.

##### `deleteTask(projectId: string, taskId: string): void`
Permanently removes a task.

##### `addComment(projectId: string, taskId: string, text: string): void`
Adds a comment to a task with current user information.

---

### GeminiService

AI service providing generation, analysis, and chat capabilities.

#### Methods

##### `generateProjectStructure(userPrompt: string): Promise<any>`
Generates a complete project structure from a natural language prompt.

**Parameters:**
- `userPrompt`: User's project description

**Returns:** Object with `{ title, description, tasks }` where tasks include dependencies.

**Features:**
- Enforced priority distribution (20-35% high, 45-65% medium, 15-30% low)
- Automatic dependency generation
- Fallback dependency chains for high-priority tasks

##### `analyzeRepoAndPlan(repoName: string, fileStructure: string, commitHistory: string, readme: string | null, packageJson: string | null): Promise<Task[]>`
Analyzes a GitHub repository and generates actionable tasks.

**Parameters:**
- `repoName`: Repository name
- `fileStructure`: File tree structure
- `commitHistory`: Recent commits
- `readme`: README content (optional)
- `packageJson`: package.json content (optional)

**Returns:** Array of tasks with dependencies, priorities, and scheduling.

##### `chatWithAgent(message: string, contextData: string, history: Content[], userName: string): Promise<AgentResponse>`
Conversational interface with tool calling capabilities.

**Parameters:**
- `message`: User message
- `contextData`: Workspace context JSON
- `history`: Previous conversation history
- `userName`: Current user's name

**Returns:** `AgentResponse` with text or tool call.

**Available Tools:**
- `create_project`
- `create_task`
- `update_task_status`
- `create_file`
- `create_mind_node`
- `navigate`
- `delete_project`
- `delete_task`

---

### MindService

Manages the knowledge graph (Mind Board).

#### Signals

##### `nodes: Signal<MindNode[]>`
Read-only signal containing all mind map nodes.

#### Methods

##### `addNode(content: string, position?: {x: number, y: number}): Promise<void>`
Creates a new mind map node with AI analysis.

**Parameters:**
- `content`: Node content
- `position`: Optional x/y coordinates

**AI Features:**
- Generates title from content
- Extracts tags
- Auto-links to related nodes

##### `updateNode(id: string, updates: Partial<MindNode>): void`
Updates a node's properties.

##### `connectNodesManual(sourceId: string, targetId: string): void`
Creates a bidirectional manual link between nodes.

---

### PersistenceService

IndexedDB wrapper for local-first data storage.

#### Stores

- `repos`: GitHub repository data
- `drive_files`: File storage
- `ai_memory`: AI interaction logs
- `repo_dependency_index`: Project dependency graphs

#### Methods

##### `saveRepoData(repoId: number, data: any): Promise<void>`
Stores repository snapshot.

##### `logAiReasoning(context: string, reasoning: string, outcome: string): Promise<void>`
Logs AI decision-making process.

##### `getAllFiles(): Promise<any[]>`
Retrieves all stored files.

##### `resetDatabase(): Promise<void>`
Completely wipes IndexedDB (use with caution).

---

## Component APIs

### AI Agent Component

#### Outputs
None (uses internal state management)

#### Methods

##### `sendMessage(): Promise<void>`
Sends user message to AI with full workspace context.

**Internal Flow:**
1. Builds workspace context via `WorkspaceService`
2. Calls `GeminiService.chatWithAgent`
3. Handles tool calls or displays response
4. Stores interaction in AI memory

---

### Project Board Component

#### Inputs
- `@Input() project: Project` - Project to display

#### Outputs
- `@Output() close: EventEmitter<string>` - Emits project ID when closed

---

### Mind Board Component

#### Features
- Double-click canvas to create node
- Drag nodes to reposition
- Click node to edit
- Force-directed graph layout

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
  startDate?: string;       // ISO date
  endDate?: string;         // ISO date
  createdAt: string;        // ISO timestamp
  tags?: string[];
  dependencyIds?: string[]; // Task IDs this depends on
  comments?: Comment[];
  inFocusList?: boolean;
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
  color?: string;           // Hex color
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

---

## Constants

### Priority Distribution
```typescript
const PRIORITY_DISTRIBUTION = {
  HIGH: { MIN: 0.20, MAX: 0.35, TARGET: 0.25 },
  MEDIUM: { MIN: 0.45, MAX: 0.65, TARGET: 0.55 },
  LOW: { MIN: 0.15, MAX: 0.30, TARGET: 0.20 }
};
```

### Task Duration
```typescript
const TASK_DURATION = {
  DEFAULT: 4,
  MIN_RANDOM: 3,
  MAX_RANDOM: 6
};
```

---

## Error Handling

All async methods return Promises that should be handled with try/catch:

```typescript
try {
  const project = await projectService.addProject(title, desc, tasks);
} catch (error) {
  console.error('Failed to create project:', error);
  // Handle error appropriately
}
```

---

## Best Practices

1. **Always use WorkspaceService for AI context** - It provides unified, relationship-aware data
2. **Preserve task IDs when creating projects** - Dependencies rely on consistent IDs
3. **Use signals for reactive updates** - Don't mutate state directly
4. **Store AI interactions** - Use `WorkspaceService.storeAIMemory` for learning
5. **Handle async operations** - All AI and persistence calls are asynchronous

---

## Migration Notes

### From v1.3 to v1.4

**Breaking Changes:**
- None

**New Features:**
- `WorkspaceService` for unified context
- `create_mind_node` AI tool
- Enhanced task dependency generation
- AI memory persistence

**Deprecated:**
- None

---

For implementation examples, see the [Getting Started Guide](./getting-started.md).
