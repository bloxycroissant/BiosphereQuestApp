import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { useAudioPlayer } from "expo-audio";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { type Lesson, type Subject } from "./curriculum";
import { notebookCurriculum } from "./subjectdata";

const pageTurnSoundFile = require("../../../assets/BiosphereQuestSoundEffectsandMusic/Page Turn.mp3");

interface SubjectNotesViewerProps {
  subject: Subject;
  gradeLevel: number;
  onClose: () => void;
}
interface LessonVisualStep {
  icon: string;
  label: string;
  detail: string;
}
interface LessonVisualData {
  title: string;
  summary: string;
  steps: LessonVisualStep[];
}

const getLessonVisualData = (
  lesson: Lesson,
  isScience: boolean,
): LessonVisualData => {
  const title = lesson.title.toLowerCase();
  let steps: LessonVisualStep[];

  if (isScience) {
    if (/plant|seed|flower|photosynth|reproduction/.test(title)) {
      steps = [
        {
          icon: "🌱",
          label: "Plant",
          detail: "Start with a healthy seed or young plant.",
        },
        {
          icon: "☀️",
          label: "Resources",
          detail: "Provide plenty of sunlight, water, and good soil.",
        },
        {
          icon: "🌼",
          label: "Growth",
          detail: "Watch as it grows into a mature, adult plant!",
        },
      ];
    } else if (/life cycle|metamorph|animal/.test(title)) {
      steps = [
        {
          icon: "🥚",
          label: "Beginning",
          detail: "Life begins as an egg or a newborn.",
        },
        {
          icon: "🐛",
          label: "Change",
          detail: "The animal grows and develops over time.",
        },
        {
          icon: "🦋",
          label: "Adult",
          detail: "It reaches maturity and can reproduce.",
        },
      ];
    } else if (/matter|solid|liquid|gas|mixture|melting/.test(title)) {
      steps = [
        {
          icon: "🧊",
          label: "Solid",
          detail: "Keeps its own shape and volume.",
        },
        {
          icon: "💧",
          label: "Liquid",
          detail: "Flows to take the shape of its container.",
        },
        {
          icon: "☁️",
          label: "Gas",
          detail: "Expands to fill all available space.",
        },
      ];
    } else if (/force|motion|gravity|speed/.test(title)) {
      steps = [
        {
          icon: "✋",
          label: "Force",
          detail: "A push or a pull applied to an object.",
        },
        {
          icon: "➡️",
          label: "Changes",
          detail: "The force changes the object’s speed or direction.",
        },
        {
          icon: "⚽",
          label: "Motion",
          detail: "The object moves based on the force applied.",
        },
      ];
    } else if (/energy|electric|circuit|magnet/.test(title)) {
      steps = [
        {
          icon: "🔋",
          label: "Source",
          detail: "Energy comes from a battery or the sun.",
        },
        {
          icon: "〰️",
          label: "Transfer",
          detail: "Energy flows through wires or the air.",
        },
        {
          icon: "💡",
          label: "Effect",
          detail: "It creates light, heat, or movement.",
        },
      ];
    } else if (
      /earth|space|weather|water|soil|rock|plate|solar|moon|sun/.test(title)
    ) {
      steps = [
        {
          icon: "🌦️",
          label: "Observe",
          detail: "Look at the sky, rocks, or weather outside.",
        },
        {
          icon: "🌍",
          label: "Connect",
          detail: "See how it affects the Earth and living things.",
        },
        {
          icon: "🔎",
          label: "Explain",
          detail: "Describe the natural patterns you see.",
        },
      ];
    } else if (/sense|organ|body|health/.test(title)) {
      steps = [
        {
          icon: "👀",
          label: "Notice",
          detail: "Use your eyes, ears, nose, tongue, or skin.",
        },
        {
          icon: "🧠",
          label: "Process",
          detail: "Your brain understands the signals.",
        },
        {
          icon: "💬",
          label: "Describe",
          detail: "Tell others what you are experiencing.",
        },
      ];
    } else {
      steps = [
        {
          icon: "🔎",
          label: "Observe",
          detail: "Look closely at the scientific details.",
        },
        {
          icon: "📝",
          label: "Record",
          detail: "Write down your evidence and findings.",
        },
        {
          icon: "💡",
          label: "Explain",
          detail: "State why this happens using science.",
        },
      ];
    }
  } else if (/fraction|percent/.test(title)) {
    steps = [
      {
        icon: "🍰",
        label: "Whole",
        detail: "Start with one complete object or group.",
      },
      {
        icon: "✂️",
        label: "Equal parts",
        detail: "Divide it into pieces of the exact same size.",
      },
      {
        icon: "½",
        label: "One part",
        detail: "Select a specific number of those pieces.",
      },
    ];
  } else if (/shape|polygon|angle|geometry|symmetry/.test(title)) {
    steps = [
      {
        icon: "△",
        label: "Sides",
        detail: "Count the straight or curved edges.",
      },
      {
        icon: "◻️",
        label: "Corners",
        detail: "Count the sharp points or angles.",
      },
      {
        icon: "🔍",
        label: "Compare",
        detail: "Match the features to name the shape.",
      },
    ];
  } else if (/graph|data|statistics|probability|pictograph|tally/.test(title)) {
    steps = [
      {
        icon: "📊",
        label: "Collect",
        detail: "Gather numbers or votes from a group.",
      },
      {
        icon: "📈",
        label: "Organize",
        detail: "Put the data into a neat chart or graph.",
      },
      {
        icon: "💡",
        label: "Conclude",
        detail: "Read the chart to find the highest or lowest.",
      },
    ];
  } else if (/time|measurement|area|perimeter|volume|length/.test(title)) {
    steps = [
      {
        icon: "📏",
        label: "Measure",
        detail: "Use a ruler, clock, or formula.",
      },
      {
        icon: "🧮",
        label: "Calculate",
        detail: "Add up the numbers or multiply the sides.",
      },
      {
        icon: "✅",
        label: "Check",
        detail: "Make sure your units (like cm or hours) are correct.",
      },
    ];
  } else if (/multiply|division|equal groups|ratio/.test(title)) {
    steps = [
      {
        icon: "● ●",
        label: "Group 1",
        detail: "Identify the size of the first group.",
      },
      {
        icon: "● ●",
        label: "Group 2",
        detail: "Make sure all groups have the same amount.",
      },
      {
        icon: "🧮",
        label: "Total",
        detail: "Find the total number across all groups.",
      },
    ];
  } else if (/add|subtract|integer|equation|expression|number/.test(title)) {
    steps = [
      {
        icon: "🔢",
        label: "Known",
        detail: "Find the numbers you already have.",
      },
      {
        icon: "➕",
        label: "Relationship",
        detail: "Decide if things are combining or separating.",
      },
      { icon: "❓", label: "Find", detail: "Solve for the missing number." },
    ];
  } else {
    steps = [
      {
        icon: "📘",
        label: "Idea",
        detail: "Read the main math concept carefully.",
      },
      {
        icon: "🧩",
        label: "Connect",
        detail: "Link the concept to the numbers in the problem.",
      },
      {
        icon: "✅",
        label: "Check",
        detail: "Solve it and verify your answer makes sense.",
      },
    ];
  }

  return {
    title: "Visual Lesson Map",
    summary: isScience
      ? "Observe the parts, connect them to the lesson, and explain what the evidence shows."
      : "Notice the parts, show how they relate, and check that your answer fits the lesson.",
    steps,
  };
};

function LessonVisual({ data }: { data: LessonVisualData }) {
  return (
    <View style={styles.lessonVisual}>
      <Text style={styles.lessonVisualTitle}>{data.title}</Text>
      <Text style={styles.lessonVisualSummary}>{data.summary}</Text>
      <View style={styles.lessonVisualSteps}>
        {data.steps.map((step, index) => (
          <View
            key={`${step.label}-${index}`}
            style={styles.lessonVisualStepGroup}
          >
            <View style={styles.lessonVisualStep}>
              <Text style={styles.lessonVisualIcon}>{step.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.lessonVisualLabel}>{step.label}</Text>
                <Text style={styles.lessonVisualDetail}>{step.detail}</Text>
              </View>
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

const getGradeStudyGuidance = (gradeLevel: number, isScience: boolean) => {
  if (gradeLevel <= 2) {
    return isScience
      ? "Look closely at familiar objects or living things. Describe what you can observe, compare what is alike or different, and use a drawing when it helps."
      : "Use counters, drawings, objects, or a number line. Say what each number or shape represents before choosing an answer.";
  }
  if (gradeLevel <= 4) {
    return isScience
      ? "Record observations carefully, compare results, and explain how the evidence supports your conclusion."
      : "Choose a model or strategy, show each step, and check that your units and answer make sense.";
  }
  return isScience
    ? "Connect the evidence to the scientific idea, distinguish observation from inference, and justify your conclusion."
    : "Connect representations and rules, show a complete solution, and justify why the result fits the problem.";
};

const buildLessonExpansion = (
  gradeLevel: number,
  subjectTitle: string,
  lesson: Lesson,
) => {
  const cleanSubject = subjectTitle.toLowerCase();
  const isScience =
    cleanSubject.includes("science") ||
    [
      "matter",
      "living",
      "force",
      "earth",
      "environment",
      "energy",
      "space",
    ].some((s) => cleanSubject.includes(s));
  const keyword = lesson.title.toLowerCase();
  const gradeHint = getGradeStudyGuidance(gradeLevel, isScience);

  const oldSubject = notebookCurriculum[gradeLevel]?.find(
    (s) => s.title === subjectTitle,
  );
  const oldLesson = oldSubject?.lessons.find((l) => l.title === lesson.title);

  const lessonMeaning =
    oldLesson?.meaning ||
    lesson.meaning ||
    "Study the basic principles of this topic.";
  const lessonExample =
    oldLesson?.example ||
    lesson.example ||
    "Look around you to see how this concept works in everyday life!";

  return {
    isScience,
    definition: lessonMeaning,
    explanation: isScience
      ? `Look closely at ${keyword}.\n\n1. What do you notice?\n2. Which detail is evidence?\n3. What does the evidence tell you?\n\nStudy tip:\n${gradeHint}`
      : `Read the question about ${keyword}.\n\n1. What do you know?\n2. What do you need to find?\n3. Choose a model or operation. Show your steps.\n4. Check your answer.\n\nStudy tip:\n${gradeHint}`,
    example: lessonExample,
    exampleExplanation: isScience
      ? `Look at the example. What can you observe? Which detail is evidence?\n\nExplain how it connects to this idea: ${lessonMeaning}`
      : `What do the numbers, objects, or shapes mean?\n\nShow how they connect. Check that your answer fits the question.\n\nMain idea to remember: ${lessonMeaning}`,
    computation: isScience
      ? `1. Observe: ${lessonExample}\n2. Find a detail that supports the lesson idea.\n3. Explain what the evidence shows.`
      : `1. Read: ${lessonExample}\n2. Find the important numbers or shapes.\n3. Show your steps.\n4. Check that your answer fits the question.`,
    practice: `Explain ${keyword} in your own words. Give one example and say how it fits the lesson idea.`,
  };
};

const renderParagraphs = (text: string) => {
  return text.split("\n\n").map((paragraph, index) => (
    <Text key={index} style={[styles.bodyText, index > 0 && { marginTop: 10 }]}>
      {paragraph}
    </Text>
  ));
};

export default function SubjectNotesViewer({
  subject,
  gradeLevel,
  onClose,
}: SubjectNotesViewerProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const pageTurnAudio = useAudioPlayer(pageTurnSoundFile);

  const pages = useMemo(() => {
    const generatedPages = [];

    generatedPages.push(
      <ScrollView
        key="intro"
        style={styles.pageContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>{subject.title} Guide</Text>
        <Text style={styles.pageSubtitle}>
          Grade {gradeLevel} Explorer's Notebook
        </Text>
        <View style={styles.divider} />
        <Text style={styles.sectionHeading}>👋 Welcome Explorer!</Text>
        <Text style={styles.bodyText}>
          This notebook contains all the core definitions, visual maps, and
          practice guides for {subject.title}.
        </Text>
        <Text style={styles.sectionHeading}>📖 How to use this book</Text>
        <Text style={styles.bodyText}>
          Tap the right edge of the page to flip forward, and the left edge to
          flip backward. Take your time and read carefully!
        </Text>
      </ScrollView>,
    );

    subject.lessons.forEach((lesson, index) => {
      const expansion = buildLessonExpansion(gradeLevel, subject.title, lesson);
      const visualData = getLessonVisualData(lesson, expansion.isScience);

      generatedPages.push(
        <ScrollView
          key={`lesson-${index}-p1`}
          style={styles.pageContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageSubtitle}>Chapter {index + 1} • Part 1</Text>
          <Text style={styles.pageTitle}>{lesson.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionHeading}>📖 Concept & Definition</Text>
          {renderParagraphs(expansion.definition)}
          <Text style={styles.sectionHeading}>🧠 How to think about it</Text>
          {renderParagraphs(expansion.explanation)}
        </ScrollView>,
      );

      generatedPages.push(
        <ScrollView
          key={`lesson-${index}-p2`}
          style={styles.pageContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageSubtitle}>Chapter {index + 1} • Part 2</Text>
          <Text style={styles.pageTitle}>Visual Concept Map</Text>
          <View style={styles.divider} />
          <Text style={styles.bodyText}>
            Follow the concept map from top to bottom. Each step shows one part
            of {lesson.title.toLowerCase()}.
          </Text>
          <LessonVisual data={visualData} />
        </ScrollView>,
      );

      generatedPages.push(
        <ScrollView
          key={`lesson-${index}-p3`}
          style={styles.pageContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageSubtitle}>Chapter {index + 1} • Part 3</Text>
          <Text style={styles.pageTitle}>Worked Example</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionHeading}>⭐ Real-World Example</Text>
          <Text style={styles.bodyText}>{expansion.example}</Text>
          <Text style={styles.sectionHeading}>
            {expansion.isScience
              ? "🔬 Observe and Explain"
              : "🧮 Computation Workspace"}
          </Text>
          {renderParagraphs(expansion.computation)}
          <Text style={styles.sectionHeading}>💡 Why this matters</Text>
          {renderParagraphs(expansion.exampleExplanation)}
        </ScrollView>,
      );

      generatedPages.push(
        <ScrollView
          key={`lesson-${index}-p4`}
          style={styles.pageContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageSubtitle}>Chapter {index + 1} • Part 4</Text>
          <Text style={styles.pageTitle}>Practice & Apply</Text>
          <View style={styles.divider} />
          <Text style={styles.sectionHeading}>🎯 Guided Practice</Text>
          <Text style={styles.bodyText}>{expansion.practice}</Text>
          <Text style={styles.sectionHeading}>🚀 Explorer's Mission Tip</Text>
          <Text style={styles.bodyText}>
            Keep this relationship in mind as you try new situations in the
            Arcade. A strong explanation names the idea, points to a useful
            detail, and tells how that detail matches the definition!
          </Text>
        </ScrollView>,
      );
    });

    return generatedPages;
  }, [subject, gradeLevel]);

  const totalPages = pages.length;

  const turnPage = (direction: "next" | "prev") => {
    const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
    if (newPage < 0 || newPage >= totalPages) return;

    if (pageTurnAudio) {
      try {
        pageTurnAudio.volume = 0.15;
        pageTurnAudio.seekTo(0);
        pageTurnAudio.play();
      } catch (e) {
        console.log("Audio play error", e);
      }
    }

    if (direction === "next") {
      Animated.timing(flipAnim, {
        toValue: -1,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCurrentPage(newPage);
        flipAnim.setValue(0);
      });
    } else {
      setCurrentPage(newPage);
      flipAnim.setValue(-1);
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const rotateY = flipAnim.interpolate({
    inputRange: [-1, 0],
    outputRange: ["-90deg", "0deg"],
  });

  return (
    <SafeAreaView style={styles.fullScreenWrapper} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.backBtn}>
          <Text style={styles.backText}> Back to Courses</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: subject.color }]}>
          {subject.icon} {subject.title} Notes
        </Text>
      </View>

      <View style={styles.notebookWrapper}>
        <View style={styles.notebookPage}>
          <View style={styles.bindingContainer}>
            {[...Array(18)].map((_, i) => (
              <View key={i} style={styles.bindingGroup}>
                <View style={styles.bindingRing} />
                <View style={styles.bindingHole} />
              </View>
            ))}
          </View>

          <Animated.View
            style={[
              styles.pageContentWrapper,
              {
                transformOrigin: "left" as any,
                transform: [{ perspective: 1200 }, { rotateY }],
              },
            ]}
          >
            {pages[currentPage]}

            <View style={styles.paginationFooter}>
              <Text style={styles.pageIndicator}>
                Page {currentPage + 1} of {totalPages}
              </Text>
            </View>
          </Animated.View>

          <Pressable
            style={styles.tapZoneLeft}
            onPress={() => turnPage("prev")}
            disabled={currentPage === 0}
          />
          <Pressable
            style={styles.tapZoneRight}
            onPress={() => turnPage("next")}
            disabled={currentPage === totalPages - 1}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreenWrapper: { flex: 1, backgroundColor: "#091426" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backBtn: { paddingVertical: 6, paddingRight: 10 },
  backText: { color: "#e582ff", fontWeight: "900", fontSize: 15 },
  headerTitle: { fontSize: 16, fontWeight: "900" },
  notebookWrapper: { 
    flex: 1, 
    padding: 18, 
    paddingBottom: 40 
  },
  notebookPage: {
    backgroundColor: "#fdf7ea",
    borderRadius: 8,
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
    flex: 1,
    padding: 24,
    paddingLeft: 46,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },

  bindingContainer: {
    position: "absolute",
    left: 8,
    top: 20,
    bottom: 20,
    width: 24,
    justifyContent: "space-between",
    zIndex: 5,
  },
  bindingGroup: { height: 16, flexDirection: "row", alignItems: "center" },
  bindingHole: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#091426",
    borderWidth: 1,
    borderColor: "#b4aca0",
    marginLeft: 10,
  },
  bindingRing: {
    position: "absolute",
    left: -12,
    width: 24,
    height: 4,
    backgroundColor: "#a19d94",
    borderRadius: 2,
    zIndex: 2,
  },

  pageContentWrapper: { flex: 1, justifyContent: "space-between" },
  pageContent: { flex: 1 },
  scrollContentContainer: { paddingBottom: 20 },
  pageTitle: {
    color: "#1e293b",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 2,
  },
  pageSubtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 2,
    backgroundColor: "#e2d8c5",
    marginBottom: 16,
    borderRadius: 1,
  },
  sectionHeading: {
    color: "#334155",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 8,
  },
  bodyText: {
    color: "#475569",
    fontSize: 14.5,
    lineHeight: 24,
    fontWeight: "600",
  },

  lessonVisual: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#b4d3c2",
    backgroundColor: "#f0f8f2",
  },
  lessonVisualTitle: {
    marginBottom: 6,
    color: "#245642",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
  lessonVisualSummary: {
    marginBottom: 16,
    color: "#475569",
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  lessonVisualSteps: { flexDirection: "column", alignItems: "stretch" },
  lessonVisualStepGroup: { alignItems: "stretch" },
  lessonVisualStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cce3d6",
  },
  lessonVisualIcon: { fontSize: 24, textAlign: "center" },
  lessonVisualLabel: { color: "#334155", fontSize: 14, fontWeight: "800" },
  lessonVisualDetail: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  lessonVisualArrow: {
    alignSelf: "center",
    color: "#16806b",
    fontSize: 20,
    fontWeight: "900",
    marginVertical: 6,
  },

  paginationFooter: {
    alignItems: "center",
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#e2d8c5",
  },
  pageIndicator: { color: "#94a3b8", fontSize: 13, fontWeight: "800" },

  tapZoneLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 36,
    width: "25%",
    zIndex: 10,
  },
  tapZoneRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: "25%",
    zIndex: 10,
  },
});