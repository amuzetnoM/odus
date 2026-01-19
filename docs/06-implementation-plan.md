---
title: Implementation Plan
description: Detailed technical roadmap for ODUS enhancement features
version: 1.4.0
last_updated: 2026-01-19
---

![Roadmap](https://img.shields.io/badge/Roadmap-Strategic_Plan-purple?style=flat-square)
![Status](https://img.shields.io/badge/Status-Planning-yellow?style=flat-square)

## Overview

This document provides detailed implementation plans for enhancing ODUS capabilities. Features are organized by priority and complexity, with **collaboration and authentication deliberately placed last** to avoid blocking core feature development.

**Note**: No timelines or durations included - build at your own pace without pressure.

---

## Phase 1: Quick Wins - Core UX Improvements

### 1. Time Tracking MVP - COMPLETED

**Status**: Implemented in v1.4.0

**Implementation Details**:
- Added TimeTrackingComponent with start/stop timer functionality
- Integrated into task detail modal
- Tracks multiple sessions per task with cumulative time
- Displays elapsed time in HH:MM:SS format
- Persists time data in task metadata
- Shows time logs history with session details
- Calculates velocity metrics (hours per week)
- Estimates vs. actual comparison available

**Files Created**:
- `src/components/time-tracking.component.ts`
- `src/models/time-tracking.model.ts`

**Files Modified**:
- `src/models/task.model.ts` - Added timeTracking interface
- `src/services/project.service.ts` - Time calculation methods
- `src/components/task-detail.component.ts` - Embedded timer

### 2. Template Library - COMPLETED

**Status**: Implemented in v1.4.0

**Implementation Details**:
- Created 6 pre-built project templates
- Templates include: SaaS Launch, Mobile App Dev, Marketing Campaign, Wedding Planning, Home Renovation, Research Project
- Each template includes pre-configured tasks with dependencies, priorities, and scheduling
- Category-based filtering (Software, Marketing, Personal, Creative, Business)
- One-click project creation from templates
- Template browser UI with grid layout

**Built-in Templates**:
1. SaaS Product Launch - 12 tasks with MVP development workflow
2. Mobile App Development - 10 tasks from setup to deployment
3. Content Marketing Calendar - 8 tasks for content strategy
4. Wedding Planning - 18 tasks covering all major aspects
5. Home Renovation - 14 tasks from planning to completion
6. Research Project - 10 tasks for academic research workflow

**Files Created**:
- `src/models/template.model.ts`
- `src/services/template.service.ts`
- `src/components/template-browser.component.ts`

### 3. Recurring Tasks - COMPLETED

**Status**: Implemented in v1.4.0

**Implementation Details**:
- Added recurrence configuration to task model
- Supports daily, weekly, and monthly frequencies
- Weekly: select specific days of week (M-S)
- Monthly: select day of month (1-31)
- Background service checks hourly for due recurring tasks
- Automatically generates new instances when due
- Tracks last generation timestamp
- Optional end date for recurrence
- Links instances to parent task

**Data Model**:
```typescript
interface RecurrenceConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
  lastGenerated?: string;
}
```

**Files Created**:
- `src/services/recurrence.service.ts`
- `src/components/recurrence-editor.component.ts`

### 4. Task Automation (Rules Engine) - COMPLETED

**Status**: Implemented in v1.4.0

**Implementation Details**:
- Rules engine with trigger-condition-action pattern
- Pre-built rule templates available
- Visual rule builder interface
- Monitors task changes via signal effects
- Supports multiple trigger types and actions
- Rules can be enabled/disabled individually

**Rule Templates**:
1. "Create follow-up when done" - Auto-creates review task
2. "Add high-priority to focus" - Auto-adds to focus list
3. "Alert on due date" - Notification for upcoming deadlines
4. "Auto-archive completed" - Archives tasks after 30 days
5. "Dependency alert" - Notifies when blocker is done

**Supported Actions**:
- create_task
- update_task
- add_to_focus
- send_notification
- archive_task

**Files Created**:
- `src/models/automation.model.ts`
- `src/services/automation.service.ts`
- `src/components/automation-editor.component.ts`

### 5. File Preview (PDF/Images/Text) - COMPLETED

**Status**: Implemented in v1.4.0

**Implementation Details**:
- In-app file viewer with type detection
- Supports images (PNG, JPG, GIF, SVG), PDF, text, markdown
- Blob URL generation for secure viewing
- Modal preview interface
- Fallback to download for unsupported types
- Sanitized rendering for security

**Supported File Types**:
- Images: Rendered via `<img>` tag
- PDF: Embedded via `<iframe>` with blob URL
- Text/Markdown: Rendered with syntax highlighting
- Code: Syntax highlighting for common languages

**Files Created**:
- `src/components/file-viewer.component.ts`
- `src/services/file-preview.service.ts`

**Files Modified**:
- `src/components/views/drive-view.component.ts` - Added preview button

### 6. Advanced Analytics Dashboard - COMPLETED

**Status**: Implemented in v1.4.0

**Implementation Details**:
- Burndown charts showing sprint progress
- Velocity tracking with weekly trends
- Completion rate charts over time
- Time estimation accuracy metrics
- Task distribution analysis
- Predictive completion dates

**Chart Types**:
- Burndown Chart: Ideal vs. actual task completion
- Velocity Chart: Hours completed per week
- Completion Rate: Percentage done over time
- Accuracy Chart: Estimate vs. actual comparison

**Files Created**:
- `src/components/analytics/burndown-chart.component.ts`
- `src/components/analytics/velocity-chart.component.ts`
- `src/components/analytics/completion-rate-chart.component.ts`
- `src/components/analytics/analytics-dashboard.component.ts`
- `src/services/analytics.service.ts`
- `src/models/analytics.model.ts`

### 7. Predictive AI Features - COMPLETED

**Status**: Implemented in v1.4.0

**Implementation Details**:
- Risk detection analyzing project health
- Smart scheduling suggestions
- Missing task detection
- Bottleneck identification
- Timeline optimization recommendations

**AI Capabilities**:
- **Risk Analysis**: Detects missing tasks, overloaded phases, unrealistic timelines
- **Smart Scheduling**: Suggests optimal start dates considering dependencies and load
- **Missing Work Detection**: Identifies commonly overlooked tasks (testing, docs, QA)
- **Bottleneck Detection**: Highlights tasks blocking multiple dependencies

**Files Modified**:
- `src/services/gemini.service.ts` - Added predictive methods
- `src/components/project-board.component.ts` - Risk score display
- `src/components/views/dashboard.component.ts` - Risk alerts

### 8. GitHub Bi-Directional Sync - COMPLETED

**Status**: Implemented in v1.4.0

**Implementation Details**:
- Push task updates to GitHub issues
- Create GitHub issues from tasks
- Sync status changes bidirectionally
- Close GitHub issues when tasks completed
- Link tasks to GitHub URLs
- Real-time sync status indicators

**Capabilities**:
- Create GitHub issue from ODUS task
- Update GitHub issue when task changes (title, description, status)
- Close GitHub issue when task marked done
- Sync GitHub issue changes back to ODUS
- Show GitHub issue number and link in task card

**Files Created**:
- `src/services/github-sync.service.ts`

**Files Modified**:
- `src/services/github.service.ts` - Added issue CRUD methods
- `src/components/task-detail.component.ts` - GitHub sync UI
- `src/models/task.model.ts` - Added GitHub metadata

### 9. GitHub Projects Integration - COMPLETED

**Status**: Implemented in v1.4.0

**Implementation Details**:
- Connect ODUS projects to GitHub Projects (Beta)
- Sync project boards bidirectionally
- Map ODUS tasks to GitHub project items
- Sync status across platforms
- Preserve custom fields and metadata

**Features**:
- Link ODUS project to GitHub Project
- Create GitHub project items from tasks
- Sync task status to project board
- Import existing project items
- Real-time sync status

**Files Created**:
- `src/services/github-projects.service.ts`
- `src/components/github-projects-config.component.ts`

### 10. Task Gestures (Double-Click/Long-Press → Mind Node)

**Goal**: Create mind map entries directly from tasks via intuitive gestures.

**Files to Create/Modify**:
- `src/components/task-card.component.ts` - Add event listeners
- `src/components/views/dashboard.component.ts` - Handler method
- `src/components/views/kanban-board.component.ts` - Handler method

**Implementation Summary**:
```typescript
// Desktop: Double-click task card
@HostListener('dblclick')
onDoubleClick() {
  this.createMindNodeFrom Task.emit(this.task());
}

// Mobile: Long-press (500ms)
@HostListener('touchstart/touchend')
// Track press duration, emit if >= 500ms

// Handler creates mind node with task context
// Links bidirectionally (task.metadata.mindNodeId + node.properties.taskReferences)
```

---

### 2. Markdown Everywhere (AI-Generated Content)

**Goal**: AI generates markdown-formatted task descriptions and mind node content.

**Files to Modify**:
- `src/services/gemini.service.ts` - Update all AI prompts
- `src/components/task-detail.component.ts` - Enhanced parser
- `src/components/views/mind-board.component.ts` - Apply parser

**Enhanced Markdown Parser** (adds to existing):
```typescript
parseMarkdown(text: string): string {
  return text
    // Existing: h1-h3, bold, italic, lists
    // NEW additions:
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="..."><code>$2</code></pre>') // Code blocks
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="...">$1</a>') // Links
    .replace(/`([^`]+)`/g, '<code class="...">$1</code>'); // Inline code
}
```

**AI Prompt Update**:
```typescript
// Add to system prompts:
"For EACH task, format description in MARKDOWN:
- ## Headers for sections
- **Bold** for key terms
- Lists for steps
- ```code blocks``` for technical details
- [Links](url) where relevant"
```

---

### 3. Time Tracking MVP

**Goal**: Track time spent on tasks, calculate velocity.

**New Data Model**:
```typescript
interface Task {
  timeTracking?: {
    estimate?: number;        // hours
    actualTime: number;       // accumulated hours
    sessions: TimeSession[];
    startedAt?: string;
  };
}

interface TimeSession {
  id: string;
  startTime: string;  // ISO
  endTime?: string;
  duration: number;   // milliseconds
  note?: string;
}
```

**Files to Create**:
- `src/components/time-tracker.component.ts` - Start/stop timer UI
- `src/components/velocity-chart.component.ts` - Weekly velocity display

**Files to Modify**:
- `src/models/task.model.ts` - Add timeTracking interface
- `src/services/project.service.ts` - Add calculateVelocity() method
- `src/components/task-detail.component.ts` - Embed time tracker

**Key Features**:
- Start/stop timer with live elapsed time display
- Multiple sessions per task (cumulative)
- Velocity calculation: hours completed per week
- Estimate vs. actual comparison
- Accuracy metric: avg(min(estimate/actual, actual/estimate))

---

### 4. Template Library

**Goal**: Pre-built project templates for common workflows.

**New Data Model**:
```typescript
interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'software' | 'marketing' | 'personal' | 'creative' | 'business';
  icon: string;  // emoji
  tasks: Partial<Task>[];
  tags: string[];
}
```

**Built-in Templates** (initial set):
1. **SaaS Product Launch** - Market research to MVP to Beta to Launch (12-15 tasks)
2. **Mobile App Development** - Setup to Design to Features to Testing to Deploy (10-12 tasks)
3. **Content Marketing Calendar** - Planning to Creation to Distribution (8-10 tasks)
4. **Wedding Planning** - Budget to Venue to Invitations to Day-of (15-20 tasks)
5. **Home Renovation** - Planning to Permits to Construction to Cleanup (12-15 tasks)

**Files to Create**:
- `src/models/template.model.ts`
- `src/services/template.service.ts` - BUILTIN_TEMPLATES array
- `src/components/template-browser.component.ts` - Grid UI with categories

**UI Flow**:
- Button in sidebar: "New from Template"
- Category filter tabs (All, Software, Marketing, etc.)
- Grid of template cards (icon, name, description, task count)
- Click → creates project with all tasks

---

### 5. Recurring Tasks

**Goal**: Tasks that repeat on schedules (daily, weekly, monthly).

**New Data Model**:
```typescript
interface Task {
  recurrence?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;         // e.g., every 2 weeks
    daysOfWeek?: number[];    // [0-6] for weekly
    dayOfMonth?: number;      // [1-31] for monthly
    endDate?: string;
    lastGenerated?: string;
  };
  isRecurringInstance?: boolean;
  recurringParentId?: string;
}
```

**Files to Create**:
- `src/services/recurrence.service.ts` - Background scheduler (checks hourly)
- `src/components/recurrence-editor.component.ts` - UI in task detail modal

**Logic**:
- Service runs every hour, checks all tasks with `recurrence.enabled`
- Generates new instance if conditions met (day/time matches + not already generated)
- New instance: copies parent task, sets status=todo, links via recurringParentId
- Updates parent's `lastGenerated` timestamp

**UI**:
- Checkbox: "Repeat this task"
- Dropdown: Daily/Weekly/Monthly
- Weekly: Day-of-week button grid (M T W T F S S)
- End date picker (optional)

---

### 6. Task Automation (Rules Engine)

**Goal**: "When X happens, do Y" automation rules.

**Data Model**:
```typescript
interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: { type: 'task_status_changed' | 'task_created' | 'due_date_approaching' };
  conditions: { field: 'status' | 'priority', operator: 'equals', value: any }[];
  actions: { type: 'create_task' | 'add_to_focus' | 'send_notification', params: any }[];
}
```

**Pre-built Templates**:
1. "Create follow-up when done" - status=done → create task "Review: [title]"
2. "Add high-priority to focus" - priority=high → add_to_focus
3. "Alert on due date" - due_date=today → send_notification

**Files to Create**:
- `src/models/automation.model.ts`
- `src/services/automation.service.ts` - Rule execution engine
- `src/components/automation-editor.component.ts` - Visual rule builder

**Execution Flow**:
- Service monitors task changes via signal effects
- On change → evaluate all enabled rules
- For matching rules → check conditions → execute actions
- Actions: create_task, update_task, add_to_focus, send_notification

---

## Phase 2: Analytics & Intelligence

### 7. Advanced Analytics Dashboard

**Goal**: Burndown charts, velocity tracking, predictive insights.

**New Components**:
- `BurndownChartComponent` - Sprint progress (ideal vs. actual)
- `VelocityChartComponent` - Hours/week trend
- `CompletionRateChartComponent` - % done over time
- `AnalyticsDashboardComponent` - Unified view

**Data Calculations**:
```typescript
// Burndown: total tasks - completed per day
// Velocity: sum(timeTracking.actualTime) per week
// Completion rate: done / total, grouped by week
```

**Visualization**: Use D3.js or Chart.js for rendering

**Files to Create**:
- `src/models/analytics.model.ts`
- `src/services/analytics.service.ts`
- `src/components/analytics/*.component.ts` (4 chart components)

---

### 8. Predictive AI Features

**Goal**: AI predicts risks, suggests optimizations, detects missing work.

**Capabilities**:

**Risk Detection**:
```typescript
async analyzeProjectRisks(project: Project): Promise<RiskAnalysis> {
  // AI analyzes for:
  // - Missing critical tasks (testing, QA, docs)
  // - Overloaded phases (too many parallel tasks)
  // - Unrealistic timelines (tight schedules)
  // - Missing dependencies (should-depend-on)
  // - Bottleneck tasks (many dependents)
  
  // Returns: { risks: [], score: 0-10 }
}
```

**Smart Scheduling**:
```typescript
async suggestOptimalSchedule(tasks: Task[]): Promise<ScheduleSuggestion> {
  // AI suggests start dates considering:
  // - Dependencies
  // - Priority
  // - Load balancing (8h/day max)
  // - Realistic timelines
}
```

**Missing Work Detection**:
```typescript
async detectMissingTasks(project: Project): Promise<Task[]> {
  // AI suggests missing tasks common to project type:
  // Software: tests, docs, code review, deployment
  // Marketing: analytics, A/B testing, metrics
  // Personal: buffer time, contingency
}
```

**Files to Modify**:
- `src/services/gemini.service.ts` - Add 3 new methods
- `src/components/project-board.component.ts` - Show risk score badge
- `src/components/views/dashboard.component.ts` - Risk alerts panel

---

## Phase 3: Integrations & Extensions

### 9. GitHub Bi-Directional Sync

**Goal**: Push task updates back to GitHub issues/PRs.

**New Capabilities**:
- Create GitHub issue from task
- Update GitHub issue when task changes
- Close GitHub issue when task marked done
- Sync GitHub issue changes back to task

**Data Model Extension**:
```typescript
interface TaskMetadata {
  githubIssueNumber?: number;
  githubRepo?: string;  // "owner/repo"
  githubUrl?: string;
}
```

**Files to Create**:
- `src/services/github-sync.service.ts`

**Files to Modify**:
- `src/services/github.service.ts` - Add createIssue, updateIssue, closeIssue methods
- `src/components/views/github-view.component.ts` - "Sync" button
- `src/components/task-detail.component.ts` - GitHub link icon

**API Methods Needed**:
```typescript
// POST /repos/{owner}/{repo}/issues
// PATCH /repos/{owner}/{repo}/issues/{number}
// PATCH /repos/{owner}/{repo}/issues/{number} (state: closed)
```

---

### 10. File Preview (PDF/Images)

**Goal**: View files in-app without downloading.

**Supported Types**:
- Images: PNG, JPG, GIF, SVG (via <img>)
- PDF: via <iframe> with blob URL
- Text: Plain text, markdown (rendered)
- Unsupported: Show download button

**Files to Create**:
- `src/components/file-viewer.component.ts` - Modal with preview

**Implementation**:
```typescript
// Create blob URL from file content
const blob = new Blob([file.content], { type: file.mimeType });
const url = URL.createObjectURL(blob);

// Display based on type:
// - Image: <img [src]="url" />
// - PDF: <iframe [src]="sanitizedUrl" />
// - Text: <pre>{{ content }}</pre>
```

**Files to Modify**:
- `src/components/views/drive-view.component.ts` - Add "Preview" button

---

## Phase 4: Advanced AI Capabilities

### 11. Multi-Modal AI (Voice Input)

**Goal**: Create tasks via voice commands using Web Speech API.

**Files to Create**:
- `src/services/voice.service.ts` - webkitSpeechRecognition wrapper
- `src/components/voice-command.component.ts` - Microphone button with animation

**Implementation**:
```typescript
// Web Speech API (browser native, no dependencies)
const recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.interimResults = true;

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  // Send to AI agent for processing
};

// UI: Microphone button
// Click → start listening (animate pulse)
// Click again → stop, process transcript
```

**Voice Commands**:
- "Create a task: Deploy frontend to production"
- "Add high priority task for code review"
- "Show my focus list"
- "Navigate to calendar"

---

### 12. Semantic Search

**Goal**: Search tasks/nodes/files by meaning, not just keywords.

**Technology**: Gemini Embedding API for vector embeddings

**Files to Create**:
- `src/services/embedding.service.ts` - Embedding cache + similarity
- `src/components/semantic-search.component.ts` - Search UI with results

**Flow**:
1. User types query: "authentication logic"
2. Get query embedding via API
3. Compare with embeddings of all tasks/nodes (cosine similarity)
4. Return top 10 results with >50% similarity

**Caching Strategy**:
- Cache embeddings in Map (memory)
- Only re-embed when content changes
- ~$0.0001 per 1K tokens (cheap)

---

## Phase 5: Collaboration (Final Phase)

### 13. Real-Time Collaboration

**Goal**: Multi-user workspaces with conflict-free editing.

**Technology**: **Y.js** (CRDT) + **WebRTC** (P2P, no server needed)

**Why Last**: Blocks all other features if built early (data model changes, testing complexity)

**Dependencies to Add**:
```json
{
  "yjs": "^13.6.0",
  "y-webrtc": "^10.2.5"
}
```

**Files to Create**:
- `src/services/collaboration.service.ts` - Y.js + WebRTC provider
- `src/components/user-presence.component.ts` - Show active users

**Key Features**:
- **CRDT**: Automatic conflict resolution (no merge logic needed)
- **P2P Sync**: WebRTC for direct browser-to-browser sync
- **Awareness**: See who's viewing what in real-time
- **Cursor Sharing**: Show other users' selections

**Setup**:
```typescript
const ydoc = new Y.Doc();
const provider = new WebrtcProvider(workspaceId, ydoc, {
  signaling: ['wss://signaling.yjs.dev'], // Free signaling server
  password: null // Add encryption later
});

const projectsMap = ydoc.getMap('projects');
projectsMap.observe(event => {
  // Sync changes to local state
});
```

---

### 14. Authentication & User Management

**Goal**: User accounts, workspace ownership, sharing.

**Technology**: **Firebase Auth** (managed service, no backend needed)

**Why Last**: Blocks development if added early (requires auth everywhere)

**Dependencies to Add**:
```json
{
  "firebase": "^10.7.0"
}
```

**Files to Create**:
- `src/services/auth.service.ts` - Firebase Auth wrapper
- `src/services/workspace-sharing.service.ts` - Firestore for sharing
- `src/components/auth/login.component.ts`
- `src/components/auth/signup.component.ts`
- `src/components/workspace-sharing-modal.component.ts`

**Features**:
- Email/password authentication
- Workspace ownership
- Share workspace with users (viewer/editor/admin roles)
- Invitation system via email

**Storage**:
- Firebase Auth: User accounts
- Firestore: Workspace shares, permissions
- IndexedDB: Still primary storage (sync to Firestore optional)

---

## Implementation Priorities

### Tier 1: Self-Contained (Start Here)
No dependencies on other features:

1. [COMPLETED] Task Gestures
2. [COMPLETED] Markdown Everywhere
3. [COMPLETED] Time Tracking
4. [COMPLETED] Templates
5. [COMPLETED] Recurring Tasks
6. [COMPLETED] File Preview
7. [PLANNED] Voice Input

### Tier 2: Interconnected
Requires Tier 1 features:

8. [COMPLETED] Automation (needs time tracking, templates)
9. [COMPLETED] Analytics (needs time tracking)
10. [COMPLETED] Predictive AI (needs analytics)
11. [PLANNED] Semantic Search (standalone but complex)
12. [COMPLETED] GitHub Bi-Sync (extends existing)

### Tier 3: Infrastructure (Build Last)
Blocks other features if done early:

13. [PLANNED] Collaboration (Y.js + WebRTC)
14. [PLANNED] Authentication (Firebase)

---

## Technical Considerations

### Performance
- **Web Workers**: Use for embeddings, analytics calculations
- **Virtual Scrolling**: Implement for lists >100 items (Angular CDK)
- **Lazy Loading**: Charts load only when analytics view opened
- **Debouncing**: Search, autosave (already implemented)

### Data Migration
```typescript
// Add migration service for schema changes
interface Migration {
  version: number;
  migrate: (data: any) => any;
}

// Example: Add timeTracking to existing tasks
migrations.push({
  version: 2,
  migrate: (data) => {
    data.projects.forEach(p => {
      p.tasks.forEach(t => {
        t.timeTracking = t.timeTracking || { actualTime: 0, sessions: [] };
      });
    });
    return data;
  }
});
```

### Browser Compatibility
- **Web Speech API**: Chrome/Edge only (Safari/Firefox limited)
- **WebRTC**: All modern browsers
- **IndexedDB**: All modern browsers
- **Service Workers**: All modern browsers

### Testing Strategy
- **Unit Tests**: Jest for services (calculateVelocity, automation rules)
- **E2E Tests**: Playwright for workflows (create task → start timer → mark done)
- **Visual Regression**: Chromatic/Percy for UI (optional)

---

## Notes

- **No timelines or durations** - Build at your own pace without stress
- **Collaboration + Auth last** - Deliberately kept separate to avoid blocking
- **Local-first priority** - All features work offline first, sync later (optional)
- **Incremental rollout** - Each feature ships independently
- **User feedback loops** - Test with real users before moving to next phase

This plan takes ODUS from **90% complete** to **200% potential**. Focus on quick wins (Tier 1) to build momentum, then tackle complex features (Tier 2-3).

**Recommendation**: Start with **Task Gestures** (easiest) and **Markdown Everywhere** (high impact, low effort).
