
# ODUS AI - System Documentation

**Version:** 1.0.0  
**Framework:** Angular 18+ (Zoneless, Signals)  
**Styling:** Tailwind CSS  
**AI Core:** Google Gemini 2.5 Flash

---

## 1. System Overview

ODUS is a comprehensive, AI-first Project Management Suite designed for high-velocity teams. It integrates Task Management, File Storage, GitHub Intelligence, and Unstructured Idea Mapping into a single "Single Page Applet".

### Core Philosophy
- **Zoneless Architecture:** Uses Angular Signals exclusively for state management.
- **Local-First:** All data persists to `IndexedDB` via a `PersistenceService`.
- **AI-Native:** AI is not a chatbot addon; it drives data generation, project planning, and relationship mapping.

---

## 2. Feature Modules

### 2.1 Dashboard (System)
The landing command center.
- **Founder's Focus List:** A prioritized subset of tasks from all projects.
    - *Features:* Drag-and-drop reordering, priority toggling (Low/Med/High), quick edit, metadata expansion.
    - *AI Curation:* The "Curate (AI)" button scans all open tasks and selects the most critical ones based on deadlines and priority.
- **Smart Quick Add:** Natural language input routed by AI to the correct project (or Personal).

### 2.2 Project Streams
The core work units.
- **Side-by-Side Viewing:** Multiple projects can be active simultaneously (hold `Ctrl/Cmd` to select multiple).
- **Views:**
    - **Kanban:** Drag-and-drop status management.
    - **Gantt:** Timeline visualization.
    - **Node Graph:** Dependency visualization using D3.
- **AI Generation:** Create entire project structures from a single prompt.

### 2.3 GitHub Integration
Deep repository intelligence.
- **Multi-Pass Analysis:**
    1.  Fetches Commits, File Tree, README, and Package.json.
    2.  **Pass 1:** AI drafts an exhaustive task list.
    3.  **Pass 2:** AI critiques its own draft for security, testing, and edge cases before finalizing.
- **Filtering:** Source Only / Active Only toggles.

### 2.4 Data Vault (Drive)
- **Drag-and-Drop:** Global drop zone for files.
- **Storage:** Persists file metadata and Blob content to IndexedDB.

### 2.5 Mind Board (Pinned Ideas)
A space for unstructured thought.
- **Input:** Text-based idea capture.
- **AI Processing:**
    - Parses content to extract structured **Properties** (Key-Value).
    - Auto-generates **Tags**.
    - **Graph Linking:** Semantic analysis finds relationships to existing ideas.
- **Visualization:** Dual-pane view with a list on the left and a D3 Force-Directed Graph on the right.

### 2.6 AI Agent (Artifact)
- **Context Aware:** Has read access to all active projects and files.
- **Voice Enabled:** Speech-to-Text input.
- **Tool Use:** Can create text documents in the Data Vault directly.

---

## 3. Architecture & Services

### `ProjectService`
Manages `Project` and `Task` entities. Handles CRUD, status updates, and moving tasks between projects.
- *Signals:* `projects`, `activeProjectIds`, `metrics`.

### `GeminiService`
The brain of the operation.
- **`analyzeRepoAndPlan`**: Two-stage recursive thinking for code analysis.
- **`analyzeIdea`**: Structured extraction for Mind Board.
- **`chatWithAgent`**: Conversational interface with tool calling (`create_note`).

### `PersistenceService`
Wrapper around `IndexedDB`.
- Stores: `repos`, `drive_files`, `ai_memory`.
- Ensures data survives page reloads.

### `MindService`
Manages the "Knowledge Graph" of ideas.
- Automatically handles bidirectional linking when new nodes are added.

---

## 4. Visual Guide (Placeholders)

### Dashboard View
> ![Dashboard Screenshot Placeholder](about:blank)
> *Shows Focus List and Smart Input.*

### Project Board (Side-by-Side)
> ![Project Board Placeholder](about:blank)
> *Shows multiple active projects horizontally scrollable.*

### Mind Board Graph
> ![Mind Graph Placeholder](about:blank)
> *Shows the D3 force graph of connected ideas.*

---

## 5. Development Setup

1.  **Install Dependencies:** No `npm install` required (ESM imports via CDN).
2.  **Environment:** Ensure `process.env.API_KEY` is set with a valid Gemini API Key.
3.  **Run:** Standard Angular CLI serve or compatible web server.

```bash
ng serve
```
