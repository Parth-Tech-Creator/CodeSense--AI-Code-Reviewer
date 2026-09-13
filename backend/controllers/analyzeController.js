const aiService = require('../services/aiService');
const Analysis = require('../models/Analysis');

exports.analyzeAdvanced = async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  try {
    const resultJson = await aiService.analyzeCodeAdvanced(code, language);

    // Save to history if logged in
    if (req.user) {
      const newAnalysis = new Analysis({
        user: req.user.id,
        language: resultJson.detectedLanguage || language,
        code,
        result: resultJson
      });
      await newAnalysis.save();
    }

    res.json(resultJson);
  } catch (error) {
    console.error('Error in advanced analysis:', error);
    res.status(500).json({ error: 'Failed to analyze code', details: error.message });
  }
};

// Streaming version: sends live commentary over SSE, then the full structured result
exports.analyzeAdvancedStream = async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  await aiService.analyzeCodeAdvancedStream(
    code,
    language,
    (chunk) => send('commentary', { chunk }),
    async (resultJson) => {
      if (req.user) {
        try {
          const newAnalysis = new Analysis({
            user: req.user.id,
            language: resultJson.detectedLanguage || language,
            code,
            result: resultJson
          });
          await newAnalysis.save();
        } catch (saveErr) {
          console.error('Error saving streamed analysis:', saveErr);
        }
      }
      send('done', resultJson);
      res.end();
    },
    (err) => {
      console.error('Error in streaming analysis:', err);
      send('error', { error: 'Streaming analysis failed', details: err.message });
      res.end();
    }
  );
};

// Grade a candidate's answer to one of the AI-generated interview questions
exports.gradeInterviewAnswer = async (req, res) => {
  const { code, language, question, answer } = req.body;

  if (!code || !language || !question || !answer) {
    return res.status(400).json({ error: 'code, language, question and answer are all required' });
  }

  try {
    const feedback = await aiService.gradeInterviewAnswer(code, language, question, answer);
    res.json(feedback);
  } catch (error) {
    console.error('Error grading interview answer:', error);
    res.status(500).json({ error: 'Failed to grade answer', details: error.message });
  }
};

// Multi-file GitHub repo review
exports.analyzeRepo = async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ error: 'A GitHub repository URL is required' });
  }

  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/i);
  if (!match) {
    return res.status(400).json({ error: 'Please provide a valid GitHub repository URL, e.g. https://github.com/owner/repo' });
  }
  const owner = match[1];
  const repo = match[2].replace(/\.git$/, '');

  try {
    const repoInfoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!repoInfoRes.ok) {
      return res.status(404).json({ error: 'Repository not found, or it is private' });
    }
    const repoInfo = await repoInfoRes.json();
    const branch = repoInfo.default_branch;

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
    if (!treeRes.ok) {
      return res.status(502).json({ error: 'Could not read the repository file tree from GitHub' });
    }
    const treeData = await treeRes.json();

    const CODE_EXT = /\.(js|jsx|ts|tsx|py|java|cpp|c|go|rb|php)$/i;
    const IGNORE = /(node_modules|dist|build|vendor|\.min\.)/i;

    const candidateFiles = (treeData.tree || [])
      .filter((f) => f.type === 'blob' && CODE_EXT.test(f.path) && !IGNORE.test(f.path) && f.size && f.size < 20000)
      .sort((a, b) => a.size - b.size)
      .slice(0, 6);

    if (candidateFiles.length === 0) {
      return res.status(400).json({ error: 'No analyzable source files were found in this repository' });
    }

    const files = await Promise.all(
      candidateFiles.map(async (f) => {
        const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${f.path}`);
        const content = rawRes.ok ? await rawRes.text() : '';
        return { path: f.path, content: content.slice(0, 4000) };
      })
    );

    const resultJson = await aiService.analyzeRepo(files, `${owner}/${repo}`);
    res.json({ ...resultJson, repo: `${owner}/${repo}`, filesAnalyzed: files.map((f) => f.path) });
  } catch (error) {
    console.error('Error in repo analysis:', error);
    res.status(500).json({ error: 'Failed to analyze repository', details: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
