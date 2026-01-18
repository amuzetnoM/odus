
# System Architecture

ODUS is built on a modern, performance-first stack designed for zero latency and high reactivity.

## Core Stack

*   **Framework:** Angular 18+ (Standalone Components).
*   **State Management:** Angular Signals (No RxJS boilerplate for state).
*   **Change Detection:** `provideZonelessChangeDetection()` - Removing Zone.js improves performance and stack trace clarity.
*   **Styling:** Tailwind CSS (Utility-first).
*   **AI:** Google Gemini 2.5 Flash via `@google/genai` SDK.

## Data Persistence

ODUS follows a **Local-First** philosophy.

### IndexedDB (`PersistenceService`)
All data is stored in the browser's IndexedDB. This ensures:
1.  Data survives page reloads.
2.  The app works offline (excluding AI generation features).
3.  Privacy: Your project data stays on your machine until you explicitly ask AI to process it.

**Stores:**
-   `repos`: GitHub repository snapshots.
-   `drive_files`: Binary file data (Blobs).
-   `ai_memory`: Logs of AI reasoning for debugging.
-   `repo_dependency_index`: Background calculated graph data.

## AI Integration Strategy

We do not use AI as a simple chatbot. AI is integrated into the data layer.

1.  **Generation:** `GeminiService.generateProjectStructure` returns structured JSON, which is immediately hydrated into `Task` objects and rendered.
2.  **Analysis:** `GeminiService.analyzeRepoAndPlan` performs a multi-pass analysis.
    *   *Pass 1:* Drafts tasks based on code structure.
    *   *Pass 2:* Critiques the draft for missing edge cases.
3.  **Risk Assessment:** The Risk Scan feature serializes the Gantt chart state into a text prompt, asking Gemini to identify circular dependencies or critical path blockers.

## Mind Board (D3.js)

The Mind Board uses `d3-force` to create a semantic graph.
-   **Nodes:** Ideas/Notes.
-   **Links:**
    -   *Manual:* Created by the user (Gold color).
    -   *Semantic:* Created by AI (Grey color) by analyzing text embedding similarity (simulated via Gemini analysis prompts).
