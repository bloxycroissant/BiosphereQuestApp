import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer } from "expo-audio";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Lesson, Subject } from "./curriculum";

const stellaMascotImage = require("../../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");
const lessonBgmFile = require("../../../assets/BiosphereQuestSoundEffectsandMusic/Cozy Space Lofi 🌌 30 Min Study, Focus & Relax Beats.mp3");

interface InteractiveLessonViewerProps {
  gradeLevel?: number;
  initialSubject?: Subject;
  initialLesson?: Lesson;
  onBack?: () => void;
  onComplete: (
    xpReward: number,
    isPerfect?: boolean,
    isSpeedyMath?: boolean,
    isSpeedyScience?: boolean,
  ) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface LessonTopic {
  title: string;
  story: string;
  howItWorks: string;
  visualIllustration: string;
  demonstration: string;
  questions: QuizQuestion[];
}

const getStorageKey = (grade: number, subj: string, lesson: string) =>
  "@biosphere_active_lesson_progress_" + grade + "_" + subj + "_" + lesson;

const shuffle = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const buildQuestion = (
  qText: string,
  correct: string,
  wrongs: string[],
  explanation: string,
): QuizQuestion => {
  const options = shuffle([correct, ...wrongs.slice(0, 2)]);
  return {
    question: qText,
    options,
    correctIndex: options.indexOf(correct),
    explanation,
  };
};

const buildLessonContent = (
  lesson: Lesson,
  subjectTitle: string,
  gradeLevel: number,
): { topics: LessonTopic[]; recapQuestions: QuizQuestion[] } => {
  const isScience =
    subjectTitle.toLowerCase().includes("science") ||
    ["matter", "living", "force", "earth"].some((s) =>
      subjectTitle.toLowerCase().includes(s),
    );

  const cleanSubject = subjectTitle.toLowerCase();
  const cleanLesson = lesson.title.toLowerCase();

  let visualIllustration = "";
  let howItWorks = "";
  let storyText = "";
  let demoText = "";
  let t1Pool: QuizQuestion[] = [];
  let t2Pool: QuizQuestion[] = [];
  let t3Pool: QuizQuestion[] = [];

  if (!isScience && cleanSubject.includes("math")) {
    if (gradeLevel === 1) {
      if (/count|number|sense|ordinal/.test(cleanLesson)) {
        visualIllustration =
          "🍎 🍎 🍎 🍎 🍎  (5 Mangos)   and   🪙 🪙 🪙  (3 Piso Coins)";
        storyText =
          "DepEd MATATAG Grade 1 Math: In our classroom, we use real physical objects like mangoes, sticks, and piso coins to count and compare quantities up to 100.";
        howItWorks =
          "One-to-one correspondence: Point your finger at each object one by one from left to right. The last counting word spoken gives the total amount.";
        demoText =
          "Classroom Activity: Grouping 5 mangoes on the desk and matching them with number symbols.";
        t1Pool = [
          buildQuestion(
            "When counting physical objects on your desk, what is the proper method?",
            "Touch and count each item one by one from left to right.",
            [
              "Guess the total number without pointing.",
              "Ignore the objects entirely.",
            ],
            "Correct! Touching each object ensures every item is counted once.",
          ),
          buildQuestion(
            "What does the final number spoken when counting a set indicate?",
            "The total quantity of items in that set.",
            ["The size of the table.", "A random label."],
            "Spot on! The last number names the total amount.",
          ),
          buildQuestion(
            "If you have 4 red counters and add 2 more counters, how do you find the new total?",
            "Count all the counters together from the beginning.",
            ["Throw half of them away.", "Stop counting immediately."],
            "Correct! Combining sets means recounting all items together.",
          ),
        ];
        t2Pool = [
          buildQuestion(
            "Look at the visual set: [🍎 🍎 🍎] vs [🍎 🍎]. Which group is greater?",
            "The group with 3 mangoes.",
            ["The group with 2 mangoes.", "Both groups have zero."],
            "Great observation! 3 is greater in quantity than 2.",
          ),
          buildQuestion(
            "Which number comes right after 7 when counting forward?",
            "8",
            ["6", "10"],
            "Spot on! Counting sequence goes 7, then 8.",
          ),
        ];
        t3Pool = [
          buildQuestion(
            "Where do we apply counting skills in our daily community life?",
            "When buying pan de sal or counting our school supplies.",
            [
              "Nowhere, numbers only exist in textbooks.",
              "Only during bedtime.",
            ],
            "Wonderful! Math is part of our everyday routines.",
          ),
        ];
      } else if (/shape|pattern/.test(cleanLesson)) {
        visualIllustration =
          "🔴 Circle ➔ 🟦 Square ➔ 🔺 Triangle ➔ 🔴 Circle ➔ [?]";
        storyText =
          "DepEd MATATAG Grade 1 Math: Exploring 2D geometric shapes and repeating pattern sequences in our environment.";
        howItWorks =
          "Observe the repeating order of shapes and colors (such as A-B-A-B) to determine what comes next in the row.";
        demoText =
          "Classroom Activity: Arranging colored paper cutouts into repeating shape trains.";
        t1Pool = [
          buildQuestion(
            "What shape comes next in the repeating sequence: Circle, Square, Circle, Square, [?]",
            "Circle",
            ["Triangle", "Rectangle"],
            "Correct! The pattern alternates between Circle and Square.",
          ),
          buildQuestion(
            "How many straight sides does a triangle have?",
            "3 straight sides",
            ["4 straight sides", "0 straight sides"],
            "Correct! Triangles always have 3 straight sides.",
          ),
        ];
        t2Pool = [
          buildQuestion(
            "What attributes define a square in geometry?",
            "4 equal straight sides and 4 square corners",
            ["Round curved edges only", "3 unequal sides"],
            "Spot on! Squares are bounded by four equal straight sides.",
          ),
        ];
        t3Pool = [
          buildQuestion(
            "Why do we study repeating patterns in Grade 1?",
            "To recognize order and predict upcoming elements in a sequence.",
            ["To make art confusing.", "Patterns have no practical use."],
            "Exactly! Pattern recognition builds foundational logical thinking.",
          ),
        ];
      } else {
        visualIllustration = "🟢 🟢 🟢  +  🟢 🟢  =  5 Counters Total";
        storyText = `DepEd MATATAG Grade 1 Math: Exploring ${lesson.title} using concrete counters and visual addition/subtraction.`;
        howItWorks =
          "Putting sets together creates addition (+); taking away items from a set represents subtraction (-).";
        demoText = lesson.example;
        t1Pool = [
          buildQuestion(
            `What is the primary objective of ${lesson.title}?`,
            lesson.meaning,
            ["Ignoring numbers completely.", "Guessing without looking."],
            "Correct! Understanding the foundational meaning is essential.",
          ),
        ];
        t2Pool = [
          buildQuestion(
            `In our classroom demonstration (${lesson.example}), what was illustrated?`,
            lesson.example,
            ["An imaginary event.", "No action."],
            "Spot on! Concrete examples bring math concepts to life.",
          ),
        ];
        t3Pool = [
          buildQuestion(
            "How do manipulatives help us learn addition and subtraction?",
            "They let us physically see quantities combine or separate.",
            ["They make numbers disappear.", "They are just toys."],
            "Wonderful! Physical objects bridge concrete actions to math symbols.",
          ),
        ];
      }
    } else if (gradeLevel === 2) {
      visualIllustration =
        "🟦 (100-Flat)  |  🟩 🟩 (20-Rods)  |  🟨 🟨 🟨 (3-Units)  ➔  123";
      storyText = `DepEd MATATAG Grade 2 Math: Mastering ${lesson.title} with Base-10 blocks, standard measurement units, and Philippine currency.`;
      howItWorks =
        "Organize numbers by place value (Hundreds, Tens, Ones) and regroup when columns exceed 9.";
      demoText = lesson.example;
      t1Pool = [
        buildQuestion(
          `What rule governs ${lesson.title}?`,
          lesson.meaning,
          ["Random number assignment.", "Ignoring column alignment."],
          "Correct! Systematic place value organization is key.",
        ),
      ];
      t2Pool = [
        buildQuestion(
          `Based on our example (${lesson.example}), how do we calculate the result?`,
          lesson.example,
          ["By guessing blindly.", "By skipping operations."],
          "Great job following the step-by-step procedure!",
        ),
      ];
      t3Pool = [
        buildQuestion(
          "Why is understanding place value crucial in Grade 2?",
          "It ensures numbers are added and subtracted across correct columns.",
          ["It makes numbers smaller.", "It is optional."],
          "Spot on! Place value maintains true numerical value.",
        ),
      ];
    } else if (gradeLevel === 3) {
      visualIllustration =
        "⭐⭐⭐⭐ / ⭐⭐⭐⭐ / ⭐⭐⭐⭐  (3 Equal Rows of 4 = 12 Array)";
      storyText = `DepEd MATATAG Grade 3 Math: Exploring ${lesson.title} through multiplication arrays, fractions, and perimeter grids.`;
      howItWorks =
        "Multiplication represents equal groups and rectangular arrays. Fractions name equal parts of a whole.";
      demoText = lesson.example;
      t1Pool = [
        buildQuestion(
          `What principle underlies ${lesson.title}?`,
          lesson.meaning,
          ["Random guessing.", "Unequal partitioning."],
          "Correct! Equal grouping forms the foundation of multiplication.",
        ),
      ];
      t2Pool = [
        buildQuestion(
          `In our worked example (${lesson.example}), what is the outcome?`,
          lesson.example,
          ["An incorrect estimate.", "Zero."],
          "Spot on! Accurate calculation yields the correct product or fraction.",
        ),
      ];
      t3Pool = [
        buildQuestion(
          "How do multiplication arrays help solve real problems?",
          "They allow rapid calculation of large quantities arranged in rows.",
          ["They have no real use.", "Only for school tests."],
          "Wonderful! Arrays make counting items efficient and structured.",
        ),
      ];
    } else {
      visualIllustration =
        "📊 [MATATAG Curriculum Framework & Mathematical Model]";
      storyText = `DepEd MATATAG Grade ${gradeLevel} Math: Advanced problem solving for ${lesson.title}.`;
      howItWorks =
        "Analyze given data, apply standard mathematical algorithms, and verify solutions against problem constraints.";
      demoText = lesson.example;
      t1Pool = [
        buildQuestion(
          `What rule defines ${lesson.title}?`,
          lesson.meaning,
          ["Random estimation.", "Ignoring equation balance."],
          "Correct! Precise operational rules govern this topic.",
        ),
      ];
      t2Pool = [
        buildQuestion(
          `How do we solve challenges like: ${lesson.example}?`,
          lesson.example,
          ["Guessing without formulas.", "Discarding units."],
          "Spot on! Systematic execution ensures mathematical accuracy.",
        ),
      ];
      t3Pool = [
        buildQuestion(
          "Why is verifying your calculated result important?",
          "It confirms that your solution satisfies all given problem conditions.",
          ["It is never required.", "To waste time."],
          "Exact proof! Verification guarantees correctness.",
        ),
      ];
    }
  } else {
    visualIllustration =
      "🌱 Roots (Water Absorption) ➔ 🌿 Stem (Transport) ➔ ☀️ Leaves (Food Synthesis)";
    storyText = `DepEd MATATAG Science Curriculum: Investigating ${lesson.title} in our natural environment.`;
    howItWorks =
      "Scientific inquiry involves observing physical phenomena, recording empirical data, and drawing evidence-based conclusions.";
    demoText = lesson.example;
    t1Pool = [
      buildQuestion(
        `What scientific principle explains ${lesson.title}?`,
        lesson.meaning,
        ["Unproven folklore.", "Pure guesswork."],
        "Correct! Science relies on verifiable empirical laws.",
      ),
    ];
    t2Pool = [
      buildQuestion(
        `In our observation example (${lesson.example}), what was demonstrated?`,
        lesson.example,
        ["An impossible anomaly.", "Nothing."],
        "Spot on! Empirical evidence proves scientific concepts.",
      ),
    ];
    t3Pool = [
      buildQuestion(
        "Why is studying science essential for our community?",
        "It helps us understand nature, conserve resources, and solve local challenges.",
        ["It has no practical application.", "Only for indoor reading."],
        "Wonderful! Science empowers us to care for our world.",
      ),
    ];
  }

  const topics: LessonTopic[] = [
    {
      title: "1. Core Concept & Classroom Guide",
      story: storyText,
      howItWorks: howItWorks,
      visualIllustration: visualIllustration,
      demonstration: demoText,
      questions: t1Pool,
    },
    {
      title: "2. Worked Classroom Demonstration",
      story:
        "Let's examine how this works in a real Matatag classroom setting step by step.",
      howItWorks: "Follow the visual illustration and breakdown below:",
      visualIllustration: visualIllustration,
      demonstration: demoText,
      questions: t2Pool,
    },
    {
      title: "3. Real-World Explorer Mission",
      story: `Now let's see how ${lesson.title} connects to our everyday environment.`,
      howItWorks: "Apply what you observed to answer the checkpoint question.",
      visualIllustration: visualIllustration,
      demonstration: demoText,
      questions: t3Pool,
    },
  ];

  const fullRecapPool: QuizQuestion[] = [
    buildQuestion(
      `Mastery Check 1: What is the primary definition of ${lesson.title}?`,
      lesson.meaning,
      ["An unproven guess.", "A temporary trick."],
      "Accurate recall of the core rule!",
    ),
    buildQuestion(
      `Mastery Check 2: When explaining ${lesson.title}, which statement is correct?`,
      lesson.meaning,
      ["It is completely random.", "It has no rules."],
      "Clear communication of knowledge!",
    ),
    buildQuestion(
      `Mastery Check 3: Recall our example: "${lesson.example}". What did it illustrate?`,
      lesson.title,
      ["An unrelated topic.", "An error in calculation."],
      "Great recognition of worked examples!",
    ),
    buildQuestion(
      "Mastery Check 4: True or False: Paying attention to details leads to accurate solutions.",
      "True, observant learners find correct answers.",
      ["False, rushing is better.", "False, details do not matter."],
      "Observant thinking is key!",
    ),
    buildQuestion(
      `Mastery Check 5: Which practice best helps us master ${lesson.title}?`,
      "Reviewing classroom examples and checking our work carefully.",
      [
        "Guessing answers quickly without looking.",
        "Ignoring all instructions.",
      ],
      "Systematic review builds mastery!",
    ),
    buildQuestion(
      `Mastery Check 6: How does ${lesson.title} connect to our daily classroom activities?`,
      "By helping us solve practical problems logically and accurately.",
      ["It only exists inside storybooks.", "It has no use in real life."],
      "Practical connection verified!",
    ),
    buildQuestion(
      "Mastery Check 7: What should you do if your first attempt at solving a problem is incorrect?",
      "Review the steps, correct mistakes, and try again patiently.",
      ["Give up and throw your notebook away.", "Change the rules of math."],
      "Perseverance leads to learning!",
    ),
    buildQuestion(
      `Mastery Check 8: In the context of ${subjectTitle}, why is careful observation important?`,
      "It ensures our findings and calculations are factual and precise.",
      ["It wastes valuable study time.", "Observations do not matter at all."],
      "Observation is the foundation of learning!",
    ),
    buildQuestion(
      "Mastery Check 9: Which habit helps you remember what you learn in class?",
      "Discussing concepts with classmates and practicing regularly.",
      [
        "Forgetting everything after the bell rings.",
        "Never reviewing your notes.",
      ],
      "Active practice reinforces memory!",
    ),
    buildQuestion(
      `Mastery Check 10: Final Reflection: How confident are you in applying ${lesson.title}?`,
      "Very confident after working through the lesson guides and examples.",
      ["Not sure at all.", "I will never use this."],
      "Great job completing your learning mission!",
    ),
  ];

  const recapQuestions = shuffle(fullRecapPool).slice(0, 10);

  return { topics, recapQuestions };
};

export default function InteractiveLessonViewer({
  gradeLevel = 1,
  initialSubject,
  initialLesson,
  onBack,
  onComplete,
}: InteractiveLessonViewerProps): React.JSX.Element {
  const fallbackSubject: Subject = {
    title: "Math",
    icon: "📐",
    color: "#9c63e8",
    lessons: [],
  };
  const fallbackLesson: Lesson = {
    title: "Counting",
    meaning: "Numbers tell us amounts.",
    example: "1, 2, 3",
    difficulty: "Easy",
  };

  const subject = initialSubject || fallbackSubject;
  const lesson = initialLesson || fallbackLesson;
  const storageKey = getStorageKey(gradeLevel, subject.title, lesson.title);

  const bgmPlayer = useAudioPlayer(lessonBgmFile);

  useEffect(() => {
    if (bgmPlayer) {
      bgmPlayer.loop = true;
      bgmPlayer.volume = 0.2;
      bgmPlayer.play();
    }
  }, [bgmPlayer]);
  const { topics, recapQuestions } = useMemo(
    () => buildLessonContent(lesson, subject.title, gradeLevel),
    [lesson, subject.title, gradeLevel],
  );

  const [stage, setStage] = useState<
    "topic_learn" | "topic_quiz" | "recap_quiz" | "summary"
  >("topic_learn");
  const [topicIndex, setTopicIndex] = useState(0);
  const [topicQuestionIndex, setTopicQuestionIndex] = useState(0);
  const [recapQuestionIndex, setRecapQuestionIndex] = useState(0);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [mistakesCount, setMistakesCount] = useState(0);

  const [showExitModal, setShowExitModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [savedProgressData, setSavedProgressData] = useState<any | null>(null);

  const currentTopic = topics[topicIndex] || topics[0];
  const activeQuiz =
    stage === "topic_quiz"
      ? currentTopic.questions[topicQuestionIndex]
      : stage === "recap_quiz"
        ? recapQuestions[recapQuestionIndex]
        : null;

  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const pulseScaleAnim = useRef(new Animated.Value(1)).current;

  const startTimeRef = useRef(Date.now());
  const timeSavedRef = useRef(false);
  const quizStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      (stage === "topic_quiz" || stage === "recap_quiz") &&
      !quizStartTimeRef.current
    ) {
      quizStartTimeRef.current = Date.now();
    }
  }, [stage]);

  useEffect(() => {
    return () => {
      const saveStudyTime = async () => {
        if (timeSavedRef.current) return;
        timeSavedRef.current = true;
        const elapsedMs = Date.now() - startTimeRef.current;
        const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));

        try {
          const profileRaw = await AsyncStorage.getItem(
            "@biosphere_profile_data_v1",
          );
          if (profileRaw) {
            const profile = JSON.parse(profileRaw);
            profile.studyMinutes = (profile.studyMinutes || 0) + elapsedMinutes;
            await AsyncStorage.setItem(
              "@biosphere_profile_data_v1",
              JSON.stringify(profile),
            );
          }
        } catch (e) {
          console.error("Failed to save study time", e);
        }
      };
      void saveStudyTime();
    };
  }, []);

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, [shimmerAnim]);

  useEffect(() => {
    const checkSaved = async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            parsed.topicIndex > 0 ||
            parsed.stage !== "topic_learn" ||
            parsed.totalXpEarned > 0
          ) {
            setSavedProgressData(parsed);
            setShowResumeModal(true);
          }
        }
      } catch (e) {
        console.error("Failed to load saved lesson progress", e);
      }
    };
    checkSaved();
  }, [storageKey]);

  const saveCurrentState = async (
    newStage: typeof stage,
    newTopicIdx: number,
    newTopicQIdx: number,
    newRecapQIdx: number,
    xp: number,
    mistakes: number,
  ) => {
    try {
      const data = {
        stage: newStage,
        topicIndex: newTopicIdx,
        topicQuestionIndex: newTopicQIdx,
        recapQuestionIndex: newRecapQIdx,
        totalXpEarned: xp,
        mistakesCount: mistakes,
      };
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  const clearCurrentProgress = async () => {
    try {
      await AsyncStorage.removeItem(storageKey);
    } catch (e) {
      console.error("Failed to clear progress", e);
    }
  };

  const handleResume = () => {
    if (savedProgressData) {
      setStage(savedProgressData.stage || "topic_learn");
      setTopicIndex(savedProgressData.topicIndex || 0);
      setTopicQuestionIndex(savedProgressData.topicQuestionIndex || 0);
      setRecapQuestionIndex(savedProgressData.recapQuestionIndex || 0);
      setTotalXpEarned(savedProgressData.totalXpEarned || 0);
      setMistakesCount(savedProgressData.mistakesCount || 0);
    }
    setShowResumeModal(false);
  };

  const handleRestart = async () => {
    await clearCurrentProgress();
    setStage("topic_learn");
    setTopicIndex(0);
    setTopicQuestionIndex(0);
    setRecapQuestionIndex(0);
    setTotalXpEarned(0);
    setMistakesCount(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowResumeModal(false);
  };

  useEffect(() => {
    let percent = 0;
    if (stage === "topic_learn") {
      percent = (topicIndex / (topics.length + 1)) * 100;
    } else if (stage === "topic_quiz") {
      const topicChunk = 1 / (topics.length + 1);
      const qFraction =
        (topicQuestionIndex + (isCorrect ? 1 : 0)) /
        currentTopic.questions.length;
      percent =
        ((topicIndex + qFraction * topicChunk) / (topics.length + 1)) * 100;
    } else if (stage === "recap_quiz") {
      const recapProgress =
        (recapQuestionIndex + (isCorrect ? 1 : 0)) / recapQuestions.length;
      percent = 75 + recapProgress * 25;
    } else if (stage === "summary") {
      percent = 100;
    }

    Animated.parallel([
      Animated.spring(progressAnim, {
        toValue: Math.min(Math.max(percent, 5), 100),
        useNativeDriver: false,
        friction: 8,
        tension: 45,
      }),
      Animated.sequence([
        Animated.timing(pulseScaleAnim, {
          toValue: 1.05,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.spring(pulseScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [
    stage,
    topicIndex,
    topicQuestionIndex,
    recapQuestionIndex,
    isCorrect,
    topics.length,
    recapQuestions.length,
  ]);

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    if (!activeQuiz) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const correct = idx === activeQuiz.correctIndex;
    setIsCorrect(correct);

    const reward = stage === "recap_quiz" ? 10 : 15;
    const updatedXp = totalXpEarned + reward;
    setTotalXpEarned(updatedXp);
    void saveCurrentState(
      stage,
      topicIndex,
      topicQuestionIndex,
      recapQuestionIndex,
      updatedXp,
      mistakesCount,
    );
  };

  const handleNextAction = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);

    if (stage === "topic_learn") {
      setStage("topic_quiz");
      setTopicQuestionIndex(0);
      void saveCurrentState(
        "topic_quiz",
        topicIndex,
        0,
        recapQuestionIndex,
        totalXpEarned,
        mistakesCount,
      );
    } else if (stage === "topic_quiz") {
      if (topicQuestionIndex < currentTopic.questions.length - 1) {
        const nextQ = topicQuestionIndex + 1;
        setTopicQuestionIndex(nextQ);
        void saveCurrentState(
          "topic_quiz",
          topicIndex,
          nextQ,
          recapQuestionIndex,
          totalXpEarned,
          mistakesCount,
        );
      } else {
        if (topicIndex < topics.length - 1) {
          const nextT = topicIndex + 1;
          setTopicIndex(nextT);
          setStage("topic_learn");
          void saveCurrentState(
            "topic_learn",
            nextT,
            0,
            recapQuestionIndex,
            totalXpEarned,
            mistakesCount,
          );
        } else {
          setStage("recap_quiz");
          setRecapQuestionIndex(0);
          void saveCurrentState(
            "recap_quiz",
            topicIndex,
            0,
            0,
            totalXpEarned,
            mistakesCount,
          );
        }
      }
    } else if (stage === "recap_quiz") {
      if (recapQuestionIndex < recapQuestions.length - 1) {
        const nextRQ = recapQuestionIndex + 1;
        setRecapQuestionIndex(nextRQ);
        void saveCurrentState(
          "recap_quiz",
          topicIndex,
          0,
          nextRQ,
          totalXpEarned,
          mistakesCount,
        );
      } else {
        const bonus = mistakesCount === 0 ? 50 : 0;
        const finalXp = totalXpEarned + bonus;
        setTotalXpEarned(finalXp);
        setStage("summary");
        void clearCurrentProgress();
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topHeader}>
          <Pressable
            onPress={() => setShowExitModal(true)}
            style={styles.backTouch}
          >
            <Text style={styles.backLabel}>Exit</Text>
          </Pressable>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>⚡ +{totalXpEarned} XP</Text>
          </View>
        </View>

        <Animated.View
          style={[
            styles.progressWrapper,
            { transform: [{ scale: pulseScaleAnim }] },
          ]}
        >
          <View style={styles.progressTrackWrapper}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.shimmerEffect,
                    {
                      transform: [
                        {
                          translateX: shimmerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-80, 320],
                          }),
                        },
                      ],
                    },
                  ]}
                />
                <View style={styles.sparkleHead} />
              </Animated.View>
            </View>

            <Animated.View
              style={[
                styles.rocketContainer,
                {
                  left: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            >
              <Text style={styles.rocketIcon}>🚀</Text>
            </Animated.View>
          </View>

          <View style={styles.moonContainer}>
            <Text style={styles.moonIcon}>🌕</Text>
          </View>
        </Animated.View>

        <View style={[styles.heroCard, { borderColor: subject.color }]}>
          <View style={styles.heroCardHeaderRow}>
            <Image
              source={stellaMascotImage}
              style={styles.heroMascotImage}
              resizeMode="contain"
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.subjectPill}>
                {subject.icon} {subject.title} (Grade {gradeLevel})
              </Text>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>
            </View>
          </View>
          <Text style={styles.topicSubtitle}>
            {stage === "summary"
              ? "Mission Accomplished!"
              : stage === "recap_quiz"
                ? "Final Mastery Quiz (" +
                  (recapQuestionIndex + 1) +
                  " of " +
                  recapQuestions.length +
                  ")"
                : "Topic " +
                  (topicIndex + 1) +
                  " of " +
                  topics.length +
                  ": " +
                  currentTopic.title}
          </Text>
        </View>

        {stage === "topic_learn" && (
          <View style={styles.contentCard}>
            <Text style={styles.storyText}>{currentTopic.story}</Text>

            <View style={styles.conceptBox}>
              <Text style={styles.conceptBoxHeader}>
                Core Pedagogical Guide
              </Text>
              <Text style={styles.conceptBoxBody}>
                {currentTopic.howItWorks}
              </Text>
            </View>

            <View style={styles.visualDemoBox}>
              <Text style={styles.visualDemoTag}>
                👀 Visual Classroom Demonstration
              </Text>
              <Text style={styles.visualDemoText}>
                {currentTopic.visualIllustration}
              </Text>
            </View>

            <View style={styles.demonstrationBox}>
              <Text style={styles.demoTag}>Key Worked Example</Text>
              <Text style={styles.demoText}>{currentTopic.demonstration}</Text>
            </View>

            <Pressable style={styles.actionButton} onPress={handleNextAction}>
              <Text style={styles.actionButtonText}>
                Take Topic Checkpoint 🎯
              </Text>
            </Pressable>
          </View>
        )}

        {(stage === "topic_quiz" || stage === "recap_quiz") && activeQuiz && (
          <View style={styles.contentCard}>
            <View style={styles.quizHeaderRow}>
              <Text style={styles.quizHeaderBadge}>
                {stage === "recap_quiz"
                  ? "RECAP QUESTION " +
                    (recapQuestionIndex + 1) +
                    " / " +
                    recapQuestions.length
                  : "CHECKPOINT " +
                    (topicQuestionIndex + 1) +
                    " / " +
                    currentTopic.questions.length}
              </Text>
              <Text style={styles.quizRewardBadge}>
                +{stage === "recap_quiz" ? 10 : 15} XP
              </Text>
            </View>

            <Text style={styles.questionPrompt}>{activeQuiz.question}</Text>

            <View style={styles.optionsList}>
              {activeQuiz.options.map((option, idx) => {
                const isThisSelected = selectedOption === idx;
                let optStyle: any = styles.optionButton;

                if (isAnswered && isThisSelected) {
                  optStyle = styles.optionSelectedNeutral;
                }

                return (
                  <Pressable
                    key={idx}
                    style={optStyle}
                    onPress={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                  >
                    <View style={styles.optionNumberCircle}>
                      <Text style={styles.optionNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>

            {isAnswered && (
              <View style={styles.successBanner}>
                <Text style={styles.feedbackTitle}>📌 Answer Recorded!</Text>
                <Text style={styles.feedbackSubtitle}>
                  {activeQuiz.explanation}
                </Text>
                <Pressable style={styles.nextButton} onPress={handleNextAction}>
                  <Text style={styles.nextButtonText}>Next Question ➔</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}

        {stage === "summary" && (
          <View style={styles.contentCard}>
            <Text style={styles.summaryTitle}>🎉 Mission Complete!</Text>
            <Text style={styles.summarySubtitle}>
              You explored all topics and conquered the final recap quiz for{" "}
              {lesson.title}!
            </Text>

            <View style={styles.statsCard}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total XP Earned:</Text>
                <Text style={styles.statValue}>⚡ {totalXpEarned} XP</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Mistakes Made:</Text>
                <Text style={styles.statValue}>{mistakesCount}</Text>
              </View>
            </View>

            {mistakesCount === 0 ? (
              <View style={styles.bonusBanner}>
                <Text style={styles.bonusIcon}>👑</Text>
                <Text style={styles.bonusTitle}>FLAWLESS EXPLORER BONUS!</Text>
                <Text style={styles.bonusDesc}>
                  You solved every question and recap without making a single
                  mistake! (+50 XP Bonus awarded!)
                </Text>
              </View>
            ) : (
              <View style={styles.encouragementBanner}>
                <Text style={styles.encouragementText}>
                  Great perseverance! You worked through all the challenges and
                  mastered this lesson.
                </Text>
              </View>
            )}

            <Pressable
              style={styles.finishMissionBtn}
              onPress={() => {
                const isPerfect = mistakesCount === 0;
                const isScience =
                  subject.title.toLowerCase().includes("science") ||
                  ["matter", "living", "force", "earth"].some((s) =>
                    subject.title.toLowerCase().includes(s),
                  );

                const quizTimeSecs = quizStartTimeRef.current
                  ? (Date.now() - quizStartTimeRef.current) / 1000
                  : 999;
                const isSpeedy = quizTimeSecs < 45;

                onComplete(
                  totalXpEarned,
                  isPerfect,
                  isSpeedy && !isScience,
                  isSpeedy && isScience,
                );
              }}
            >
              <Text style={styles.finishMissionBtnText}>
                Complete Mission & Return 🚀
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>⏸️</Text>
            <Text style={styles.modalTitle}>Pause this mission?</Text>
            <Text style={styles.modalBody}>
              Your progress and earned XP will be saved. You can jump right back
              in where you left off!
            </Text>
            <View style={styles.modalButtonStack}>
              <Pressable
                style={styles.modalPrimaryBtn}
                onPress={() => setShowExitModal(false)}
              >
                <Text style={styles.modalPrimaryText}>Keep Learning</Text>
              </Pressable>
              <Pressable
                style={styles.modalSecondaryBtn}
                onPress={() => {
                  setShowExitModal(false);
                  if (onBack) onBack();
                }}
              >
                <Text style={styles.modalSecondaryText}>
                  Save & Exit to Courses
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showResumeModal}
        transparent
        animationType="fade"
        onRequestClose={handleRestart}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalIcon}>🚀</Text>
            <Text style={styles.modalTitle}>Welcome Back, Explorer!</Text>
            <Text style={styles.modalBody}>
              You have saved progress on this mission. Would you like to resume
              or start fresh?
            </Text>
            <View style={styles.modalButtonStack}>
              <Pressable style={styles.modalPrimaryBtn} onPress={handleResume}>
                <Text style={styles.modalPrimaryText}>Continue Mission 🎯</Text>
              </Pressable>
              <Pressable
                style={styles.modalSecondaryBtn}
                onPress={handleRestart}
              >
                <Text style={styles.modalSecondaryText}>
                  Restart from Beginning ↺
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1d204a" },
  container: { padding: 18, paddingBottom: 40 },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  backTouch: { paddingVertical: 6, paddingHorizontal: 4 },
  backLabel: { color: "#df91f4", fontSize: 16, fontWeight: "900" },
  xpBadge: {
    backgroundColor: "#202c6b",
    borderColor: "#4d58cc",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  xpBadgeText: { color: "#ffda61", fontSize: 13, fontWeight: "900" },

  progressWrapper: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  progressTrackWrapper: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    paddingVertical: 10,
  },
  progressTrack: {
    height: 14,
    backgroundColor: "#162244",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#293e75",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#22c55e",
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",
  },
  rocketContainer: {
    position: "absolute",
    marginLeft: -14,
    zIndex: 10,
  },
  rocketIcon: {
    fontSize: 22,
  },
  moonContainer: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  moonIcon: {
    fontSize: 24,
  },

  shimmerEffect: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    transform: [{ skewX: "-20deg" }],
  },
  sparkleHead: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: "#a7f3d0",
    shadowColor: "#34d399",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 3,
  },
  heroCard: {
    backgroundColor: "#16254a",
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  heroCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  heroMascotImage: {
    width: 42,
    height: 42,
  },
  subjectPill: {
    color: "#a5b8e8",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2,
  },
  lessonTitle: { color: "#ffffff", fontSize: 20, fontWeight: "900" },
  topicSubtitle: {
    color: "#ffd05a",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  contentCard: {
    backgroundColor: "#1f2e60",
    borderColor: "#3d4fa6",
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  storyText: {
    color: "#ffffff",
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "600",
    marginBottom: 16,
  },
  conceptBox: {
    backgroundColor: "#152044",
    borderColor: "#283b75",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  conceptBoxHeader: {
    color: "#8be7ff",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 6,
  },
  conceptBoxBody: {
    color: "#e2eafc",
    fontSize: 14.5,
    lineHeight: 22,
    fontWeight: "500",
  },
  visualDemoBox: {
    backgroundColor: "#143336",
    borderColor: "#22c55e",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  visualDemoTag: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  visualDemoText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
  demonstrationBox: {
    backgroundColor: "#172b5c",
    borderColor: "#395296",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  demoTag: {
    color: "#ffd05a",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  demoText: {
    color: "#ffffff",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
  },
  actionButton: {
    backgroundColor: "#5855ea",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "900" },
  quizHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  quizHeaderBadge: {
    color: "#8be7ff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  quizRewardBadge: {
    backgroundColor: "#172957",
    color: "#ffd05a",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  questionPrompt: {
    color: "#ffffff",
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "800",
    marginBottom: 16,
  },
  optionsList: { gap: 10, marginBottom: 14 },
  optionButton: {
    backgroundColor: "#293c78",
    borderColor: "#4a5ebd",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  optionSelectedNeutral: {
    backgroundColor: "#3b529c",
    borderColor: "#8be7ff",
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  optionNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  optionNumberText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  optionText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
    flex: 1,
  },
  successBanner: {
    backgroundColor: "#17254a",
    borderColor: "#8be7ff",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  feedbackTitle: {
    color: "#8be7ff",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  feedbackSubtitle: {
    color: "#e2eafc",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  nextButton: {
    backgroundColor: "#5855ea",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  nextButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  summaryTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  summarySubtitle: {
    color: "#b0c1e4",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  statsCard: {
    backgroundColor: "#16254a",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { color: "#a5b8e8", fontSize: 13, fontWeight: "700" },
  statValue: { color: "#ffffff", fontSize: 15, fontWeight: "900" },
  bonusBanner: {
    backgroundColor: "#2e2509",
    borderColor: "#eab308",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 18,
  },
  bonusIcon: { fontSize: 28, marginBottom: 4 },
  bonusTitle: {
    color: "#fde047",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bonusDesc: {
    color: "#fef08a",
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  encouragementBanner: {
    backgroundColor: "#17264a",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  encouragementText: {
    color: "#a4b7dd",
    fontSize: 12.5,
    textAlign: "center",
    lineHeight: 18,
  },
  finishMissionBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  finishMissionBtnText: { color: "#052e16", fontSize: 15, fontWeight: "900" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(4, 10, 28, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#16254a",
    borderColor: "#37508a",
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    width: "100%",
    maxWidth: 360,
  },
  modalIcon: { fontSize: 36, marginBottom: 8 },
  modalTitle: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  modalBody: {
    color: "#b0c1e4",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 18,
  },
  modalButtonStack: { width: "100%", gap: 10 },
  modalPrimaryBtn: {
    backgroundColor: "#5855ea",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalPrimaryText: { color: "#ffffff", fontSize: 14, fontWeight: "900" },
  modalSecondaryBtn: {
    backgroundColor: "#223561",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalSecondaryText: { color: "#b9ccf2", fontSize: 14, fontWeight: "700" },
});
