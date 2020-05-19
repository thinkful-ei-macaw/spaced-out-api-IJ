const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');
const { display } = require('../utils/linked-list');
const languageRouter = express.Router();
const bodyParser = express.json();

languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id,
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`,
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/', async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id,
    );

    res.json({
      language: req.language,
      words,
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get('/head', async (req, res, next) => {
  let headWordId = req.language.head;
  let totalScore = req.language.total_score;
  let nextWord;
  try {
    nextWord = await LanguageService.getNextWord(req.app.get('db'), headWordId);
  } catch (error) {
    next(error);
  }
  res.status(200).json({
    nextWord: nextWord.original,
    totalScore: totalScore,
    wordCorrectCount: nextWord.correct_count,
    wordIncorrectCount: nextWord.incorrect_count,
  });
});

languageRouter.post('/guess', bodyParser, async (req, res, next) => {
  let guess = req.body.guess.trim().toLowerCase();
  let headWordId = req.language.head;
  let wordList;
  let newMemoryValue;

  try {
    headWord = await LanguageService.getWord(req.app.get('db'), headWordId);
    let correctCount = headWord.correct_count;
    let incorrectCount = headWord.incorrect_count;
    let totalScore = req.language.total_score;
    let isCorrect = false;
    if (!req.guess) {
      res.status(400, "Missing 'guess' in request body");
    }
    if (guess === headWord.translation) {
      newMemoryValue = headWord.memory_value * 2;
      isCorrect = true;
      await LanguageService.updateWord(req.app.get('db'), headWord.id, {
        ...headWord,
        memory_value: newMemoryValue,
        correct_count: ++correctCount,
      });

      await LanguageService.updateLanguageScore(
        req.app.get('db'),
        req.user.id,
        ++totalScore,
      );
    }

    if (guess !== headWord.translation) {
      newMemoryValue = 1;
      await LanguageService.updateWord(req.app.get('db'), headWord.id, {
        ...headWord,
        memory_value: newMemoryValue,
        incorrect_count: ++incorrectCount,
      });
    }

    // Populating linked list. Now must be sorted with new memory value of head.
    wordList = await LanguageService.populateList(
      req.app.get('db'),
      headWordId,
    );

    wordList.moveHeadTo(headWord.memory_value);
    await LanguageService.updateWords(req.app.get('db'), wordList, req.user.id);

    return res.status(201).json({
      nextWord: headWord.original,
      totalScore: totalScore,
      wordCorrectCount: correctCount,
      wordIncorrectCount: incorrectCount,
      answer: headWord.translation,
      isCorrect: isCorrect,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = languageRouter;
