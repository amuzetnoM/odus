
import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Type, Schema, Content } from '@google/genai';
import { Task, Project } from './project.service';
import { PersistenceService } from './persistence.service';

export type AiProvider = 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'openrouter';

export interface AgentResponse {
  text: string;
  groundingMetadata?: any;
  toolCall?: {
    type: string;
    data: any; 
  };
}

export interface DayBriefing {
  briefing: string;
  dayType: 'FOCUS' | 'CRUNCH' | 'BALANCED' | 'LIGHT' | 'REST';
}

// Priority Distribution Constants
const PRIORITY_DISTRIBUTION = {
  HIGH: { MIN: 0.20, MAX: 0.35, TARGET: 0.25 },   // 20-35%, target 25%
  MEDIUM: { MIN: 0.45, MAX: 0.65, TARGET: 0.55 },  // 45-65%, target 55%
  LOW: { MIN: 0.15, MAX: 0.30, TARGET: 0.20 }      // 15-30%, target 20%
} as const;

// Task Duration Constants
const TASK_DURATION = {
  DEFAULT: 4,      // Default duration when AI doesn't provide one
  MIN_RANDOM: 3,   // Minimum random duration
  MAX_RANDOM: 6    // Maximum random duration
} as const;

export interface RepoAnalysisContext {
  language?: string;
  stars?: number;
  pyproject?: string | null;
  cargoToml?: string | null;
  goMod?: string | null;
  filesByType?: Record<string, string[]>;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private provider: AiProvider = 'gemini';
  private apiKey = '';
  
  // Gemini Instance
  private googleAi: GoogleGenAI | null = null;
  
  // Ollama Config
  private readonly ollamaBase = 'http://localhost:11434';
  
  private persistence = inject(PersistenceService);

  constructor() {
    this.init();
  }

  private init() {
    this.provider = (localStorage.getItem('ai_provider') as AiProvider) || 'gemini';
    this.apiKey = this.getKeyForProvider(this.provider);
    
    if (this.provider === 'gemini' && this.apiKey) {
        this.googleAi = new GoogleGenAI({ apiKey: this.apiKey });
    }
  }

  private getKeyForProvider(provider: AiProvider): string {
      switch(provider) {
          case 'gemini': return localStorage.getItem('gemini_api_key') || '';
          case 'openai': return localStorage.getItem('openai_api_key') || '';
          case 'anthropic': return localStorage.getItem('anthropic_api_key') || '';
          case 'ollama': return localStorage.getItem('ollama_model') || 'llama3'; // Use key slot for Model Name
          case 'openrouter': return localStorage.getItem('openrouter_api_key') || '';
          default: return '';
      }
  }

  updateApiKey(key: string, provider: AiProvider) {
    const keyMap: Record<AiProvider, string> = {
        'gemini': 'gemini_api_key',
        'openai': 'openai_api_key',
        'anthropic': 'anthropic_api_key',
        'ollama': 'ollama_model',
        'openrouter': 'openrouter_api_key'
    };
    localStorage.setItem(keyMap[provider], key);
    this.provider = provider;
    this.apiKey = key;
    
    if (provider === 'gemini') {
        this.googleAi = new GoogleGenAI({ apiKey: key });
    }
  }

  setProvider(provider: AiProvider) {
      localStorage.setItem('ai_provider', provider);
      this.init();
  }
  
  async validateConnection(key: string): Promise<boolean> {
      try {
          if (this.provider === 'gemini') {
              if (!key) return false;
              const testAi = new GoogleGenAI({ apiKey: key });
              await testAi.models.generateContent({ model: 'gemini-2.0-flash', contents: 'ping' });
              return true;
          }
          if (this.provider === 'openai') {
              if (!key) return false;
              const res = await fetch('https://api.openai.com/v1/models', {
                  headers: { 'Authorization': `Bearer ${key}` }
              });
              return res.ok;
          }
          if (this.provider === 'anthropic') {
              if (!key) return false;
              const res = await fetch('https://api.anthropic.com/v1/messages', {
                  method: 'POST',
                  headers: {
                      'x-api-key': key,
                      'anthropic-version': '2023-06-01',
                      'content-type': 'application/json'
                  },
                  body: JSON.stringify({
                      model: 'claude-3-haiku-20240307',
                      max_tokens: 1,
                      messages: [{ role: 'user', content: 'ping' }]
                  })
              });
              return res.ok;
          }
          if (this.provider === 'ollama') {
              // Check tags to see if server is up
              const res = await fetch(`${this.ollamaBase}/api/tags`);
              return res.ok;
          }
          if (this.provider === 'openrouter') {
              if (!key) return false;
              const res = await fetch('https://openrouter.ai/api/v1/models', {
                  headers: { 'Authorization': `Bearer ${key}` }
              });
              return res.ok;
          }
          return false;
      } catch (e) {
          console.error('Validation Failed', e);
          return false;
      }
  }

  // --- Helper: Clean JSON from Markdown ---
  private cleanJson(text: string): string {
      const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      return match ? match[1].trim() : text.trim();
  }

  // --- Helper: Generate Random Duration ---
  private getTaskDuration(providedDuration?: number): number {
      if (typeof providedDuration === 'number' && providedDuration > 0) {
          return providedDuration;
      }
      return Math.floor(Math.random() * (TASK_DURATION.MAX_RANDOM - TASK_DURATION.MIN_RANDOM + 1)) + TASK_DURATION.MIN_RANDOM;
  }

  // --- Core Generation Logic (Multi-Provider) ---

  private async generateText(prompt: string, systemInstruction?: string, jsonSchema?: any): Promise<string> {
      // 1. Google Gemini (Default/Native)
      if (this.provider === 'gemini' && this.googleAi) {
          const config: any = {};
          if (systemInstruction) config.systemInstruction = systemInstruction;
          if (jsonSchema) {
              config.responseMimeType = 'application/json';
              config.responseSchema = jsonSchema;
          }
          
          const res = await this.googleAi.models.generateContent({
              model: 'gemini-2.0-flash',
              contents: prompt,
              config
          });
          return res.text || '';
      }

      // Common Message Structure for OpenAI/Ollama/OpenRouter
      const messages = [
          { role: 'system', content: systemInstruction || 'You are a helpful AI.' },
          { role: 'user', content: prompt }
      ];

      // 2. OpenAI
      if (this.provider === 'openai') {
          const body: any = {
              model: 'gpt-4-turbo',
              messages,
              response_format: jsonSchema ? { type: 'json_object' } : undefined
          };

          const res = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
          });
          const data = await res.json();
          return data.choices?.[0]?.message?.content || '';
      }

      // 3. Anthropic
      if (this.provider === 'anthropic') {
          const body: any = {
              model: 'claude-3-5-sonnet-20240620',
              max_tokens: 4096,
              messages: [{ role: 'user', content: prompt }]
          };
          if (systemInstruction) body.system = systemInstruction;

          const res = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: { 
                  'x-api-key': this.apiKey, 
                  'anthropic-version': '2023-06-01', 
                  'content-type': 'application/json',
                  'dangerously-allow-browser': 'true'
              },
              body: JSON.stringify(body)
          });
          const data = await res.json();
          return data.content?.[0]?.text || '';
      }

      // 4. Ollama (Local)
      if (this.provider === 'ollama') {
          const body: any = {
              model: this.apiKey || 'llama3', // apiKey slot holds model name
              messages,
              stream: false,
              format: jsonSchema ? 'json' : undefined
          };
          
          const res = await fetch(`${this.ollamaBase}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
          });
          const data = await res.json();
          return data.message?.content || '';
      }

      // 5. OpenRouter
      if (this.provider === 'openrouter') {
          const body: any = {
              model: 'meta-llama/llama-3.1-70b-instruct', // Reasonable default for OpenRouter
              messages,
              response_format: jsonSchema ? { type: 'json_object' } : undefined
          };

          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: { 
                  'Authorization': `Bearer ${this.apiKey}`,
                  'HTTP-Referer': window.location.href,
                  'X-Title': 'ODUS',
                  'Content-Type': 'application/json' 
              },
              body: JSON.stringify(body)
          });
          const data = await res.json();
          return data.choices?.[0]?.message?.content || '';
      }

      throw new Error('Provider not configured or invalid.');
  }

  // --- Rebuilt Project Generator (Exhaustive & Robust) ---

  async generateProjectStructure(userPrompt: string): Promise<any> {
      // Powerful System Prompt for Chain of Thought
      const systemPrompt = `
        You are a world-class Senior Technical Program Manager. Your task is to transform a user's objective into a detailed, executable project plan.

        **CRITICAL RULES:**
        1.  **OUTPUT FORMAT IS NON-NEGOTIABLE:** You MUST respond with ONLY a valid JSON object that strictly adheres to the provided schema. Do not add any conversational text, markdown, or explanations before or after the JSON.
        2.  **TASK GRANULARITY:** Generate an exhaustive list of 8 to 15 granular, actionable tasks. Break down high-level concepts into smaller steps.
        3.  **ALL FIELDS ARE REQUIRED:** For every single task, you MUST provide a value for 'title', 'description', 'status', 'priority', 'tags', 'startOffset', 'duration', and 'dependsOn'.
        4.  **REALISTIC SCHEDULING:** Assign realistic integer values for 'startOffset' (days from now to begin) and 'duration' (days to complete).
        5.  **PRIORITY DISTRIBUTION:** Distribute priorities effectively:
           - 20-30% tasks should be 'high' priority (critical-path items)
           - 50-60% tasks should be 'medium' priority (standard work)
           - 20-30% tasks should be 'low' priority (polish or non-essential tasks)
        6.  **DEPENDENCIES:** Each task MUST have a 'dependsOn' array containing 0-3 task indices (array index, 0-based). Create logical dependency chains.
        7.  **TAGS:** Use short, 3-4 letter uppercase codes (e.g., 'DEV', 'UI/UX', 'TEST', 'OPS', 'MKT'). Assign 1-2 relevant tags per task.

        Failure to follow these rules, especially the JSON output format and required fields, will result in system failure.
      `;

      const geminiSchema = {
          type: Type.OBJECT,
          properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              tasks: {
                  type: Type.ARRAY,
                  items: {
                      type: Type.OBJECT,
                      properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          status: { type: Type.STRING, enum: ['todo', 'in-progress'] },
                          priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                          startOffset: { type: Type.INTEGER },
                          duration: { type: Type.INTEGER },
                          dependsOn: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                      }
                  }
              }
          }
      };

      try {
          const rawText = await this.generateText(
              `Create a detailed project plan for: "${userPrompt}". Ensure at least 8-12 granular tasks with proper dependencies.`,
              systemPrompt,
              this.provider === 'gemini' ? geminiSchema : undefined
          );

          const data = JSON.parse(this.cleanJson(rawText));
          
          // Post-processing: Hydrate dates relative to now
          const today = new Date();
          const tasksWithIds = (data.tasks || []).map((t: any, index: number) => {
              const start = new Date(today);
              start.setDate(today.getDate() + (t.startOffset || 0));
              
              const duration = this.getTaskDuration(t.duration);
              const end = new Date(start);
              end.setDate(start.getDate() + duration);

              return {
                  id: crypto.randomUUID(),
                  title: t.title,
                  description: t.description,
                  status: t.status || 'todo',
                  priority: t.priority || 'medium',
                  tags: t.tags || ['GEN'],
                  startDate: start.toISOString().split('T')[0],
                  endDate: end.toISOString().split('T')[0],
                  dependsOn: t.dependsOn || [],
                  originalIndex: index
              };
          });
          
          // Convert dependsOn indices to actual task IDs
          tasksWithIds.forEach((task: any) => {
              if (task.dependsOn && Array.isArray(task.dependsOn)) {
                  task.dependencyIds = task.dependsOn
                      .filter((idx: number) => idx >= 0 && idx < tasksWithIds.length && idx !== task.originalIndex)
                      .map((idx: number) => tasksWithIds[idx].id);
                  delete task.dependsOn;
              } else {
                  task.dependencyIds = [];
              }
              delete task.originalIndex;
          });
          
          // Fallback: If NO dependencies were created, create a simple chain
          const hasDependencies = tasksWithIds.some((t: any) => t.dependencyIds && t.dependencyIds.length > 0);
          if (!hasDependencies && tasksWithIds.length > 1) {
              // Create a simple sequential dependency chain for high-priority tasks
              const highPriorityTasks = tasksWithIds.filter((t: any) => t.priority === 'high');
              for (let i = 1; i < highPriorityTasks.length; i++) {
                  highPriorityTasks[i].dependencyIds = [highPriorityTasks[i-1].id];
              }
          }

          return { ...data, tasks: tasksWithIds };

      } catch (e) {
          console.error("Project Generation Failed:", e);
          throw new Error("Failed to generate project structure.");
      }
  }

  // --- Smart Features ---

  async generateManagerialInsight(context: { title: string, description: string, taskCount: number, tasks: Task[] }): Promise<string> {
      const prompt = `
        Context: Project "${context.title}", ${context.taskCount} tasks. Desc: ${context.description}.
        Sample Tasks: ${JSON.stringify(context.tasks.slice(0, 3).map(t => t.title))}
        
        Task: Identify ONE critical gap or next step. Max 25 words. Conversational.
      `;
      const system = "You are ODUS, a Senior Technical Project Manager.";
      
      try {
          return await this.generateText(prompt, system);
      } catch (e) {
          return `Project "${context.title}" initialized.`;
      }
  }

  async getDailyBriefing(dayTasks: any, metrics: any): Promise<DayBriefing> {
    const prompt = `
      Analyze today's workload and provide a structured briefing.
      
      Workspace Metrics: ${JSON.stringify(metrics)}
      Today's Tasks:
      - Starting: ${dayTasks.starting?.length || 0} tasks
      - Due: ${dayTasks.due?.length || 0} tasks  
      - Ongoing: ${dayTasks.ongoing?.length || 0} tasks
      
      Tasks Detail: ${JSON.stringify(dayTasks)}
      
      Provide a clear, structured briefing with:
      1. A concise overview sentence
      2. Key priorities for the day (if any high-priority tasks)
      3. A brief recommendation or insight
      
      Format the briefing as a single paragraph with proper structure, using 2-4 sentences. Be professional and actionable.
      
      Return JSON: { "briefing": "string", "dayType": "FOCUS" | "CRUNCH" | "BALANCED" | "LIGHT" | "REST" }
      
      dayType definitions:
      - FOCUS: 1-3 high-priority tasks, manageable workload
      - CRUNCH: 4+ tasks or multiple high-priority items
      - BALANCED: Mix of priorities, moderate load
      - LIGHT: Few tasks, mostly low priority
      - REST: No tasks or all completed
    `;
    const system = "You are an executive assistant providing daily briefings. Be clear, concise, and actionable.";
    
    try {
        const text = await this.generateText(prompt, system, this.provider === 'gemini' ? {
            type: Type.OBJECT,
            properties: {
                briefing: { type: Type.STRING },
                dayType: { type: Type.STRING, enum: ['FOCUS', 'CRUNCH', 'BALANCED', 'LIGHT', 'REST'] }
            }
        } : undefined);
        
        return JSON.parse(this.cleanJson(text));
    } catch (e) {
        return { briefing: "Unable to analyze schedule at this time.", dayType: "BALANCED" };
    }
  }

  async routeTaskToProject(taskTitle: string, projects: Project[]): Promise<string> {
    if (projects.length === 0) return 'personal';
    const list = projects.map(p => ({ id: p.id, title: p.title }));
    
    const prompt = `Task: "${taskTitle}". Projects: ${JSON.stringify(list)}. Return JSON: { "projectId": "id" } or "personal".`;
    
    try {
        const text = await this.generateText(prompt, "You are a routing system.", this.provider === 'gemini' ? { type: Type.OBJECT, properties: { projectId: { type: Type.STRING }}} : undefined);
        return JSON.parse(this.cleanJson(text)).projectId || 'personal';
    } catch { return 'personal'; }
  }

  async curateFocusList(allTasks: any[]): Promise<{ taskIds: string[], reasoning: string }> {
      const candidates = allTasks.filter(t => t.status !== 'done').map(t => ({ id: t.id, title: t.title, priority: t.priority }));
      const prompt = `Pick top 5 tasks for Focus List. Tasks: ${JSON.stringify(candidates)}. Return JSON: { "taskIds": [], "reasoning": "" }`;
      
      try {
          const text = await this.generateText(prompt, "Executive Assistant.", this.provider === 'gemini' ? {
              type: Type.OBJECT,
              properties: { taskIds: { type: Type.ARRAY, items: { type: Type.STRING } }, reasoning: { type: Type.STRING } }
          } : undefined);
          return JSON.parse(this.cleanJson(text));
      } catch { return { taskIds: [], reasoning: "Error" }; }
  }

  async analyzeIdea(content: string, existing: any[]): Promise<any> {
      const prompt = `Analyze idea: "${content}". Existing: ${JSON.stringify(existing)}. Return JSON: { "title": "", "properties": {}, "tags": [], "relatedNodeIds": [] }`;
      try {
          const text = await this.generateText(prompt, "Knowledge Graph Architect.", this.provider === 'gemini' ? {
              type: Type.OBJECT,
              properties: {
                  title: { type: Type.STRING },
                  properties: { type: Type.OBJECT, properties: {} },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  relatedNodeIds: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
          } : undefined);
          return JSON.parse(this.cleanJson(text));
      } catch { return { title: 'New Idea', properties: {}, tags: [], relatedNodeIds: [] }; }
  }

  async suggestNextTask(currentTasks: any[]): Promise<any> {
      const prompt = `Tasks: ${JSON.stringify(currentTasks.map(t => t.title))}. Suggest 1 missing task. JSON: { "title": "", "description": "", "priority": "medium", "tags": [] }`;
      try {
          const text = await this.generateText(prompt, "Project Assistant.", this.provider === 'gemini' ? {
              type: Type.OBJECT, properties: { 
                  title: {type:Type.STRING}, 
                  description: {type:Type.STRING}, 
                  priority: {type:Type.STRING},
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
          } : undefined);
          return JSON.parse(this.cleanJson(text));
      } catch { return null; }
  }

  // --- Complex Methods (Repo Analysis & Chat) ---

  async analyzeRepoAndPlan(repoName: string, fileStructure: string, commitHistory: string, readme: string | null, packageJson: string | null, additionalContext?: RepoAnalysisContext): Promise<Task[]> {
      const languageInfo = additionalContext?.language ? `\nPrimary Language: ${additionalContext.language}` : '';
      const projectConfig = additionalContext?.pyproject || additionalContext?.cargoToml || additionalContext?.goMod || '';
      const popularityInfo = additionalContext?.stars ? `\nRepository Stars: ${additionalContext.stars}` : '';
      
      const prompt = `Analyze Repository: "${repoName}"${languageInfo}${popularityInfo}

FILE STRUCTURE (Categorized):
${fileStructure}

RECENT COMMITS:
${commitHistory}

README:
${readme || 'No README found'}

PACKAGE.JSON:
${packageJson || 'No package.json found'}

${projectConfig ? `ADDITIONAL CONFIG:\n${projectConfig.substring(0, 1000)}` : ''}

TASK: Create a comprehensive, detailed project plan with proper task dependencies and rich descriptions.

CRITICAL REQUIREMENTS:
1. Generate 8-15 granular, actionable tasks based on the actual codebase analysis
2. Use the file structure to inform task breakdown (e.g., separate tasks for different modules/components)
3. Use commit history to identify recent work and suggest next steps
4. Extract technical details from package.json/configs to create specific tasks

5. PRIORITY DISTRIBUTION (MANDATORY):
   - Exactly 20-30% tasks must be "high" priority (critical path items like architecture, core features, blockers)
   - Exactly 50-60% tasks must be "medium" priority (standard features, improvements)
   - Exactly 20-30% tasks must be "low" priority (polish, documentation, nice-to-haves)

6. DEPENDENCIES (MANDATORY):
   - Each task MUST have a "dependsOn" array with 0-3 task indices (use array index, 0-based)
   - Create logical dependency chains: setup → implementation → testing → deployment
   - Example: Task 3 depends on tasks 0 and 1: "dependsOn": [0, 1]

7. RICH DESCRIPTIONS:
   - Each task description should be detailed (50-200 chars)
   - Include technical context from the codebase
   - Reference specific files or modules when relevant
   - Describe WHY the task is important, not just WHAT

8. SCHEDULING:
   - Assign realistic durationDays (2-14 days based on complexity)
   - startDayOffset should account for dependencies (dependent tasks start after prerequisites)

9. TAGS: Use relevant codes based on the repository:
   - For code: 'ARCH', 'FEAT', 'REFAC', 'PERF'
   - For testing: 'TEST', 'QA', 'E2E'
   - For ops: 'DOCS', 'OPS', 'CI/CD', 'SEC'
   - For fixes: 'BUG', 'FIX', 'HOTFIX'
   - Tech-specific: 'UI/UX', 'API', 'DB', 'AUTH'

Return ONLY valid JSON matching this structure:
{
  "tasks": [
    {
      "title": "string (60 chars max, descriptive)",
      "description": "string (detailed, 50-200 chars with context)",
      "priority": "high|medium|low",
      "status": "todo",
      "tags": ["string"],
      "durationDays": number,
      "startDayOffset": number,
      "dependsOn": [number]
    }
  ]
}`;
      
      try {
          const text = await this.generateText(prompt, "You are a Senior Technical Program Manager and Solution Architect. Create detailed, actionable project plans with proper task dependencies and priority distribution.", this.provider === 'gemini' ? {
              type: Type.OBJECT,
              properties: { tasks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { 
                  title: { type: Type.STRING }, 
                  description: { type: Type.STRING }, 
                  status: { type: Type.STRING }, 
                  priority: { type: Type.STRING }, 
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  durationDays: { type: Type.INTEGER }, 
                  startDayOffset: { type: Type.INTEGER },
                  dependsOn: { type: Type.ARRAY, items: { type: Type.INTEGER } }
              }}}}
          } : undefined);
          
          const json = JSON.parse(this.cleanJson(text));
          const rawTasks = json.tasks || [];
          
          // Post-process: Ensure priorities are distributed correctly
          const priorityCounts = { high: 0, medium: 0, low: 0 };
          rawTasks.forEach((t: any) => {
              if (t.priority === 'high' || t.priority === 'medium' || t.priority === 'low') {
                  priorityCounts[t.priority]++;
              }
          });
          
          // If priority distribution is poor, fix it
          const total = rawTasks.length;
          const highRatio = priorityCounts.high / total;
          if (total > 0 && (highRatio < PRIORITY_DISTRIBUTION.HIGH.MIN || highRatio > PRIORITY_DISTRIBUTION.HIGH.MAX)) {
              // Rebalance priorities according to target distribution
              const targetHigh = Math.max(2, Math.floor(total * PRIORITY_DISTRIBUTION.HIGH.TARGET));
              const targetMedium = Math.floor(total * PRIORITY_DISTRIBUTION.MEDIUM.TARGET);
              
              rawTasks.forEach((t: any, idx: number) => {
                  if (idx < targetHigh) {
                      t.priority = 'high';
                  } else if (idx < targetHigh + targetMedium) {
                      t.priority = 'medium';
                  } else {
                      t.priority = 'low';
                  }
              });
          }
          
          // Create task objects with UUIDs first
          const today = new Date();
          const tasksWithIds = rawTasks.map((t: any, index: number) => {
              const start = new Date(today); 
              start.setDate(today.getDate() + (t.startDayOffset || 0));
              
              const duration = this.getTaskDuration(t.durationDays);
              const end = new Date(start); 
              end.setDate(start.getDate() + duration);

              return {
                  id: crypto.randomUUID(),
                  title: t.title,
                  description: t.description,
                  createdAt: new Date().toISOString(),
                  status: t.status || 'todo',
                  priority: t.priority || 'medium',
                  tags: t.tags || ['GEN'],
                  startDate: start.toISOString().split('T')[0],
                  endDate: end.toISOString().split('T')[0],
                  dependsOn: t.dependsOn || [],
                  originalIndex: index
              };
          });
          
          // Convert dependsOn indices to actual task IDs
          tasksWithIds.forEach((task: any) => {
              if (task.dependsOn && Array.isArray(task.dependsOn)) {
                  task.dependencyIds = task.dependsOn
                      .filter((idx: number) => idx >= 0 && idx < tasksWithIds.length && idx !== task.originalIndex)
                      .map((idx: number) => tasksWithIds[idx].id);
                  delete task.dependsOn;
              } else {
                  task.dependencyIds = [];
              }
              delete task.originalIndex;
          });
          
          // Fallback: If NO dependencies were created, create a simple chain
          const hasDependencies = tasksWithIds.some((t: any) => t.dependencyIds && t.dependencyIds.length > 0);
          if (!hasDependencies && tasksWithIds.length > 1) {
              // Create a simple sequential dependency chain for high-priority tasks
              const highPriorityTasks = tasksWithIds.filter((t: any) => t.priority === 'high');
              for (let i = 1; i < highPriorityTasks.length; i++) {
                  highPriorityTasks[i].dependencyIds = [highPriorityTasks[i-1].id];
              }
          }

          return tasksWithIds;
      } catch (e) {
          console.error("Repo analysis error:", e);
          return [];
      }
  }

  async analyzeProjectRisks(project: Project): Promise<string> {
      const prompt = `Analyze risks for project "${project.title}". Tasks: ${JSON.stringify(project.tasks.map(t=>({t:t.title, s:t.startDate, e:t.endDate})))}. Markdown format.`;
      return this.generateText(prompt, "Risk Analyst.");
  }

  async chatWithAgent(message: string, contextData: string, history: Content[], userName: string): Promise<AgentResponse> {
      const system = `
        You are ODUS, an advanced AI assistant integrated into a comprehensive project management workspace.
        
        USER: ${userName}
        
        CAPABILITIES:
        - Manage projects, tasks, and files
        - Access mind map nodes (knowledge graph)
        - View calendar and timeline data
        - Understand cross-references between tasks, mind nodes, and files
        - Navigate the application
        
        WORKSPACE CONTEXT (Unified View):
        ${contextData}
        
        TOOL CALLING:
        To perform actions, output JSON: {"toolCall": {"type": "...", "data": ...}}
        
        Available Tools:
        - create_project: {"title": "...", "description": "..."}
        - delete_project: {"projectId": "..."}
        - create_task: {"projectId": "...", "title": "...", "description": "...", "priority": "low|medium|high", "addToFocus": boolean}
        - delete_task: {"projectId": "...", "taskId": "..."}
        - update_task_status: {"taskTitle": "...", "newStatus": "todo|in-progress|done"}
        - update_task: {"projectId": "...", "taskId": "...", "updates": {"title"?: "...", "description"?: "...", "priority"?: "...", "startDate"?: "...", "endDate"?: "..."}}
        - curate_focus_list: {} - AI will analyze all tasks and select the top 5 most important ones for the focus list
        - add_task_to_focus: {"taskId": "...", "projectId": "..."}
        - remove_task_from_focus: {"taskId": "...", "projectId": "..."}
        - create_file: {"filename": "...", "content": "...", "mimeType": "text/csv|text/markdown"}
        - navigate: {"view": "dashboard|projects|mind|drive|github|calendar"}
        - create_mind_node: {"content": "...", "tags": []}
        - link_task_to_mind_node: {"taskId": "...", "projectId": "...", "nodeId": "..."} - Creates a connection between a task and a mind map node
        - analyze_repository: {"owner": "...", "repo": "..."} - Analyzes a GitHub repository and creates a project
        
        INTELLIGENCE:
        - Reference the unified workspace context to understand relationships
        - Mind map nodes can relate to tasks and projects
        - Files can be linked to specific projects
        - Timeline shows what's urgent and what's overdue
        - Use metrics to gauge project health
        
        Be conversational, helpful, and leverage the full workspace context to provide intelligent assistance.
      `;

      // 1. Google Gemini (Native Chat)
      if (this.provider === 'gemini' && this.googleAi) {
          try {
              const res = await this.googleAi.models.generateContent({
                  model: 'gemini-2.0-flash',
                  contents: [...history, { role: 'user', parts: [{ text: message }] }],
                  config: {
                      tools: [{ googleSearch: {} }],
                      systemInstruction: system
                  }
              });
              
              const text = res.text || '';
              const cleanText = this.cleanJson(text);
              if (cleanText.startsWith('{') && cleanText.includes('toolCall')) {
                  try { return { text: 'Processing...', toolCall: JSON.parse(cleanText).toolCall, groundingMetadata: res.candidates?.[0]?.groundingMetadata }; } catch {}
              }
              return { text, groundingMetadata: res.candidates?.[0]?.groundingMetadata };
          } catch { return { text: 'Connection Error.' }; }
      } 
      
      // 2. Others (OpenAI / Anthropic / Ollama / OpenRouter) - Manual Chat Construction
      else {
          const messages: any[] = [];
          
          // System Prompt (Prepend)
          if (this.provider !== 'anthropic') {
              messages.push({ role: 'system', content: system });
          }

          // Convert History (Gemini Content -> Standard Message)
          history.forEach(h => {
              messages.push({ 
                  role: h.role === 'model' ? 'assistant' : 'user', 
                  content: (h.parts[0] as any).text 
              });
          });
          
          // Add Current User Message
          messages.push({ role: 'user', content: message });

          // Helper to call specific endpoints with full history
          let text = '';
          
          if (this.provider === 'openai') {
              const res = await fetch('https://api.openai.com/v1/chat/completions', {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ model: 'gpt-4-turbo', messages })
              });
              text = (await res.json()).choices?.[0]?.message?.content || '';
          }
          else if (this.provider === 'ollama') {
              const res = await fetch(`${this.ollamaBase}/api/chat`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                      model: this.apiKey || 'llama3', 
                      messages, 
                      stream: false 
                  })
              });
              text = (await res.json()).message?.content || '';
          }
          else if (this.provider === 'openrouter') {
              const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                  method: 'POST',
                  headers: { 
                      'Authorization': `Bearer ${this.apiKey}`,
                      'HTTP-Referer': window.location.href,
                      'X-Title': 'ODUS',
                      'Content-Type': 'application/json' 
                  },
                  body: JSON.stringify({ model: 'meta-llama/llama-3.1-70b-instruct', messages })
              });
              text = (await res.json()).choices?.[0]?.message?.content || '';
          }
          else if (this.provider === 'anthropic') {
              // Simple fallback for Anthropic which handles history differently
              text = await this.generateText(`History: ${JSON.stringify(history)}\nUser: ${message}`, system);
          }

          const cleanText = this.cleanJson(text);
          if (cleanText.startsWith('{') && cleanText.includes('toolCall')) {
              try { return { text: 'Processing...', toolCall: JSON.parse(cleanText).toolCall }; } catch {}
          }
          return { text };
      }
  }
}
