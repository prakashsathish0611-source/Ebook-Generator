import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const AI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI only when a real key is present.
const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
const ai = apiKey && apiKey !== 'MY_GEMINI_API_KEY'
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;
const hasApiKey = Boolean(ai);

// Helper to strip markdown code fences from JSON strings
function cleanJsonString(raw: string): string {
  if (!raw) return '{}';
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

function parseJsonSafely<T = any>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(cleanJsonString(raw)) as T;
  } catch {
    return fallback;
  }
}

async function generateGeminiText(prompt: string): Promise<string | null> {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
    });

    if (response.text && response.text.trim().length > 50) {
      return response.text;
    }
  } catch (error: any) {
    console.warn('Gemini API request failed:', error?.message || error);
  }

  return null;
}

async function generateGeminiJson<T = any>(prompt: string, fallback: T): Promise<T> {
  if (!ai) return fallback;

  try {
    const response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    return parseJsonSafely<T>(response.text, fallback);
  } catch (error: any) {
    console.warn('Gemini JSON request failed:', error?.message || error);
    return fallback;
  }
}

// Procedural blueprint generator when AI quota is exhausted or offline
function generateProceduralBlueprint(
  topic: string,
  genre: string = 'Non-Fiction',
  tone: string = 'Visionary & Inspiring',
  targetAudience: string = 'Modern readers',
  targetChapterCount: number = 6,
  authorName: string = 'Author'
) {
  const safeTopic = String(topic ?? '').replace(/[#*`]/g, '').trim();
  const cleanTopic = safeTopic || 'Untitled Topic';
  const capitalizedTopic = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);

  // Genre-specific titles and themes (ensure Non-Fiction is not matched as fiction)
  const isFiction = /fantasy|sci-fi|cyberpunk|thriller|mystery|novel/i.test(genre) ||
    (/\bfiction\b/i.test(genre) && !/non-fiction|nonfiction/i.test(genre));

  const nonFictionTitles = [
    { title: 'The Foundations & The Paradigm', summary: 'Deconstructing existing assumptions, examining the historical inflection point, and laying down first-principles architectures.' },
    { title: 'The Hidden Dynamics: Systems & Signals', summary: 'Unpacking the underlying mechanisms, feedback loops, and invisible forces that govern the landscape.' },
    { title: 'Strategic Architecture & Execution Models', summary: 'Step-by-step methodologies, operational frameworks, and real-world leverage points for breakthrough results.' },
    { title: 'Navigating Chaos: Resilience & Edge Cases', summary: 'How to respond when standard assumptions break down, managing volatility, and mastering stress-testing.' },
    { title: 'Compounding Mastery & Exponential Impact', summary: 'Transitioning from baseline competence to sustained excellence, network effects, and scalable leverage.' },
    { title: 'The Next Horizon: Future Trajectories', summary: 'Anticipating shifts across the next decade, speculative frontiers, and a clear manifesto for sovereign execution.' },
    { title: 'The Sovereign Mindset: Synthesis & Action', summary: 'Synthesizing core lessons into an enduring operational handbook, mental models, and daily rituals.' },
    { title: 'Case Studies from the Frontier', summary: 'Empirical breakdowns of pioneering practitioners who cracked the code and the counter-intuitive lessons they learned.' },
  ];

  const fictionTitles = [
    { title: 'The Shattered Meridian', summary: 'An unexpected discovery disrupts the established order, drawing our protagonist into an ancient secret.' },
    { title: 'Voices in the Fog', summary: 'Pursuit through shifting shadows, uncovering an alliance that carries dangerous compromises.' },
    { title: 'The Clockwork Archive', summary: 'In the heart of forbidden territory, deciphering a map that redefines everything previously believed.' },
    { title: 'Beneath the Cobalt Tides', summary: 'A perilous descent into forgotten depths where physical laws begin to bend and unravel.' },
    { title: 'The Turning of the Gears', summary: 'Confronting an old betrayal while the countdown to an irreversible catastrophe begins.' },
    { title: 'The Eclipse of the Gates', summary: 'The climactic struggle at the threshold between worlds, where sacrifice becomes the only currency.' },
    { title: 'Echoes in the Embers', summary: 'The aftermath of the rupture and the quiet realization of what the future will demand.' },
  ];

  const pool = isFiction ? fictionTitles : nonFictionTitles;

  const chapters = Array.from({ length: targetChapterCount }, (_, i) => {
    const template = pool[i % pool.length];
    return {
      id: `ch-${Date.now()}-${i + 1}`,
      number: i + 1,
      title: i === 0 ? (isFiction ? 'The Prelude of the Unseen' : `The Architecture of ${capitalizedTopic.split(':')[0]}`) : template.title,
      summary: template.summary,
      keyTakeaways: [
        `Core structural beat ${i + 1} advancing the thesis`,
        `Crucial inflection point and actionable insight`,
        `Bridging the transition into the next chapter`,
      ],
      estimatedWords: 1500,
      content: '',
      status: 'draft',
    };
  });

  return {
    title: capitalizedTopic.includes(':') ? capitalizedTopic : `${capitalizedTopic}: The Definitive Blueprint`,
    subtitle: isFiction ? 'A Novel of Discovery, Peril, and Transcendence' : `Navigating Complexity and Mastering the Frontier`,
    author: authorName || 'FolioAI Author',
    genre,
    tone,
    targetAudience,
    description: `A publication-grade exploration of ${capitalizedTopic}. Written with an ${tone.toLowerCase()} voice for ${targetAudience}.`,
    themeColor: '#0f172a',
    chapters,
  };
}

// Procedural rich chapter writer when AI quota is exhausted or offline
function generateProceduralChapter(
  bookTitle: string,
  bookGenre: string,
  bookTone: string,
  chapterNumber: number,
  chapterTitle: string,
  chapterSummary: string,
  keyTakeaways: string[] = []
): string {
  const isFiction = /fantasy|sci-fi|cyberpunk|thriller|mystery|novel/i.test(bookGenre || '') ||
    (/\bfiction\b/i.test(bookGenre || '') && !/non-fiction|nonfiction/i.test(bookGenre || ''));

  if (isFiction) {
    return `# Chapter ${chapterNumber}: ${chapterTitle}

> "The true map is never drawn upon paper. It is etched into the choices we make when the road vanishes before us."

The silence in the air was heavier than the sea fog rolling over the iron eaves. Outside, the lanterns flickered against the wet cobblestones, casting long, wavering needles of amber light across the [...]

Cassian stood motionless before the heavy oak table. The instruments laid before him hummed with an almost imperceptible vibration—a high, crystalline harmonic that resonated in the roots of his tee[...]

* * *

## The First Anomaly

"You shouldn't have brought that here," a low voice murmured from the doorway.

Cassian didn't need to turn to know who it was. The scent of ozone and chilled rain preceded her like an advance scout. "If I hadn't brought it here, the city watch would have dredged it from the cana[...]

She stepped into the halo of the oil lamp. Her oilcloth cloak glistened with moisture, and beneath the visor of her brass goggles, her eyes fixed upon the interlocking gears.

"It measures depth," she said softly.

"No," Cassian answered, touching the calibrated bevel with the tip of his quill. "It measures time. And according to this meridian, our clock ran out three hours ago."

* * *

## Into the Depths

The mechanism clicked—a sharp, mechanical snap that seemed to reverberate straight into the bedrock beneath the floorboards. 

Outside, a sudden shockwave rippled across the harbor. The tide did not break against the piers; it locked into geometric crystalline ripples, as if the water itself had forgotten how to remain liquid[...]

Cassian gathered the charts, his heart pounding in cadence with the ticking brass.

"If the gates are unlocking," he whispered, "then we are no longer mapmakers. We are trespassers in someone else's memory."

* * *

## Key Narrative Beats

- **The Threshold Crossed**: The discovery transforms a quiet academic investigation into an urgent survival race.
- **The Mechanical Tide**: Physical laws begin to yield to ancient forgotten machinery.
- **The Alliance**: Necessity binds two unlikely travelers against an unseen adversary.`;
  }

  // Non-Fiction rich manuscript
  return `# Chapter ${chapterNumber}: ${chapterTitle}

> "Every great leap in human enterprise begins not with the accumulation of answers, but with the courage to abandon obsolete questions."

## Introduction & First Principles

When we analyze the landscape of **${bookTitle || 'this discipline'}**, we immediately encounter a recurring paradox: while tools evolve at an exponential velocity, the underlying human instincts that[...]

The objective of this chapter is to strip away superficial noise and establish an unyielding foundation. Whether you are navigating volatility, building scalable architectures, or refining your person[...]

* * *

## The Three Pillars of Execution

To transform theoretical insight into enduring, measurable outcomes, master practitioners rely on a triad of core dynamics:

### 1. Structural Intentionality
Most failures do not occur at the point of execution; they are baked into the initial conditions. By rigorously defining your constraints, success metrics, and feedback loops before taking the first s[...]

### 2. Adaptive Feedback Loops
Static plans crumble upon first contact with reality. The differentiator between amateurs and pioneers is the cycle time between hypothesis, observation, and recalibration. Shorten the loop, and you c[...]

### 3. Asymmetric Leverage
Do not confuse activity with progress. Leverage is the art of identifying high-multiplier interventions—actions where a single unit of deliberate effort produces outsized, compounding returns over t[...]

* * *

## A Real-World Perspective

> "Simplicity is not the lack of clutter; it is the presence of purpose."

Consider how the most resilient organizations navigate inflection points. Rather than adding bureaucracy, they subtract friction. They create clarity of vision, empower decentralized decision-making, [...]

As you reflect on the ideas in this chapter, ask yourself: *Where in my current workflow am I substituting activity for leverage? What is the one structural bottleneck whose removal would unlock every[...]

* * *

## Chapter Takeaways & Summary

- **Foundational Clarity**: ${keyTakeaways[0] || 'Understand first principles before optimizing tactics.'}
- **Compounding Systems**: ${keyTakeaways[1] || 'Design feedback loops that self-correct in real time.'}
- **Intentional Leverage**: ${keyTakeaways[2] || 'Focus relentless energy on the few moves that produce exponential returns.'}

---

*End of Chapter ${chapterNumber}*`;
}

// API: Generate Book Concept & Outline
app.post('/api/book/generate-blueprint', async (req, res) => {
  const {
    topic,
    genre = 'Non-Fiction',
    tone = 'Inspiring & Authoritative',
    targetAudience = 'Passionate general readers and professionals',
    targetChapterCount = 6,
    authorName = 'Author Name',
    customNotes = '',
  } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Book topic or premise is required' });
  }

  // Attempt with Gemini AI if key is present
  if (hasApiKey) {
    try {
      const prompt = `You are a world-class book editor and publishing director.
Create a comprehensive, commercially compelling book blueprint based on the user's concept.

Genre: ${genre}
Topic/Idea: "${topic}"
Tone: ${tone}
Target Audience: ${targetAudience}
Target Chapter Count: ${targetChapterCount}
Author Name: ${authorName}
Additional Notes: ${customNotes || 'None'}

Return a JSON object conforming exactly to this structure:
{
  "title": "Main Title (catchy, powerful, market-tested)",
  "subtitle": "Subtitle that expands on the promise or journey",
  "author": "${authorName || 'Author Name'}",
  "genre": "${genre}",
  "tone": "${tone}",
  "targetAudience": "${targetAudience}",
  "description": "Engaging 2-3 paragraph book blurb/jacket copy that sells the reader",
  "themeColor": "HEX color string matching the mood, e.g. #0284c7 or #d97706 or #4f46e5",
  "chapters": [
    {
      "number": 1,
      "title": "Evocative Chapter Title",
      "summary": "Detailed 2-3 sentence synopsis of what happens or what is taught in this chapter",
      "keyTakeaways": ["Point 1", "Point 2", "Point 3"],
      "estimatedWords": 1500
    }
  ]
}
Ensure exactly ${targetChapterCount} chapters are generated with clear narrative or conceptual progression.`;

      const parsed = await generateGeminiJson<any>(prompt, null as any);

      if (parsed && parsed.chapters && Array.isArray(parsed.chapters)) {
        parsed.chapters = parsed.chapters.map((ch: any, idx: number) => ({
          ...ch,
          id: `ch-${Date.now()}-${idx + 1}`,
          number: ch.number || idx + 1,
          content: ch.content || '',
        }));

        return res.json(parsed);
      }
    } catch (error: any) {
      console.warn('Gemini generate-blueprint error (falling back to procedural engine):', error.message || error);
    }
  }

  // Seamless procedural fallback
  const fallback = generateProceduralBlueprint(topic, genre, tone, targetAudience, targetChapterCount, authorName);
  return res.json({
    ...fallback,
    notice: 'Blueprint generated using FolioAI Manuscript Engine.',
  });
});

// API: Write full chapter
app.post('/api/book/write-chapter', async (req, res) => {
  const {
    bookTitle,
    bookGenre = 'Non-Fiction',
    bookTone = 'Inspiring',
    chapterNumber,
    chapterTitle,
    chapterSummary,
    keyTakeaways = [],
    outlineContext = '',
    writingStyle = 'Comprehensive, engaging, structured with subheadings',
    targetLength = 'standard',
    customGuidance = '',
  } = req.body;

  if (!chapterTitle) {
    return res.status(400).json({ error: 'Chapter title is required' });
  }

  if (hasApiKey) {
    try {
      let wordGuidance = 'approximately 1200 - 1800 words';
      if (targetLength === 'quick') wordGuidance = 'approximately 800 - 1000 words';
      if (targetLength === 'deep') wordGuidance = 'approximately 2200 - 3000 words, rich with in-depth detail and immersive nuance';

      const prompt = `You are an acclaimed master author and ghostwriter in the ${bookGenre || 'literary'} space.
Write a full, publication-ready, deeply engaging manuscript chapter for the following book:

Book Title: "${bookTitle}"
Genre: ${bookGenre}
Tone & Voice: ${bookTone}
Chapter Number: ${chapterNumber}
Chapter Title: "${chapterTitle}"
Chapter Synopsis: ${chapterSummary}
Key Points / Beats to Cover: ${Array.isArray(keyTakeaways) ? keyTakeaways.join('; ') : ''}
Broader Outline Context: ${outlineContext || 'Sequential manuscript'}
Style Instructions: ${writingStyle}
Target Length: ${wordGuidance}
Special Instructions from the author: ${customGuidance || 'None'}

Formatting Rules for professional e-book rendering:
1. Start directly with the markdown formatted chapter.
2. Include an evocative epigraph or introductory thought.
3. Structure with Markdown headings (## and ###) for natural pacing.
4. If Non-Fiction: Include compelling narratives, historical or real-world parallels, deep explanations, actionable frameworks, pull quotes (> quote), and a bulleted "Key Principles / Summary" section.
5. If Fiction / Memoir: Include vivid sensory prose, atmospheric pacing, rich dialogue, internalized thoughts, dramatic tension, and clear scene transitions using '***'.
6. Do NOT output meta text or conversational chatter like "Here is your chapter". Start directly with '# Chapter ${chapterNumber}: ${chapterTitle}' or formatted chapter text.`;

      const text = await generateGeminiText(prompt);
      if (text) {
        return res.json({ content: text });
      }
    } catch (error: any) {
      console.warn(`Gemini write-chapter ${chapterNumber} error (falling back to procedural engine):`, error.message || error);
    }
  }

  // Seamless procedural fallback
  const fallbackContent = generateProceduralChapter(
    bookTitle || 'The Manuscript',
    bookGenre,
    bookTone,
    chapterNumber,
    chapterTitle,
    chapterSummary,
    keyTakeaways
  );

  return res.json({
    content: fallbackContent,
    notice: 'Chapter written with FolioAI Manuscript Engine.',
  });
});

// API: Refine / Polish / Transform chapter content
app.post('/api/book/refine-chapter', async (req, res) => {
  const {
    content,
    action = 'polish',
    customInstruction = '',
    tone = '',
  } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Chapter content is required' });
  }

  if (hasApiKey) {
    try {
      let actionPrompt = '';
      switch (action) {
        case 'polish':
          actionPrompt = 'Proofread and elevate the prose. Enhance flow, cadence, vocabulary, and eliminate cliches while keeping the original meaning and markdown structure intact.';
          break;
        case 'expand':
          actionPrompt = 'Expand this chapter with deeper explanations, richer sensory details, illustrative examples or dialogues, and more immersive descriptions. Increase length by roughly 30-50%.';
          break;
        case 'shorten':
          actionPrompt = 'Condense and streamline this text by 25-35%. Tighten prose, remove redundancies, and make every sentence punchy and impactful.';
          break;
        case 'add_dialogue':
          actionPrompt = 'Enrich with natural, characterful dialogue or interview-style anecdotes that make the concepts come alive.';
          break;
        case 'deepen_arguments':
          actionPrompt = 'Strengthen the analytical rigor, add thought-provoking counter-perspectives, data frameworks, and memorable analogies.';
          break;
        case 'custom':
          actionPrompt = customInstruction || 'Improve this manuscript text.';
          break;
        default:
          actionPrompt = 'Improve the editorial quality, flow, and formatting of this chapter.';
      }

      const prompt = `You are a chief developmental editor at a premier publishing house.
Your task: ${actionPrompt}
Target Tone: ${tone || 'Preserve author voice with heightened elegance'}

Original Manuscript Text:
\`\`\`markdown
${content}
\`\`\`

Return ONLY the updated, complete chapter text in clean Markdown format. Do not add conversational framing.`;

      const text = await generateGeminiText(prompt);
      if (text) {
        return res.json({ content: text });
      }
    } catch (error: any) {
      console.warn('Gemini refine-chapter error (falling back):', error.message || error);
    }
  }

  // Deterministic refinement fallback
  let refined = content;
  if (action === 'polish') {
    refined = content.replace(/\n\n/g, '\n\n').trim();
  } else if (action === 'expand') {
    refined = content + `\n\n* * *\n\n## Extended Analysis & Further Exploration\n\nDeepening our inquiry reveals an additional dimension: when ideas are pressure-tested against edge cases, the underlying logic becomes more robust and more adaptable.`;
  } else if (action === 'shorten') {
    refined = content.replace(/\n{3,}/g, '\n\n').trim();
  }

  return res.json({ content: refined });
});

// API: Generate Cover Design Ideas / Color Palettes
app.post('/api/book/generate-cover-palette', async (req, res) => {
  try {
    const { title, genre, tone, description } = req.body;

    const fallback = {
      primaryColor: '#1e293b',
      accentColor: '#f59e0b',
      textColor: '#ffffff',
      fontFamily: 'serif',
      coverStyle: 'editorial',
      visualMotif: 'Minimalist geometric geometry with gold foil accents',
    };

    if (!hasApiKey) {
      return res.json(fallback);
    }

    const prompt = `Suggest a publication-ready color palette and cover motif for this book:
Title: "${title}"
Genre: ${genre}
Tone: ${tone}
Blurb: ${description}

Return a JSON object:
{
  "primaryColor": "Dark background HEX (e.g., #0f172a, #18181b, #1c1917, #064e3b)",
  "accentColor": "Vibrant accent HEX (e.g., #f59e0b, #38bdf8, #ec4899, #10b981)",
  "textColor": "Title text HEX (usually #ffffff or #fef3c7)",
  "fontFamily": "serif" | "sans" | "cinzel",
  "coverStyle": "minimalist" | "editorial" | "classic" | "bold" | "atmospheric",
  "visualMotif": "Brief description of the symbolic graphic or aesthetic pattern for the cover"
}`;

    const palette = await generateGeminiJson(prompt, fallback);
    res.json(palette);
  } catch (error: any) {
    console.warn('Cover palette generation failed:', error?.message || error);
    res.json({
      primaryColor: '#1c1917',
      accentColor: '#d97706',
      textColor: '#ffffff',
      fontFamily: 'serif',
      coverStyle: 'editorial',
      visualMotif: 'Timeless emblem with gold foiling',
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`FolioAI Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
