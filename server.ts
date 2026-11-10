import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateRuleBasedSubtasks(title: string, targetMinutes?: number): Array<{ title: string; durationMinutes: number }> {
  const lower = (title || '').toLowerCase();
  
  if (lower.includes('clean') || lower.includes('tidy') || lower.includes('room')) {
    return [
      { title: 'Gather cleaning supplies and bag', durationMinutes: 5 },
      { title: 'Clear clutter and put misplaced items away', durationMinutes: 10 },
      { title: 'Wipe surfaces, desks and mirrors', durationMinutes: 10 },
      { title: 'Vacuum / sweep floor area', durationMinutes: 15 },
      { title: 'Take out trash and final tidy', durationMinutes: 5 },
    ];
  }

  if (lower.includes('website') || lower.includes('web') || lower.includes('page') || lower.includes('design')) {
    return [
      { title: 'Review visual references & project brief', durationMinutes: 20 },
      { title: 'Build low-fidelity wireframes and layout structure', durationMinutes: 30 },
      { title: 'Design desktop hero & core section components', durationMinutes: 45 },
      { title: 'Adapt layout for mobile responsive viewports', durationMinutes: 30 },
      { title: 'Final typography, polish and asset export', durationMinutes: 20 },
    ];
  }

  if (lower.includes('brand') || lower.includes('logo') || lower.includes('identity')) {
    return [
      { title: 'Collect moodboard references & competitor imagery', durationMinutes: 25 },
      { title: 'Initial concept sketching & typography exploration', durationMinutes: 35 },
      { title: 'Vector mark development & lockups', durationMinutes: 40 },
      { title: 'Color palette definition & contrast checks', durationMinutes: 20 },
      { title: 'Prepare presentation deck or guideline sheet', durationMinutes: 25 },
    ];
  }

  if (lower.includes('study') || lower.includes('exam') || lower.includes('read') || lower.includes('research')) {
    return [
      { title: 'Review syllabus & assemble required reading notes', durationMinutes: 15 },
      { title: 'Deep reading & annotate primary chapter', durationMinutes: 35 },
      { title: 'Draft key concept summaries and flashcards', durationMinutes: 25 },
      { title: 'Self-test quiz on core topics', durationMinutes: 20 },
    ];
  }

  if (lower.includes('write') || lower.includes('article') || lower.includes('post') || lower.includes('email') || lower.includes('proposal')) {
    return [
      { title: 'Outline main objectives and key arguments', durationMinutes: 15 },
      { title: 'Write initial rough draft without editing', durationMinutes: 35 },
      { title: 'Fact check, refine wording and restructure flow', durationMinutes: 20 },
      { title: 'Final proofread, formatting and deliver', durationMinutes: 10 },
    ];
  }

  if (lower.includes('code') || lower.includes('bug') || lower.includes('feature') || lower.includes('app') || lower.includes('develop')) {
    return [
      { title: 'Reproduce problem & inspect related component state', durationMinutes: 15 },
      { title: 'Architect data model and functional signatures', durationMinutes: 20 },
      { title: 'Implement core functionality & edge cases', durationMinutes: 45 },
      { title: 'Write tests & verify responsive behavior', durationMinutes: 20 },
      { title: 'Refactor code and commit changes', durationMinutes: 10 },
    ];
  }

  // Default universal breakdown
  const total = targetMinutes || 90;
  const stepTime = Math.max(10, Math.round(total / 4 / 5) * 5);
  return [
    { title: `Prepare materials and outline approach for "${title}"`, durationMinutes: Math.min(15, stepTime) },
    { title: `Execute core phase 1: Primary production`, durationMinutes: stepTime * 2 },
    { title: `Review results against requirements`, durationMinutes: stepTime },
    { title: `Final polish, tidy and sign-off`, durationMinutes: Math.min(15, stepTime) },
  ];
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for AI Task Breakdown
  app.post('/api/breakdown', async (req: Request, res: Response) => {
    try {
      const { title, description, estimatedMinutes } = req.body;
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Task title is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          source: 'rule-based',
          message: 'Smart task breakdown generated',
          subtasks: generateRuleBasedSubtasks(title.trim(), estimatedMinutes),
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `Break down the following task into 3 to 6 actionable, concrete, sequential subtasks with realistic durations in minutes.
Task: "${title.trim()}"
${description ? `Context/Description: "${description.trim()}"` : ''}
${estimatedMinutes ? `Target total time: ~${estimatedMinutes} minutes.` : ''}

Strict requirements:
- Plain, direct language.
- Action-oriented verbs (e.g., "Gather references", "Draft layout structure", "Refine typography").
- No filler steps.
- Realistic durationMinutes for each (5 to 60 minutes).
- Return an array of objects with title and durationMinutes.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are Dayframe\'s task breakdown engine. Your job is to make overwhelming tasks manageable by producing small, focused subtasks. Respond only with JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                durationMinutes: { type: Type.INTEGER },
              },
              required: ['title', 'durationMinutes'],
            },
          },
        },
      });

      const text = response.text?.trim() || '[]';
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({
          source: 'ai',
          message: 'AI breakdown generated with Gemini',
          subtasks: parsed.map((item: any) => ({
            title: String(item.title || 'Step'),
            durationMinutes: Number(item.durationMinutes) || 20,
          })),
        });
      }

      return res.json({
        source: 'rule-based',
        message: 'Default breakdown used',
        subtasks: generateRuleBasedSubtasks(title, estimatedMinutes),
      });
    } catch (err: any) {
      console.warn('AI breakdown error, using fallback:', err?.message || err);
      return res.json({
        source: 'rule-based',
        message: 'Generated sensible breakdown',
        subtasks: generateRuleBasedSubtasks(req.body.title || '', req.body.estimatedMinutes),
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'Dayframe' });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dayframe app running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Dayframe server:', err);
  process.exit(1);
});
