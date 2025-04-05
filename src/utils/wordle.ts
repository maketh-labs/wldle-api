import { readFileSync } from 'fs';
import { join } from 'path';

const wordleWords = new Set(
  readFileSync(join(__dirname, '../../resource/wordle_words.txt'), 'utf-8')
    .split('\n')
    .map((word: string) => word.trim().toLowerCase())
);

const validWordleWords = new Set(
  readFileSync(join(__dirname, '../../resource/valid-wordle-words.txt'), 'utf-8')
    .split('\n')
    .map((word: string) => word.trim().toLowerCase())
);

export function getRandomWord(): string {
  return Array.from(wordleWords)[Math.floor(Math.random() * wordleWords.size)];
}

export function getPossibleWords(): string[] {
  return Array.from(validWordleWords);
}

export function isValidWordleWord(word: string): boolean {
  return validWordleWords.has(word.toLowerCase());
}

export function playWordle(word: string, guess: string): { pattern: ("gray" | "blue" | "green")[], solved: boolean } {
  word = word.toLowerCase();
  guess = guess.toLowerCase();
  const pattern: ("gray" | "blue" | "green")[] = new Array(word.length).fill('gray');

  if (guess.length !== word.length) {
    throw new Error('Guess length does not match word length');
  }

  if (!isValidWordleWord(word)) {
    throw new Error('Word is not in dictionary');
  }

  if (!isValidWordleWord(guess)) {
    throw new Error('Guess is not in dictionary');
  }

  const wordLetters = word.split('');

  for (let i = 0; i < word.length; i++) {
    if (guess[i] === word[i]) {
      pattern[i] = 'green';
      wordLetters[i] = '';
    }
  }

  for (let i = 0; i < word.length; i++) {
    if (pattern[i] !== 'green' && wordLetters.includes(guess[i])) {
      pattern[i] = 'blue';
      wordLetters[wordLetters.indexOf(guess[i])] = '';
    }
  }

  return {
    pattern,
    solved: word === guess,
  };
}
