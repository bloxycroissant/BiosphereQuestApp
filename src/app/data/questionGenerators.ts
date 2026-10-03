export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type Subject = 'Math' | 'Science' | 'Both';

export interface CodebreakerChallenge {
  ruleDescription: string;
  sequence: (number | string)[];
  options: (number | string)[];
  missingAnswer: number | string;
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

const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const makeOptions = (answer: number): number[] => {
  const options = new Set([answer]);
  for (const offset of [3, -2, 7, 5, -4, 9]) {
    const candidate = answer + offset;
    if (candidate >= 0) options.add(candidate);
    if (options.size === 4) break;
  }
  return shuffle([...options]);
};

const FLASHCARD_BANK: Record<GradeLevel, Flashcard[]> = {
  1: [
    { front: 'What are the five basic senses?', back: 'Sight, hearing, smell, taste, and touch', explanation: 'Our senses help us observe and understand our surroundings.' },
    { front: 'What is 12 + 8?', back: '20', explanation: 'Add the two groups to find the total.' },
    { front: 'Which state of matter has a fixed shape?', back: 'Solid', explanation: 'A solid keeps its own shape and volume.' },
    { front: 'What number comes after 38?', back: '39', explanation: 'Counting forward adds one.' },
    { front: 'Which body part helps you hear?', back: 'Ears', explanation: 'Our ears detect sounds.' },
    { front: 'What is 15 - 7?', back: '8', explanation: 'Subtracting 7 from 15 leaves 8.' },
  ],
  2: [
    { front: 'What is an animal habitat?', back: 'Its natural home or environment', explanation: 'A habitat provides an organism with resources such as food, water, and shelter.' },
    { front: 'What is 150 + 250?', back: '400', explanation: 'Add the hundreds and tens to find the sum.' },
    { front: 'What does a liquid do in a container?', back: 'Takes the shape of its container', explanation: 'Liquids flow and do not have a fixed shape.' },
    { front: 'What is 5 groups of 2?', back: '10', explanation: 'Skip-count by twos: 2, 4, 6, 8, 10.' },
    { front: 'What do plants need from sunlight?', back: 'Energy to grow and make food', explanation: 'Plants use light energy during photosynthesis.' },
    { front: 'What is half of 18?', back: '9', explanation: 'Half means splitting a quantity into two equal groups.' },
  ],
  3: [
    { front: 'What is photosynthesis?', back: 'How plants make food using sunlight', explanation: 'Plants use sunlight, water, and carbon dioxide to make food.' },
    { front: 'What is the perimeter of a square with a 5 cm side?', back: '20 cm', explanation: 'A square has four equal sides: 4 × 5 cm.' },
    { front: 'What are the three common states of matter?', back: 'Solid, liquid, and gas', explanation: 'Matter can be described by these three states.' },
    { front: 'What is 7 × 6?', back: '42', explanation: 'Seven groups of six make 42.' },
    { front: 'Which animal is a mammal: frog, dolphin, eagle, or crocodile?', back: 'Dolphin', explanation: 'Dolphins are mammals that breathe air and nurse their young.' },
    { front: 'What do roots absorb from the soil?', back: 'Water and minerals', explanation: 'Roots anchor a plant and take in water and minerals.' },
  ],
  4: [
    { front: 'What are three main stages of the water cycle?', back: 'Evaporation, condensation, and precipitation', explanation: 'Water changes form and moves through the environment in a cycle.' },
    { front: 'What is 3/4 as a decimal?', back: '0.75', explanation: 'Divide 3 by 4 to convert the fraction to a decimal.' },
    { front: 'How is a chemical change different from a physical change?', back: 'A chemical change forms a new substance', explanation: 'Melting is physical; burning is chemical.' },
    { front: 'What is 8 × 7?', back: '56', explanation: 'Eight groups of seven make 56.' },
    { front: 'What is a food chain?', back: 'A sequence showing how energy passes between organisms', explanation: 'Each link can show what an organism eats and what eats it.' },
    { front: 'How many degrees are in a right angle?', back: '90 degrees', explanation: 'A right angle forms a square corner.' },
  ],
  5: [
    { front: 'How do you find the volume of a rectangular prism?', back: 'Length × width × height', explanation: 'Multiply the three dimensions to find cubic units.' },
    { front: 'What is an electromagnet?', back: 'A magnet created using electric current', explanation: 'Current flowing through a coil can create a magnetic field.' },
    { front: 'What is a food web?', back: 'A network of connected food chains', explanation: 'A food web shows many feeding relationships in an ecosystem.' },
    { front: 'What is 15 × 4?', back: '60', explanation: 'Four groups of 15 make 60.' },
    { front: 'What force pulls objects toward Earth?', back: 'Gravity', explanation: 'Gravity attracts objects with mass toward one another.' },
    { front: 'What is 25% of 80?', back: '20', explanation: '25% is one quarter; one quarter of 80 is 20.' },
  ],
  6: [
    { front: 'What does Newton’s First Law describe?', back: 'Inertia: objects resist changes to their motion', explanation: 'An object stays at rest or in motion unless acted on by an unbalanced force.' },
    { front: 'What is a homogeneous mixture?', back: 'A mixture with a uniform composition', explanation: 'Its components are evenly distributed throughout.' },
    { front: 'What is the area of a triangle with base 10 and height 5?', back: '25 square units', explanation: 'Area = (base × height) ÷ 2.' },
    { front: 'What is 3/5 as a percentage?', back: '60%', explanation: '3 ÷ 5 = 0.6, which is 60%.' },
    { front: 'What is friction?', back: 'A force that resists motion between surfaces', explanation: 'Friction acts when surfaces touch and move or try to move.' },
    { front: 'What is the next multiple of 9 after 45?', back: '54', explanation: 'Add 9 to 45 to get the next multiple.' },
  ],
};

const QUIZ_BANK: Record<GradeLevel, QuizQuestion[]> = {
  1: [
    { question: 'Which sense do you use to listen to music?', options: ['Hearing', 'Sight', 'Taste', 'Touch'], answer: 'Hearing' },
    { question: 'What shape has 3 sides?', options: ['Triangle', 'Square', 'Circle', 'Rectangle'], answer: 'Triangle' },
    { question: 'What is 6 + 7?', options: ['13', '12', '14', '11'], answer: '13' },
    { question: 'Which body part helps you see?', options: ['Eyes', 'Ears', 'Nose', 'Hands'], answer: 'Eyes' },
    { question: 'What number comes next: 2, 4, 6, __?', options: ['8', '7', '9', '10'], answer: '8' },
    { question: 'Which object is a solid?', options: ['Rock', 'Steam', 'Juice', 'Air'], answer: 'Rock' },
  ],
  2: [
    { question: 'Which of these is a liquid?', options: ['Water', 'Rock', 'Wood', 'Iron'], answer: 'Water' },
    { question: 'Where do fish naturally live?', options: ['Aquatic habitat', 'Desert', 'Forest', 'Mountain'], answer: 'Aquatic habitat' },
    { question: 'What is 35 + 27?', options: ['62', '52', '63', '72'], answer: '62' },
    { question: 'What number comes next: 10, 15, 20, __?', options: ['25', '22', '30', '24'], answer: '25' },
    { question: 'Which plant part usually absorbs water from soil?', options: ['Roots', 'Flower', 'Fruit', 'Leaf'], answer: 'Roots' },
    { question: 'How many sides does a hexagon have?', options: ['6', '5', '7', '8'], answer: '6' },
  ],
  3: [
    { question: 'Which of these animals is a mammal?', options: ['Dolphin', 'Frog', 'Eagle', 'Crocodile'], answer: 'Dolphin' },
    { question: 'What gas do plants absorb from the air?', options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Helium'], answer: 'Carbon dioxide' },
    { question: 'What is the perimeter of a rectangle with sides 4 and 6?', options: ['20', '24', '10', '12'], answer: '20' },
    { question: 'What is 8 × 7?', options: ['56', '54', '48', '64'], answer: '56' },
    { question: 'Which part of a plant makes most of its food?', options: ['Leaves', 'Roots', 'Bark', 'Seeds'], answer: 'Leaves' },
    { question: 'What is 1/2 of 36?', options: ['18', '16', '20', '12'], answer: '18' },
  ],
  4: [
    { question: 'What is the third main stage of the water cycle?', options: ['Precipitation', 'Evaporation', 'Condensation', 'Collection'], answer: 'Precipitation' },
    { question: 'What is 3/5 expressed as a percentage?', options: ['60%', '35%', '50%', '75%'], answer: '60%' },
    { question: 'Which is an example of a producer in a food chain?', options: ['Grass', 'Eagle', 'Frog', 'Mushroom'], answer: 'Grass' },
    { question: 'What is 12 × 8?', options: ['96', '86', '108', '92'], answer: '96' },
    { question: 'What is the area of a 7 by 4 rectangle?', options: ['28', '22', '11', '32'], answer: '28' },
    { question: 'What happens during evaporation?', options: ['Liquid changes to gas', 'Gas changes to liquid', 'Liquid freezes', 'Solid melts'], answer: 'Liquid changes to gas' },
  ],
  5: [
    { question: 'What force pulls objects toward Earth?', options: ['Gravity', 'Magnetism', 'Friction', 'Tension'], answer: 'Gravity' },
    { question: 'What is the volume of a box with length 3, width 4, and height 5?', options: ['60', '12', '20', '45'], answer: '60' },
    { question: 'What is 15 × 4?', options: ['60', '45', '50', '75'], answer: '60' },
    { question: 'Which is a renewable source of energy?', options: ['Sunlight', 'Coal', 'Petroleum', 'Natural gas'], answer: 'Sunlight' },
    { question: 'What is 25% of 120?', options: ['30', '25', '40', '20'], answer: '30' },
    { question: 'Which organ pumps blood around the body?', options: ['Heart', 'Lungs', 'Stomach', 'Kidneys'], answer: 'Heart' },
  ],
  6: [
    { question: 'Which simple machine is a ramp?', options: ['Inclined plane', 'Pulley', 'Lever', 'Wedge'], answer: 'Inclined plane' },
    { question: 'What is a mixture with uniform composition called?', options: ['Homogeneous', 'Heterogeneous', 'Suspension', 'Colloid'], answer: 'Homogeneous' },
    { question: 'What is the area of a triangle with base 10 and height 8?', options: ['40', '80', '18', '36'], answer: '40' },
    { question: 'What is 3/4 as a percentage?', options: ['75%', '34%', '70%', '80%'], answer: '75%' },
    { question: 'Which force opposes motion between touching surfaces?', options: ['Friction', 'Gravity', 'Magnetism', 'Buoyancy'], answer: 'Friction' },
    { question: 'What is the next number: 3, 6, 9, __?', options: ['12', '10', '15', '11'], answer: '12' },
  ],
};

const codebreakerKey = (challenge: CodebreakerChallenge): string =>
  `${challenge.ruleDescription}|${challenge.sequence.join(',')}|${challenge.missingAnswer}`;

export const generateCodebreaker = (
  grade: GradeLevel,
  subject: Subject = 'Math',
  previouslySeen: ReadonlySet<string> = new Set<string>()
): CodebreakerChallenge => {
  const useScience = subject === 'Science' || (subject === 'Both' && Math.random() < 0.5);
  if (useScience && previouslySeen.size < 12) {
    const sequences = [
      { values: ['Seed', 'Sprout', 'Seedling', 'Flower'], rule: 'Put the plant growth stages in order.' },
      { values: ['Egg', 'Caterpillar', 'Chrysalis', 'Butterfly'], rule: 'Complete the butterfly life cycle.' },
      { values: ['Evaporation', 'Condensation', 'Precipitation', 'Collection'], rule: 'Complete the water cycle sequence.' },
    ];
    for (let attempt = 0; attempt < 36; attempt++) {
      const chosen = sequences[Math.floor(Math.random() * sequences.length)];
      const sequence = [...chosen.values];
      const missingIndex = Math.floor(Math.random() * (sequence.length - 1)) + 1;
      const missingAnswer = sequence[missingIndex];
      sequence[missingIndex] = '?';
      const challenge = {
        ruleDescription: chosen.rule,
        sequence,
        options: shuffle([missingAnswer, ...chosen.values.filter((value) => value !== missingAnswer).slice(0, 2)]),
        missingAnswer,
      };
      if (!previouslySeen.has(codebreakerKey(challenge))) return challenge;
    }
  }

  const gradeStep: Record<GradeLevel, number> = { 1: 2, 2: 2, 3: 5, 4: 3, 5: 7, 6: 12 };
  const step = gradeStep[grade];
  for (let attempt = 0; attempt < 1000; attempt++) {
    const multiplyByThree = grade >= 4 && Math.random() < 0.35;
    const range = 10 + previouslySeen.size + attempt;
    const start = Math.floor(Math.random() * range) + 1;
    const values = Array.from({ length: 4 }, (_, index) => multiplyByThree ? start * (index + 1) * 3 : start + index * step);
    const missingIndex = Math.floor(Math.random() * 3) + 1;
    const missingAnswer = values[missingIndex];
    const options = multiplyByThree
      ? [missingAnswer, missingAnswer - 1, missingAnswer + 1, missingAnswer + 3]
      : [missingAnswer, missingAnswer + step, Math.max(0, missingAnswer - step), missingAnswer + step * 2];
    const challenge: CodebreakerChallenge = {
      ruleDescription: useScience
        ? `Track an ecosystem population growing by ${multiplyByThree ? 'tripling' : step + ' each season'}.`
        : multiplyByThree ? 'Find the next multiple in the ×3 pattern.' : `Find the missing number. The pattern adds ${step}.`,
      sequence: values.map((value, index) => index === missingIndex ? '?' : value),
      options: shuffle(Array.from(new Set(options))),
      missingAnswer,
    };
    if (!previouslySeen.has(codebreakerKey(challenge))) return challenge;
  }
  throw new Error(`Unable to generate a new Codebreaker puzzle for grade ${grade}.`);
};

export const generateFlashcard = (grade: GradeLevel): Flashcard => {
  const cards = FLASHCARD_BANK[grade];
  return cards[Math.floor(Math.random() * cards.length)];
};

export const generateFlashcardDeck = (
  grade: GradeLevel,
  previouslySeen: ReadonlySet<string> = new Set<string>()
): Flashcard[] => {
  const unseenCards = shuffle(FLASHCARD_BANK[grade].filter((card) => !previouslySeen.has(card.front)));
  const deck = unseenCards.slice(0, 6);
  const usedPrompts = new Set([...previouslySeen, ...deck.map((card) => card.front)]);
  let seed = 1;

  while (deck.length < 6) {
    const range = 20 + previouslySeen.size * 3 + seed;
    const left = Math.floor(Math.random() * range) + 1;
    const right = Math.floor(Math.random() * range) + 1;
    const operations = [
      {
        front: `What is ${left} + ${right}?`,
        back: String(left + right),
        explanation: 'Add the two quantities to find their total.',
      },
      {
        front: `What is ${left} × ${right}?`,
        back: String(left * right),
        explanation: 'Multiply the number of groups by the quantity in each group.',
      },
    ];
    const card = operations[Math.floor(Math.random() * operations.length)];
    if (!usedPrompts.has(card.front)) {
      usedPrompts.add(card.front);
      deck.push(card);
    }
    seed += 1;
  }

  return shuffle(deck);
};

export const generateNinjaProblem = (
  grade: GradeLevel,
  previouslySeen: ReadonlySet<string> = new Set<string>()
): NinjaProblem => {
  for (let attempt = 0; attempt < 1000; attempt++) {
    const range = 20 + previouslySeen.size * 4 + attempt;
    let num1 = Math.floor(Math.random() * range) + 1;
    let num2 = Math.floor(Math.random() * range) + 1;
    let prompt = '';
    let correctAnswer = 0;

    if (grade === 1) {
      prompt = `${num1} + ${num2} = ?`;
      correctAnswer = num1 + num2;
    } else if (grade === 2) {
      if (num2 > num1) [num1, num2] = [num2, num1];
      prompt = `${num1} - ${num2} = ?`;
      correctAnswer = num1 - num2;
    } else if (grade === 3 || grade === 5) {
      prompt = `${num1} × ${num2} = ?`;
      correctAnswer = num1 * num2;
    } else if (grade === 4) {
      num1 *= 5;
      prompt = `${num1} ÷ 5 = ?`;
      correctAnswer = num1 / 5;
    } else {
      const coefficient = Math.floor(Math.random() * 5) + 2;
      const solution = Math.floor(Math.random() * Math.max(2, Math.floor(range / 2))) + 1;
      prompt = `Solve for x: ${coefficient}x + ${num1} = ${num1 + coefficient * solution}`;
      correctAnswer = solution;
    }

    if (!previouslySeen.has(prompt)) {
      return { prompt, options: makeOptions(correctAnswer), correctAnswer };
    }
  }

  throw new Error(`Unable to generate a new Number Ninja question for grade ${grade}.`);
};

export const generateQuizQuestion = (grade: GradeLevel): QuizQuestion => {
  const bank = QUIZ_BANK[grade];
  const question = bank[Math.floor(Math.random() * bank.length)];
  return { ...question, options: shuffle(question.options) };
};

export const generateQuizQuestions = (grade: GradeLevel, count: number): QuizQuestion[] =>
  shuffle(QUIZ_BANK[grade]).slice(0, Math.min(count, QUIZ_BANK[grade].length));

const whackKey = (challenge: WhackChallenge): string =>
  `${challenge.targetMultiple}|${[...challenge.gridNumbers].sort((a, b) => a - b).join(',')}`;

export const generateWhackChallenge = (
  grade: GradeLevel,
  previouslySeen: ReadonlySet<string> = new Set<string>()
): WhackChallenge => {
  const targetMultiple: Record<GradeLevel, number> = { 1: 2, 2: 3, 3: 4, 4: 5, 5: 7, 6: 9 };
  const multiple = targetMultiple[grade];
  for (let attempt = 0; attempt < 1000; attempt++) {
    const range = 8 + previouslySeen.size + attempt;
    const gridNumbers = Array.from({ length: 9 }, (_, index) =>
      index % 2 === 0
        ? multiple * (Math.floor(Math.random() * range) + 1)
        : multiple * (Math.floor(Math.random() * range) + 1) + 1
    );
    const challenge = { ruleText: `Whack all multiples of ${multiple}!`, targetMultiple: multiple, gridNumbers: shuffle(gridNumbers) };
    if (!previouslySeen.has(whackKey(challenge))) return challenge;
  }
  throw new Error(`Unable to generate a new Whack-a-Number board for grade ${grade}.`);
};

const VOCAB_BANK: Record<GradeLevel, { word: string; clue: string }[]> = {
  1: [
    { word: 'SOLID', clue: 'State of matter with a fixed shape' },
    { word: 'SENSES', clue: 'Sight, smell, touch, taste, and hearing' },
    { word: 'SHAPES', clue: 'Triangles and circles are examples of these' },
  ],
  2: [
    { word: 'HABITAT', clue: 'The natural home of an animal' },
    { word: 'LIQUID', clue: 'Matter that flows and takes its container shape' },
    { word: 'PLANTS', clue: 'Living things that need water and sunlight' },
  ],
  3: [
    { word: 'PLANTS', clue: 'Organisms that can make their own food' },
    { word: 'ENERGY', clue: 'The ability to do work or cause change' },
    { word: 'MAMMAL', clue: 'An animal group that includes dolphins' },
  ],
  4: [
    { word: 'CYCLE', clue: 'A series of events that repeats' },
    { word: 'MATTER', clue: 'Anything that has mass and takes up space' },
    { word: 'RAINBOW', clue: 'A spectrum of colors visible after light is refracted in water droplets' },
    { word: 'PHOTOSYNTHESIS', clue: 'The process by which plants make food using sunlight' },
  ],
  5: [
    { word: 'GRAVITY', clue: 'The force that pulls objects toward Earth' },
    { word: 'VOLUME', clue: 'The amount of three-dimensional space an object takes up' },
    { word: 'HABITAT', clue: 'The place where an organism lives' },
  ],
  6: [
    { word: 'INERTIA', clue: 'Resistance to a change in motion' },
    { word: 'MIXTURE', clue: 'A combination of two or more substances' },
    { word: 'FRACTION', clue: 'A number representing part of a whole' },
  ],
};

export const generateWordScramble = (
  grade: GradeLevel,
  previouslySeen: ReadonlySet<string> = new Set<string>()
): ScrambleChallenge => {
  const bank = VOCAB_BANK[grade];
  const unseenItem = shuffle(bank.filter((item) => !previouslySeen.has(item.clue)))[0];
  let item: { word: string; clue: string };
  if (unseenItem) {
    item = unseenItem;
  } else {
    const terms: Record<GradeLevel, { word: string; operation: string }[]> = {
      1: [{ word: 'SUM', operation: '+' }],
      2: [{ word: 'DIFFERENCE', operation: 'subtracted from' }],
      3: [{ word: 'PRODUCT', operation: 'multiplied by' }],
      4: [{ word: 'QUOTIENT', operation: 'divided by' }],
      5: [{ word: 'PRODUCT', operation: 'multiplied by' }],
      6: [{ word: 'QUOTIENT', operation: 'divided by' }],
    };
    for (let attempt = 0; ; attempt++) {
      const range = 12 + previouslySeen.size + attempt;
      const term = terms[grade][Math.floor(Math.random() * terms[grade].length)];
      let left = Math.floor(Math.random() * range) + 1;
      let right = Math.floor(Math.random() * range) + 1;
      if (term.operation === '-' && right > left) [left, right] = [right, left];
      if (term.operation === 'divided by') {
        right = Math.max(2, Math.floor(Math.random() * 12) + 2);
        left = right * (Math.floor(Math.random() * range) + 1);
      }
      const clue = term.operation === '-'
        ? `The answer to ${left} - ${right} is called the ___ .`
        : `The answer to ${left} ${term.operation} ${right} is called the ___ .`;
      if (!previouslySeen.has(clue)) {
        item = { word: term.word, clue };
        break;
      }
    }
  }
  let jumbledLetters = shuffle(item.word.split(''));
  if (jumbledLetters.join('') === item.word && item.word.length > 1) {
    jumbledLetters = [...item.word.slice(1), item.word[0]];
  }
  return { clue: item.clue, jumbledLetters, targetWord: item.word };
};

const MEMORY_PAIRS: Record<GradeLevel, { term: string; match: string }[]> = {
  1: [
    { term: 'Eye', match: 'Sight' }, { term: 'Ear', match: 'Hearing' },
    { term: 'Nose', match: 'Smell' }, { term: 'Tongue', match: 'Taste' },
    { term: 'Hand', match: 'Touch' }, { term: 'Triangle', match: '3 sides' },
    { term: '2 + 3', match: '5' }, { term: 'Sun', match: 'Daylight' },
  ],
  2: [
    { term: 'Solid', match: 'Ice cube' }, { term: 'Liquid', match: 'Water' },
    { term: 'Habitat', match: 'Animal home' }, { term: 'Root', match: 'Absorbs water' },
    { term: '2, 4, 6', match: 'Skip-count by 2' }, { term: '5 × 2', match: '10' },
    { term: 'Seed', match: 'Can grow into a plant' }, { term: 'Fish', match: 'Aquatic habitat' },
  ],
  3: [
    { term: 'Sun', match: 'Light source' }, { term: 'Root', match: 'Plant anchor' },
    { term: 'Dolphin', match: 'Mammal' }, { term: 'Carbon dioxide', match: 'Gas plants absorb' },
    { term: 'Photosynthesis', match: 'Plants make food' }, { term: '8 × 7', match: '56' },
    { term: 'Perimeter', match: 'Distance around a shape' }, { term: 'Water', match: 'H₂O' },
  ],
  4: [
    { term: 'Evaporation', match: 'Liquid to gas' }, { term: 'Precipitation', match: 'Rain or snow' },
    { term: 'Condensation', match: 'Gas to liquid' }, { term: 'Food chain', match: 'Energy path' },
    { term: '3/4', match: '0.75' }, { term: '12 × 8', match: '96' },
    { term: 'Producer', match: 'Makes its own food' }, { term: 'Right angle', match: '90°' },
  ],
  5: [
    { term: 'Gravity', match: 'Attraction between objects with mass' }, { term: 'Electromagnet', match: 'Magnet made using current' },
    { term: 'Food web', match: 'Connected food chains' }, { term: '15 × 4', match: '60' },
    { term: '25% of 80', match: '20' }, { term: 'Volume', match: 'Length × width × height' },
    { term: 'Heart', match: 'Pumps blood' }, { term: 'Sunlight', match: 'Renewable energy source' },
  ],
  6: [
    { term: 'Friction', match: 'Resistance between surfaces' }, { term: 'Inertia', match: 'Resistance to motion change' },
    { term: 'Homogeneous', match: 'Uniform mixture' }, { term: '3/4', match: '75%' },
    { term: 'Inclined plane', match: 'Ramp' }, { term: 'Triangle area', match: '(base × height) ÷ 2' },
    { term: '9 × 6', match: '54' }, { term: 'Gravity', match: 'Pull between masses' },
  ],
};

const memoryBoardKey = (pairs: { term: string; match: string }[]): string =>
  pairs.map(({ term, match }) => `${term}=${match}`).sort().join('|');

const MATH_MEMORY_TERMS: Record<GradeLevel, ReadonlySet<string>> = {
  1: new Set(['Triangle', '2 + 3']),
  2: new Set(['2, 4, 6', '5 × 2']),
  3: new Set(['8 × 7', 'Perimeter']),
  4: new Set(['3/4', '12 × 8', 'Right angle']),
  5: new Set(['15 × 4', '25% of 80', 'Volume']),
  6: new Set(['3/4', 'Triangle area', '9 × 6']),
};

export const generateMemoryPairs = (
  grade: GradeLevel,
  previouslySeen: ReadonlySet<string> = new Set<string>(),
  subject: Subject = 'Both',
): MemoryMatchCard[] => {
  const gradePairs = MEMORY_PAIRS[grade];
  const fixedPairs = subject === 'Both'
    ? gradePairs.slice(0, 4)
    : subject === 'Science'
      ? gradePairs.filter(({ term }) => !MATH_MEMORY_TERMS[grade].has(term)).slice(0, 4)
      : gradePairs.filter(({ term }) => MATH_MEMORY_TERMS[grade].has(term)).slice(0, 4);
  const arithmeticPairCount = subject === 'Science' ? 0 : 4 - fixedPairs.length;
  for (let attempt = 0; attempt < 1000; attempt++) {
    const range = 12 + previouslySeen.size + attempt;
    const arithmeticPairs: { term: string; match: string }[] = [];
    const terms = new Set(fixedPairs.map(({ term }) => term));
    const answers = new Set(fixedPairs.map(({ match }) => match));
    for (let candidate = 0; arithmeticPairs.length < arithmeticPairCount && candidate < 1000; candidate++) {
      const left = Math.floor(Math.random() * range) + 1;
      const right = Math.floor(Math.random() * range) + 1;
      let pair: { term: string; match: string };
      if (grade === 1) pair = { term: `${left} + ${right}`, match: String(left + right) };
      else if (grade === 2) {
        const larger = Math.max(left, right);
        const smaller = Math.min(left, right);
        pair = { term: `${larger} - ${smaller}`, match: String(larger - smaller) };
      }
      else if (grade === 4) pair = { term: `${left * 5} ÷ 5`, match: String(left) };
      else pair = { term: `${left} × ${right}`, match: String(left * right) };
      if (terms.has(pair.term) || answers.has(pair.match)) continue;
      terms.add(pair.term);
      answers.add(pair.match);
      arithmeticPairs.push(pair);
    }
    if (arithmeticPairs.length < arithmeticPairCount) continue;
    const pairs = [...fixedPairs, ...arithmeticPairs];
    if (subject !== 'Science' && previouslySeen.has(memoryBoardKey(pairs))) continue;
    const cards: MemoryMatchCard[] = [];
    pairs.forEach((pair, index) => {
      cards.push(
        { id: `term-${index}`, content: pair.term, pairId: `pair-${index}` },
        { id: `match-${index}`, content: pair.match, pairId: `pair-${index}` }
      );
    });
    return shuffle(cards);
  }
  throw new Error(`Unable to generate a new Memory Match board for grade ${grade}.`);
};
