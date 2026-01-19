
# System Architecture

![Angular](https://img.shields.io/badge/Angular-v18+-dd0031?style=flat-square&logo=angular)
![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)
![Status](https://img.shields.io/badge/Status-Nominal-success?style=flat-square)

ODUS is built on a modern, performance-first stack designed for zero latency and high reactivity.

## Core Stack

*   **Framework:** Angular 18+ (Standalone Components).
*   **State Management:** Angular Signals.
*   **Change Detection:** `provideZonelessChangeDetection()` - No Zone.js overhead.
*   **Styling:** Tailwind CSS with dynamic CSS Variables for theming.
*   **AI:** Google Gemini 2.0 Flash via `@google/genai` SDK.

## Service Layer

### `ThemeService` (New)
Handles the application's visual state.
-   **Dark/Light Mode:** Toggles the `.dark` class on the `html` element.
-   **Accent Colors:** Injects `--color-accent` CSS variable dynamically.
-   **Persistence:** Saves preferences to `localStorage`.

### `PersistenceService` (IndexedDB)
Implements the **Local-First** philosophy.
-   **Stores:** `repos`, `drive_files`, `ai_memory`, `repo_dependency_index`.
-   **Privacy:** Data remains on the client until AI processing is requested.

## Visual Logic & Physics

### 1. Physics Engine (`AiAgentComponent` & `MindBoardComponent`)
ODUS uses custom physics simulations for natural interaction.
-   **Agent Bubble:** Implements velocity, friction, and boundary collision detection (bounce effect) for the floating AI trigger.
-   **Mind Board:** Uses `d3-force` for semantic node clustering.

### 2. Success Roadmap (D3.js)
A specialized directed graph visualization.
-   **Critical Path:** AI and heuristic-based identification of high-priority tasks.
-   **Flow:** Visualizes the temporal sequence from start date to due date.

### 3. Responsive Layout
-   **Mobile:** Uses a `ResizeObserver` in `AppComponent` to detect viewport changes. Sidebar automatically collapses to an icon-only rail (`w-16`) on screens < 1024px.
-   **Desktop:** Sidebar is fully resizable via a drag handle.

## AI Integration Strategy

1.  **Generation:** `GeminiService.generateProjectStructure` produces strict JSON schemas.
2.  **Analysis:** `GeminiService.analyzeRepoAndPlan` reads file trees and commits.
3.  **Routing:** `GeminiService.routeTaskToProject` uses embedding-like logic to classify natural language inputs.
4.  **Generative UI:** The AI Agent can render UI components (Success Cards, File Previews) inside the chat stream based on `toolCall` results.
