
# Feature Guide

## 1. GitHub Intelligence
ODUS doesn't just list your repos; it reads them.
-   **How to use:** Navigate to the GitHub view, enter a Token, and select a repo. Click **ADD**.
-   **Process:** ODUS pulls the file tree and README, then uses Gemini to "read" the code architecture and generate a project board with "Refactor", "Feature", and "Testing" tasks suited to that specific codebase.

## 2. Risk Analysis
Stop fire-fighting. Start predicting.
-   **Action:** Inside a project board, click the **Risk Scan** button.
-   **Output:** A Markdown report highlighting:
    -   Circular Dependencies (Task A waits for B, B waits for A).
    -   Resource Bottlenecks (Too many tasks due on Friday).
    -   Missing Specs (High priority tasks with no descriptions).

## 3. Neural Mind Board
A space for unstructured thinking.
-   **Quick Add:** Double-click anywhere on the canvas to add a node.
-   **AI Tagging:** Type a messy thought like "Need to optimize database queries for the user table."
    -   *Result:* AI cleans the title to "DB Optimization", tags it `DATABASE`, `PERFORMANCE`, and links it to any existing nodes related to SQL or Users.
-   **Markdown Editor:** Click a node to open a full-screen, distraction-free Markdown editor.

## 4. Calendar Intelligence
The Calendar view isn't just dates.
-   **Daily Briefing:** Click on any day. Gemini analyzes the tasks starting, due, and ongoing for that specific 24-hour period and generates a "Daily Briefing" telling you if it's a `CRUNCH`, `FOCUS`, or `LIGHT` day.
