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

### 1. Time Tracking System

**Comprehensive Time Management**: Track time spent on every task with built-in timer and session logging.

**Features**:
- **Start/Stop Timer**: One-click time tracking with live elapsed time display (HH:MM:SS format)
- **Session Logging**: Multiple time sessions per task with start/end timestamps
- **Cumulative Tracking**: Automatic calculation of total time across all sessions
- **Session History**: View all past sessions with notes and durations
- **Velocity Metrics**: Calculate hours completed per week for sprint planning
- **Estimates vs. Actuals**: Compare estimated time with actual time spent
- **Accuracy Tracking**: Performance metrics for estimation improvement

**Data Model**:
```typescript
interface TimeTracking {
  estimate?: number;        // Estimated hours
  actualTime: number;       // Accumulated hours
  sessions: TimeSession[];  // All tracking sessions
  startedAt?: string;       // Current session start
}
```

**Integration**:
- Embedded in task detail modal
- Displayed on task cards
- Used for velocity calculations
- Feeds into analytics dashboard

### 2. Template Library

**Pre-Built Project Templates**: 6 professionally designed templates for common workflows.

**Available Templates**:

1. **SaaS Product Launch** (12 tasks)
   - Market research and validation
   - MVP development phases
   - Beta testing workflow
   - Launch and marketing
   - Post-launch monitoring

2. **Mobile App Development** (10 tasks)
   - Project setup and architecture
   - UI/UX design phases
   - Feature implementation
   - Testing and QA
   - App store deployment

3. **Content Marketing Calendar** (8 tasks)
   - Strategy and planning
   - Content creation workflow
   - Distribution channels
   - Analytics and optimization

4. **Wedding Planning** (18 tasks)
   - Budget and venue
   - Vendors and contracts
   - Invitations and RSVPs
   - Day-of coordination
   - Post-wedding tasks

5. **Home Renovation** (14 tasks)
   - Planning and design
   - Permits and approvals
   - Construction phases
   - Cleanup and final touches

6. **Research Project** (10 tasks)
   - Literature review
   - Methodology design
   - Data collection
   - Analysis and writing
   - Publication process

**Features**:
- Category-based filtering (Software, Marketing, Personal, Creative, Business)
- One-click project creation
- Pre-configured dependencies
- Realistic time estimates
- Priority distribution
- Customizable after creation

**Usage**:
1. Click "New from Template" button
2. Browse by category or view all
3. Select template
4. Customize project name and dates
5. Generate project with all tasks

### 3. Recurring Tasks

**Automated Task Repetition**: Create tasks that repeat on daily, weekly, or monthly schedules.

**Frequency Options**:
- **Daily**: Every N days (e.g., every 1 day, every 3 days)
- **Weekly**: Select specific days of week (Monday through Sunday)
- **Monthly**: Select day of month (1st through 31st)

**Configuration**:
- **Interval**: How often to repeat (e.g., every 2 weeks)
- **Days of Week**: For weekly tasks, select specific days
- **Day of Month**: For monthly tasks, choose date
- **End Date**: Optional stop date for recurrence
- **Auto-Generation**: Background service creates instances automatically

**How It Works**:
1. Configure recurrence in task detail modal
2. Background service checks hourly for due recurrences
3. New task instance created automatically when due
4. Instance links to parent task
5. Original task tracks last generation timestamp

**Use Cases**:
- Daily standups
- Weekly planning sessions
- Monthly reports
- Quarterly reviews
- Annual compliance tasks

### 4. Task Automation (Rules Engine)

**Workflow Automation**: Create custom rules with trigger-condition-action patterns.

**Rule Components**:

**Triggers**:
- Task status changed (todo/in-progress/done)
- Task created
- Due date approaching
- Priority changed
- Task completed

**Conditions**:
- Status equals/not equals
- Priority level matches
- Has specific tags
- Due within timeframe
- Assigned to specific project

**Actions**:
- Create follow-up task
- Update task properties
- Add to focus list
- Send notification
- Archive task
- Create mind node

**Pre-Built Rule Templates**:
1. "Create review task when done" - Auto-creates "Review: [title]" task
2. "Add high-priority to focus" - Automatically adds high-priority tasks to focus list
3. "Alert on due date" - Notification 1 day before due date
4. "Auto-archive completed" - Archives tasks 30 days after completion
5. "Dependency alert" - Notifies when blocking task is completed

**Visual Rule Builder**:
- Drag-and-drop interface
- Template selection
- Custom rule creation
- Enable/disable toggle
- Rule execution log

**Example Rules**:
```typescript
// When task marked done, create review task
{
  trigger: { type: 'task_status_changed' },
  conditions: [{ field: 'status', operator: 'equals', value: 'done' }],
  actions: [{ 
    type: 'create_task', 
    params: { 
      title: 'Review: {{original.title}}',
      priority: 'medium',
      dueDate: '{{7_days_from_now}}'
    }
  }]
}
```

### 5. File Preview System

**In-App File Viewing**: View files without downloading, with support for multiple formats.

**Supported Formats**:

**Images**:
- PNG, JPG, JPEG, GIF, SVG
- Rendered in modal with zoom controls
- High-resolution support

**PDF Documents**:
- Embedded viewer via iframe
- Secure blob URL rendering
- Scroll and zoom support
- No external dependencies

**Text Files**:
- Plain text (.txt)
- Markdown (.md) with rendering
- Code files with syntax highlighting
- JSON with formatting

**Security**:
- Blob URL generation for isolation
- Sanitized content rendering
- XSS prevention
- Memory cleanup after viewing

**Interface**:
- Modal preview window
- File type detection
- Fallback to download for unsupported types
- Close/download buttons
- Keyboard navigation (Escape to close)

### 6. Advanced Analytics Dashboard

**Data-Driven Insights**: Comprehensive analytics with multiple chart types.

**Chart Types**:

**1. Burndown Chart**:
- Sprint progress visualization
- Ideal vs. actual completion rate
- Daily task completion tracking
- Scope change indicators
- Completion projection

**2. Velocity Chart**:
- Hours completed per week
- Trend analysis over time
- Rolling averages
- Capacity planning
- Sprint comparison

**3. Completion Rate Chart**:
- Percentage done over time
- Project health indicators
- Milestone tracking
- Historical performance
- Trend predictions

**4. Time Accuracy Chart**:
- Estimate vs. actual comparison
- Accuracy percentage by task
- Improvement trends
- Outlier identification
- Estimation calibration

**5. Task Distribution Analysis**:
- Priority distribution
- Status breakdown
- Tag-based grouping
- Project comparison
- Dependency depth

**Metrics Calculated**:
- Total tasks completed
- Average completion time
- Velocity (tasks/week or hours/week)
- Estimation accuracy
- Project health score
- Critical path length
- Bottleneck count

**Usage**:
- Access via Analytics view in sidebar
- Filter by project, date range, or tags
- Export charts as PNG
- Download raw data as CSV
- Share via link

### 7. Predictive AI Features

**AI-Powered Project Intelligence**: Analyze risks, optimize schedules, and detect issues.

**Capabilities**:

**Risk Detection**:
- Missing critical tasks (testing, QA, documentation)
- Overloaded project phases (too many parallel tasks)
- Unrealistic timelines (insufficient time between tasks)
- Missing dependencies (should-depend-on relationships)
- Bottleneck tasks (blocking many dependents)
- Scope creep indicators
- Resource conflicts

**Risk Scoring**:
```typescript
Risk Score = 0-10 scale
0-3: Low risk (healthy project)
4-6: Medium risk (needs attention)
7-10: High risk (immediate action required)
```

**Smart Scheduling**:
- Optimal start date suggestions
- Dependency-aware scheduling
- Load balancing (max 8 hours/day)
- Buffer time recommendations
- Critical path optimization
- Resource leveling

**Missing Task Detection**:
- Analyzes project type and context
- Identifies commonly overlooked tasks
- Suggests additions with rationale
- Examples:
  - Software: Unit tests, integration tests, code review, deployment scripts
  - Marketing: Analytics setup, A/B testing, performance metrics
  - Personal: Buffer time, contingency planning, review sessions

**Bottleneck Identification**:
- Tasks blocking multiple dependents
- Long-duration critical tasks
- Resource conflicts
- Dependency chains analysis
- Recommendations for parallelization

**Timeline Optimization**:
- Analyzes current schedule
- Suggests reordering for efficiency
- Identifies float time opportunities
- Recommends dependency adjustments
- Predicts completion dates

**UI Integration**:
- Risk score badge on project cards
- Warning icons for high-risk tasks
- Alerts panel in dashboard
- Recommendations in AI agent chat
- Automated suggestions on project creation

### 8. GitHub Bi-Directional Sync

**Seamless GitHub Integration**: Push ODUS changes to GitHub issues and sync bidirectionally.

**Capabilities**:

**Push to GitHub**:
- Create GitHub issue from ODUS task
- Update issue when task changes (title, description, status, priority)
- Close issue when task marked done
- Sync labels based on task tags
- Add comments to issues
- Link to milestones

**Sync from GitHub**:
- Import issue changes back to ODUS
- Update task when issue edited
- Mark task done when issue closed
- Sync labels to tags
- Import issue comments
- Track issue events

**Data Mapping**:
```typescript
ODUS Task → GitHub Issue
- title → issue title
- description → issue body
- status (done) → issue state (closed)
- priority → issue labels (priority: high/medium/low)
- tags → issue labels
- comments → issue comments
```

**Sync Status Indicators**:
- Synced (green checkmark)
- Syncing (spinner)
- Conflict (warning icon)
- Manual review needed (alert)

**Conflict Resolution**:
- Last-write-wins by default
- Manual resolution option
- Conflict history log
- Rollback capability

**Configuration**:
1. Link task to GitHub repo
2. Choose sync direction (one-way or bidirectional)
3. Map fields (optional custom mapping)
4. Enable auto-sync
5. Monitor sync status

**Usage**:
- Click "Sync to GitHub" button in task detail
- Automatic sync on task changes (if enabled)
- View GitHub issue number and link
- Access issue directly from ODUS
- Sync status in task card

### 9. GitHub Projects Integration

**Project Board Synchronization**: Connect ODUS projects to GitHub Projects (Beta).

**Features**:

**Project Linking**:
- Link ODUS project to GitHub Project board
- Support for both Classic and Beta Projects
- One-to-one or one-to-many mapping
- Project-level sync settings

**Item Synchronization**:
- Create GitHub project items from ODUS tasks
- Sync task status to project board columns
- Update custom fields
- Preserve project-specific metadata
- Bidirectional updates

**Column Mapping**:
```typescript
ODUS Status → GitHub Project Column
- todo → To Do / Backlog
- in-progress → In Progress
- done → Done / Completed
```

**Custom Field Support**:
- Priority mapping
- Tags as labels
- Due dates
- Assignees
- Custom text/number fields
- Single-select fields

**Sync Options**:
- Real-time sync (on every change)
- Batch sync (hourly/daily)
- Manual sync only
- One-way vs. bidirectional
- Conflict resolution strategy

**Project Views**:
- Table view sync
- Board view sync
- Roadmap view integration
- Custom view support

**Configuration UI**:
1. Select ODUS project
2. Authenticate with GitHub
3. Choose GitHub Project
4. Map columns and fields
5. Set sync frequency
6. Enable sync

**Benefits**:
- Keep both systems in sync
- Use ODUS for AI features, GitHub for collaboration
- Single source of truth
- Reduced manual data entry
- Team visibility

### AI-Powered Project Generation

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
