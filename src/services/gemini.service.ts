
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
        3.  **ALL FIELDS ARE REQUIRED:** For every single task, you MUST provide a value for 'title', 'description', 'status', 'priority', 'tags', 'startOffset', and 'duration'.
        4.  **REALISTIC SCHEDULING:** Assign realistic integer values for 'startOffset' (days from now to begin) and 'duration' (days to complete).
        5.  **PRIORITY DISTRIBUTION:** Distribute priorities effectively. Use 'high' for critical-path items, 'medium' for standard work, and 'low' for polish or non-essential tasks.
        6.  **TAGS:** Use short, 3-4 letter uppercase codes (e.g., 'DEV', 'UI/UX', 'TEST', 'OPS', 'MKT'). Assign 1-2 relevant tags per task.

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
                          duration: { type: Type.INTEGER }
                      }
                  }
              }
          }
      };

      try {
          const rawText = await this.generateText(
              `Create a detailed project plan for: "${userPrompt}". Ensure at least 8-12 granular tasks.`,
              systemPrompt,
              this.provider === 'gemini' ? geminiSchema : undefined
          );

          const data = JSON.parse(this.cleanJson(rawText));
          
          // Post-processing: Hydrate dates relative to now
          const today = new Date();
          const hydratedTasks = (data.tasks || []).map((t: any) => {
              const start = new Date(today);
              start.setDate(today.getDate() + (t.startOffset || 0));
              
              const duration = typeof t.duration === 'number' && t.duration > 0 ? t.duration : Math.floor(Math.random() * 4) + 2; // 2-5 days
              const end = new Date(start);
              end.setDate(start.getDate() + duration);

              return {
                  ...t,
                  // Ensure defaults if AI missed them
                  status: t.status || 'todo',
                  priority: t.priority || 'medium',
                  tags: t.tags || ['GEN'],
                  startDate: start.toISOString().split('T')[0],
                  endDate: end.toISOString().split('T')[0]
              };
          });

          return { ...data, tasks: hydratedTasks };

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
      Analyze workload.
      Metrics: ${JSON.stringify(metrics)}
      Today: ${JSON.stringify(dayTasks)}
      
      Return JSON: { "briefing": "string", "dayType": "FOCUS" | "CRUNCH" | "BALANCED" | "LIGHT" | "REST" }
    `;
    const system = "You are an executive assistant. Be concise.";
    
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
        return { briefing: "Unable to analyze schedule.", dayType: "BALANCED" };
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

  async analyzeRepoAndPlan(repoName: string, fileStructure: string, commitHistory: string, readme: string | null, packageJson: string | null): Promise<Task[]> {
      const prompt = `Analyze Repo: ${repoName}\nFiles: ${fileStructure}\nCommits: ${commitHistory}\nREADME: ${readme}\nPkg: ${packageJson}\n\nCreate a JSON task list: { "tasks": [{ "title", "description", "priority", "status", "tags", "durationDays", "startDayOffset" }] }. \nCRITICAL: Assign 'high' priority to core architecture/bottlenecks, 'medium' to features, 'low' to polish. Varied priorities are required for the roadmap visualization. Generate relevant tags (e.g. 'REF', 'FEAT', 'BUG', 'TEST').`;
      
      try {
          const text = await this.generateText(prompt, "CTO. Create exhaustive plan.", this.provider === 'gemini' ? {
              type: Type.OBJECT,
              properties: { tasks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { 
                  title: { type: Type.STRING }, 
                  description: { type: Type.STRING }, 
                  status: { type: Type.STRING }, 
                  priority: { type: Type.STRING }, 
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  durationDays: { type: Type.INTEGER }, 
                  startDayOffset: { type: Type.INTEGER } 
              }}}}
          } : undefined);
          
          const json = JSON.parse(this.cleanJson(text));
          const rawTasks = json.tasks || [];
          
          const today = new Date();
          return rawTasks.map((t: any) => {
              const start = new Date(today); start.setDate(today.getDate() + (t.startDayOffset || 0));
              const end = new Date(start); end.setDate(start.getDate() + (t.durationDays || 3));
              return {
                  ...t,
                  id: crypto.randomUUID(),
                  createdAt: new Date().toISOString(),
                  startDate: start.toISOString().split('T')[0],
                  endDate: end.toISOString().split('T')[0]
              };
          });
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
        You are ODUS. User: ${userName}.
        Capabilities: Manage projects, create files.
        TOOLS: Output JSON {"toolCall": {"type": "...", "data": ...}} to act.
        Types: create_project, delete_project, create_task, delete_task, update_task_status, create_file, navigate.
        Context: ${contextData}
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
