const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

const MODEL = 'openai/gpt-oss-20b';

// Strips ```json fences if the model adds them despite instructions
const cleanJson = (text) => {
  let t = text.trim();
  if (t.startsWith('```json')) t = t.replace(/^```json/, '').replace(/```$/, '');
  else if (t.startsWith('```')) t = t.replace(/^```/, '').replace(/```$/, '');
  return t.trim();
};

// Non-streaming helper (used by: main analysis, interview grading, repo review)
const callGroq = async (prompt, maxTokens = 4096) => {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: maxTokens,
    reasoning_effort: 'low',
    response_format: { type: 'json_object' }
  });

  const resultText = cleanJson(completion.choices[0].message.content);
  return JSON.parse(resultText);
};

const ANALYSIS_SCHEMA = `{
  "detectedLanguage": "<the actual programming language of the code, lowercase, e.g. python, java, javascript, cpp>",
  "score": {
    "correctness": <number 0-40>,
    "efficiency": <number 0-30>,
    "readability": <number 0-20>,
    "bestPractices": <number 0-10>,
    "total": <number 0-100>
  },
  "bugs": [
    { "line": <string or number>, "issue": "<string>", "fix": "<string>" }
  ],
  "dryRun": "<string explaining step-by-step execution with a sample input>",
  "complexity": {
    "time": "<string e.g. O(N)>",
    "space": "<string e.g. O(1)>",
    "explanation": "<string>"
  },
  "eli5": "<string explaining the code simply to a 5-year-old>",
  "refactoredCode": "<string containing the complete, improved clean code>",
  "interviewQuestions": [
    "<string question 1>",
    "<string question 2>"
  ],
  "testCases": [
    { "input": "<string>", "expected": "<string>", "type": "<string e.g. Edge Case>" }
  ]
}`;

// ---- Feature: main advanced analysis (non-streaming) ----
exports.analyzeCodeAdvanced = async (code, language) => {
  const prompt = `
Act as an expert Senior Software Engineer and Technical Interviewer. First, detect the actual programming language of the code below by examining its syntax — do NOT trust the caller-provided hint ("${language}") if it does not match what you observe in the code itself. Then analyze the code.
You MUST return ONLY a valid JSON object matching this exact schema, with no additional text:
${ANALYSIS_SCHEMA}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`
`;
  return await callGroq(prompt);
};

// ---- Feature: main advanced analysis (STREAMING) ----
// Streams a short live "commentary" as plain text (for immediate UI feedback),
// then a separator, then the full JSON (same schema as above), which is
// parsed once the stream ends and returned to the caller via onDone.
exports.analyzeCodeAdvancedStream = async (code, language, onChunk, onDone, onError) => {
  const prompt = `
Act as an expert Senior Software Engineer reviewing code live, out loud, for a developer watching over your shoulder.

STEP 1: Write a short, friendly, 2-4 sentence running commentary about the code in plain text (no markdown, no JSON). This is what the developer sees streaming in real time.
STEP 2: On a new line, output exactly this separator: ---JSON---
STEP 3: Immediately after the separator, output ONLY a valid JSON object (no markdown fences, no extra text) matching this exact schema:
${ANALYSIS_SCHEMA}

Also detect the actual programming language from the code's syntax — do not trust the caller-provided hint ("${language}") if it doesn't match.

Code to analyze:
\`\`\`${language}
${code}
\`\`\`
`;

  try {
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4096,
      reasoning_effort: 'low',
      stream: true
    });

    let fullText = '';
    let commentarySent = '';
    let splitDone = false;

    for await (const part of stream) {
      const delta = part.choices?.[0]?.delta?.content || '';
      if (!delta) continue;
      fullText += delta;

      if (!splitDone) {
        const sepIndex = fullText.indexOf('---JSON---');
        if (sepIndex === -1) {
          // Still within commentary — stream only the new bit
          const newCommentary = fullText.slice(commentarySent.length);
          if (newCommentary) {
            onChunk(newCommentary);
            commentarySent = fullText;
          }
        } else {
          // Separator just appeared — flush any remaining commentary once, then stop streaming
          const commentaryPart = fullText.slice(0, sepIndex);
          const newCommentary = commentaryPart.slice(commentarySent.length);
          if (newCommentary) onChunk(newCommentary);
          commentarySent = commentaryPart;
          splitDone = true;
        }
      }
    }

    const sepIndex = fullText.indexOf('---JSON---');
    const jsonPart = sepIndex === -1 ? fullText : fullText.slice(sepIndex + '---JSON---'.length);
    const parsed = JSON.parse(cleanJson(jsonPart));
    onDone(parsed);
  } catch (err) {
    onError(err);
  }
};

// ---- Feature: grade an answer to an AI-generated interview question ----
exports.gradeInterviewAnswer = async (code, language, question, answer) => {
  const prompt = `
Act as a Senior Software Engineer conducting a technical interview about the ${language} code below. You asked the candidate this question:
"${question}"

The candidate answered:
"${answer}"

Evaluate their answer for correctness and depth given the actual code. Return ONLY a valid JSON object matching this schema, with no additional text:
{
  "verdict": "<one of: Strong, Needs Improvement, Incorrect>",
  "feedback": "<2-4 sentences of specific, constructive feedback on their answer>",
  "idealAnswerHint": "<1-2 sentences hinting at what a stronger answer would include>"
}

Code being discussed:
\`\`\`${language}
${code}
\`\`\`
`;
  return await callGroq(prompt, 1024);
};

// ---- Feature: multi-file repository review ----
exports.analyzeRepo = async (files, repoName) => {
  const combined = files
    .map((f) => `--- FILE: ${f.path} ---\n${f.content}`)
    .join('\n\n');

  const prompt = `
Act as a Principal Software Engineer performing a high-level architecture review of the GitHub repository "${repoName}". Below are ${files.length} representative source files from the repo (some content may be truncated for length).
You MUST return ONLY a valid JSON object matching this exact schema, with no additional text:
{
  "overallScore": <number 0-100>,
  "architectureSummary": "<3-5 sentences on overall structure, patterns used, and design quality>",
  "topRisks": ["<string>", "<string>", "<string>"],
  "fileReviews": [
    { "file": "<path exactly as given>", "issues": ["<string>"], "suggestion": "<string>" }
  ]
}

Repository files:
${combined}
`;
  return await callGroq(prompt, 4096);
};
