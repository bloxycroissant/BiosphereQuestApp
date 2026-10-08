import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Lesson, Subject } from "./curriculum";

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
): { topics: LessonTopic[]; recapQuestions: QuizQuestion[] } => {
  const isScience =
    subjectTitle.toLowerCase().includes("science") ||
    ["matter", "living", "force", "earth"].some((s) =>
      subjectTitle.toLowerCase().includes(s),
    );

  const t1QuestionCount = Math.floor(Math.random() * 3) + 1;
  const t1Pool = [
    buildQuestion(
      "What is the primary idea behind " + lesson.title + "?",
      lesson.meaning,
      [
        "It is a random guess without any underlying pattern.",
        "It means ignoring evidence and picking whatever looks easy.",
      ],
      "Exactly! That is the core rule of this lesson.",
    ),
    buildQuestion(
      "Why do we study " + lesson.title + "?",
      isScience
        ? "To explain observations and understand natural phenomena."
        : "To calculate amounts accurately and solve quantitative problems.",
      [
        "Only to memorize long words for an exam.",
        "It has no connection to how things actually work.",
      ],
      "Great job! That connects our lesson directly to real life.",
    ),
    buildQuestion(
      "True or False: Understanding the rules helps us predict results.",
      "True, rules give us dependable ways to find answers.",
      [
        "False, things happen by complete chance with no rules.",
        "False, you should never check your work twice.",
      ],
      "Spot on! Knowing the concept gives you predictable results.",
    ),
  ];

  const t2QuestionCount = Math.floor(Math.random() * 3) + 1;
  const t2Pool = [
    buildQuestion(
      "In our example, what evidence or action was shown?",
      lesson.example,
      [
        "Nothing changed or happened in the example.",
        "The example did the exact opposite of the lesson rule.",
      ],
      "Correct! You identified the key details from the demonstration.",
    ),
    buildQuestion(
      "How does this example prove the lesson's main idea?",
      "It shows the concept happening step by step in a real situation.",
      [
        "It does not relate to the lesson at all.",
        "It tells us to ignore what we observe.",
      ],
      "Awesome deduction! Examples prove the theoretical rule.",
    ),
    buildQuestion(
      "What should an explorer do first when working through a problem like this?",
      "Look at what is known and identify the important parts.",
      [
        "Jump immediately to a wild guess without reading.",
        "Skip all the clues and look for a shortcut.",
      ],
      "Smart thinking! Careful observation is always step one.",
    ),
  ];

  const t3QuestionCount = Math.floor(Math.random() * 3) + 1;
  const t3Pool = [
    buildQuestion(
      "How can an explorer use " + lesson.title + " outside of school?",
      isScience
        ? "To notice patterns, care for nature, and explain everyday changes."
        : "To measure, share items fairly, and budget time or supplies.",
      [
        "It is strictly for classroom homework and nowhere else.",
        "It should be forgotten as soon as the test is done.",
      ],
      "That is it! Real knowledge travels with you everywhere.",
    ),
    buildQuestion(
      "When comparing two different problems on this topic, what stays the same?",
      "The underlying rule and logical relationship.",
      [
        "The numbers and words will always be identical.",
        "Nothing stays the same; every problem has random rules.",
      ],
      "Spot on! The numbers or objects change, but the rule remains constant.",
    ),
    buildQuestion(
      "What is the best way to verify that your answer is reasonable?",
      "Re-check the clues to see if the outcome makes logical sense.",
      [
        "Assume the first fast guess is always right.",
        "Stop thinking once an option is selected.",
      ],
      "Well done! Checking your answer confirms your mastery.",
    ),
  ];

  const topics: LessonTopic[] = [
    {
      title: "Foundations & Core Idea",
      story:
        lesson.title +
        " helps explorers understand foundational concepts. " +
        lesson.meaning,
      howItWorks: isScience
        ? "Scientists look for clues, test what happens when variables change, and connect observations to reliable rules."
        : "Mathematicians look at what quantities are given, break larger values into manageable parts, and apply reliable operations.",
      demonstration: lesson.example,
      questions: t1Pool.slice(0, t1QuestionCount),
    },
    {
      title: "Real-World Demonstration",
      story:
        "Learning a rule is great, but seeing it in motion makes it stick in your mind!",
      howItWorks:
        "Watch how the rule behaves when applied to everyday objects, creatures, or numbers:",
      demonstration: lesson.example,
      questions: t2Pool.slice(0, t2QuestionCount),
    },
    {
      title: "Connecting the Dots",
      story:
        "Now that you understand the rule and saw it work, let's explore why this matters in the broader world of " +
        subjectTitle +
        ".",
      howItWorks:
        "Everyday problems become easier when you identify which concepts connect together. Once you master this rule, you can unlock more advanced missions!",
      demonstration:
        "Explorers use this logic every single day to measure, discover, and build.",
      questions: t3Pool.slice(0, t3QuestionCount),
    },
  ];

  const recapPool: QuizQuestion[] = [
    buildQuestion(
      "Mastery Check: What is the primary definition of " + lesson.title + "?",
      lesson.meaning,
      [
        "An unproven hypothesis with no evidence.",
        "A temporary trick that only works sometimes.",
      ],
      "Accurate recall of the core rule!",
    ),
    buildQuestion(
      "Scenario: If a fellow explorer asks what " +
        lesson.title +
        " is about, you say:",
      lesson.meaning,
      [
        "It is too complicated to explain in words.",
        "It is just a bunch of random guesses.",
      ],
      "Clear communication of knowledge!",
    ),
    buildQuestion(
      'Recall the example: "' + lesson.example + '". What concept was that?',
      lesson.title,
      ["A completely unrelated subject.", "An accidental mistake."],
      "Great recognition of worked examples!",
    ),
    buildQuestion(
      "True or False: Paying attention to details leads to more accurate answers.",
      "True, observant learners find better solutions.",
      [
        "False, rushing fast is better than being accurate.",
        "False, details do not matter in learning.",
      ],
      "Observant thinking is key!",
    ),
    buildQuestion(
      "Which of the following is the best example of " + lesson.title + "?",
      lesson.example,
      [
        "Ignoring all given measurements and rules.",
        "Choosing numbers without reading the problem.",
      ],
      "Excellent application skills!",
    ),
    buildQuestion(
      isScience
        ? "In science, what do we call information collected through our senses?"
        : "In math, what do we call breaking numbers into easier parts?",
      isScience ? "Observations and Evidence" : "Decomposition and Strategies",
      ["Pure Guesses", "Distractions"],
      "Mastery of scientific and mathematical vocabulary!",
    ),
    buildQuestion(
      "What should you do if an answer does not seem to make sense?",
      "Review the core rule and check your steps again.",
      [
        "Ignore the error and move forward anyway.",
        "Erase everything and give up on the mission.",
      ],
      "Resilient learners always double-check!",
    ),
    buildQuestion(
      "Why is " +
        lesson.title +
        " considered an essential topic for " +
        subjectTitle +
        "?",
      "It forms the building blocks for more advanced topics.",
      [
        "It is just filler content to make books longer.",
        "It will never be used again in higher grades.",
      ],
      "Foundational understanding achieved!",
    ),
    buildQuestion(
      "When solving challenges, what is the best order to work in?",
      "Read carefully, identify the rule, then solve and verify.",
      [
        "Guess immediately, skip reading, and check nothing.",
        "Give up, pick randomly, and move on.",
      ],
      "A systematic approach guarantees success!",
    ),
    buildQuestion(
      "How do we know a concept is mastered?",
      "When we can explain it simply and use it in a new situation.",
      [
        "Only when we memorize words without understanding.",
        "When we copy an answer without thinking.",
      ],
      "True mastery demonstrated!",
    ),
  ];

  return { topics, recapQuestions: recapPool };
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

  const { topics, recapQuestions } = useMemo(
    () => buildLessonContent(lesson, subject.title),
    [lesson, subject.title],
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
    if (isAnswered && isCorrect) return;
    if (!activeQuiz) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const correct = idx === activeQuiz.correctIndex;
    setIsCorrect(correct);

    if (correct) {
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
    } else {
      setMistakesCount((prev) => prev + 1);
    }
  };

  const handleRetryQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
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

            {/* The Rocket sliding on the bar! */}
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

          {/* The Moon at the finish line! */}
          <View style={styles.moonContainer}>
            <Text style={styles.moonIcon}>🌕</Text>
          </View>
        </Animated.View>

        <View style={[styles.heroCard, { borderColor: subject.color }]}>
          <Text style={styles.subjectPill}>
            {subject.icon} {subject.title}
          </Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
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
              <Text style={styles.conceptBoxHeader}>How It Works</Text>
              <Text style={styles.conceptBoxBody}>
                {currentTopic.howItWorks}
              </Text>
            </View>

            <View style={styles.demonstrationBox}>
              <Text style={styles.demoTag}>Key Demonstration</Text>
              <Text style={styles.demoText}>{currentTopic.demonstration}</Text>
            </View>

            <Pressable style={styles.actionButton} onPress={handleNextAction}>
              <Text style={styles.actionButtonText}>
                Practice This Concept 🎯
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
                  optStyle = isCorrect
                    ? styles.optionCorrect
                    : styles.optionWrong;
                }

                return (
                  <Pressable
                    key={idx}
                    style={optStyle}
                    onPress={() => handleSelectOption(idx)}
                  >
                    <View style={styles.optionNumberCircle}>
                      <Text style={styles.optionNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.optionText}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>

            {isAnswered && isCorrect && (
              <View style={styles.successBanner}>
                <Text style={styles.feedbackTitle}>🌟 Excellent Work!</Text>
                <Text style={styles.feedbackSubtitle}>
                  {activeQuiz.explanation}
                </Text>
                <Pressable style={styles.nextButton} onPress={handleNextAction}>
                  <Text style={styles.nextButtonText}>Continue</Text>
                </Pressable>
              </View>
            )}

            {isAnswered && !isCorrect && (
              <View style={styles.wrongBanner}>
                <Text style={styles.wrongTitle}>Not quite, try again!</Text>
                <Text style={styles.wrongSubtitle}>
                  Review the question carefully. You can retry as many times as
                  you need!
                </Text>
                <Pressable
                  style={styles.retryButton}
                  onPress={handleRetryQuestion}
                >
                  <Text style={styles.retryButtonText}>Try Again ↺</Text>
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
                const isScience = subject.title.toLowerCase().includes("science") || ["matter", "living", "force", "earth"].some((s) => subject.title.toLowerCase().includes(s));
                
                const quizTimeSecs = quizStartTimeRef.current ? (Date.now() - quizStartTimeRef.current) / 1000 : 999;
                const isSpeedy = quizTimeSecs < 45;

                onComplete(totalXpEarned, isPerfect, isSpeedy && !isScience, isSpeedy && isScience);
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
  safeArea: { flex: 1, backgroundColor: "#0b142d" },
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
  subjectPill: {
    color: "#a5b8e8",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 4,
  },
  lessonTitle: { color: "#ffffff", fontSize: 21, fontWeight: "900" },
  topicSubtitle: {
    color: "#ffd05a",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
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
  optionCorrect: {
    backgroundColor: "#144837",
    borderColor: "#34d399",
    borderWidth: 2,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  optionWrong: {
    backgroundColor: "#4c1d2c",
    borderColor: "#f87171",
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
    backgroundColor: "#0d3b2f",
    borderColor: "#34d399",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  feedbackTitle: {
    color: "#4ade80",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  feedbackSubtitle: {
    color: "#e3fcf0",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  nextButton: {
    backgroundColor: "#34d399",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  nextButtonText: { color: "#063024", fontSize: 15, fontWeight: "900" },
  wrongBanner: {
    backgroundColor: "#411422",
    borderColor: "#f87171",
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
  },
  wrongTitle: {
    color: "#f87171",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  wrongSubtitle: { color: "#fed7d7", fontSize: 12, marginBottom: 10 },
  retryButton: {
    backgroundColor: "#f87171",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  retryButtonText: { color: "#ffffff", fontSize: 14, fontWeight: "900" },
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
