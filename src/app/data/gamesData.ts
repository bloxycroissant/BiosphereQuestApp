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
      objective: 'Answer 5 multiple-choice questions before the timer expires.',
      howToPlay: [
        'Read the question at the top of the card.',
        'Keep an eye on the 15-second countdown timer.',
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
      objective: 'Review key terms and concepts using interactive flashcards.',
      howToPlay: [
        'Read the prompt or question on the front.',
        'Tap the card to flip it over and inspect the answer.',
        'Mark "Got it" to advance or "Review Again" to repeat.',
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
      objective: 'Unscramble jumbled letter tiles using the clue provided.',
      howToPlay: [
        'Read the clue text below the empty slots.',
        'Tap or drag jumbled letter tiles into the correct sequence.',
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
      objective: 'Flip cards in a grid to find matching conceptual pairs.',
      howToPlay: [
        'Tap two face-down cards to reveal their contents.',
        'Match related terms (e.g., H2O with Water Droplet).',
        'Clear the grid in fewer turns for higher XP.',
      ],
      example: 'Match: "H2O" <-> "Water Droplet"',
    },
  },
  {
    key: 'NUMBER_NINJA',
    title: 'Number Ninja',
    icon: '🥷',
    xpText: '+50 XP per answer',
    tutorial: {
      objective: 'Solve math equations rapidly in an arcade setting.',
      howToPlay: [
        'Watch math prompts pop up or scroll on screen.',
        'Calculate the answer quickly.',
        'Tap the matching target number before it disappears.',
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
      objective: 'Whack target numbers matching the prompt while avoiding penalties.',
      howToPlay: [
        'Check the active prompt rule (e.g., "Whack Multiples of 3").',
        'Tap numbers popping up that satisfy the rule.',
        'Avoid tapping wrong numbers to prevent score loss.',
      ],
      example: 'Prompt: Whack Multiples of 3! -> Hit: [9], [12]',
    },
  },
  {
    key: 'CODEBREAKER',
    title: 'Codebreaker',
    icon: '🔐',
    xpText: '+500 XP',
    tutorial: {
      objective: 'Identify pattern logic to unlock missing code slots.',
      howToPlay: [
        'Examine the sequence of numbers or nature icons.',
        'Determine the step rule (e.g., +5, x3, or growth cycle).',
        'Select the missing item to complete the sequence.',
      ],
      example: 'Pattern: [ 10 ] -> [ 15 ] -> [ 20 ] -> [ ? ] -> Answer: 25',
    },
  },
];