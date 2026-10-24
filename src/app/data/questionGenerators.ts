export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type Subject = "Math" | "Science" | "Both";

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
  for (const offset of [3, -2, 7, 5, -4, 9, 12, -8]) {
    const candidate = answer + offset;
    if (candidate >= 0 && candidate !== answer) options.add(candidate);
    if (options.size === 4) break;
  }
  let fallback = answer + 1;
  while (options.size < 4) {
    options.add(fallback);
    fallback++;
  }
  return shuffle([...options]);
};

const FLASHCARD_BANK: Record<GradeLevel, Flashcard[]> = {
  1: [
    {
      front: "What are the five basic senses according to Science?",
      back: "Sight, hearing, smell, taste, and touch",
      explanation:
        "Our sense organs help us observe and explore our environment safely.",
    },
    {
      front: "What is 12 + 8 in Mathematics?",
      back: "20",
      explanation: "Combining 12 and 8 gives a total sum of 20.",
    },
    {
      front: "Which state of matter has a definite shape and volume?",
      back: "Solid",
      explanation: "Solids maintain their own shape and do not easily deform.",
    },
    {
      front: "What number comes directly after 38?",
      back: "39",
      explanation: "Counting forward by ones follows 37, 38, 39.",
    },
    {
      front: "Which body part is responsible for hearing sounds?",
      back: "Ears",
      explanation: "Ears detect sound vibrations in the surroundings.",
    },
    {
      front: "What is 15 - 7?",
      back: "8",
      explanation: "Taking away 7 from 15 leaves a difference of 8.",
    },
    {
      front: "What do living things need to survive and grow?",
      back: "Food, water, air, and shelter",
      explanation: "Basic needs sustain life for plants, animals, and humans.",
    },
  ],
  2: [
    {
      front: "What is an animal habitat?",
      back: "Its natural home or environment",
      explanation:
        "A habitat provides food, water, and shelter for living organisms.",
    },
    {
      front: "What is 150 + 250?",
      back: "400",
      explanation:
        "Adding the hundreds (100 + 200 = 300) and tens (50 + 50 = 100) equals 400.",
    },
    {
      front: "How does a liquid behave in different containers?",
      back: "It takes the shape of its container while keeping its volume",
      explanation: "Liquids flow and adapt to container shapes.",
    },
    {
      front: "What is 5 groups of 2?",
      back: "10",
      explanation:
        "Skip-counting by twos five times (2, 4, 6, 8, 10) yields 10.",
    },
    {
      front: "Why do plants require sunlight?",
      back: "To produce food through photosynthesis",
      explanation:
        "Sunlight provides energy for plants to manufacture nutrients.",
    },
    {
      front: "What is half of 18?",
      back: "9",
      explanation: "Splitting 18 into two equal groups gives 9 in each group.",
    },
  ],
  3: [
    {
      front: "What is photosynthesis?",
      back: "The process by which plants make food using sunlight, water, and carbon dioxide",
      explanation:
        "Plants act as producers in ecosystems by creating their own nourishment.",
    },
    {
      front: "What is the perimeter of a square with a 5 cm side?",
      back: "20 cm",
      explanation:
        "Perimeter is the total distance around the outside: 4 × 5 cm.",
    },
    {
      front: "What are the three common states of matter?",
      back: "Solid, liquid, and gas",
      explanation:
        "Matter exists in these primary phases depending on temperature and arrangement.",
    },
    {
      front: "What is 7 × 6?",
      back: "42",
      explanation:
        "Multiplication represents repeated addition: seven groups of six.",
    },
    {
      front: "Which aquatic animal is classified as a marine mammal?",
      back: "Dolphin",
      explanation:
        "Dolphins breathe air using lungs and give birth to live young.",
    },
    {
      front: "What is the primary function of plant roots?",
      back: "To absorb water and minerals from the soil and anchor the plant",
      explanation:
        "Roots secure plants firmly and take in essential soil nutrients.",
    },
  ],
  4: [
    {
      front: "What are the three main stages of the water cycle?",
      back: "Evaporation, condensation, and precipitation",
      explanation:
        "Water continuously circulates through Earth and the atmosphere.",
    },
    {
      front: "What is 3/4 expressed as a decimal?",
      back: "0.75",
      explanation: "Dividing numerator by denominator (3 ÷ 4) yields 0.75.",
    },
    {
      front: "How does a chemical change differ from a physical change?",
      back: "A chemical change forms entirely new substances with different properties",
      explanation:
        "Burning or rusting are chemical changes, unlike melting or cutting.",
    },
    {
      front: "What is 8 × 7?",
      back: "56",
      explanation: "Basic multiplication fact: eight groups of seven equal 56.",
    },
    {
      front: "What is a food chain?",
      back: "A linear sequence showing how energy and nutrients flow from one organism to another",
      explanation: "Energy moves from producers to herbivores and carnivores.",
    },
    {
      front: "How many degrees are in a right angle?",
      back: "90 degrees",
      explanation:
        "Perpendicular lines intersect to form a 90-degree right angle.",
    },
  ],
  5: [
    {
      front: "How do you calculate the volume of a rectangular prism?",
      back: "Length × width × height",
      explanation: "Volume measures three-dimensional space using cubic units.",
    },
    {
      front: "What is an electromagnet?",
      back: "A temporary magnet created by electric current flowing through a coil around a core",
      explanation: "Electromagnets can be turned on and off using electricity.",
    },
    {
      front: "What is a food web?",
      back: "A complex network of interconnected food chains in an ecosystem",
      explanation:
        "Food webs show multiple feeding relationships among species.",
    },
    {
      front: "What is 15 × 4?",
      back: "60",
      explanation: "Four groups of 15 equal 60.",
    },
    {
      front: "What gravitational force acts on objects near Earth?",
      back: "Gravity",
      explanation: "Gravity pulls objects toward the center of the Earth.",
    },
    {
      front: "What is 25% of 80?",
      back: "20",
      explanation: "25% is equivalent to one-fourth (1/4); 80 ÷ 4 = 20.",
    },
  ],
  6: [
    {
      front: "What does Newton’s First Law of Motion state?",
      back: "An object at rest stays at rest and an object in motion stays in motion unless acted upon by an unbalanced force",
      explanation: "This property of matter is known as inertia.",
    },
    {
      front: "What is a homogeneous mixture?",
      back: "A mixture with a uniform composition throughout",
      explanation:
        "The components are evenly distributed so individual parts cannot be easily distinguished.",
    },
    {
      front: "What is the area of a triangle with base 10 cm and height 5 cm?",
      back: "25 square cm",
      explanation:
        "Triangle area formula is (base × height) ÷ 2 = (10 × 5) ÷ 2 = 25.",
    },
    {
      front: "What is 3/5 expressed as a percentage?",
      back: "60%",
      explanation: "Convert to hundredths: (3 × 20) / (5 × 20) = 60/100 = 60%.",
    },
    {
      front: "What is friction?",
      back: "A contact force that opposes the relative motion of surfaces in contact",
      explanation: "Friction generates heat and resists sliding movement.",
    },
    {
      front: "What is the next multiple of 9 after 45?",
      back: "54",
      explanation: "Adding 9 to 45 gives 54.",
    },
  ],
};

const QUIZ_BANK: Record<GradeLevel, QuizQuestion[]> = {
  1: [
    {
      question: "Which sense organ do you use to listen to music?",
      options: [
        "Hearing (Ears)",
        "Sight (Eyes)",
        "Taste (Tongue)",
        "Touch (Skin)",
      ],
      answer: "Hearing (Ears)",
    },
    {
      question: "What closed geometric shape has exactly 3 sides and 3 angles?",
      options: ["Triangle", "Square", "Circle", "Rectangle"],
      answer: "Triangle",
    },
    {
      question: "What is the sum of 6 and 7?",
      options: ["13", "12", "14", "11"],
      answer: "13",
    },
    {
      question: "Which body part allows you to see colors and shapes?",
      options: ["Eyes", "Ears", "Nose", "Hands"],
      answer: "Eyes",
    },
    {
      question: "What number comes next in the counting sequence: 2, 4, 6, __?",
      options: ["8", "7", "9", "10"],
      answer: "8",
    },
    {
      question:
        "Which of the following common objects is classified as a solid?",
      options: ["Wooden block", "Water vapor", "Juice", "Air"],
      answer: "Wooden block",
    },
  ],
  2: [
    {
      question: "Which of these common materials is in the liquid state?",
      options: ["Drinking water", "Rock", "Wooden chair", "Iron nail"],
      answer: "Drinking water",
    },
    {
      question: "Where do freshwater fish naturally live and thrive?",
      options: [
        "Aquatic habitat (Rivers and lakes)",
        "Desert",
        "Tropical rainforest",
        "Mountain peak",
      ],
      answer: "Aquatic habitat (Rivers and lakes)",
    },
    {
      question: "What is the sum of 35 and 27?",
      options: ["62", "52", "63", "72"],
      answer: "62",
    },
    {
      question:
        "What number completes the skip-counting pattern: 10, 15, 20, __?",
      options: ["25", "22", "30", "24"],
      answer: "25",
    },
    {
      question:
        "Which plant structure is primarily responsible for absorbing water from soil?",
      options: ["Roots", "Flower petals", "Fruit", "Leaves"],
      answer: "Roots",
    },
    {
      question: "How many flat sides does a regular hexagon have?",
      options: ["6", "5", "7", "8"],
      answer: "6",
    },
  ],
  3: [
    {
      question: "Which of these animals is classified as a mammal?",
      options: ["Dolphin", "Green frog", "Bald eagle", "Saltwater crocodile"],
      answer: "Dolphin",
    },
    {
      question:
        "What essential gas do green plants absorb from the air during photosynthesis?",
      options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Helium"],
      answer: "Carbon dioxide",
    },
    {
      question:
        "What is the perimeter of a rectangle with length 6 cm and width 4 cm?",
      options: ["20 cm", "24 cm", "10 cm", "12 cm"],
      answer: "20 cm",
    },
    {
      question: "What is the product of 8 and 7?",
      options: ["56", "54", "48", "64"],
      answer: "56",
    },
    {
      question:
        "Which part of a plant is mainly responsible for making food through sunlight?",
      options: ["Leaves", "Roots", "Bark", "Seeds"],
      answer: "Leaves",
    },
    {
      question: "What is exactly one-half of 36?",
      options: ["18", "16", "20", "12"],
      answer: "18",
    },
  ],
  4: [
    {
      question:
        "What is the third primary stage of the water cycle where moisture falls as rain or snow?",
      options: [
        "Precipitation",
        "Evaporation",
        "Condensation",
        "Transpiration",
      ],
      answer: "Precipitation",
    },
    {
      question: "What is the fraction 3/5 expressed as a percentage?",
      options: ["60%", "35%", "50%", "75%"],
      answer: "60%",
    },
    {
      question:
        "Which organism acts as a primary producer in a terrestrial food chain?",
      options: ["Green grass", "Golden eagle", "Tree frog", "Mushroom"],
      answer: "Green grass",
    },
    {
      question: "What is the product of 12 and 8?",
      options: ["96", "86", "108", "92"],
      answer: "96",
    },
    {
      question:
        "What is the area of a rectangular garden measuring 7 meters by 4 meters?",
      options: [
        "28 square meters",
        "22 square meters",
        "11 square meters",
        "32 square meters",
      ],
      answer: "28 square meters",
    },
    {
      question: "What physical change occurs during evaporation?",
      options: [
        "Liquid water changes into water vapor gas",
        "Gas changes into liquid droplets",
        "Liquid water freezes into ice",
        "Solid melts into liquid",
      ],
      answer: "Liquid water changes into water vapor gas",
    },
  ],
  5: [
    {
      question:
        "What invisible force pulls objects downward toward the center of the Earth?",
      options: ["Gravity", "Magnetism", "Friction", "Air resistance"],
      answer: "Gravity",
    },
    {
      question:
        "What is the volume of a rectangular storage box with length 3m, width 4m, and height 5m?",
      options: [
        "60 cubic meters",
        "12 cubic meters",
        "20 cubic meters",
        "45 cubic meters",
      ],
      answer: "60 cubic meters",
    },
    {
      question: "What is 15 multiplied by 4?",
      options: ["60", "45", "50", "75"],
      answer: "60",
    },
    {
      question: "Which of the following is a renewable energy source?",
      options: [
        "Solar energy from sunlight",
        "Coal",
        "Petroleum",
        "Natural gas",
      ],
      answer: "Solar energy from sunlight",
    },
    {
      question: "What is 25% of 120?",
      options: ["30", "25", "40", "20"],
      answer: "30",
    },
    {
      question:
        "Which major human organ pumps oxygenated blood throughout the body?",
      options: ["Heart", "Lungs", "Stomach", "Kidneys"],
      answer: "Heart",
    },
  ],
  6: [
    {
      question:
        "Which simple machine consists of a slanted surface used to raise heavy loads easily?",
      options: ["Inclined plane", "Pulley", "Lever", "Wedge"],
      answer: "Inclined plane",
    },
    {
      question:
        "What term describes a mixture that has a uniform composition throughout?",
      options: [
        "Homogeneous mixture",
        "Heterogeneous mixture",
        "Suspension",
        "Colloid",
      ],
      answer: "Homogeneous mixture",
    },
    {
      question:
        "What is the area of a triangular sail with base 10 meters and height 8 meters?",
      options: [
        "40 square meters",
        "80 square meters",
        "18 square meters",
        "36 square meters",
      ],
      answer: "40 square meters",
    },
    {
      question: "What is 3/4 expressed as a percentage?",
      options: ["75%", "34%", "70%", "80%"],
      answer: "75%",
    },
    {
      question:
        "Which contact force opposes the sliding motion between two touching surfaces?",
      options: ["Friction", "Gravity", "Magnetism", "Buoyancy"],
      answer: "Friction",
    },
    {
      question:
        "What is the next number in the arithmetic sequence: 3, 6, 9, __?",
      options: ["12", "10", "15", "11"],
      answer: "12",
    },
  ],
};

const codebreakerKey = (challenge: CodebreakerChallenge): string =>
  `${challenge.ruleDescription}|${challenge.sequence.join(",")}|${challenge.missingAnswer}`;

export const generateCodebreaker = (
  grade: GradeLevel,
  subject: Subject = "Math",
  previouslySeen: ReadonlySet<string> = new Set<string>(),
): CodebreakerChallenge => {
  const useScience =
    subject === "Science" || (subject === "Both" && Math.random() < 0.5);
  if (useScience) {
    const scienceSequences = [
      {
        values: ["Seed", "Sprout", "Seedling", "Mature Plant"],
        rule: "Put the plant growth stages in correct chronological order.",
      },
      {
        values: ["Egg", "Larva", "Pupa", "Adult Butterfly"],
        rule: "Complete the insect metamorphosis lifecycle sequence.",
      },
      {
        values: ["Evaporation", "Condensation", "Precipitation", "Collection"],
        rule: "Complete the stages of the water cycle.",
      },
      {
        values: ["Solid", "Liquid", "Gas"],
        rule: "Arrange states of matter by increasing thermal energy.",
      },
    ];
    const chosen =
      scienceSequences[Math.floor(Math.random() * scienceSequences.length)];
    const sequence = [...chosen.values];
    const missingIndex = Math.floor(Math.random() * sequence.length);
    const missingAnswer = sequence[missingIndex];
    sequence[missingIndex] = "?";
    const options = shuffle(
      [
        missingAnswer,
        ...chosen.values.filter((v) => v !== missingAnswer),
      ].slice(0, 4),
    );
    return {
      ruleDescription: chosen.rule,
      sequence,
      options,
      missingAnswer,
    };
  }

  const gradeStep: Record<GradeLevel, number> = {
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 8,
    6: 10,
  };
  const step = gradeStep[grade];
  const start = Math.floor(Math.random() * 10) + 1;
  const values = Array.from({ length: 4 }, (_, index) => start + index * step);
  const missingIndex = Math.floor(Math.random() * values.length);
  const missingAnswer = values[missingIndex];
  const seqCopy = values.map((val, idx) => (idx === missingIndex ? "?" : val));
  const options = makeOptions(Number(missingAnswer));

  const challenge: CodebreakerChallenge = {
    ruleDescription: `Find the missing number in the sequence. Each step adds ${step}.`,
    sequence: seqCopy,
    options: shuffle(options),
    missingAnswer,
  };

  return challenge;
};

const createAlgorithmicFlashcard = (
  grade: GradeLevel,
  seed: number,
): Flashcard => {
  const op = seed % 4;
  const a = Math.floor(Math.random() * (8 * grade)) + seed + 2;
  const b = Math.floor(Math.random() * (4 * grade)) + 1;

  if (op === 0) {
    return {
      front: `What is ${a} + ${b}?`,
      back: `${a + b}`,
      explanation: "Add the two numbers together to find the sum.",
    };
  } else if (op === 1) {
    const sum = a + b;
    return {
      front: `What is ${sum} - ${b}?`,
      back: `${a}`,
      explanation:
        "Subtract the subtrahend from the minuend to find the difference.",
    };
  } else if (op === 2) {
    return {
      front: `What is ${a} × ${b}?`,
      back: `${a * b}`,
      explanation: "Multiply the two factors to find the product.",
    };
  } else {
    const side = Math.floor(Math.random() * 10) + 2 + (seed % 3);
    return {
      front: `What is the perimeter of a square with side length ${side} cm?`,
      back: `${side * 4} cm`,
      explanation: "A square has 4 equal sides, so perimeter = 4 × side.",
    };
  }
};

export const generateFlashcard = (grade: GradeLevel): Flashcard => {
  const cards = FLASHCARD_BANK[grade];
  return cards[Math.floor(Math.random() * cards.length)];
};

export const generateFlashcardDeck = (
  grade: GradeLevel,
  previouslySeen: ReadonlySet<string> = new Set<string>(),
): Flashcard[] => {
  const bank = FLASHCARD_BANK[grade];
  const deck = shuffle([...bank]).slice(0, 6);
  let seed = 1;
  while (deck.length < 6) {
    const card = createAlgorithmicFlashcard(grade, seed);
    if (!deck.some((c) => c.front === card.front)) {
      deck.push(card);
    }
    seed++;
  }
  return shuffle(deck);
};

export const generateNinjaProblem = (
  grade: GradeLevel,
  previouslySeen: ReadonlySet<string> = new Set<string>(),
): NinjaProblem => {
  const num1 = Math.floor(Math.random() * (12 * grade)) + 2;
  const num2 = Math.floor(Math.random() * (8 * grade)) + 1;
  let prompt = "";
  let correctAnswer = 0;

  if (grade === 1) {
    prompt = `${num1} + ${num2} = ?`;
    correctAnswer = num1 + num2;
  } else if (grade === 2) {
    const larger = Math.max(num1, num2);
    const smaller = Math.min(num1, num2);
    prompt = `${larger} - ${smaller} = ?`;
    correctAnswer = larger - smaller;
  } else if (grade === 3 || grade === 5) {
    prompt = `${num1} × ${num2} = ?`;
    correctAnswer = num1 * num2;
  } else if (grade === 4) {
    const product = num1 * 5;
    prompt = `${product} ÷ 5 = ?`;
    correctAnswer = product / 5;
  } else {
    const coefficient = Math.floor(Math.random() * 4) + 2;
    const solution = Math.floor(Math.random() * 10) + 1;
    prompt = `Solve for x: ${coefficient}x + ${num1} = ${num1 + coefficient * solution}`;
    correctAnswer = solution;
  }

  return {
    prompt,
    options: makeOptions(correctAnswer),
    correctAnswer,
  };
};

const createDynamicQuizQuestion = (
  grade: GradeLevel,
  seed: number,
): QuizQuestion => {
  const type = seed % 3;
  if (type === 0) {
    const a = Math.floor(Math.random() * 10 * grade) + 2;
    const b = Math.floor(Math.random() * 8 * grade) + 2;
    const ans = a * b;
    return {
      question: `What is the product of ${a} and ${b}?`,
      options: makeOptions(ans).map(String),
      answer: String(ans),
    };
  } else if (type === 1) {
    const base = Math.floor(Math.random() * 8) + 2;
    const height = Math.floor(Math.random() * 8) + 4;
    const ans = (base * height) / 2;
    return {
      question: `What is the area of a triangle with base ${base} units and height ${height} units?`,
      options: makeOptions(ans).map(String),
      answer: String(ans),
    };
  } else {
    const percents = [10, 20, 25, 50];
    const pct = percents[seed % percents.length];
    const val = (Math.floor(Math.random() * 10) + 1) * 20;
    const ans = (pct / 100) * val;
    return {
      question: `What is ${pct}% of ${val}?`,
      options: makeOptions(ans).map(String),
      answer: String(ans),
    };
  }
};

export const generateQuizQuestion = (grade: GradeLevel): QuizQuestion => {
  const bank = QUIZ_BANK[grade];
  const question = bank[Math.floor(Math.random() * bank.length)];
  return { ...question, options: shuffle(question.options) };
};

export const generateQuizQuestions = (
  grade: GradeLevel,
  count: number,
  previouslySeen: ReadonlySet<string> = new Set<string>(),
): QuizQuestion[] => {
  const bank = QUIZ_BANK[grade];
  const results: QuizQuestion[] = [];
  const shuffledBank = shuffle([...bank]);

  for (const q of shuffledBank) {
    if (results.length < count) {
      results.push({ ...q, options: shuffle(q.options) });
    }
  }

  let seed = 1;
  while (results.length < count) {
    const dynamicQ = createDynamicQuizQuestion(grade, seed);
    if (!results.some((r) => r.question === dynamicQ.question)) {
      results.push(dynamicQ);
    }
    seed++;
  }

  return results;
};

const whackKey = (challenge: WhackChallenge): string =>
  `${challenge.targetMultiple}|${[...challenge.gridNumbers].sort((a, b) => a - b).join(",")}`;

export const generateWhackChallenge = (
  grade: GradeLevel,
  previouslySeen: ReadonlySet<string> = new Set<string>(),
): WhackChallenge => {
  const targetMultiple: Record<GradeLevel, number> = {
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 7,
    6: 9,
  };
  const multiple = targetMultiple[grade];
  const gridNumbers = Array.from({ length: 9 }, (_, index) =>
    index % 2 === 0
      ? multiple * (Math.floor(Math.random() * 8) + 1)
      : multiple * (Math.floor(Math.random() * 8) + 1) +
        (index % 3 === 0 ? 1 : 2),
  );

  return {
    ruleText: `Whack all numbers that are multiples of ${multiple}!`,
    targetMultiple: multiple,
    gridNumbers: shuffle(gridNumbers),
  };
};

const VOCAB_BANK: Record<GradeLevel, { word: string; clue: string }[]> = {
  1: [
    { word: "SOLID", clue: "State of matter that keeps a fixed shape" },
    { word: "SENSES", clue: "Sight, smell, touch, taste, and hearing" },
    { word: "SHAPES", clue: "Triangles and circles are examples of these" },
  ],
  2: [
    { word: "HABITAT", clue: "The natural home or environment of an animal" },
    {
      word: "LIQUID",
      clue: "Matter that flows and takes the shape of its container",
    },
    {
      word: "PLANTS",
      clue: "Living organisms that need sunlight and water to grow",
    },
  ],
  3: [
    { word: "ENERGY", clue: "The capacity to do work or cause change" },
    {
      word: "MAMMAL",
      clue: "Warm-blooded animal group that includes dolphins",
    },
    {
      word: "ROOTS",
      clue: "Plant parts that absorb water and minerals from soil",
    },
  ],
  4: [
    {
      word: "CYCLE",
      clue: "A series of events that regularly repeats in order",
    },
    { word: "MATTER", clue: "Anything that has mass and takes up space" },
    {
      word: "GRAVITY",
      clue: "The invisible force that pulls objects toward Earth",
    },
  ],
  5: [
    {
      word: "VOLUME",
      clue: "The amount of three-dimensional space an object occupies",
    },
    {
      word: "CIRCUIT",
      clue: "A complete closed path for electric current to flow",
    },
    {
      word: "OXYGEN",
      clue: "Gas produced by plants and breathed in by humans",
    },
  ],
  6: [
    {
      word: "INERTIA",
      clue: "The tendency of objects to resist changes in motion",
    },
    {
      word: "MIXTURE",
      clue: "A combination of two or more distinct substances",
    },
    {
      word: "FRICTION",
      clue: "Force resisting relative motion between touching surfaces",
    },
  ],
};

export const generateWordScramble = (
  grade: GradeLevel,
  previouslySeen: ReadonlySet<string> = new Set<string>(),
): ScrambleChallenge => {
  const bank = VOCAB_BANK[grade];
  const item = bank[Math.floor(Math.random() * bank.length)];
  let jumbledLetters = shuffle(item.word.split(""));
  if (jumbledLetters.join("") === item.word && item.word.length > 1) {
    jumbledLetters = [...item.word.slice(1), item.word[0]];
  }
  return { clue: item.clue, jumbledLetters, targetWord: item.word };
};

const MEMORY_PAIRS: Record<GradeLevel, { term: string; match: string }[]> = {
  1: [
    { term: "Eye", match: "Sight" },
    { term: "Ear", match: "Hearing" },
    { term: "Nose", match: "Smell" },
    { term: "Tongue", match: "Taste" },
    { term: "Hand", match: "Touch" },
    { term: "Triangle", match: "3 sides" },
    { term: "2 + 3", match: "5" },
    { term: "Sun", match: "Daylight" },
  ],
  2: [
    { term: "Solid", match: "Ice cube" },
    { term: "Liquid", match: "Water" },
    { term: "Habitat", match: "Animal home" },
    { term: "Root", match: "Absorbs water" },
    { term: "2 + 8", match: "10" },
    { term: "5 × 2", match: "10" },
    { term: "Seed", match: "Grows into plant" },
    { term: "Fish", match: "Water habitat" },
  ],
  3: [
    { term: "Sun", match: "Light source" },
    { term: "Root", match: "Plant anchor" },
    { term: "Dolphin", match: "Mammal" },
    { term: "Carbon dioxide", match: "Absorbed by plants" },
    { term: "Photosynthesis", match: "Plant food making" },
    { term: "8 × 7", match: "56" },
    { term: "Perimeter", match: "Distance around shape" },
    { term: "Water", match: "H₂O" },
  ],
  4: [
    { term: "Evaporation", match: "Liquid to gas" },
    { term: "Precipitation", match: "Rain or snow" },
    { term: "Condensation", match: "Gas to liquid" },
    { term: "Food chain", match: "Energy path" },
    { term: "3/4", match: "0.75" },
    { term: "12 × 8", match: "96" },
    { term: "Producer", match: "Makes own food" },
    { term: "Right angle", match: "90°" },
  ],
  5: [
    { term: "Gravity", match: "Downward pull" },
    { term: "Electromagnet", match: "Current magnet" },
    { term: "Food web", match: "Connected food chains" },
    { term: "15 × 4", match: "60" },
    { term: "25% of 80", match: "20" },
    { term: "Volume", match: "Length × width × height" },
    { term: "Heart", match: "Pumps blood" },
    { term: "Sunlight", match: "Renewable energy" },
  ],
  6: [
    { term: "Friction", match: "Surface resistance" },
    { term: "Inertia", match: "Resistance to change" },
    { term: "Homogeneous", match: "Uniform mixture" },
    { term: "3/4", match: "75%" },
    { term: "Inclined plane", match: "Ramp" },
    { term: "Triangle area", match: "(base × height) ÷ 2" },
    { term: "9 × 6", match: "54" },
    { term: "Gravity", match: "Mass attraction" },
  ],
};

const MATH_MEMORY_TERMS: Record<GradeLevel, ReadonlySet<string>> = {
  1: new Set(["Triangle", "2 + 3"]),
  2: new Set(["2 + 8", "5 × 2"]),
  3: new Set(["8 × 7", "Perimeter"]),
  4: new Set(["3/4", "12 × 8", "Right angle"]),
  5: new Set(["15 × 4", "25% of 80", "Volume"]),
  6: new Set(["3/4", "Triangle area", "9 × 6"]),
};

export const generateMemoryPairs = (
  grade: GradeLevel,
  previouslySeen: ReadonlySet<string> = new Set<string>(),
  subject: Subject = "Both",
): MemoryMatchCard[] => {
  const gradePairs = MEMORY_PAIRS[grade];
  const filteredPairs =
    subject === "Both"
      ? gradePairs
      : subject === "Science"
        ? gradePairs.filter(({ term }) => !MATH_MEMORY_TERMS[grade].has(term))
        : gradePairs.filter(({ term }) => MATH_MEMORY_TERMS[grade].has(term));

  const selectedPairs = shuffle(
    filteredPairs.length >= 4 ? filteredPairs : gradePairs,
  ).slice(0, 4);

  const cards: MemoryMatchCard[] = [];
  selectedPairs.forEach((pair, index) => {
    cards.push(
      { id: `term-${index}`, content: pair.term, pairId: `pair-${index}` },
      { id: `match-${index}`, content: pair.match, pairId: `pair-${index}` },
    );
  });
  return shuffle(cards);
};
