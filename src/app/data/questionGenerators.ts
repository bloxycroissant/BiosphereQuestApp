export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface CodebreakerChallenge {
  ruleDescription: string;
  sequence: (number | string)[];
  options: number[];
  missingAnswer: number;
}

export interface Flashcard {
  front: string;
  back: string;
  explanation: string;
}

export interface NinjaProblem {
  prompt: string;
  options: number[];
  correctAnswer: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface WhackChallenge {
  ruleText: string;
  targetMultiple: number;
  gridNumbers: number[];
}

export interface ScrambleChallenge {
  clue: string;
  jumbledLetters: string[];
  targetWord: string;
}

export interface MemoryMatchCard {
  id: string;
  content: string;
  pairId: string;
}

// Helper for shuffling arrays
const shuffle = <T>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

// ==========================================
// 1. CODEBREAKER GENERATOR (Patterns, Sequences, Algebra)
// ==========================================
export const generateCodebreaker = (grade: GradeLevel): CodebreakerChallenge => {
  let step = grade * 2;
  let start = Math.floor(Math.random() * 10) + 1;
  
  if (grade === 5) step = 7;
  if (grade === 6) step = 12;

  const missingIndex = Math.floor(Math.random() * 3) + 1; // position 1, 2, or 3
  const seq: number[] = [];
  
  for (let i = 0; i < 4; i++) {
    seq.push(start + i * step);
  }

  const missingAnswer = seq[missingIndex];
  seq[missingIndex] = '?' as any;

  const options = shuffle([
    missingAnswer,
    missingAnswer + step,
    missingAnswer - step > 0 ? missingAnswer - step : missingAnswer + 3,
    missingAnswer + (step * 2)
  ]);

  return {
    ruleDescription: `Grade ${grade} Pattern Rule: Find the missing number in the sequence! (Step size: +${step})`,
    sequence: seq,
    options: Array.from(new Set(options)).slice(0, 4),
    missingAnswer,
  };
};

// ==========================================
// 2. FLASHCARD GENERATOR (Expanded Concepts 1-6)
// ==========================================
const FLASHCARD_BANK: Record<GradeLevel, Flashcard[]> = {
  1: [
    { front: "What are the 5 basic senses?", back: "Sight, Hearing, Smell, Taste, Touch", explanation: "We use our senses to explore the world around us." },
    { front: "What is 12 + 8?", back: "20", explanation: "Basic addition combining two sets." },
    { front: "State of matter with a fixed shape?", back: "Solid", explanation: "Solids keep their own shape and volume." }
  ],
  2: [
    { front: "What is an animal habitat?", back: "A natural home or environment", explanation: "Provides food, water, and shelter." },
    { front: "What is 150 + 250?", back: "400", explanation: "Addition with hundreds place value." },
    { front: "What is a liquid property?", back: "Takes the shape of its container", explanation: "Liquids flow and have no fixed shape." }
  ],
  3: [
    { front: "What is photosynthesis?", back: "How plants make food using sunlight", explanation: "Plants use sunlight, water, and CO2." },
    { front: "Perimeter of a square with side 5cm?", back: "20 cm", explanation: "Perimeter = side × 4." },
    { front: "Three states of matter?", back: "Solid, Liquid, Gas", explanation: "Fundamental states found on Earth." }
  ],
  4: [
    { front: "What is the water cycle?", back: "Evaporation, Condensation, Precipitation", explanation: "Continuous movement of water on Earth." },
    { front: "What is 3/4 as a decimal?", back: "0.75", explanation: "Dividing numerator by denominator." },
    { front: "Difference between physical & chemical change?", back: "Chemical creates a new substance; physical does not.", explanation: "Burning is chemical; melting is physical." }
  ],
  5: [
    { front: "Formula for rectangular volume?", back: "Length × Width × Height", explanation: "Measures 3D space occupied." },
    { front: "What is an electromagnet?", back: "A magnet run by electricity", explanation: "Created by passing current through a wire coil." },
    { front: "What is a food web?", back: "A network of interconnected food chains", explanation: "Shows feeding relationships in an ecosystem." }
  ],
  6: [
    { front: "What is Newton's First Law?", back: "An object at rest stays at rest unless acted upon", explanation: "Also known as the Law of Inertia." },
    { front: "What are homogeneous mixtures?", back: "Mixtures uniform throughout (solutions)", explanation: "Cannot distinguish individual components easily." },
    { front: "Calculate area of triangle with base 10, height 5", back: "25", explanation: "Area = (Base × Height) / 2." }
  ]
};

export const generateFlashcard = (grade: GradeLevel): Flashcard => {
  const list = FLASHCARD_BANK[grade] || FLASHCARD_BANK[1];
  return list[Math.floor(Math.random() * list.length)];
};

// ==========================================
// 3. NUMBER NINJA GENERATOR (Arithmetic & Logic)
// ==========================================
export const generateNinjaProblem = (grade: GradeLevel): NinjaProblem => {
  let num1 = Math.floor(Math.random() * 10) + 2;
  let num2 = Math.floor(Math.random() * 10) + 2;
  let prompt = '';
  let correctAnswer = 0;

  if (grade === 1) {
    num1 = Math.floor(Math.random() * 20) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    prompt = `${num1} + ${num2} = ?`;
    correctAnswer = num1 + num2;
  } else if (grade === 2) {
    num1 = Math.floor(Math.random() * 50) + 10;
    num2 = Math.floor(Math.random() * 30) + 5;
    prompt = `${num1} - ${num2} = ?`;
    correctAnswer = num1 - num2;
  } else if (grade === 3) {
    prompt = `${num1} × ${num2} = ?`;
    correctAnswer = num1 * num2;
  } else if (grade === 4) {
    num1 = (Math.floor(Math.random() * 10) + 2) * 5;
    num2 = 5;
    prompt = `${num1} ÷ ${num2} = ?`;
    correctAnswer = num1 / num2;
  } else if (grade === 5) {
    num1 = Math.floor(Math.random() * 20) + 10;
    prompt = `Find 25% of ${num1 * 4}?`;
    correctAnswer = num1;
  } else {
    num1 = Math.floor(Math.random() * 12) + 5;
    prompt = `Solve for x: 2x + ${num1} = ${num1 + 16}`;
    correctAnswer = 8;
  }

  const options = shuffle([
    correctAnswer,
    correctAnswer + 3,
    correctAnswer - 2 > 0 ? correctAnswer - 2 : correctAnswer + 5,
    correctAnswer + 7
  ]);

  return { prompt, options: Array.from(new Set(options)).slice(0, 4), correctAnswer };
};

// ==========================================
// 4. QUIZ GENERATOR (Comprehensive Curriculum)
// ==========================================
const QUIZ_BANK: Record<GradeLevel, QuizQuestion[]> = {
  1: [
    { question: "Which sense do you use to listen to music?", options: ["Hearing", "Sight", "Taste", "Touch"], answer: "Hearing" },
    { question: "What shape has 3 sides?", options: ["Triangle", "Square", "Circle", "Rectangle"], answer: "Triangle" }
  ],
  2: [
    { question: "Which of these is a liquid?", options: ["Water", "Rock", "Wood", "Iron"], answer: "Water" },
    { question: "Where do fish naturally live?", options: ["Aquatic Habitat", "Desert", "Forest", "Mountain"], answer: "Aquatic Habitat" }
  ],
  3: [
    { question: "What gas do plants absorb from the air?", options: ["Carbon Dioxide", "Oxygen", "Nitrogen", "Helium"], answer: "Carbon Dioxide" },
    { question: "What is the perimeter of a rectangle with sides 4 and 6?", options: ["20", "24", "10", "12"], answer: "20" }
  ],
  4: [
    { question: "What is the third stage of the water cycle?", options: ["Precipitation", "Evaporation", "Condensation", "Collection"], answer: "Precipitation" },
    { question: "What is 3/5 expressed as a percentage?", options: ["60%", "35%", "50%", "75%"], answer: "60%" }
  ],
  5: [
    { question: "What force pulls objects toward Earth?", options: ["Gravity", "Magnetism", "Friction", "Tension"], answer: "Gravity" },
    { question: "What is the volume of a box with length 3, width 4, height 5?", options: ["60", "12", "20", "45"], answer: "60" }
  ],
  6: [
    { question: "Which simple machine is a ramp?", options: ["Inclined Plane", "Pulley", "Lever", "Wedge"], answer: "Inclined Plane" },
    { question: "What is a mixture where components are uniform?", options: ["Homogeneous", "Heterogeneous", "Suspension", "Colloid"], answer: "Homogeneous" }
  ]
};

export const generateQuizQuestion = (grade: GradeLevel): QuizQuestion => {
  const list = QUIZ_BANK[grade] || QUIZ_BANK[1];
  const q = list[Math.floor(Math.random() * list.length)];
  return { ...q, options: shuffle(q.options) };
};

// ==========================================
// 5. WHACK-A-NUMBER GENERATOR (Multiples & Factors)
// ==========================================
export const generateWhackChallenge = (grade: GradeLevel): WhackChallenge => {
  let targetMultiple = grade + 1;
  if (grade === 5) targetMultiple = 7;
  if (grade === 6) targetMultiple = 9;

  const gridNumbers: number[] = [];
  for (let i = 0; i < 6; i++) {
    if (i % 2 === 0) {
      gridNumbers.push(targetMultiple * (Math.floor(Math.random() * 5) + 1));
    } else {
      gridNumbers.push(targetMultiple * (Math.floor(Math.random() * 5) + 1) + 1);
    }
  }

  return {
    ruleText: `Whack numbers that are multiples of ${targetMultiple}!`,
    targetMultiple,
    gridNumbers: shuffle(gridNumbers),
  };
};

// ==========================================
// 6. WORD SCRAMBLE GENERATOR (Science & Math Vocabulary)
// ==========================================
const VOCAB_BANK: Record<GradeLevel, { word: string; clue: string }[]> = {
  1: [
    { word: "SOLID", clue: "Matter with a fixed shape" },
    { word: "SENSES", clue: "Sight, smell, touch, taste, hearing" }
  ],
  2: [
    { word: "HABITAT", clue: "Natural home of an animal" },
    { word: "LIQUID", clue: "Flows and takes container shape" }
  ],
  3: [
    { word: "PLANTS", clue: "Organisms that make their own food" },
    { word: "ENERGY", clue: "Capacity to do work or cause change" }
  ],
  4: [
    { word: "CYCLE", clue: "A series of events that repeat" },
    { word: "MATTER", clue: "Anything that has mass and takes up space" }
  ],
  5: [
    { word: "GRAVITY", clue: "Force pulling objects toward Earth" },
    { word: "VOLUME", clue: "Amount of 3D space an object takes up" }
  ],
  6: [
    { word: "INERTIA", clue: "Resistance to change in motion" },
    { word: "MIXTURE", clue: "Combination of two or more substances" }
  ]
};

export const generateWordScramble = (grade: GradeLevel): ScrambleChallenge => {
  const bank = VOCAB_BANK[grade] || VOCAB_BANK[1];
  const item = bank[Math.floor(Math.random() * bank.length)];
  const targetWord = item.word;
  const jumbledLetters = shuffle(targetWord.split(''));

  return {
    clue: item.clue,
    jumbledLetters,
    targetWord,
  };
};

// ==========================================
// 7. MEMORY MATCH GENERATOR (Concept Pairs)
// ==========================================
export const generateMemoryPairs = (grade: GradeLevel): MemoryMatchCard[] => {
  const pairsMap: Record<GradeLevel, { term: string; match: string }[]> = {
    1: [
      { term: "Eye", match: "Sight" },
      { term: "Ear", match: "Hearing" }
    ],
    2: [
      { term: "Solid", match: "Ice Cube" },
      { term: "Liquid", match: "Water" }
    ],
    3: [
      { term: "Sun", match: "Light Source" },
      { term: "Root", match: "Plant Anchor" }
    ],
    4: [
      { term: "Evaporation", match: "Gas State" },
      { term: "Precipitation", match: "Rain/Snow" }
    ],
    5: [
      { term: "Gravity", match: "Downward Pull" },
      { term: "Volume", match: "Cubic Units" }
    ],
    6: [
      { term: "Friction", match: "Resistance" },
      { term: "Inertia", match: "Rest/Motion Stay" }
    ]
  };

  const selectedPairs = pairsMap[grade] || pairsMap[1];
  const cards: MemoryMatchCard[] = [];

  selectedPairs.forEach((p, idx) => {
    cards.push(
      { id: `t-${idx}`, content: p.term, pairId: `pair-${idx}` },
      { id: `m-${idx}`, content: p.match, pairId: `pair-${idx}` }
    );
  });

  return shuffle(cards);
};