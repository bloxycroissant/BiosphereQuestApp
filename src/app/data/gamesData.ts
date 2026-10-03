export type GameKey =
  | 'QUIZ'
  | 'FLASHCARD'
  | 'WORD_SCRAMBLE'
  | 'MEMORY_MATCH'
  | 'NUMBER_NINJA'
  | 'WHACK_A_NUMBER'
  | 'CODEBREAKER';

export interface GameMeta {
  key: GameKey;
  title: string;
  icon: string;
  xpText: string;
  tutorial: {
    objective: string;
    howToPlay: string[];
    example: string;
  };
}

export const GAMES_LIST: GameMeta[] = [
  {
    key: 'QUIZ',
    title: 'Daily Quiz',
    icon: '📝',
    xpText: '+150 XP',
    tutorial: {
      objective: 'Answer five Math and Science multiple-choice questions, each within 15 seconds.',
      howToPlay: [
        'Read the question at the top of the card.',
        'Keep an eye on the 15-second countdown timer and the question progress bar.',
        'Tap the correct answer from the 4 options.',
      ],
      example: 'Q: Which animal is a mammal? -> Answer: Dolphin',
    },
  },
  {
    key: 'FLASHCARD',
    title: 'Flashcards',
    icon: '🃏',
    xpText: '+80 XP per cycle',
    tutorial: {
      objective: 'Review six grade-level Math and Science cards in a flip-card deck.',
      howToPlay: [
        'Read the prompt or question on the front.',
        'Tap the card to flip it over and inspect the answer.',
        'Mark "Got it" when mastered or "Review Again" to see the card again before the cycle ends.',
      ],
      example: 'Front: What process helps a plant grow toward sunlight? -> Back: Photosynthesis!',
    },
  },
  {
    key: 'WORD_SCRAMBLE',
    title: 'Word Scramble',
    icon: '🧩',
    xpText: '+20 to +120 XP',
    tutorial: {
      objective: 'Unscramble movable letter tiles using the clue before the 30-second timer expires.',
      howToPlay: [
        'Read the clue text below the empty slots.',
        'Tap letters to fill the answer slots; tap a filled slot to return its letter.',
        'Complete the word before time runs out!',
      ],
      example: 'Clue: Plant food making process -> Target: PHOTOSYNTHESIS',
    },
  },
  {
    key: 'MEMORY_MATCH',
    title: 'Memory Match',
    icon: '🧠',
    xpText: '+40 to +200 XP',
    tutorial: {
      objective: 'Clear a 4×4 grid by matching eight related Math and Science pairs.',
      howToPlay: [
        'Tap two face-down cards to reveal their contents.',
        'Match related terms (e.g., H2O with Water Droplet).',
        'Finish within 90 seconds; faster clears and higher grades award more XP.',
      ],
      example: 'Match: "H2O" <-> "Water Droplet"',
    },
  },
  {
    key: 'NUMBER_NINJA',
    title: 'Number Ninja',
    icon: '🥷',
    xpText: '+50 XP per correct answer',
    tutorial: {
      objective: 'Solve ten grade-level math equations with a 15-second limit per question.',
      howToPlay: [
        'Watch math prompts pop up or scroll on screen.',
        'Calculate the answer quickly.',
        'Tap the correct answer from the four choices before time runs out.',
      ],
      example: 'Prompt: 15 × 4 = ? -> Answer: 60',
    },
  },
  {
    key: 'WHACK_A_NUMBER',
    title: 'Whack-a-Number',
    icon: '🔨',
    xpText: '+100 XP',
    tutorial: {
      objective: 'Hit ten numbers that match the target rule before the 45-second timer expires.',
      howToPlay: [
        'Check the active prompt rule (e.g., "Whack Multiples of 3").',
        'Tap target numbers in the 3×3 grid to increase your score.',
        'Wrong numbers deduct a point; reach the quota for +100 XP.',
      ],
      example: 'Prompt: Whack Multiples of 3! -> Hit: [9], [12]',
    },
  },
  {
    key: 'CODEBREAKER',
    title: 'Codebreaker',
    icon: '🔐',
    xpText: 'Up to +500 XP',
    tutorial: {
      objective: 'Solve ten Math or Science sequences to unlock the secret nature code.',
      howToPlay: [
        'Examine the sequence of numbers or nature icons.',
        'Determine the step rule (e.g., +5, x3, or growth cycle).',
        'Choose the missing number or life-cycle stage; earn 50 XP for each correct answer.',
      ],
      example: 'Pattern: [ 10 ] -> [ 15 ] -> [ 20 ] -> [ ? ] -> Answer: 25',
    },
  },
];