import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { curriculum, Lesson, Subject } from './curriculum';

interface NotebookBookViewerProps {
  gradeLevel?: number;
  initialSubject?: Subject;
  initialLesson?: Lesson;
  totalPages?: number; 
  onBack?: () => void;
  onComplete: (xpReward: number) => void;
}

interface LessonVisualStep {
  icon: string;
  label: string;
}

interface LessonVisualData {
  title: string;
  summary: string;
  steps: LessonVisualStep[];
}

interface TextbookPageData {
  leftHeading: string;
  leftContent: string;
  rightHeading: string;
  rightContent: string;
  leftType?: 'line' | 'grid';
  rightType?: 'line' | 'grid';
  visualData?: LessonVisualData;
  rightVisualData?: LessonVisualData;
}

const MIN_NOTEBOOK_PAGES = 21;
const MAX_NOTEBOOK_PAGES = 30;
const CORE_NOTEBOOK_PAGES = 16;
const CLOSING_NOTEBOOK_PAGES = 5;
const DEFAULT_NOTEBOOK_PAGES = 27;
const NOTEBOOK_COVER_COLORS = [
  '#3F6B5B', '#496C8C', '#8D5964', '#A36F3F', '#725C91', '#557B83', '#A25445', '#64723F',
  '#3E6990', '#875372', '#947A3F', '#4B7B69', '#8F4A58', '#62508A', '#AA5F3B', '#427785',
  '#746947', '#55719B', '#9A5D7A', '#6E7B42', '#B07846', '#496B72', '#874C3E', '#596486',
  '#3F7753', '#A15C52', '#756044', '#4D768F', '#8A5771', '#66763F', '#AA654D', '#52647B',
];

const getNotebookCoverColor = (
  gradeLevel: number,
  subject?: Subject,
  lesson?: Lesson,
) => {
  const gradeLessons = curriculum[gradeLevel]?.flatMap((gradeSubject) =>
    gradeSubject.lessons.map((gradeLesson) => ({
      subjectTitle: gradeSubject.title,
      lessonTitle: gradeLesson.title,
    })),
  ) ?? [];
  const lessonIndex = gradeLessons.findIndex(
    (gradeLesson) =>
      gradeLesson.subjectTitle === subject?.title &&
      gradeLesson.lessonTitle === lesson?.title,
  );
  const colorIndex = (Math.max(lessonIndex, 0) + gradeLevel * 5) % NOTEBOOK_COVER_COLORS.length;

  return NOTEBOOK_COVER_COLORS[colorIndex];
};


const getCurriculumPageData = (
  gradeLevel: number,
  subjectTitle: string,
  lessonTitle: string,
  pageIndex: number,
  totalPages: number
) => {
  const cleanLesson = lessonTitle.toLowerCase();
  const cleanSubject = subjectTitle.toLowerCase();


  const isScience = cleanSubject.includes('science') || 
                    ['matter', 'living', 'force', 'earth', 'environment', 'energy', 'space'].some(s => cleanSubject.includes(s));

  const displaySubject = isScience ? 'Science' : 'Mathematics';
  const halfPage = Math.ceil(totalPages / 2);
  const isFirstHalf = pageIndex <= halfPage;


  const seed1 = pageIndex * 5 + gradeLevel * 2;
  const seed2 = pageIndex * 3 + 4;

  if (gradeLevel === 1) {
    if (!isScience) {
      if (cleanLesson.includes('count') || cleanLesson.includes('number sense')) {
        const tens = (pageIndex * 2) % 8 + 1;
        const ones = (pageIndex * 3) % 9 + 1;
        const total = tens * 10 + ones;
        if (isFirstHalf) {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Counting up to 100:\nDetermining quantities by grouping objects into bundles of tens and single ones units.\n\n• Place Value (Tens and Ones):\nIn two-digit numbers, the digit on the left represents sets of 10, while the digit on the right represents remaining ones units.`,
            rightHeading: `THEORETICAL EXPLANATION`,
            rightContent: `EXPLANATION & SKIPS:\n\n1. Skip Counting:\n- By 2s: 2, 4, 6, 8, 10...\n- By 5s: 5, 10, 15, 20...\n- By 10s: 10, 20, 30, 40...\n\n2. Comparing Quantities:\nUse terms like 'more than', 'less than', or 'equal to'.\n\n3. Philippine Currency:\nRecognizing coins and bills up to ₱100.`
          };
        } else {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Place Value Breakdown:\nNumber Analysis for ${total}.\n\n• Tens Digit: ${tens} Tens = ${tens * 10}\n• Ones Digit: ${ones} Ones = ${ones}\n\n• Expanded Form: ${tens * 10} + ${ones} = ${total}`,
            rightHeading: `COMPUTATION WORKSPACE & EXAMPLE`,
            rightContent: `WORKED EXAMPLE #${pageIndex - halfPage}:\n\nScenario: Leo has ${tens} bundles of 10 pencils and ${ones} loose pencils.\n\nCalculation:\n1. Tens Value = ${tens} × 10 = ${tens * 10}\n2. Ones Value = ${ones} × 1 = ${ones}\n3. Total = ${tens * 10} + ${ones} = ${total} pencils.\n\nCheck: ${total} - ${ones} = ${tens * 10}. Verified.`
          };
        }
      }

      if (cleanLesson.includes('shape') || cleanLesson.includes('pattern')) {
        if (isFirstHalf) {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• 2D Flat Geometric Shapes:\nIdentifying circles, triangles, squares, and rectangles based on straight/curved sides and corners.\n\n• Repeating Patterns:\nPredicting the next item in a repeating visual sequence (AB, ABC patterns).`,
            rightHeading: `THEORETICAL EXPLANATION`,
            rightContent: `SPATIAL ATTRIBUTES:\n\n1. Square: 4 equal straight sides, 4 corners.\n2. Rectangle: 2 long opposite sides, 2 short opposite sides.\n3. Triangle: 3 sides and 3 corners.\n4. Circle: 1 continuous curved boundary without corners.`
          };
        } else {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Pattern Analysis #${pageIndex - halfPage}:\nEvaluating core repeating units.\n\n• Sequence: 🔴 🟦 🔴 🟦 [?]`,
            rightHeading: `COMPUTATION WORKSPACE & EXAMPLE`,
            rightContent: `PATTERN WORKSPACE:\n\n1. Identify Core Unit: [🔴, 🟦]\n2. Pattern Type: Alternating AB Pattern\n3. Solution: After 🟦 comes 🔴.\n\nConclusion: Next shape in sequence is 🔴.`
          };
        }
      }

      if (cleanLesson.includes('addition') || cleanLesson.includes('subtraction')) {
        const valA = (pageIndex * 2) % 10 + 2;
        const valB = (pageIndex * 3) % 8 + 1;
        const sum = valA + valB;
        if (isFirstHalf) {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Addition & Subtraction (0 to 20):\nAddition combines two quantities; subtraction finds the difference or remaining amount.\n\n• Symbols:\nPlus (+) for combining, Minus (-) for taking away, Equals (=) for total balance.`,
            rightHeading: `THEORETICAL EXPLANATION`,
            rightContent: `STRATEGIES:\n\n1. Counting On: Start at larger number and count forward.\n2. Taking Away: Remove items from set and count remaining.\n3. Number Bonds: Decomposing total into two addend parts.`
          };
        } else {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Word Problem #${pageIndex - halfPage}:\nAdding two sets of classroom objects.\n\n• Set A: ${valA} mangoes\n• Set B: ${valB} mangoes`,
            rightHeading: `COMPUTATION WORKSPACE & EXAMPLE`,
            rightContent: `WORKED EXAMPLE WORKSPACE:\n\n1. Problem: ${valA} + ${valB}\n2. Start at ${valA}, count forward ${valB} steps.\n3. ${valA} + ${valB} = ${sum}\n\nCheck: ${sum} - ${valB} = ${valA}. Verified.`
          };
        }
      }

      if (cleanLesson.includes('ordinal')) {
        const pos = (pageIndex % 10) + 1;
        if (isFirstHalf) {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Ordinal Numbers (1st to 10th):\nOrdinal numbers indicate position or sequence of items in an ordered set.\n\n• Representations:\n1st (First), 2nd (Second), 3rd (Third), 4th (Fourth), 5th (Fifth)... 10th (Tenth).`,
            rightHeading: `THEORETICAL EXPLANATION`,
            rightContent: `POSITION VS QUANTITY:\n\n1. Cardinal Numbers: Tells 'how many' items in total (e.g., 5 apples).\n2. Ordinal Numbers: Tells 'which specific position' an item holds (e.g., 5th apple in line).`
          };
        } else {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Positional Sequence #${pageIndex - halfPage}:\nDetermining student rankings in a line.`,
            rightHeading: `COMPUTATION WORKSPACE & EXAMPLE`,
            rightContent: `WORKED EXAMPLE WORKSPACE:\n\nLine Order: [Ana (1st), Ben (2nd), Cara (3rd), Don (4th), Eve (5th)...]\n\nTarget Position: Student #${pos}\nResult: Holds the ${pos}${pos === 1 ? 'st' : pos === 2 ? 'nd' : pos === 3 ? 'rd' : 'th'} place in line.`
          };
        }
      }

      if (cleanLesson.includes('fraction')) {
        if (isFirstHalf) {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Introduction to Fractions (1/2 and 1/4):\nFractions represent equal parts of a single whole or set.\n\n• One-Half (1/2):\nOne of two equal parts of a whole.\n\n• One-Fourth (1/4):\nOne of four equal parts of a whole.`,
            rightHeading: `THEORETICAL EXPLANATION`,
            rightContent: `FRACTIONAL FAIR SHARING:\n\n1. Equal Parts: Parts must be identical in size.\n2. Whole: The entire unbroken object before partitioning.`
          };
        } else {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Partitioning Model #${pageIndex - halfPage}:\nDividing a Bibingka cake equally among friends.`,
            rightHeading: `COMPUTATION WORKSPACE & EXAMPLE`,
            rightContent: `WORKED EXAMPLE WORKSPACE:\n\n1. Whole Cake = 1\n2. Cut into 2 equal pieces = Each person gets 1/2.\n3. Cut into 4 equal pieces = Each person gets 1/4.\n\nCheck: 1/2 + 1/2 = 1 Whole. Verified.`
          };
        }
      }

      if (cleanLesson.includes('time') || cleanLesson.includes('measurement')) {
        const hours = (pageIndex % 12) + 1;
        if (isFirstHalf) {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Telling Time & Non-Standard Measurement:\nReading clock hours (o'clock) and measuring lengths using non-standard units (paperclips, hand spans).\n\n• Time Units:\nDays of the week, months of the year, and analog clock face reading.`,
            rightHeading: `THEORETICAL EXPLANATION`,
            rightContent: `MEASUREMENT PRINCIPLES:\n\n1. Non-Standard Measuring: Lay units end-to-end without gaps or overlaps.\n2. Analog Clock: Short hand points to hour; long hand at 12 indicates o'clock.`
          };
        } else {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Time & Measurement Test #${pageIndex - halfPage}:\nReading clock time and measuring desk length.`,
            rightHeading: `COMPUTATION WORKSPACE & EXAMPLE`,
            rightContent: `WORKED EXAMPLE WORKSPACE:\n\n1. Clock Reading: Short hand at ${hours}, Long hand at 12 $\\rightarrow$ ${hours}:00 O'clock.\n2. Measurement: Desk length = 6 paperclips laid end-to-end.`
          };
        }
      }

      if (cleanLesson.includes('pictograph')) {
        if (isFirstHalf) {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Pictographs:\nData displays using picture symbols where 1 image represents 1 unit.\n\n• Key Components:\nTitle, categories, image symbols, and a key legend.`,
            rightHeading: `THEORETICAL EXPLANATION`,
            rightContent: `READING DATA:\n\n1. Tallying: Counting visual icons per row.\n2. Comparison: Identifying rows with the most or least icons.`
          };
        } else {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Pictograph Analysis #${pageIndex - halfPage}:\nFavorite Fruits Survey.\n\n• 🍎 Apples: 🍎🍎🍎 (3)\n• 🍌 Bananas: 🍌🍌 (2)`,
            rightHeading: `COMPUTATION WORKSPACE & EXAMPLE`,
            rightContent: `WORKED EXAMPLE WORKSPACE:\n\n1. Apple Count = 3\n2. Banana Count = 2\n3. Difference = 3 - 2 = 1 more Apple.\n\nConclusion: Apples are the most popular fruit.`
          };
        }
      }
    }

    if (isScience) {
      if (cleanLesson.includes('five senses') || cleanLesson.includes('senses')) {
        if (isFirstHalf) {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• The Five Senses:\nSpecialized body organs used to observe the world around us.\n\n• Sensory Organs:\n1. Eyes (Sight)\n2. Ears (Hearing)\n3. Nose (Smell)\n4. Tongue (Taste)\n5. Skin (Touch)`,
            rightHeading: `THEORETICAL EXPLANATION`,
            rightContent: `BIOLOGICAL FUNCTIONS:\n\n1. Sight: Detects colors, shapes, and sizes.\n2. Hearing: Listens to loud and quiet sounds.\n3. Smell: Identifies sweet or foul odors.\n4. Taste: Detects sweet, sour, salty, and bitter flavors.\n5. Touch: Feels hot, cold, rough, and smooth surfaces.`
          };
        } else {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Sensory Observation #${pageIndex - halfPage}:\nIdentifying sensory organ inputs for classroom items.`,
            rightHeading: `EXAMPLE & OBSERVATION NOTEBOOK`,
            rightContent: `LABORATORY OBSERVATION LOG:\n\n1. Item: Calamansi Fruit\n   - Eye: Small green sphere\n   - Tongue: Sour taste\n   - Nose: Citrus smell\n\nConclusion: Multiple senses combine to describe objects.`
          };
        }
      }

      if (cleanLesson.includes('surrounding') || cleanLesson.includes('caring')) {
        if (isFirstHalf) {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Caring for Our Surroundings:\nKeeping our environment clean promotes health and safety.\n\n• Care Practices:\n1. Proper Waste Disposal\n2. Watering plants\n3. Saving water and electricity`,
            rightHeading: `THEORETICAL EXPLANATION`,
            rightContent: `ENVIRONMENTAL RESPONSIBILITY:\n\n- Clean surroundings prevent disease-carrying pests.\n- Proper trash segregation keeps local waterways clear.`
          };
        } else {
          return {
            leftHeading: `CONCEPT & DEFINITION`,
            leftContent: `• Waste Segregation Test #${pageIndex - halfPage}:\nSorting school rubbish into correct bins.`,
            rightHeading: `EXAMPLE & OBSERVATION NOTEBOOK`,
            rightContent: `FIELD OBSERVATION LOG:\n\n1. Fruit Peels $\\rightarrow$ Green Biodegradable Bin\n2. Plastic Wrappers $\\rightarrow$ Blue Non-Biodegradable Bin\n\nResult: Clean school yard free of pests.`
          };
        }
      }
    }
  }


  if (isScience) {
    if (isFirstHalf) {
      return {
        leftHeading: `CONCEPT & DEFINITION`,
        leftContent: `Grade ${gradeLevel} Science • ${lessonTitle}\n\n• Primary Concept:\n${lessonTitle} explores scientific principles through systematic observation, hypothesis testing, and environmental analysis.\n\n• Core Rule:\nScientific inquiry relies on evidence gathered through structured experiment observations.`,
        rightHeading: `THEORETICAL EXPLANATION`,
        rightContent: `SCIENTIFIC ANALYSIS:\n\n1. Domain Framework: Understanding biological, physical, and earth processes.\n2. Observation Steps: Collect qualitative and quantitative sensory data.\n3. Real-World Context: Connecting science concepts to local Philippine natural environments.`
      };
    } else {
      return {
        leftHeading: `CONCEPT & DEFINITION`,
        leftContent: `Grade ${gradeLevel} Science • ${lessonTitle}\n\n• Field Study #${pageIndex - halfPage}:\nAnalyzing parameters and environmental conditions related to ${lessonTitle}.`,
        rightHeading: `EXAMPLE & OBSERVATION NOTEBOOK`,
        rightContent: `LABORATORY OBSERVATION LOG:\n\n• Target Subject: ${lessonTitle}\n• Procedure Step 1: Set up controlled observation variables.\n• Procedure Step 2: Record qualitative environmental changes.\n• Procedure Step 3: Analyze experimental outcome.\n\nConclusion: Observed data confirms theoretical scientific principles.`
      };
    }
  } else {
    const lengthVal = pageIndex + 4;
    const widthVal = pageIndex + 2;
    const areaVal = lengthVal * widthVal;

    if (isFirstHalf) {
      return {
        leftHeading: `CONCEPT & DEFINITION`,
        leftContent: `Grade ${gradeLevel} Mathematics • ${lessonTitle}\n\n• Primary Concept:\n${lessonTitle} develops mathematical competencies through analytical reasoning, formulas, and quantitative rules.\n\n• Operational Rule:\nApply systematic algebraic and geometric properties step by step.`,
        rightHeading: `THEORETICAL EXPLANATION`,
        rightContent: `MATHEMATICAL ANALYSIS:\n\n1. Formula Derivation: Understanding underlying mathematical structures.\n2. Procedural Accuracy: Execute operations following standard PEMDAS/GMDAS precedence rules.\n3. Application: Solving real-world quantitative problems.`
      };
    } else {
      return {
        leftHeading: `CONCEPT & DEFINITION`,
        leftContent: `Grade ${gradeLevel} Mathematics • ${lessonTitle}\n\n• Dimension Evaluation:\nLength = ${lengthVal}m, Width = ${widthVal}m.`,
        rightHeading: `COMPUTATION WORKSPACE & EXAMPLE`,
        rightContent: `WORKED EXAMPLE WORKSPACE:\n\nProblem: Calculate total area for rectangular plot.\n\nWorkspace:\n1. Formula: Area = Length × Width\n2. Area = ${lengthVal}m × ${widthVal}m\n3. Total Area = ${areaVal} sq meters (m²)\n\nCheck: ${areaVal} ÷ ${widthVal} = ${lengthVal}m. Verified.`
      };
    }
  }
};

const getGradeStudyGuidance = (gradeLevel: number, isScience: boolean) => {
  if (gradeLevel <= 2) {
    return isScience
      ? 'Look closely at familiar objects or living things. Describe what you can observe, compare what is alike or different, and use a drawing when it helps.'
      : 'Use counters, drawings, objects, or a number line. Say what each number or shape represents before choosing an answer.';
  }

  if (gradeLevel <= 4) {
    return isScience
      ? 'Record observations carefully, compare results, and explain how the evidence supports your conclusion.'
      : 'Choose a model or strategy, show each step, and check that your units and answer make sense.';
  }

  return isScience
    ? 'Connect the evidence to the scientific idea, distinguish observation from inference, and justify your conclusion.'
    : 'Connect representations and rules, show a complete solution, and justify why the result fits the problem.';
};

const getLessonVisualData = (lesson: Lesson, isScience: boolean): LessonVisualData => {
  const title = lesson.title.toLowerCase();
  let steps: LessonVisualStep[];

  if (isScience) {
    if (/plant|seed|flower|photosynth|reproduction/.test(title)) {
      steps = [
        { icon: '🌱', label: 'Plant' },
        { icon: '☀️', label: 'Resources' },
        { icon: '🌼', label: 'Growth' },
      ];
    } else if (/life cycle|metamorph|animal/.test(title)) {
      steps = [
        { icon: '🥚', label: 'Beginning' },
        { icon: '🐛', label: 'Change' },
        { icon: '🦋', label: 'Adult' },
      ];
    } else if (/matter|solid|liquid|gas|mixture|melting/.test(title)) {
      steps = [
        { icon: '🧊', label: 'Solid' },
        { icon: '💧', label: 'Liquid' },
        { icon: '☁️', label: 'Gas' },
      ];
    } else if (/force|motion|gravity|speed/.test(title)) {
      steps = [
        { icon: '✋', label: 'Force' },
        { icon: '➡️', label: 'Changes' },
        { icon: '⚽', label: 'Motion' },
      ];
    } else if (/energy|electric|circuit|magnet/.test(title)) {
      steps = [
        { icon: '🔋', label: 'Source' },
        { icon: '〰️', label: 'Transfer' },
        { icon: '💡', label: 'Effect' },
      ];
    } else if (/earth|space|weather|water|soil|rock|plate|solar|moon|sun/.test(title)) {
      steps = [
        { icon: '🌦️', label: 'Observe' },
        { icon: '🌍', label: 'Connect' },
        { icon: '🔎', label: 'Explain' },
      ];
    } else if (/sense|organ|body|health/.test(title)) {
      steps = [
        { icon: '👀', label: 'Notice' },
        { icon: '🧠', label: 'Process' },
        { icon: '💬', label: 'Describe' },
      ];
    } else {
      steps = [
        { icon: '🔎', label: 'Observe' },
        { icon: '📝', label: 'Record' },
        { icon: '💡', label: 'Explain' },
      ];
    }
  } else if (/fraction|percent/.test(title)) {
    steps = [
      { icon: '🍰', label: 'Whole' },
      { icon: '✂️', label: 'Equal parts' },
      { icon: '½', label: 'One part' },
    ];
  } else if (/shape|polygon|angle|geometry|symmetry/.test(title)) {
    steps = [
      { icon: '△', label: 'Sides' },
      { icon: '◻️', label: 'Corners' },
      { icon: '🔍', label: 'Compare' },
    ];
  } else if (/graph|data|statistics|probability|pictograph|tally/.test(title)) {
    steps = [
      { icon: '📊', label: 'Collect' },
      { icon: '📈', label: 'Organize' },
      { icon: '💡', label: 'Conclude' },
    ];
  } else if (/time|measurement|area|perimeter|volume|length/.test(title)) {
    steps = [
      { icon: '📏', label: 'Measure' },
      { icon: '🧮', label: 'Calculate' },
      { icon: '✅', label: 'Check' },
    ];
  } else if (/multiply|division|equal groups|ratio/.test(title)) {
    steps = [
      { icon: '● ●', label: 'Group 1' },
      { icon: '● ●', label: 'Group 2' },
      { icon: '🧮', label: 'Total' },
    ];
  } else if (/add|subtract|integer|equation|expression|number/.test(title)) {
    steps = [
      { icon: '🔢', label: 'Known' },
      { icon: '➕', label: 'Relationship' },
      { icon: '❓', label: 'Find' },
    ];
  } else {
    steps = [
      { icon: '📘', label: 'Idea' },
      { icon: '🧩', label: 'Connect' },
      { icon: '✅', label: 'Check' },
    ];
  }

  return {
    title: lesson.title,
    summary: isScience
      ? 'Observe the parts, connect them to the lesson, and explain what the evidence shows.'
      : 'Notice the parts, show how they relate, and check that your answer fits the lesson.',
    steps,
  };
};

const getLessonExampleVisualData = (lesson: Lesson, isScience: boolean): LessonVisualData => {
  const title = lesson.title.toLowerCase();
  let strategyIcon = isScience ? '🔎' : '🧮';
  let strategyLabel = isScience ? 'Find evidence' : 'Choose a method';

  if (/plant|seed|flower|animal|habitat|ecosystem/.test(title)) {
    strategyIcon = isScience ? '🌿' : '📊';
  } else if (/matter|solid|liquid|gas|mixture|material/.test(title)) {
    strategyIcon = '🧊';
    strategyLabel = 'Notice properties';
  } else if (/force|motion|gravity|speed/.test(title)) {
    strategyIcon = '➡️';
    strategyLabel = 'Notice the change';
  } else if (/fraction|percent|ratio/.test(title)) {
    strategyIcon = '🍰';
    strategyLabel = 'Show the parts';
  } else if (/graph|data|statistics|probability|pictograph|tally/.test(title)) {
    strategyIcon = '📊';
    strategyLabel = 'Read the data';
  } else if (/shape|polygon|angle|geometry|symmetry/.test(title)) {
    strategyIcon = '📐';
    strategyLabel = 'Compare features';
  }

  return {
    title: 'Example in Steps',
    summary: lesson.example,
    steps: [
      { icon: '📌', label: 'Example' },
      { icon: strategyIcon, label: strategyLabel },
      { icon: '💡', label: 'Explain why' },
    ],
  };
};

const buildLessonExpansion = (gradeLevel: number, subjectTitle: string, lesson: Lesson) => {
  const isScience = subjectTitle === 'Science';
  const keyword = lesson.title.toLowerCase();
  const gradeHint = getGradeStudyGuidance(gradeLevel, isScience);

  const definition = lesson.meaning;
  const explanation = isScience
    ? `Look closely at ${keyword}.\n\n1. What do you notice?\n2. Which detail is evidence?\n3. What does the evidence tell you?\n\nLesson idea: ${lesson.meaning}\n\n${gradeHint}`
    : `Read the question about ${keyword}.\n\n1. What do you know?\n2. What do you need to find?\n3. Choose a model or operation. Show your steps.\n4. Check your answer.\n\nLesson idea: ${lesson.meaning}\n\n${gradeHint}`;

  const exampleExplanation = isScience
    ? `Look at the example. What can you observe? Which detail is evidence?\n\nExplain how it connects to this idea: ${lesson.meaning}`
    : `What do the numbers, objects, or shapes mean?\n\nShow how they connect. Check that your answer fits the question.\n\nLesson idea: ${lesson.meaning}`;

  const computation = isScience
    ? `1. Observe: ${lesson.example}\n2. Find a detail that supports the lesson idea.\n3. Explain what the evidence shows.\n\nLesson idea: ${lesson.meaning}`
    : `1. Read: ${lesson.example}\n2. Find the important numbers or shapes.\n3. Show your steps.\n4. Check that your answer fits the question.\n\nLesson idea: ${lesson.meaning}`;

  return {
    definition,
    explanation,
    example: lesson.example,
    exampleExplanation,
    computation,
    practice: `Explain ${keyword} in your own words. Give one example and say how it fits the lesson idea.`,
  };
};

const buildExtensionPages = (
  subjectTitle: string,
  lesson: Lesson,
): TextbookPageData[] => {
  const isScience = subjectTitle === 'Science';
  const topic = lesson.title.toLowerCase();
  const evidenceWord = isScience ? 'observation or evidence' : 'quantity, shape, or relationship';

  return [
    {
      leftHeading: 'VOCABULARY BUILDER',
      leftContent: `Choose three important words connected to ${topic}. Write a student-friendly meaning for each one and use each word in a sentence.`,
      rightHeading: 'USE THE WORDS',
      rightContent: `Explain how your words connect to this idea: ${lesson.meaning} Add a quick sketch or symbol beside each word to help you remember it.`,
    },
    {
      leftHeading: 'FIND THE CLUE',
      leftContent: `Read the lesson example again: ${lesson.example} Identify the ${evidenceWord} that helps you recognize the main idea.`,
      rightHeading: 'EXPLAIN THE CLUE',
      rightContent: `Describe how the clue supports the lesson. Finish this sentence: “I know this is about ${topic} because…”`,
    },
    {
      leftHeading: 'MAKE A NEW EXAMPLE',
      leftContent: `Create a different example of ${topic} from school, home, or your community. Make sure it shows the same main idea.`,
      rightHeading: 'PROVE THE CONNECTION',
      rightContent: `Compare your example with this definition: ${lesson.meaning} Name the detail that proves your new example belongs in this lesson.`,
    },
    {
      leftHeading: 'SORT AND CLASSIFY',
      leftContent: `List four items or situations related to ${topic}. Sort them into two groups using a feature that matters to this lesson.`,
      rightHeading: 'NAME YOUR RULE',
      rightContent: `Write the rule you used to sort the examples. Explain how the rule connects to the lesson definition and check whether every item fits its group.`,
    },
    {
      leftHeading: 'ASK A GOOD QUESTION',
      leftContent: `Write one question that can be answered by using the idea of ${topic}. Include enough information for another learner to understand what is being asked.`,
      rightHeading: 'PLAN AN ANSWER',
      rightContent: `Underline the important information. Decide whether you need a model, calculation, comparison, or observation, then explain why that approach fits.`,
    },
    {
      leftHeading: 'DRAW AND LABEL',
      leftContent: `Draw a clear picture or model of ${topic}. Include at least three labels for the parts that matter to the idea.`,
      rightHeading: 'CAPTION YOUR MODEL',
      rightContent: `Write a short caption that explains what your picture shows. Check that each label agrees with this definition: ${lesson.meaning}`, 
    },
    {
      leftHeading: 'REAL-WORLD CONNECTION',
      leftContent: `Find one way ${topic} can be useful or visible outside this lesson. Describe the place, people, objects, or event involved.`,
      rightHeading: 'CONNECT THE IDEA',
      rightContent: `Explain how the real-world situation matches the lesson. Include one detail you could point to as support for your explanation.`,
    },
    {
      leftHeading: 'EXPLAIN EACH STEP',
      leftContent: `Use the chapter example as a model: ${lesson.example} Break your reasoning into small steps that a classmate could follow.`,
      rightHeading: 'CHECK THE REASONING',
      rightContent: `For each step, say what information you used and why. Check that your final explanation agrees with the lesson definition.`,
    },
    {
      leftHeading: 'SELF-QUIZ',
      leftContent: `Write three questions about ${topic}: one about its meaning, one about recognizing it, and one about applying it in a new situation.`,
      rightHeading: 'ANSWER AND CHECK',
      rightContent: `Answer without looking back, then check your responses against the chapter. Correct any answer that does not match the definition or example.`,
    },
    {
      leftHeading: 'SPOT THE MIX-UP',
      leftContent: `Write a possible mistake a learner might make when explaining ${topic}. Make it realistic, then identify which part of the idea was misunderstood.`,
      rightHeading: 'FIX THE IDEA',
      rightContent: `Rewrite the explanation correctly using this definition: ${lesson.meaning} Add one reason or example that makes the correction clear.`,
    },
    {
      leftHeading: 'SHOW IT ANOTHER WAY',
      leftContent: `Represent ${topic} in a second way. If you first used words, try a diagram, model, table, number sentence, or observation log.`,
      rightHeading: 'COMPARE YOUR MODELS',
      rightContent: `What does each representation make easy to see? Explain what both models show about the same lesson idea.`,
    },
    {
      leftHeading: 'CREATE A STUDY CARD',
      leftContent: `Front: write the topic, ${topic}. Back: write its definition and one useful reminder in your own words.`,
      rightHeading: 'ADD AN EXAMPLE',
      rightContent: `Add an example that is different from the chapter example. Label the detail that connects it to the definition.`,
    },
    {
      leftHeading: 'CHALLENGE ROUND',
      leftContent: `Create a harder task about ${topic}. It should require at least two reasoning steps, not just recalling a word.`,
      rightHeading: 'SUPPORT YOUR SOLUTION',
      rightContent: `Show each step or observation and explain why it is useful. Finish by checking the answer against the lesson's main idea.`,
    },
    {
      leftHeading: 'MY LEARNING REFLECTION',
      leftContent: `Complete these thoughts: “At first I thought…” / “Now I understand…” / “One example I can explain is…”`,
      rightHeading: 'NEXT STEP',
      rightContent: `Choose one part of ${topic} to keep practicing. State what you will review and how you will know when your explanation is clear.`,
    },
  ];
};

const buildLessonSummaryPage = (
  gradeLevel: number,
  subjectTitle: string,
  lesson: Lesson,
): TextbookPageData => {
  const isScience = subjectTitle === 'Science';
  const gradePrompt = gradeLevel <= 2
    ? 'Say the main idea in your own words and point to one example.'
    : gradeLevel <= 4
      ? 'Explain the main idea, then use the example to show how it works.'
      : 'Summarize the idea, support it with evidence or reasoning, and connect it to a new situation.';

  return {
    leftHeading: 'LESSON SUMMARY',
    leftContent: `Grade ${gradeLevel} ${subjectTitle}\n\n${lesson.title}\n\nMAIN IDEA\n${lesson.meaning}\n\nRemember: use this idea to recognize what is happening in a new example.`,
    rightHeading: 'WHAT I CAN DO NOW',
    rightContent: `EXAMPLE TO REMEMBER\n${lesson.example}\n\n${gradePrompt}\n\nI can explain how this example connects to the lesson's main idea.${isScience ? ' I can point to an observation that supports my explanation.' : ' I can show the quantities, model, or steps that support my answer.'}\n\nOne thing I want to remember: ____________________`,
  };
};

const buildClosingLessonPages = (
  gradeLevel: number,
  subjectTitle: string,
  lesson: Lesson,
): TextbookPageData[] => {
  const isScience = subjectTitle === 'Science';
  const guidance = getGradeStudyGuidance(gradeLevel, isScience);
  const practicePrompt = gradeLevel <= 2
    ? 'Draw or describe one new example. Point to the part that matches the lesson idea.'
    : gradeLevel <= 4
      ? 'Write a new example and explain which details show the lesson idea.'
      : 'Create a new situation, support your reasoning with details, and explain why the idea applies.';

  return [
    {
      leftHeading: 'EXPANDED EXPLANATION',
      leftContent: `${lesson.title}\n\n${lesson.meaning}\n\nKeep this relationship in mind as you read the example and try a new situation.`,
      rightHeading: 'CONNECT THE IDEA',
      rightContent: `Grade ${gradeLevel} focus:\n${guidance}\n\nA strong explanation names the idea, points to a useful detail, and tells how that detail matches the definition.`,
    },
    {
      leftHeading: 'WORKED LESSON EXAMPLE',
      leftContent: `${lesson.example}\n\nWhat to notice: identify the important quantities, features, or evidence in this example.`,
      rightHeading: isScience ? 'EXPLAIN THE EVIDENCE' : 'EXPLAIN THE REASONING',
      rightContent: `1. Identify what matters in the example.\n\n2. Connect that detail to this idea: ${lesson.meaning}\n\n3. Explain why the example fits the lesson.`,
    },
    {
      leftHeading: 'TRY A NEW EXAMPLE',
      leftContent: `${practicePrompt}\n\nLesson: ${lesson.title}\nDefinition: ${lesson.meaning}`,
      rightHeading: 'PLAN YOUR RESPONSE',
      rightContent: isScience
        ? `Record what you can observe, choose evidence that supports your idea, and explain what the evidence shows.\n\n${guidance}`
        : `Name what is known, choose a model or strategy, and show how it connects to the definition. Check that your answer fits the situation.\n\n${guidance}`,
    },
    {
      leftHeading: 'CHECK YOUR UNDERSTANDING',
      leftContent: `1. Explain ${lesson.title.toLowerCase()} in your own words.\n\n2. Give a detail from this example: ${lesson.example}\n\n3. Explain how that detail connects to the definition.`,
      rightHeading: 'SELF-CHECK',
      rightContent: `Does your response include the main idea? Is the example accurate? Did you explain the connection instead of only naming it?\n\nRevise any part that does not match: ${lesson.meaning}`,
    },
    buildLessonSummaryPage(gradeLevel, subjectTitle, lesson),
  ];
};

const getTextbookPageData = (
  gradeLevel: number,
  subjectTitle: string,
  lesson: Lesson,
  pageIndex: number,
  totalPages: number,
): TextbookPageData => {
  const isScience = subjectTitle === 'Science';
  const guidance = getGradeStudyGuidance(gradeLevel, isScience);
  const keywords = lesson.title.split(/\s+/).filter((word) => word.length > 2).join('\n');
  const expansion = buildLessonExpansion(gradeLevel, subjectTitle, lesson);
  const visualData = getLessonVisualData(lesson, isScience);
  const exampleVisualData = getLessonExampleVisualData(lesson, isScience);
  const extensionPages = buildExtensionPages(subjectTitle, lesson);
  const closingPages = buildClosingLessonPages(gradeLevel, subjectTitle, lesson);
  const extensionPageCount = Math.max(
    0,
    totalPages - CORE_NOTEBOOK_PAGES - CLOSING_NOTEBOOK_PAGES,
  );
  const contentsEntries: [number, string][] = [
    [2, 'Chapter roadmap'],
    [3, 'Key words'],
    [4, 'Definition'],
    [5, 'Explanation'],
    [6, 'Example and explanation'],
    [7, isScience ? 'Observation and evidence' : 'Worked computation'],
    [8, 'Guided practice'],
    [9, 'Visual map and worked example'],
    [10, 'Check your understanding'],
    [11, 'Apply it'],
    [12, 'Compare and connect'],
    [13, 'Visual model and reasoning'],
    [14, 'Chapter review'],
    [15, 'Teach it back'],
    [16, 'Mastery challenge'],
    ...extensionPages.slice(0, extensionPageCount).map((page, index): [number, string] => [
      17 + index,
      page.leftHeading,
    ]),
    ...closingPages.slice(0, -1).map((page, index): [number, string] => [
      CORE_NOTEBOOK_PAGES + extensionPageCount + index + 1,
      page.leftHeading,
    ]),
    [totalPages, 'Lesson summary'],
  ];
  const contents = contentsEntries
    .filter(([pageNumber]) => pageNumber <= totalPages)
    .map(([pageNumber, label]) => `${pageNumber}. ${label}`)
    .join('\n');
  const pages: TextbookPageData[] = [
    {
      leftHeading: 'TABLE OF CONTENTS',
      leftContent: `Grade ${gradeLevel} ${subjectTitle}\n\nLesson: ${lesson.title}\n\n${contents}`,
      rightHeading: 'LESSON FOCUS',
      rightContent: `${lesson.title}\n\n${lesson.meaning}\n\nThis lesson helps students connect an idea to a real-world example, write a working explanation, and solve or observe a related task.`,
    },
    {
      leftHeading: 'CHAPTER ROADMAP',
      leftContent: `Grade ${gradeLevel} ${subjectTitle}\n\nIn this chapter, you will study ${lesson.title.toLowerCase()} and connect the idea to familiar situations.\n\nLearning goals:\n• Name the central idea in your own words.\n• Explain how it works or how to use it.\n• Apply what you learned to a new situation.`,
      rightHeading: 'HOW TO STUDY THIS LESSON',
      rightContent: `${guidance}\n\nKeep a record of your thinking. If your first answer changes after you check the evidence or calculation, write down what helped you improve it.`,
    },
    {
      leftHeading: 'KEY WORDS',
      leftContent: `${keywords}\n\nThese words name the topic. Read them aloud and notice how each one relates to the lesson.`,
      rightHeading: 'BUILD THE IDEA',
      rightContent: `Before reading further, tell what you already know about ${lesson.title.toLowerCase()}. Think of one question you would like this chapter to answer.\n\n${guidance}`,
    },
    {
      leftHeading: 'DEFINITION',
      leftContent: expansion.definition,
      rightHeading: 'READING THE DEFINITION',
      rightContent: `Read the definition slowly. Identify its important words and explain how they work together. Restate the idea in your own words without changing its meaning.\n\nFor Grade ${gradeLevel}, make your explanation clear enough that a classmate could recognize the idea in a new example.`,
    },
    {
      leftHeading: 'EXPLANATION',
      leftContent: expansion.explanation,
      rightHeading: isScience ? 'OBSERVE AND EXPLAIN' : 'CHOOSE A STRATEGY',
      rightContent: isScience
        ? `Start with something you can observe. Describe the evidence accurately, compare it with another observation when useful, and then explain what the evidence shows about ${lesson.title.toLowerCase()}. Do not claim more than your observations support.\n\n${guidance}`
        : `First identify what the task asks you to find. Select a useful representation, such as objects, a drawing, a table, a diagram, or a number sentence. Work through the reasoning in order, then check whether the answer fits the original question.\n\n${guidance}`,
    },
    {
      leftHeading: 'EXAMPLE',
      leftContent: expansion.example,
      rightHeading: 'EXAMPLE EXPLAINED',
      rightContent: expansion.exampleExplanation,
    },
    {
      leftHeading: 'COMPUTATION',
      leftContent: expansion.computation,
      rightHeading: isScience ? 'EVIDENCE AND CONCLUSION' : 'WORK SPACE',
      leftType: 'grid',
      rightType: 'grid',
      rightContent: isScience
        ? `Observation: Write what you notice about ${lesson.title.toLowerCase()} in the given situation.\n\nEvidence: List at least two details that support the idea.\n\nConclusion: Explain what the evidence shows and how it proves the lesson concept.`
        : `Problem: Use the lesson's idea to solve a related question.\n\nStep 1: Write the relevant quantity or equation.\nStep 2: Solve the operation or formula.\nStep 3: Label the final answer and explain why it makes sense.`,
    },
    {
      leftHeading: 'GUIDED PRACTICE',
      leftContent: expansion.practice,
      rightHeading: 'SHOW YOUR REASONING',
      rightContent: isScience
        ? `Make a simple observation or use the information in the situation. Record the evidence, describe the pattern or change you notice, and write a conclusion that the evidence can support.\n\n${guidance}`
        : `Represent the quantities or relationships in the situation. Choose a strategy, show the steps in order, and use an estimate, model, or related operation to check your result.\n\n${guidance}`,
    },
    {
      leftHeading: 'VISUAL LESSON MAP',
      leftContent: `Follow the concept map from left to right. Each step shows one part of ${lesson.title.toLowerCase()}; use the definition to explain how the parts connect.`,
      rightHeading: 'VISUAL LESSON EXAMPLE',
      rightContent: `Use the example card to follow the situation, notice the important detail, and explain the result. Connect your reasoning to this idea: ${lesson.meaning}`,
      leftType: 'grid',
      visualData,
      rightVisualData: exampleVisualData,
    },
    {
      leftHeading: 'CHECK YOUR UNDERSTANDING',
      leftContent: `Answer these questions without looking back:\n\n• What is the main idea of ${lesson.title.toLowerCase()}?\n• Which detail or step is most important?\n• How could you check whether your answer or conclusion is reasonable?`,
      rightHeading: 'REVIEW YOUR WORK',
      rightContent: `Check that your response answers the question, uses accurate lesson vocabulary, and includes enough reasoning to make your thinking clear. Correct any step that does not match the evidence or the task.`,
    },
    {
      leftHeading: 'APPLY IT',
      leftContent: `Look for ${lesson.title.toLowerCase()} in a different classroom, home, or community situation. Describe what is similar to the chapter and what is different.`,
      rightHeading: 'MAKE A CONNECTION',
      rightContent: `Explain why the lesson is useful beyond this chapter. Give one new situation of your own and describe how you would recognize or use the idea there.\n\n${guidance}`,
    },
    {
      leftHeading: 'COMPARE AND CONNECT',
      leftContent: `Compare two situations related to ${lesson.title.toLowerCase()}. List one feature they share and one feature that makes them different.`,
      rightHeading: 'EXPLAIN THE DIFFERENCE',
      rightContent: `Use the important details from each situation to explain why they are alike or different. Support your comparison with an observation, representation, or clear reasoning.`,
    },
    {
      leftHeading: 'VISUAL MODEL',
      leftContent: `Follow the visual model to connect the main parts of ${lesson.title.toLowerCase()}. Use the definition to explain why each step belongs.`,
      rightHeading: 'VISUAL REASONING',
      rightContent: `Study the worked example and notice which details support the lesson idea. Explain how the example connects to this definition: ${lesson.meaning}`,
      visualData,
      rightVisualData: exampleVisualData,
    },
    {
      leftHeading: 'CHAPTER REVIEW',
      leftContent: `Complete these prompts in your own words:\n\n• I can describe…\n• I can explain…\n• I can use this idea when…`,
      rightHeading: 'REFLECT',
      rightContent: `Which part of ${lesson.title.toLowerCase()} can you now explain confidently? Which part would you like to practise again? Use your answer to choose a next step: review your model, check your reasoning, or try another situation.`,
    },
    {
      leftHeading: 'TEACH IT BACK',
      leftContent: `Prepare a short explanation of ${lesson.title.toLowerCase()} for a younger learner. Choose words and a model that would make the idea understandable.`,
      rightHeading: 'CHECK YOUR EXPLANATION',
      rightContent: `Ask a classmate to describe what they understood. If an important part is unclear, revise your explanation and add a helpful detail or label.`,
    },
    {
      leftHeading: 'MASTERY CHALLENGE',
      leftContent: `Create a new question or investigation about ${lesson.title.toLowerCase()}. Make sure it can be answered using the ideas and skills from this chapter.`,
      rightHeading: 'SUPPORT YOUR ANSWER',
      rightContent: `Solve or investigate your challenge, then present the evidence or steps that support your answer. Finish by explaining how your work demonstrates the chapter's learning goals.\n\n${guidance}`,
    },
  ];

  const pageNotes = [
    {
      left: `Chapter path: Definition (page 4), explanation (page 5), example (page 6), computation (page 7), and practice (page 8).`,
      right: `By the end, you should be able to describe ${lesson.title.toLowerCase()}, connect it to an example, and explain your reasoning.`,
    },
    {
      left: `Before reading, write one thing you already know about ${lesson.title.toLowerCase()} and one question you hope this lesson answers.`,
      right: `As you read, pause after each section. Say the main idea aloud, then connect it to the definition and example in this chapter.`,
    },
    {
      left: `Use the key words while explaining this idea: ${lesson.meaning}`, 
      right: `Keep your question in mind as you read. Look for a detail in the example that helps answer it.`,
    },
    {
      left: `A useful definition should help you recognize the idea in a new situation, not only repeat the lesson title.`,
      right: `Check your understanding: Which words carry the most meaning? Can you give a new example that still matches the definition?`,
    },
    {
      left: `Connect each step in this explanation to the definition. Notice what information matters and what you still need to find out.`,
      right: `After choosing a strategy, explain why it fits this lesson. A clear reason is just as important as the answer.`,
    },
    {
      left: `Read the example once for the situation, then again to find the detail that shows ${lesson.title.toLowerCase()}.`,
      right: `Try covering the explanation and describing the connection yourself. Then compare your reasoning with the notes on this page.`,
    },
    {
      left: `Keep your work organized: show what is known, the step you take, and what the result means.`,
      right: `Check your work another way when possible. Ask whether the result is reasonable and answers the original question.`,
    },
    {
      left: `Use the example as a model, but change the situation. Explain which detail still connects your new example to the definition.`,
      right: `A complete response includes the idea, supporting details, and a reason. Add a labeled drawing or number sentence if it helps.`,
    },
    {
      left: `Read the labels from left to right, then explain how they connect to ${lesson.title.toLowerCase()}.`,
      right: `Cover the diagram and redraw its sequence from memory. Add one sentence explaining what connects the steps.`,
    },
    {
      left: `Answer in a complete sentence and include a detail from the lesson to support your thinking.`,
      right: `If an answer is unclear, return to the definition or example. Correct the part that does not match the lesson idea.`,
    },
    {
      left: `Choose a familiar situation from home, school, or your community where ${lesson.title.toLowerCase()} could be useful.`,
      right: `Describe the situation, name the lesson idea you would use, and explain what detail helped you recognize it.`,
    },
    {
      left: `Choose two examples of ${lesson.title.toLowerCase()}. Record one feature they share and one feature that differs.`,
      right: `Use evidence from both examples to explain your comparison. Do not rely only on how the examples look at first.`,
    },
    {
      left: `Choose a model that matches the idea: a labeled drawing, a table, objects, or a number sentence.`,
      right: `Check every label and part of your model against the definition. Add a sentence that explains what the model shows.`,
    },
    {
      left: `Finish the prompts with details: I understand… / I can show it by… / I still want to learn…`,
      right: `Review your definition, example, and reasoning. Choose one part to explain again without looking at the book.`,
    },
    {
      left: `Teach the idea in three steps: name it, explain it simply, and give an example that demonstrates it.`,
      right: `Ask your listener what was clear and what needs another example. Revise your explanation using that feedback.`,
    },
    {
      left: `Create a new challenge about ${lesson.title.toLowerCase()} that can be answered using this chapter's main idea.`,
      right: `Show your solution or evidence, explain each important step, and finish by connecting your answer to the definition.`,
    },
  ];
  const allPages = [
    ...pages,
    ...extensionPages.slice(0, extensionPageCount),
    ...closingPages,
  ];
  const page = allPages[pageIndex - 1] || allPages[allPages.length - 1];
  const pageNote = pageNotes[pageIndex - 1] || {
    left: `Return to the definition of ${lesson.title.toLowerCase()} when you need a reminder: ${lesson.meaning}`,
    right: 'Use a clear example, model, or explanation to show what you understand about this lesson.',
  };
  const completeShortColumn = (content: string, note: string) =>
    pageIndex <= totalPages - CLOSING_NOTEBOOK_PAGES && content.length < 120
      ? `${content}\n\n${note}`
      : content;

  return {
    ...page,
    leftContent: completeShortColumn(page.leftContent, pageNote.left),
    rightContent: completeShortColumn(page.rightContent, pageNote.right),
  };
};

function LessonVisual({ data }: { data: LessonVisualData }) {
  return (
    <View
      accessible
      accessibilityLabel={`Visual lesson map for ${data.title}`}
      style={styles.lessonVisual}
    >
      <Text style={styles.lessonVisualTitle}>{data.title}</Text>
      <Text style={styles.lessonVisualSummary}>{data.summary}</Text>
      <View style={styles.lessonVisualSteps}>
        {data.steps.map((step, index) => (
          <View key={`${step.label}-${index}`} style={styles.lessonVisualStepGroup}>
            <View style={styles.lessonVisualStep}>
              <Text style={styles.lessonVisualIcon}>{step.icon}</Text>
              <Text style={styles.lessonVisualLabel}>{step.label}</Text>
            </View>
            {index < data.steps.length - 1 && (
              <Text style={styles.lessonVisualArrow}>↓</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const formatPageHeading = (heading: string) =>
  heading.charAt(0) + heading.slice(1).toLowerCase();

const generateTextbookBookPages = (
  gradeLevel: number,
  subjectTitle: string,
  lesson: Lesson,
  totalPages: number = DEFAULT_NOTEBOOK_PAGES,
) => {
  const cleanSubject = subjectTitle.toLowerCase();
  const isScience = cleanSubject.includes('science') || 
                    ['matter', 'living', 'force', 'earth', 'environment', 'energy', 'space'].some(s => cleanSubject.includes(s));

  const displaySubject = isScience ? 'Science' : 'Mathematics';

  const actualPages = Math.min(Math.max(totalPages, MIN_NOTEBOOK_PAGES), MAX_NOTEBOOK_PAGES);
  const pages = [];

  for (let i = 1; i <= actualPages; i++) {
    const pageData = getTextbookPageData(
      gradeLevel,
      displaySubject,
      lesson,
      i,
      actualPages,
    );
    pages.push({
      gradeLevel,
      subjectTitle: displaySubject,
      category: `DepEd Grade ${gradeLevel} • ${displaySubject}`,
      title: `${lesson.title} — Page ${i} of ${actualPages}`,
      leftType: pageData.leftType || 'line',
      rightType: pageData.rightType || 'line',
      leftHeading: pageData.leftHeading,
      leftContent: pageData.leftContent,
      rightHeading: pageData.rightHeading,
      rightContent: pageData.rightContent,
      visualData: pageData.visualData,
      rightVisualData: pageData.rightVisualData,
    });
  }

  return pages;
};

export default function NotebookBookViewer({
  gradeLevel = 1,
  initialSubject,
  initialLesson,
  totalPages = DEFAULT_NOTEBOOK_PAGES,
  onBack,
  onComplete,
}: NotebookBookViewerProps) {
  const BOOK_PAGES = useMemo(() => {
    // Respect initialSubject title explicitly
    const sTitle = initialSubject?.title || "Mathematics";
    const lesson = initialLesson || {
      title: 'Counting and Number Sense',
      meaning: 'Numbers describe how many objects there are and help us compare quantities.',
      example: 'Count a group of objects, then compare its total with a second group.',
      difficulty: 'Easy' as const,
    };
    return generateTextbookBookPages(gradeLevel, sTitle, lesson, totalPages);
  }, [gradeLevel, initialSubject, initialLesson, totalPages]);
  const notebookCoverColor = getNotebookCoverColor(gradeLevel, initialSubject, initialLesson);

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isCompletionModalVisible, setIsCompletionModalVisible] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');

  const pageCount = BOOK_PAGES.length;
  const xpReward = pageCount * 3;

  const rotateYAnim = useMemo(() => new Animated.Value(0), []);
  const flipSoundPlayer = useAudioPlayer(
    require('../../../assets/BiosphereQuestSoundEffectsandMusic/flip-sound-effect.mp3')
  );

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    }).catch((error) => {
      console.log('Failed to configure page turn audio:', error);
    });
  }, []);

  const playPageTurnSound = () => {
    try {
      flipSoundPlayer.pause();
      void flipSoundPlayer.seekTo(0).catch((error) => {
        console.log('Failed to rewind page turn audio:', error);
      });
      flipSoundPlayer.play();
    } catch (error) {
      console.log("Audio playback error:", error);
    }
  };

  const triggerFlipAnimation = (direction: 'next' | 'prev', callback: () => void) => {
    setFlipDirection(direction);
    setIsFlipping(true);
    playPageTurnSound();

    rotateYAnim.setValue(0);

    const targetValue = direction === 'next' ? 180 : -180;

    Animated.timing(rotateYAnim, {
      toValue: targetValue,
      duration: 480,
      useNativeDriver: true,
    }).start(() => {
      callback();
      setIsFlipping(false);
      rotateYAnim.setValue(0);
    });
  };

  const goToNextPage = () => {
    if (currentPageIndex < pageCount - 1 && !isFlipping) {
      const nextPageIndex = currentPageIndex + 1;
      triggerFlipAnimation('next', () => {
        setCurrentPageIndex(nextPageIndex);
        if (nextPageIndex === pageCount - 1) {
          setIsCompletionModalVisible(true);
        }
      });
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0 && !isFlipping) {
      triggerFlipAnimation('prev', () => {
        setCurrentPageIndex((prev) => prev - 1);
      });
    }
  };

  const activePageData = BOOK_PAGES[currentPageIndex] || BOOK_PAGES[0];

  const frontOverlayHeading = flipDirection === 'next'
    ? activePageData.rightHeading
    : activePageData.leftHeading;

  const frontOverlayContent = flipDirection === 'next'
    ? activePageData.rightContent
    : activePageData.leftContent;

  const backOverlayData = flipDirection === 'next'
    ? (BOOK_PAGES[currentPageIndex + 1] || activePageData)
    : (BOOK_PAGES[currentPageIndex - 1] || activePageData);

  const backOverlayHeading = flipDirection === 'next'
    ? backOverlayData.leftHeading
    : backOverlayData.rightHeading;

  const backOverlayContent = flipDirection === 'next'
    ? backOverlayData.leftContent
    : backOverlayData.rightContent;

  const frontOverlayVisualData = flipDirection === 'prev'
    ? activePageData.visualData
    : activePageData.rightVisualData;

  const backOverlayVisualData = flipDirection === 'next'
    ? backOverlayData.visualData
    : backOverlayData.rightVisualData;

  const frontOverlayType = flipDirection === 'next'
    ? activePageData.rightType || 'line'
    : activePageData.leftType || 'line';

  const backOverlayType = flipDirection === 'next'
    ? backOverlayData.leftType || 'line'
    : backOverlayData.rightType || 'line';

  const renderPageBackground = (type: string) => {
    if (type === 'grid') {
      return (
        <View style={styles.gridOverlay} pointerEvents="none">
          <View style={styles.marginLine} />
          {[...Array(22)].map((_, i) => (
            <View key={`grid-h-${i}`} style={styles.gridHorizontalLine} />
          ))}
          {[...Array(7)].map((_, i) => (
            <View key={`grid-v-${i}`} style={[styles.gridVerticalLine, { left: `${(i + 1) * 12.5}%` }]} />
          ))}
        </View>
      );
    } else {
      return (
        <View style={styles.lineOverlay} pointerEvents="none">
          <View style={styles.marginLine} />
          {[...Array(24)].map((_, i) => (
            <View key={`line-${i}`} style={styles.ruledLine} />
          ))}
        </View>
      );
    }
  };

  const renderScrollPageContent = (
    visualData: LessonVisualData | undefined,
    content: string,
  ) => (
    <>
      {visualData && <LessonVisual data={visualData} />}
      {content.split(/\n{2,}/).map((paragraph, index) => (
        <Text
          key={`paragraph-${index}`}
          style={[styles.pageTextContent, index > 0 && styles.pageParagraph]}
        >
          {paragraph}
        </Text>
      ))}
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>‹ Back to courses</Text>
        </TouchableOpacity>
        <View style={styles.badgeContainer}>
          <Text style={styles.pageIndicator}>
            Grade {gradeLevel} • Page {currentPageIndex + 1} of {pageCount}
          </Text>
        </View>
      </View>

      <View style={styles.headerCard}>
        <Text style={styles.headerIcon}>📓</Text>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {activePageData.title.replace(/ — Page \d+ of \d+$/, '')}
        </Text>
        <Text style={styles.headerMission}>Grade {gradeLevel} {activePageData.subjectTitle} • {activePageData.category}</Text>
      </View>

      <View style={[styles.notebookContainer, { backgroundColor: notebookCoverColor }]}>
        <View style={styles.notebookSpread}>
          
          <View style={styles.page}>
            {renderPageBackground(activePageData.leftType || 'line')}
            <Text style={styles.pageLabel}>{formatPageHeading(activePageData.leftHeading)}</Text>
            <ScrollView
              style={styles.pageScrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator
            >
              {renderScrollPageContent(
                activePageData.visualData,
                activePageData.leftContent,
              )}
            </ScrollView>
          </View>

          <View style={styles.bindingShadow}>
            {[...Array(15)].map((_, index) => (
              <View key={`coil-${index}`} style={styles.bindingCoil} />
            ))}
          </View>

          <View style={styles.page}>
            {renderPageBackground(activePageData.rightType || 'line')}
            <Text style={styles.pageLabel}>{formatPageHeading(activePageData.rightHeading)}</Text>
            <ScrollView
              style={styles.pageScrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator
            >
              {renderScrollPageContent(
                activePageData.rightVisualData,
                activePageData.rightContent,
              )}
            </ScrollView>
          </View>

          {isFlipping && (
            <View style={styles.spinePivotWrapper} pointerEvents="none">
              <Animated.View
                style={[
                  styles.spineHingeContainer,
                  {
                    transform: [
                      { perspective: 1200 },
                      {
                        rotateY: rotateYAnim.interpolate({
                          inputRange: [-180, 0, 180],
                          outputRange: ['180deg', '0deg', '-180deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.turningLeafPaper,
                    flipDirection === 'next' ? styles.turningLeafRight : styles.turningLeafLeft,
                  ]}
                >
                  <View style={styles.page}>
                    {renderPageBackground(frontOverlayType)}
                    <Text style={styles.pageLabel}>{formatPageHeading(frontOverlayHeading)}</Text>
                    <ScrollView style={styles.pageScrollView} contentContainerStyle={styles.scrollContent}>
                      {renderScrollPageContent(frontOverlayVisualData, frontOverlayContent)}
                    </ScrollView>
                  </View>

                  <Animated.View
                    style={[
                      styles.turningLeafBack,
                      {
                        opacity: rotateYAnim.interpolate({
                          inputRange: [-180, -90, 0, 90, 180],
                          outputRange: [1, 1, 0, 1, 1],
                        }),
                      },
                    ]}
                  >
                    <View style={styles.page}>
                      {renderPageBackground(backOverlayType)}
                      <Text style={styles.pageLabel}>{formatPageHeading(backOverlayHeading)}</Text>
                      <ScrollView style={styles.pageScrollView} contentContainerStyle={styles.scrollContent}>
                        {renderScrollPageContent(backOverlayVisualData, backOverlayContent)}
                      </ScrollView>
                    </View>
                  </Animated.View>
                </View>
              </Animated.View>
            </View>
          )}

        </View>
      </View>

      <View style={styles.pagerControls}>
        <TouchableOpacity
          style={[styles.pagerButton, (currentPageIndex === 0 || isFlipping) && styles.disabledButton]}
          onPress={goToPrevPage}
          disabled={currentPageIndex === 0 || isFlipping}
        >
          <Text style={styles.pagerButtonText}>← Previous Page</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pagerButton, (currentPageIndex === pageCount - 1 || isFlipping) && styles.disabledButton]}
          onPress={goToNextPage}
          disabled={currentPageIndex === pageCount - 1 || isFlipping}
        >
          <Text style={styles.pagerButtonText}>Next Page →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtonWrapper}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            currentPageIndex < pageCount - 1 && styles.disabledCompleteButton,
          ]}
          onPress={() => setIsCompletionModalVisible(true)}
          disabled={currentPageIndex < pageCount - 1}
        >
          <Text style={styles.completeButtonText}>
            {currentPageIndex === pageCount - 1
              ? `Complete lesson • +${xpReward} XP →`
              : 'Finish the notes to complete'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isCompletionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCompletionModalVisible(false)}
      >
        <View style={styles.completionBackdrop}>
          <View style={styles.completionDialog}>
            <Text style={styles.completionIcon}>✓</Text>
            <Text style={styles.completionTitle}>Lesson notes complete!</Text>
            <Text style={styles.completionMessage}>
              You reached the last of {pageCount} pages. Complete this lesson to earn:
            </Text>
            <Text style={styles.completionReward}>+{xpReward} XP</Text>
            <TouchableOpacity
              style={styles.completionSecondaryButton}
              onPress={() => setIsCompletionModalVisible(false)}
            >
              <Text style={styles.completionSecondaryText}>Review notes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completionConfirmButton}
              onPress={() => {
                setIsCompletionModalVisible(false);
                onComplete(xpReward);
              }}
            >
              <Text style={styles.completionConfirmText}>Complete lesson</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#091426',
    paddingTop: 28,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  backButton: {
    paddingVertical: 2,
  },
  backText: {
    color: '#e582ff',
    fontSize: 14,
    fontWeight: '800',
  },
  badgeContainer: {
    backgroundColor: '#182e5d',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3730a3',
  },
  pageIndicator: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '800',
  },
  headerCard: {
    backgroundColor: '#f1e6c7',
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#b69a62',
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginBottom: 6,
    transform: [{ rotate: '-0.5deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#29362f',
    textAlign: 'center',
  },
  headerMission: {
    fontSize: 11,
    fontWeight: '700',
    color: '#617064',
    marginTop: 1,
  },
  notebookContainer: {
    flex: 1,
    width: '100%',
    maxHeight: 520,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    padding: 7,
    borderRadius: 15,
    backgroundColor: '#45624f',
    borderWidth: 1,
    borderColor: '#d6c89c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  notebookSpread: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f8f0da',
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  page: {
    flex: 1,
    backgroundColor: '#fffdf5',
    paddingHorizontal: 14,
    paddingTop: 30,
    paddingBottom: 14,
    justifyContent: 'flex-start',
    overflow: 'hidden',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 28,
  },
  pageScrollView: {
    flex: 1,
    minHeight: 0,
  },
  lessonVisual: {
    marginBottom: 12,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#86b99c',
    backgroundColor: '#f0f8f2',
  },
  lessonVisualTitle: {
    marginBottom: 6,
    color: '#245642',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  lessonVisualSummary: {
    marginBottom: 8,
    color: '#334155',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    textAlign: 'left',
  },
  lessonVisualSteps: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  lessonVisualStepGroup: {
    alignItems: 'stretch',
  },
  lessonVisualStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  lessonVisualIcon: {
    color: '#245642',
    fontSize: 18,
    textAlign: 'center',
  },
  lessonVisualLabel: {
    flex: 1,
    minWidth: 0,
    color: '#334155',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    textAlign: 'left',
  },
  lessonVisualArrow: {
    alignSelf: 'center',
    color: '#16806b',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  spinePivotWrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  spineHingeContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  turningLeafPaper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 170,
    backfaceVisibility: 'hidden',
  },
  turningLeafRight: {
    left: 0,
  },
  turningLeafLeft: {
    right: 0,
  },
  turningLeafBack: {
    ...StyleSheet.absoluteFill,
    transform: [{ rotateY: '180deg' }],
  },
  lineOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 8,
    justifyContent: 'flex-start',
  },
  ruledLine: {
    height: 1,
    marginBottom: 19,
    backgroundColor: '#d5e2e8',
    width: '100%',
  },
  marginLine: {
    position: 'absolute',
    left: 8,
    top: -20,
    bottom: 0,
    width: 1,
    backgroundColor: '#e7aaa0',
  },
  gridOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    bottom: 8,
    justifyContent: 'flex-start',
  },
  gridHorizontalLine: {
    height: 1,
    marginBottom: 19,
    backgroundColor: '#d5e2e8',
    width: '100%',
  },
  gridVerticalLine: {
    position: 'absolute',
    top: -20,
    bottom: 0,
    width: 1,
    backgroundColor: '#d5e2e8',
  },
  pageLabel: {
    position: 'absolute',
    top: 9,
    left: 14,
    fontSize: 10,
    fontWeight: '900',
    color: '#4b765e',
    letterSpacing: 0,
    zIndex: 2,
  },
  pageTextContent: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '400',
    lineHeight: 21,
    textAlign: 'left',
    zIndex: 2,
  },
  pageParagraph: {
    marginTop: 8,
  },
  bindingShadow: {
    width: 24,
    backgroundColor: '#e7dcc0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  bindingCoil: {
    width: 21,
    height: 8,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#85877f',
    backgroundColor: '#f5f1e5',
  },
  pagerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 10,
  },
  pagerButton: {
    flex: 1,
    backgroundColor: '#1d2e5a',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3b82f6',
  },
  disabledButton: {
    opacity: 0.35,
    borderColor: '#475569',
  },
  pagerButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  actionButtonWrapper: {
    paddingBottom: 6,
  },
  completeButton: {
    backgroundColor: '#6258ff',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#6258ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  disabledCompleteButton: {
    opacity: 0.45,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  completionBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(5, 12, 25, 0.72)',
  },
  completionDialog: {
    width: '100%',
    maxWidth: 360,
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#b69a62',
    backgroundColor: '#fffdf5',
  },
  completionIcon: {
    width: 44,
    height: 44,
    marginBottom: 12,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#dff1df',
    color: '#3d7651',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 44,
    textAlign: 'center',
  },
  completionTitle: {
    color: '#29362f',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  completionMessage: {
    marginTop: 10,
    color: '#526052',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  completionReward: {
    marginTop: 8,
    marginBottom: 16,
    color: '#3d7651',
    fontSize: 24,
    fontWeight: '900',
  },
  completionSecondaryButton: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#66806d',
    alignItems: 'center',
  },
  completionSecondaryText: {
    color: '#3c5745',
    fontSize: 14,
    fontWeight: '700',
  },
  completionConfirmButton: {
    width: '100%',
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#45624f',
  },
  completionConfirmText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});