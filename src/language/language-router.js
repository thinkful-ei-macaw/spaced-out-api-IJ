const express = require('express');
const LanguageService = require('./language-service');
const { requireAuth } = require('../middleware/jwt-auth');

const languageRouter = express.Router();

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

languageRouter.post('/guess', async (req, res, next) => {
  let guess = req.guess.trim().toLowerCase();
  let headWordId = req.language.head;
  let wordList;

  try {
    headWord = await LanguageService.getWord(req.app.get('db'), headWordId);
  } catch (error) {
    next(error);
  }
  let resBody = {
    nextWord: testLanguagesWords[0].original,
    totalScore: req.language.total_score,
    wordCorrectCount: headWord.correct_count,
    wordIncorrectCount: headword.incorrect_count,
    guess: headword.translation,
  };
  if (!req.guess) {
    res.status(400, "Missing 'guess' in request body");
  } else if (guess === headWord.original) {
    try {
      await LanguageService.updateWord(req.app.get('db'), headWord.id, {
        ...headWord,
        memory_value: headWord.memory_value * 2,
        correct_count: ++headWord.correct_count,
      });

      await LanguageService.updateLanguageScore(
        req.app.get('db'),
        req.user.id,
        ++language.total_score,
      );
    } catch (e) {
      next(e);
    }
    res.send({
      ...resBody,
      isCorrect: true,
    });
  } else if (guess !== headword.original) {
    try {
      await LanguageService.updateWord({
        ...headWord,
        memory_value: 1,
        incorrect_count: ++headWord.incorrect_count,
      });
    } catch (e) {
      next(e);
    }

    res.send({
      ...resBody,
      isCorrect: false,
    });
  }
  // Populating linked list. Now must be sorted with new memory value of head.
  try {
    wordList = await LanguageService.populateList(
      req.app.get('db'),
      headWordId,
    );
  } catch (e) {
    next(e);
  }
});

module.exports = languageRouter;
