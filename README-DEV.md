
# ODUS AI - System Documentation

![Angular](https://img.shields.io/badge/Angular-v18+-dd0031?style=flat-square&logo=angular)
![Gemini](https://img.shields.io/badge/AI-Gemini_2.0_Flash-8e75b2?style=flat-square&logo=google-gemini)
![Tailwind](https://img.shields.io/badge/Style-Tailwind_CSS-38bdf8?style=flat-square&logo=tailwindcss)
![Version](https://img.shields.io/badge/Version-1.3.0-blue?style=flat-square)
![Build](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)

**Version:** 1.3.0  
**Framework:** Angular 18+ (Zoneless, Signals)  
**Styling:** Tailwind CSS (Dark/Light Mode Support)  
**AI Core:** Google Gemini 2.0 Flash

---

## 1. System Overview

ODUS is a comprehensive, AI-first Project Management Suite designed for high-velocity teams. It integrates Task Management, File Storage, GitHub Intelligence, and Unstructured Idea Mapping into a single "Single Page Applet".

### Core Philosophy
-   **Zoneless Architecture:** Uses Angular Signals exclusively for state management.
-   **Local-First:** All data persists to `IndexedDB` via a `PersistenceService`.
-   **AI-Native:** AI drives data generation, project planning, and relationship mapping.
-   **Physics-Driven UI:** Implements D3.js force simulations and custom physics engines for natural UI interactions (Floating Agent, Mind Board).

---

## 2. Feature Modules

### 2.1 Dashboard (Scope)
The landing command center.
-   **Founder's Focus List:** A prioritized subset of tasks color-coded by project identity.
-   **Success Roadmap:** A calculated "Optimal Delivery Vector" visualization using D3.js to show critical path nodes and temporal flow.
-   **Smart Quick Add:** Natural language input routed by AI to the correct project (or Personal).

### 2.2 Interface Customization (New in v1.3)
-   **Theme Engine:** Toggle between Dark and Light modes.
-   **Accent Control:** Custom neon accent selection (Indigo, Cyan, Rose, Amber, Emerald).
-   **Responsive Layout:** Sidebar collapses to icon-only mode on mobile; resizable width on desktop.
-   **Slide-Up Telemetry:** System metrics (Health, Focus Load) are tucked away in a bottom-sheet panel to reduce visual noise.

### 2.3 Zen Mode
-   **Distraction Free:** A dedicated canvas for relaxation and focus.
-   **Interactive Particles:** Mouse-driven particle physics simulation to help reset mental state.

### 2.4 Project Streams
-   **Views:** Kanban, Gantt, and Node Graph.
-   **Risk Scan:** AI analysis of circular dependencies and resource bottlenecks.

### 2.5 GitHub Intelligence
-   **Multi-Pass Analysis:** recursive fetching of repo structure to generate actionable project boards.
-   **Terminal View:** Cyberpunk CLI interface for import logs.

### 2.6 Neural Mind Board
-   **Graph Database:** Semantic linking of unstructured ideas.
-   **Markdown Editor:** Full-screen writing environment with live preview.

### 2.7 AI Agent (Artifact)
-   **Physics Button:** Draggable, "throwable" floating action button with boundary collision detection.
-   **Generative UI:** Renders rich components (File Previews, Success Cards) directly in the chat stream.
-   **Tool Calling:** Can create files, projects, and navigate the app autonomously.

---

## 3. Architecture & Services

### `ProjectService`
Manages `Project` and `Task` entities.
-   *Signals:* `projects`, `activeProjectIds`, `metrics`.

### `ThemeService` (New)
Manages global UI state.
-   *Responsibility:* Dark/Light mode toggling, Sidebar width persistence, CSS Variable injection for accent colors.

### `GeminiService`
The brain of the operation.
-   **`analyzeRepoAndPlan`**: Two-stage recursive thinking for code analysis.
-   **`chatWithAgent`**: Conversational interface with tool calling (`create_note`, `navigate`, etc.).

### `PersistenceService`
Wrapper around `IndexedDB`.
-   Stores: `repos`, `drive_files`, `ai_memory`, `repo_dependency_index`.

### `MindService`
Manages the "Knowledge Graph" of ideas.

---

## 4. Development Setup

1.  **Install Dependencies:** No `npm install` required (ESM imports via CDN).
2.  **Environment:** Ensure `process.env.API_KEY` is set with a valid Gemini API Key.
3.  **Run:** Standard Angular CLI serve.

```bash
ng serve
```
