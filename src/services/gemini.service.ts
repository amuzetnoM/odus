
import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Type, SchemaType, Content } from '@google/genai';
import { Task, Project } from './project.service';
import { PersistenceService } from './persistence.service';

export interface AgentResponse {
  text: string;
  groundingMetadata?: any;
  toolCall?: {
    type: 'create_note';
    data: { title: string; content: string };
  };
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private persistence = inject(PersistenceService);

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] || '' });
  }

  // --- Smart Features ---

  async routeTaskToProject(taskTitle: string, projects: Project[]): Promise<string> {
    if (projects.length === 0) return 'personal';

    const projectList = projects.map(p => ({ id: p.id, title: p.title }));
    const prompt = `
      Task: "${taskTitle}"
      Available Projects: ${JSON.stringify(projectList)}
      
      Return JSON with 'projectId'. 
      If the task strongly belongs to a project based on the name/context, return its ID.
      If it's generic or personal, return 'personal'.
    `;

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { projectId: { type: Type.STRING } }
                }
            }
        });
        const json = JSON.parse(response.text || '{}');
        return json.projectId || 'personal';
    } catch {
        return 'personal';
    }
  }

  async curateFocusList(allTasks: any[]): Promise<{ taskIds: string[], reasoning: string }> {
      // Filter candidates to avoid overwhelming token limits (only todo/in-progress)
      const candidates = allTasks
        .filter(t => t.status !== 'done')
        .map(t => ({ id: t.id, title: t.title, priority: t.priority, project: t.projectTitle }));

      const prompt = `
        You are an Executive Assistant. Review these tasks and pick the top 5-10 for the "Founder's Focus List".
        Criteria: High Strategic Value, Blockers, High Priority. Ignore trivial stuff.
        Tasks: ${JSON.stringify(candidates)}
        
        Return JSON: { "taskIds": ["id1", "id2"], "reasoning": "brief explanation" }
      `;

      try {
          const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          taskIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                          reasoning: { type: Type.STRING }
                      }
                  }
              }
          });
          return JSON.parse(response.text || '{ "taskIds": [], "reasoning": "Failed" }');
      } catch (e) {
          console.error(e);
          return { taskIds: [], reasoning: "AI Error" };
      }
  }

  // --- Mind Board Logic ---
  async analyzeIdea(content: string, existingNodesSummary: any[]): Promise<{
    title: string;
    properties: Record<string, string>;
    tags: string[];
    relatedNodeIds: string[];
  }> {
      const prompt = `
        You are a Knowledge Graph Architect.
        Analyze this new idea/note.
        
        New Input: "${content}"
        
        Existing Knowledge Nodes: 
        ${JSON.stringify(existingNodesSummary)}
        
        Tasks:
        1. Create a short title.
        2. Extract structured properties (key-value pairs) based on the text.
        3. Generate semantic tags.
        4. Identify IDs of existing nodes that are semantically related to this new one for linking.
      `;

      try {
          const response = await this.ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          title: { type: Type.STRING },
                          properties: { 
                              type: Type.OBJECT,
                              properties: {
                                  category: { type: Type.STRING },
                                  status: { type: Type.STRING },
                                  impact: { type: Type.STRING }
                              },
                              // Allow flexibility, though strict schema helps
                          },
                          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                          relatedNodeIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                  }
              }
          });
          const result = JSON.parse(response.text || '{}');
          return {
              title: result.title || 'Untitled Node',
              properties: result.properties || {},
              tags: result.tags || [],
              relatedNodeIds: result.relatedNodeIds || []
          };
      } catch (e) {
          console.error(e);
          return { title: 'Raw Node', properties: {}, tags: [], relatedNodeIds: [] };
      }
  }

  // --- Repo Analysis (Exhaustive + Review Loop) ---
  async analyzeRepoAndPlan(
      repoName: string, 
      fileStructure: string, 
      commitHistory: string,
      readme: string | null,
      packageJson: string | null
  ): Promise<Task[]> {
    const model = 'gemini-2.5-flash';
    
    // --- PASS 1: INITIAL DRAFT ---
    const context = `
      Repo: ${repoName}
      
      File Structure (Summary):
      ${fileStructure}
      
      Recent Commits:
      ${commitHistory}
      
      README Preview:
      ${readme ? readme.substring(0, 1500) : 'Not available'}
      
      Package/Config Preview:
      ${packageJson ? packageJson.substring(0, 1000) : 'Not available'}
    `;

    const draftPrompt = `
      You are a CTO/Tech Lead. 
      Analyze this Git Repository context deeply to create an EXHAUSTIVE project board.
      
      CRITICAL REQUIREMENTS:
      1. Dependency Graph: You MUST identify dependencies between tasks.
      2. Scheduling: You MUST estimate 'durationDays' and 'startDayOffset' (from day 0) for EVERY task.
         - Tasks cannot all start on Day 0. Stagger them based on dependencies.
      
      1. Identify the Tech Stack and Project Goal.
      2. Determine the Development Phase.
      3. Create tasks for Features, Refactoring, Testing, CI/CD.
      
      Context:
      ${context}
    `;

    const taskSchema: SchemaType = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['todo', 'in-progress', 'done'] },
          priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          costEst: { type: Type.NUMBER },
          durationDays: { type: Type.INTEGER, description: "Estimated effort in days" },
          startDayOffset: { type: Type.INTEGER, description: "Days from project start until this task begins" },
          dependencyIndices: { 
             type: Type.ARRAY, 
             items: { type: Type.INTEGER },
             description: "Indices (0-based) of other tasks in this list that this task depends on."
          }
        },
        required: ['title', 'description', 'status', 'priority', 'durationDays', 'startDayOffset']
    };

    const draftResponse = await this.ai.models.generateContent({
        model,
        contents: draftPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    reasoning: { type: Type.STRING },
                    tasks: { type: Type.ARRAY, items: taskSchema }
                }
            }
        }
    });

    const draftJson = JSON.parse(draftResponse.text || '{}');
    const draftTasks = draftJson.tasks || [];
    
    await this.persistence.logAiReasoning(repoName, draftJson.reasoning || 'Draft Complete', 'Pass 1 Done');

    // --- PASS 2: REVIEW & REFINE (The "Rerun") ---
    const reviewPrompt = `
      You are a Quality Assurance & Architecture AI.
      Review this Task List for "${repoName}".
      
      Draft Tasks:
      ${JSON.stringify(draftTasks)}
      
      CRITIQUE & EXPAND:
      1. Are there missing edge cases?
      2. Is the dependency graph logical? (Ensure no cycles).
      3. Is the schedule realistic? Do 'startDayOffset' values make sense given dependencies?
      
      Output a FINAL, REFINED list. 
      Ensure 'dependencyIndices' are accurate for the new list order.
    `;

    const finalResponse = await this.ai.models.generateContent({
        model,
        contents: reviewPrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    reviewNotes: { type: Type.STRING },
                    finalTasks: { type: Type.ARRAY, items: taskSchema }
                }
            }
        }
    });

    const finalJson = JSON.parse(finalResponse.text || '{}');
    const finalRawTasks = finalJson.finalTasks || draftTasks;

    await this.persistence.logAiReasoning(repoName, finalJson.reviewNotes || 'Review Complete', 'Pass 2 Done');

    // --- Post-Process: Link Resolution & Date Calculation ---
    const today = new Date();
    
    // 1. Assign IDs and Dates
    const tasksWithIds = finalRawTasks.map((t: any) => {
        // Calculate dates based on AI offsets
        const start = new Date(today);
        start.setDate(today.getDate() + (t.startDayOffset || 0));
        
        const end = new Date(start);
        end.setDate(start.getDate() + (t.durationDays || 3));

        return {
            ...t,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
            metadata: { cost: t.costEst }
        };
    });

    // 2. Resolve Indices to IDs
    tasksWithIds.forEach((task: any) => {
        if (task.dependencyIndices && Array.isArray(task.dependencyIndices)) {
            task.dependencyIds = task.dependencyIndices
                .map((idx: number) => tasksWithIds[idx]?.id)
                .filter((id: string) => id && id !== task.id); 
        }
        delete task.dependencyIndices;
        delete task.startDayOffset;
        delete task.durationDays;
    });

    return tasksWithIds;
  }

  // --- Existing Methods (Preserved) ---
  async generateProjectStructure(description: string): Promise<{ title: string, description: string, tasks: Task[] }> {
    const model = 'gemini-2.5-flash';
    const responseSchema: SchemaType = {
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
              status: { type: Type.STRING, enum: ['todo', 'in-progress', 'done'] },
              priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
              startDateOffset: { type: Type.INTEGER },
              durationDays: { type: Type.INTEGER },
              dependencyIndices: { type: Type.ARRAY, items: { type: Type.INTEGER } },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'description', 'status', 'priority', 'startDateOffset', 'durationDays']
          }
        }
      },
      required: ['title', 'description', 'tasks']
    };

    const prompt = `Create a project plan for: "${description}". Break into 5-10 tasks. Return JSON.`;

    const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: 'application/json', responseSchema }
    });

    const text = response.text;
    if (!text) throw new Error('No response');
    const rawData = JSON.parse(text);

    // Hydrate
    const tasksWithIds: Task[] = rawData.tasks.map((t: any) => ({
      ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString()
    }));
    
    const today = new Date();
    tasksWithIds.forEach((task: any, index: number) => {
        const start = new Date(today); start.setDate(today.getDate() + (task.startDateOffset || 0));
        task.startDate = start.toISOString().split('T')[0];
        const end = new Date(start); end.setDate(start.getDate() + (task.durationDays || 1));
        task.endDate = end.toISOString().split('T')[0];
        if (task.dependencyIndices?.length) {
           task.dependencyIds = task.dependencyIndices.map((idx: number) => tasksWithIds[idx]?.id).filter(Boolean);
        }
        delete task.startDateOffset; delete task.durationDays; delete task.dependencyIndices;
    });

    return { title: rawData.title, description: rawData.description, tasks: tasksWithIds };
  }

  async suggestNextTask(currentTasks: any[]): Promise<any> {
    const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Given these tasks: ${JSON.stringify(currentTasks.map(t => t.title))}. Suggest 1 missing critical task.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, priority: { type: Type.STRING, enum: ['low','medium','high'] }, tags: { type: Type.ARRAY, items: {type: Type.STRING}}}
          }
        }
      });
    return response.text ? JSON.parse(response.text) : null;
  }

  async chatWithAgent(message: string, contextData: string, history: Content[]): Promise<AgentResponse> {
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `
      You are ARTIFACT, an advanced AI project manager. 
      You have read-access to the user's current project state and file vault provided in the context.
      
      Capabilities:
      1. Answer questions about the projects/files.
      2. Search the web for info (Use googleSearch).
      3. Create Notes/Documents. To create a note, you MUST output a specific JSON structure (see below) INSTEAD of plain text.

      IF the user asks to create a note/file/document:
      Return strictly this JSON: { "toolCall": { "type": "create_note", "data": { "title": "...", "content": "..." } } }
      
      Otherwise, answer normally.
      Current System Context:
      ${contextData}
    `;

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: [...history, { role: 'user', parts: [{ text: message }] }],
        config: {
          tools: [{ googleSearch: {} }],
          systemInstruction,
        }
      });

      const text = response.text || '';
      
      if (text.trim().startsWith('{') && text.includes('toolCall')) {
          try {
              const json = JSON.parse(text);
              if (json.toolCall) {
                  return { text: 'Creating document...', toolCall: json.toolCall };
              }
          } catch (e) { }
      }

      return {
        text,
        groundingMetadata: response.candidates?.[0]?.groundingMetadata
      };

    } catch (e) {
      console.error(e);
      return { text: 'I encountered a connection error.' };
    }
  }
}
