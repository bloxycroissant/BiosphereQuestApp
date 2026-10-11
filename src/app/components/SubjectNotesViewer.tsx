import { GradientSafeAreaView as SafeAreaView } from "@/components/gradient-safe-area";
import { useAudioPlayer } from "expo-audio";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { type Subject } from "./curriculum";

const pageTurnSoundFile = require("../../../assets/BiosphereQuestSoundEffectsandMusic/Page Turn.mp3");
const stellaMascotImage = require("../../../assets/BiosphereQuestAssets/Stella (Biosphere Quest Mascot).png");

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

interface BookmarkOption {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const BOOKMARK_DESIGNS: BookmarkOption[] = [
  { id: "ribbon", name: "Classic Ribbon", icon: "🔖", color: "#FF5252" },
  { id: "star", name: "Golden Star", icon: "⭐", color: "#FFD700" },
  { id: "badge", name: "Explorer Badge", icon: "🛡️", color: "#4879E7" },
  { id: "emerald", name: "Emerald Tag", icon: "💎", color: "#2ECC71" },
];

const HIGHLIGHTER_PALETTE = [
  { id: "yellow", color: "rgba(255, 255, 186, 0.85)", name: "Butter Yellow" },
  { id: "pink", color: "rgba(255, 209, 220, 0.85)", name: "Soft Pink" },
  { id: "peach", color: "rgba(255, 223, 186, 0.85)", name: "Pastel Peach" },
  { id: "green", color: "rgba(186, 255, 201, 0.85)", name: "Mint Green" },
  { id: "blue", color: "rgba(186, 225, 255, 0.85)", name: "Sky Blue" },
  { id: "lavender", color: "rgba(232, 170, 255, 0.85)", name: "Lavender" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getLessonVisualData = (
  lessonTitle: string,
  isScience: boolean,
): LessonVisualData => {
  const title = (lessonTitle || "").toLowerCase();
  let steps: LessonVisualStep[];

  if (isScience) {
    if (/plant|seed|flower|photosynth|reproduction/.test(title)) {
      steps = [
        {
          icon: "🌱",
          label: "Plant Germination",
          detail: "Start with a healthy seed or young plant embedded in fertile soil.",
        },
        {
          icon: "☀️",
          label: "Resource Absorption",
          detail: "Provide plenty of sunlight, clean water, and rich organic minerals.",
        },
        {
          icon: "🌼",
          label: "Full Maturity",
          detail: "Watch as it blossoms into a mature, adult organism capable of reproduction!",
        },
      ];
    } else if (/life cycle|metamorph|animal/.test(title)) {
      steps = [
        {
          icon: "🥚",
          label: "Initial Stage",
          detail: "Life begins inside a protective egg membrane or as a newborn juvenile.",
        },
        {
          icon: "🐛",
          label: "Developmental Phase",
          detail: "The animal feeds continuously, grows rapidly, and undergoes structural change.",
        },
        {
          icon: "🦋",
          label: "Adult Stage",
          detail: "The organism reaches full biological maturity and passes on genetic traits.",
        },
      ];
    } else if (/matter|solid|liquid|gas|mixture|melting/.test(title)) {
      steps = [
        {
          icon: "🧊",
          label: "Solid State",
          detail: "Molecules remain tightly packed together, holding a fixed shape and volume.",
        },
        {
          icon: "💧",
          label: "Liquid State",
          detail: "Thermal energy loosens molecular bonds, allowing fluid movement and flow.",
        },
        {
          icon: "☁️",
          label: "Gas State",
          detail: "High temperature drives particles apart, expanding to fill any container space.",
        },
      ];
    } else {
      steps = [
        {
          icon: "🔎",
          label: "Observation",
          detail: "Examine key physical phenomena and record empirical field data.",
        },
        {
          icon: "📝",
          label: "Documentation",
          detail: "Log all findings carefully inside a structured research framework.",
        },
        {
          icon: "💡",
          label: "Conclusion",
          detail: "Formulate a sound scientific rule supported by verifiable evidence.",
        },
      ];
    }
  } else {
    steps = [
      {
        icon: "📘",
        label: "Rule Identification",
        detail: "Read and analyze the core mathematical rule or algebraic principle.",
      },
      {
        icon: "🧩",
        label: "Variable Alignment",
        detail: "Substitute given numerical values into the target equation correctly.",
      },
      {
        icon: "✅",
        label: "Verification",
        detail: "Execute steps systematically and double-check units and calculations.",
      },
    ];
  }

  return {
    title: "Visual Concept Map",
    summary: isScience
      ? "Observe key physical components, trace fundamental interactions, and conclude with verified empirical evidence."
      : "Identify given variables, apply mathematical formulas step-by-step, and verify your results against core rules.",
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
      ? "Look closely at familiar objects or living things in your environment. Describe what you can observe with your five senses, compare what is alike or different, and draw a simple scientific picture when it helps clarify your thoughts."
      : "Use physical counters, visual drawings, real objects, or a simple number line. Always state what each number or shape stands for out loud before selecting your final answer.";
  }
  if (gradeLevel <= 4) {
    return isScience
      ? "Record your observations carefully in an organized notebook. Compare experimental results across multiple trials, and explain clearly how physical evidence directly supports your scientific conclusions."
      : "Select an appropriate mathematical model or strategy. Carefully write down every calculation step, label your units, and check that your final solution makes logical sense.";
  }
  return isScience
    ? "Connect observational evidence directly to broader scientific theories. Distinguish carefully between direct physical observation and logical inference, justifying every conclusion with empirical data."
    : "Connect symbolic equations, geometric models, and numerical relationships. Provide complete step-by-step proofs, and justify why your computed result fits the constraints of the original problem statement.";
};

const buildLessonExpansion = (
  gradeLevel: number,
  subjectTitle: string,
  lessonTitle: string,
  lessonMeaning?: string,
  lessonExample?: string,
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
  const keyword = lessonTitle.toLowerCase();
  const gradeHint = getGradeStudyGuidance(gradeLevel, isScience);

  const meaningText =
    lessonMeaning ||
    `Study the foundational laws and structural mechanics governing ${keyword}.`;
  const exampleText =
    lessonExample ||
    `Examine practical everyday phenomena to see how ${keyword} works in real-world environments!`;

  return {
    isScience,
    definition: meaningText,
    explanation: isScience
      ? `In-Depth Scientific Analysis of ${keyword}:\n\n1. Structural Properties & Observations: When examining ${keyword}, scientists begin by documenting physical attributes, thermal changes, and environmental interactions. Every physical system operates according to fixed scientific laws that govern energy conservation, molecular behavior, and system equilibrium.\n\n2. Key Mechanisms & Relationships: Observing ${keyword} requires analyzing cause-and-effect patterns. For instance, changes in temperature, pressure, forces, or biological resources directly alter how the system behaves. Identifying these variables allows us to predict future outcomes accurately.\n\n3. Empirical Rules to Remember: Always distinguish between directly observable traits (such as color, mass, or velocity) and inferred properties (such as chemical composition or potential energy). Verifiable scientific conclusions are built on reproducible, empirical evidence.\n\nAcademic Guidance Note:\n${gradeHint}`
      : `Comprehensive Mathematical Explanation of ${keyword}:\n\n1. Foundational Rules & Principles: The mathematical framework of ${keyword} relies on fundamental axioms, formulas, and operational definitions. Understanding this topic requires recognizing how numerical quantities interact within structured equations.\n\n2. Systematic Problem Approach: When solving problems involving ${keyword}, always follow a clear three-step process:\n- Step A: Carefully identify all given information and denote unknown target variables.\n- Step B: Select the appropriate formula or operational rule that relates the known values to the target unknown.\n- Step C: Perform arithmetic calculations systematically, ensuring proper order of operations and maintaining exact units of measure.\n\n3. Proof and Validation Protocols: Never accept a calculated result without verification. Substitute your calculated value back into the original expression to verify equality and ensure that your result is logically reasonable.\n\nAcademic Guidance Note:\n${gradeHint}`,
    example: exampleText,
    exampleExplanation: isScience
      ? `Detailed Breakdown of the Example:\n\nAnalyze the scenario provided above regarding ${keyword}. Observe how each physical component operates in harmony with scientific principles. The key evidence lies in noticing specific physical interactions and identifying how energy or mass transfers between states.\n\nCore Principles Illustrated:\n• Observation: Identify the initial conditions and physical properties presented in the real-world setup.\n• Analysis: Connect these initial conditions directly to the definition: "${meaningText}".\n• Conclusion: Synthesize these findings to understand how natural systems remain balanced and governed by natural laws.`
      : `Detailed Breakdown of the Example:\n\nExamine the mathematical context established in the example above. Every number, symbol, and geometric representation corresponds to a precise quantitative relationship. By decomposing the example into discrete operational steps, we can easily see how the abstract rule translates into a practical solution.\n\nCore Principles Illustrated:\n• Setup: Match the numbers from the example with their corresponding operational positions.\n• Calculation: Execute each operation step-by-step while adhering strictly to algebraic rules.\n• Verification: Re-check that your computed result satisfies the overarching rule: "${meaningText}".`,
    computation: isScience
      ? `Step-by-Step Practical Demonstration:\n\n1. Observation Phase: Examine the example details carefully: "${exampleText}". Identify the primary objects, forces, or biological entities involved in the process.\n\n2. Evidence Identification: Locate key details that demonstrate scientific principles in action. Note any changes in energy, state of matter, or physical structure.\n\n3. Analytical Explanation: Connect the empirical evidence directly back to the scientific laws governing ${keyword}. Formulate a concise summary explaining why the outcome occurred based on verifiable physical properties.`
      : `Step-by-Step Computational Procedure:\n\n1. Read & Deconstruct: Review the problem statement: "${exampleText}". Extract all given quantities, operational conditions, and required target units.\n\n2. Operational Setup: Arrange the numbers in logical order according to the standard formula for ${keyword}. Ensure all measurement units are uniform prior to calculation.\n\n3. Execute Calculation: Perform the required arithmetic operations step-by-step. Work cleanly from left to right while respecting formal order of operations.\n\n4. Logical Check: Verify that the computed numerical output falls within reasonable physical or numerical bounds.`,
    practice: `Comprehensive Activity Exercise:\n\nIn your own words, explain the core meaning of ${keyword}. Next, construct a complete original example that illustrates this concept in action.\n\nExercise Tasks:\n1. Write out the primary definition using clear, formal academic language.\n2. Detail a practical scenario where this concept applies.\n3. Write a short explanation demonstrating step-by-step how your scenario proves the rule!`,
  };
};

export default function SubjectNotesViewer({
  subject,
  gradeLevel,
  onClose,
}: SubjectNotesViewerProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedHighlighter, setSelectedHighlighter] = useState<string | null>(null);
  const [wordHighlights, setWordHighlights] = useState<Record<string, string>>({});
  const [bookmarkedPages, setBookmarkedPages] = useState<Record<number, BookmarkOption>>({});
  const [currentBookmarkDesign, setCurrentBookmarkDesign] = useState<BookmarkOption>(BOOKMARK_DESIGNS[0]);

  // Animation System Refs
  const flipAnim = useRef(new Animated.Value(0)).current;
  const bookmarkDropAnim = useRef(new Animated.Value(-80)).current;
  const bookmarkScaleAnim = useRef(new Animated.Value(0.2)).current;
  const bookmarkBtnScale = useRef(new Animated.Value(1)).current;
  const closeAnim = useRef(new Animated.Value(0)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const mascotFloatAnim = useRef(new Animated.Value(0)).current;

  const swatchAnimValues = useRef<Record<string, Animated.Value>>({}).current;
  const stickyTabAnimValues = useRef<Record<number, Animated.Value>>({}).current;

  const pageTurnAudio = useAudioPlayer(pageTurnSoundFile);

  const selectedHighlighterRef = useRef<string | null>(null);
  selectedHighlighterRef.current = selectedHighlighter;

  const currentPageRef = useRef<number>(currentPage);
  currentPageRef.current = currentPage;

  const isChildTheme = gradeLevel <= 3;

  const theme = {
    pageBg: isChildTheme ? "#fffdf0" : "#f8f9fa",
    dividerColor: isChildTheme ? "#ffd166" : "#cbd5e1",
    ringColor: isChildTheme ? "#ff7043" : "#cbd5e1",
    holeBorder: isChildTheme ? "#f4a261" : "#94a3b8",
    borderRadius: isChildTheme ? 18 : 6,
    titleSize: isChildTheme ? 26 : 22,
    bodySize: isChildTheme ? 16 : 14,
    bodyLineHeight: isChildTheme ? 26 : 22,
  };

  const CARTOON_CHARACTERS = [
    { avatar: "🦉", name: "Ollie the Owl", tip: "Great reading! Swipe or tap to keep going!", isStella: false },
    { avatar: "🦊", name: "Felix the Fox", tip: "You're doing super awesome!", isStella: false },
    { avatar: "🐼", name: "Pippin Panda", tip: "Spot any fun ideas on this page?", isStella: false },
    { avatar: "", name: "Stella (Biosphere Quest Mascot)", tip: "Keep exploring, cosmic learner!", isStella: true },
  ];

  const LAB_STAMPS = [
    { icon: "🔬", title: "LAB PRO-TIP", tip: "Analyze the core evidence before forming your hypothesis." },
    { icon: "💡", title: "KEY INSIGHT", tip: "Notice how this principle connects to real-world models." },
    { icon: "📊", title: "FIELD NOTE", tip: "Verify all units and check your steps for consistency." },
  ];

  const activeCharacter = CARTOON_CHARACTERS[currentPage % CARTOON_CHARACTERS.length];
  const activeLabStamp = LAB_STAMPS[currentPage % LAB_STAMPS.length];

  // Continuous Floating Mascot Idle Animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(mascotFloatAnim, {
          toValue: -6,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(mascotFloatAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, []);

  // Animated Screen Close Transition when going back to courses
  const handleCloseViewer = () => {
    Animated.timing(closeAnim, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const chapterList = useMemo(() => {
    const list = [];
    const lessons = subject.lessons || [];

    for (let i = 0; i < 7; i++) {
      if (i < lessons.length) {
        list.push({
          title: lessons[i].title,
          meaning: lessons[i].meaning,
          example: lessons[i].example,
        });
      } else {
        const fallbackTitles = [
          "Practical Synthesis & Real-World Application",
          "Advanced System Analysis & Guided Practice",
          "Comprehensive Field Exercise & Mastery Challenge",
        ];
        const titleIndex = i - lessons.length;
        list.push({
          title: fallbackTitles[titleIndex % fallbackTitles.length],
          meaning: `Apply core subject rules from earlier chapters to solve complex problems in ${subject.title}.`,
          example: `Observe real-world scenarios in ${subject.title} and apply step-by-step reasoning to establish verifiable solutions.`,
        });
      }
    }
    return list;
  }, [subject]);

  const getSwatchAnim = (id: string) => {
    if (!swatchAnimValues[id]) {
      swatchAnimValues[id] = new Animated.Value(1);
    }
    return swatchAnimValues[id];
  };

  const getStickyTabAnim = (pageIdx: number) => {
    if (!stickyTabAnimValues[pageIdx]) {
      stickyTabAnimValues[pageIdx] = new Animated.Value(0);
    }
    return stickyTabAnimValues[pageIdx];
  };

  const handleSelectHighlighter = (color: string | null, swatchId: string) => {
    setSelectedHighlighter(color);
    Animated.sequence([
      Animated.timing(getSwatchAnim(swatchId), {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(getSwatchAnim(swatchId), {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const stickyTabs = useMemo(() => {
    const tabs: Array<{ pageIndex: number; label: string; color: string }> = [];
    const colors = ["#FF5252", "#FF7043", "#FFA726", "#66BB6A", "#26A69A", "#42A5F5", "#AB47BC"];

    chapterList.forEach((_, index) => {
      const startPageIndex = 1 + index * 2;
      tabs.push({
        pageIndex: startPageIndex,
        label: `Ch ${index + 1}`,
        color: colors[index % colors.length],
      });
    });

    return tabs;
  }, [chapterList]);

  const tabCount = stickyTabs.length;
  const isCompressed = tabCount > 6;
  const dynamicTabHeight = isCompressed ? Math.max(18, 160 / tabCount) : 30;
  const dynamicFontSize = isCompressed ? 8 : 10;
  const dynamicArrowSize = isCompressed ? dynamicTabHeight / 2 : 15;

  const applyHighlightKey = (wordKey: string) => {
    const activeColor = selectedHighlighterRef.current;
    setWordHighlights((prev) => {
      if (!activeColor) {
        if (!prev[wordKey]) return prev;
        const copy = { ...prev };
        delete copy[wordKey];
        return copy;
      }
      if (prev[wordKey] === activeColor) return prev;
      return { ...prev, [wordKey]: activeColor };
    });
  };

  const toggleWordHighlight = (wordKey: string) => {
    const activeColor = selectedHighlighterRef.current;
    setWordHighlights((prev) => {
      const copy = { ...prev };
      if (!activeColor) {
        delete copy[wordKey];
      } else if (copy[wordKey] === activeColor) {
        delete copy[wordKey];
      } else {
        copy[wordKey] = activeColor;
      }
      return copy;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) => {
        return !!selectedHighlighterRef.current || Math.abs(gestureState.dx) > 10;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return !!selectedHighlighterRef.current || Math.abs(gestureState.dx) > 15;
      },
      onPanResponderGrant: (evt) => {
        if (selectedHighlighterRef.current) {
          const key = (evt.target as any)?._attributePayload?.["data-word-key"];
          if (key) applyHighlightKey(key);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (selectedHighlighterRef.current) {
          const key = (evt.target as any)?._attributePayload?.["data-word-key"];
          if (key) applyHighlightKey(key);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!selectedHighlighterRef.current) {
          const SWIPE_THRESHOLD = 30;
          if (gestureState.dx < -SWIPE_THRESHOLD) {
            turnPage("next");
          } else if (gestureState.dx > SWIPE_THRESHOLD) {
            turnPage("prev");
          }
        }
      },
    })
  ).current;

  const renderParagraphs = (text: string, prefix: string) => {
    return text.split("\n\n").map((paragraph, pIdx) => {
      const words = paragraph.split(" ");
      return (
        <Text
          key={pIdx}
          style={[
            styles.bodyText,
            { fontSize: theme.bodySize, lineHeight: theme.bodyLineHeight },
            pIdx > 0 && { marginTop: 10 },
          ]}
        >
          {words.map((word, wIdx) => {
            const wordKey = `${currentPage}-${prefix}-${pIdx}-${wIdx}`;
            const highlightColor = wordHighlights[wordKey];

            return (
              <Text
                key={wIdx}
                {...({ "data-word-key": wordKey } as any)}
                onPress={() => toggleWordHighlight(wordKey)}
                style={[
                  styles.clickableWordText,
                  highlightColor
                    ? { backgroundColor: highlightColor, borderRadius: 2 }
                    : null,
                ]}
              >
                {word}{" "}
              </Text>
            );
          })}
        </Text>
      );
    });
  };

  const pages = useMemo(() => {
    const generatedPages = [];

    generatedPages.push(
      <ScrollView
        key="intro"
        style={styles.pageContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { fontSize: theme.titleSize }]}>
          {isChildTheme ? `🌈 ${subject.title} Field Guide` : `📑 ${subject.title} Comprehensive Journal`}
        </Text>
        <Text style={styles.pageSubtitle}>
          Grade {gradeLevel} Explorer's Master Notebook
        </Text>
        <View style={[styles.divider, { backgroundColor: theme.dividerColor }]} />
        <Text style={styles.sectionHeading}>
          {isChildTheme ? "🎈 Welcome Explorer!" : "🔬 Academic Research Notebook"}
        </Text>
        {renderParagraphs(`Welcome to the master field notebook for ${subject.title}! This study guide is meticulously designed to provide complete conceptual clarity across 7 full chapters: rigorous scientific and mathematical definitions, step-by-step worked examples, and interactive activity exercises.`, "intro-1")}
        <Text style={styles.sectionHeading}>📖 Notebook Structural Organization</Text>
        {renderParagraphs("• Chapters 1–4 (Theoretical Foundations): Focus purely on extensive explanations, formal definitions, and deep descriptions of core principles.\n\n• Chapters 5–7 (Practical Applications): Focus on comprehensive real-world worked examples, step-by-step computation models, and guided activity exercises.\n\nHighlighter Tool Usage: Choose a color from the toolbar above to mark important text. Select 'Off' to clear highlights. Use the sticky arrow tabs on the right margin to jump directly across chapters.", "intro-2")}
      </ScrollView>,
    );

    chapterList.forEach((chap, index) => {
      const expansion = buildLessonExpansion(
        gradeLevel,
        subject.title,
        chap.title,
        chap.meaning,
        chap.example,
      );
      const visualData = getLessonVisualData(chap.title, expansion.isScience);
      const isExplanationChapter = index < 4;
      const includeVisualMap = index < 2;

      if (isExplanationChapter) {
        generatedPages.push(
          <ScrollView
            key={`chap-${index}-p1`}
            style={styles.pageContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageSubtitle}>Chapter {index + 1} of 7 • Theoretical Foundations (Part 1)</Text>
            <Text style={[styles.pageTitle, { fontSize: theme.titleSize }]}>{chap.title}</Text>
            <View style={[styles.divider, { backgroundColor: theme.dividerColor }]} />
            <Text style={styles.sectionHeading}>📖 Core Axiom & Definition</Text>
            {renderParagraphs(expansion.definition, `c${index}-p1`)}
            <Text style={styles.sectionHeading}>🧠 Comprehensive Theoretical Breakdown</Text>
            {renderParagraphs(expansion.explanation, `c${index}-p2`)}
          </ScrollView>,
        );

        generatedPages.push(
          <ScrollView
            key={`chap-${index}-p2`}
            style={styles.pageContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageSubtitle}>Chapter {index + 1} of 7 • Theoretical Foundations (Part 2)</Text>
            <Text style={[styles.pageTitle, { fontSize: theme.titleSize }]}>
              {includeVisualMap ? "Visual Concept Map" : "Structural Rules & Analysis"}
            </Text>
            <View style={[styles.divider, { backgroundColor: theme.dividerColor }]} />
            
            {includeVisualMap ? (
              <>
                {renderParagraphs(`Examine the flow diagram below to understand the key sequential steps of ${chap.title.toLowerCase()}.`, `c${index}-map-desc`)}
                <LessonVisual data={visualData} />
              </>
            ) : (
              <>
                <Text style={styles.sectionHeading}>🔬 Deep Structural Rules & Mechanics</Text>
                {renderParagraphs(`Mastering ${chap.title.toLowerCase()} requires analyzing how each rule fits into the overarching academic system.\n\n• Axiom 1 (Fundamental Definition): Always start by anchoring your analysis in the primary definition. Identify all core properties and governing rules before attempting complex problems.\n\n• Axiom 2 (System Interactions): Observe how internal variables interact with external influences. Changing one element shifts the equilibrium of the entire mathematical or physical framework.\n\n• Axiom 3 (Verification Protocols): Always cross-examine your observational or computational data against established scientific laws and mathematical proofs. Consistency across multiple test conditions ensures true mastery!`, `c${index}-deep-desc`)}
              </>
            )}
          </ScrollView>,
        );
      } else {
        generatedPages.push(
          <ScrollView
            key={`chap-${index}-p3`}
            style={styles.pageContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageSubtitle}>Chapter {index + 1} of 7 • Practical Application (Part 1)</Text>
            <Text style={[styles.pageTitle, { fontSize: theme.titleSize }]}>{chap.title}</Text>
            <View style={[styles.divider, { backgroundColor: theme.dividerColor }]} />
            <Text style={styles.sectionHeading}>⭐ Worked Real-World Example</Text>
            {renderParagraphs(expansion.example, `c${index}-ex`)}
            <Text style={styles.sectionHeading}>
              {expansion.isScience ? "🔬 Step-by-Step Empirical Solution" : "🧮 Step-by-Step Computation Model"}
            </Text>
            {renderParagraphs(expansion.computation, `c${index}-comp`)}
          </ScrollView>,
        );

        generatedPages.push(
          <ScrollView
            key={`chap-${index}-p4`}
            style={styles.pageContent}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.pageSubtitle}>Chapter {index + 1} of 7 • Practical Application (Part 2)</Text>
            <Text style={[styles.pageTitle, { fontSize: theme.titleSize }]}>Activity Practice Exercise</Text>
            <View style={[styles.divider, { backgroundColor: theme.dividerColor }]} />
            <Text style={styles.sectionHeading}>🎯 Guided Activity Exercise</Text>
            {renderParagraphs(expansion.practice, `c${index}-prac`)}
            <Text style={styles.sectionHeading}>💡 Analytical Breakdown & Solution Notes</Text>
            {renderParagraphs(expansion.exampleExplanation, `c${index}-why`)}
            <Text style={styles.sectionHeading}>🚀 Explorer's Mission Strategy</Text>
            {renderParagraphs("Apply the foundational rules and theoretical descriptions from Chapters 1–4 to complete this activity exercise. Always check your steps against the definition to verify complete correctness!", `c${index}-tip`)}
          </ScrollView>,
        );
      }
    });

    return generatedPages;
  }, [subject, gradeLevel, chapterList, selectedHighlighter, wordHighlights, currentPage, isChildTheme, theme]);

  const totalPages = pages.length;

  const jumpToPage = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages || newPage === currentPageRef.current) return;

    if (pageTurnAudio) {
      try {
        pageTurnAudio.volume = 0.15;
        pageTurnAudio.seekTo(0);
        pageTurnAudio.play();
      } catch (e) {
        console.log("Audio play error", e);
      }
    }

    const tabAnim = getStickyTabAnim(newPage);
    Animated.sequence([
      Animated.timing(tabAnim, { toValue: -12, duration: 100, useNativeDriver: true }),
      Animated.spring(tabAnim, { toValue: 0, friction: 5, useNativeDriver: true }),
    ]).start();

    if (newPage > currentPageRef.current) {
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

  const turnPage = (direction: "next" | "prev") => {
    const cur = currentPageRef.current;
    const newPage = direction === "next" ? cur + 1 : cur - 1;
    jumpToPage(newPage);
  };

  // Toggle Bookmark logic with interactive state change and bouncing scale animations
  const toggleBookmark = () => {
    Animated.sequence([
      Animated.timing(bookmarkBtnScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(bookmarkBtnScale, { toValue: 1, friction: 3, tension: 120, useNativeDriver: true }),
    ]).start();

    setBookmarkedPages((prev) => {
      const next = { ...prev };
      const isAlreadyBookmarked = !!next[currentPage];

      if (isAlreadyBookmarked) {
        Animated.parallel([
          Animated.timing(bookmarkDropAnim, { toValue: -80, duration: 200, useNativeDriver: true }),
          Animated.timing(bookmarkScaleAnim, { toValue: 0.2, duration: 180, useNativeDriver: true }),
        ]).start(() => {
          delete next[currentPage];
        });
      } else {
        next[currentPage] = currentBookmarkDesign;
        bookmarkDropAnim.setValue(-80);
        bookmarkScaleAnim.setValue(0.2);

        Animated.parallel([
          Animated.spring(bookmarkDropAnim, {
            toValue: 0,
            friction: 5,
            tension: 90,
            useNativeDriver: true,
          }),
          Animated.spring(bookmarkScaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]).start();
      }
      return next;
    });
  };

  const rotateY = flipAnim.interpolate({
    inputRange: [-1, 0],
    outputRange: ["-90deg", "0deg"],
  });

  const activeBookmark = bookmarkedPages[currentPage];

  // Interpolated animation values for smooth screen exit when returning to courses
  const closeTranslateY = closeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });
  const closeScale = closeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.94],
  });
  const closeOpacity = closeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <SafeAreaView style={styles.fullScreenWrapper} edges={["top"]}>
      <Animated.View
        style={[
          styles.containerAnimatedWrapper,
          {
            opacity: closeOpacity,
            transform: [{ translateY: closeTranslateY }, { scale: closeScale }],
          },
        ]}
      >
        {/* Top Header */}
        <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
          <Pressable onPress={handleCloseViewer} style={styles.backBtn}>
            <Text style={styles.backText}> Back to Courses</Text>
          </Pressable>

          <Text
            style={[styles.headerTitle, { color: subject.color }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subject.icon} {subject.title}
          </Text>
        </Animated.View>

        {/* Toolbar for Highlighters and Tag Designs */}
        <View style={styles.toolbarRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
            <Text style={styles.toolbarLabel}>Highlighter:</Text>
            <AnimatedPressable
              style={[
                styles.colorSwatch,
                !selectedHighlighter && styles.swatchSelected,
                { transform: [{ scale: getSwatchAnim("off") }] },
              ]}
              onPress={() => handleSelectHighlighter(null, "off")}
            >
              <Text style={{ fontSize: 9, color: "#fff" }}>Off</Text>
            </AnimatedPressable>
            {HIGHLIGHTER_PALETTE.map((item) => (
              <AnimatedPressable
                key={item.id}
                style={[
                  styles.colorSwatch,
                  { backgroundColor: item.color },
                  selectedHighlighter === item.color && styles.swatchSelected,
                  { transform: [{ scale: getSwatchAnim(item.id) }] },
                ]}
                onPress={() => handleSelectHighlighter(item.color, item.id)}
              />
            ))}

            <View style={styles.toolbarDivider} />

            <Text style={styles.toolbarLabel}>Ribbon Design:</Text>
            {BOOKMARK_DESIGNS.map((design) => (
              <Pressable
                key={design.id}
                style={[
                  styles.designBadge,
                  currentBookmarkDesign.id === design.id && styles.designBadgeSelected,
                ]}
                onPress={() => setCurrentBookmarkDesign(design)}
              >
                <Text style={{ fontSize: 13 }}>{design.icon}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.notebookWrapper}>
          <View
            style={[
              styles.notebookPage,
              {
                backgroundColor: theme.pageBg,
                borderRadius: theme.borderRadius,
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.bindingContainer}>
              {[...Array(18)].map((_, i) => (
                <View key={i} style={styles.bindingGroup}>
                  <View
                    style={[
                      styles.bindingRing,
                      { backgroundColor: theme.ringColor },
                    ]}
                  />
                  <View
                    style={[
                      styles.bindingHole,
                      { borderColor: theme.holeBorder },
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* Hanging Animated Ribbon Bookmark */}
            {activeBookmark && (
              <Animated.View
                style={[
                  styles.bookmarkRibbonLarge,
                  {
                    backgroundColor: activeBookmark.color,
                    transform: [
                      { translateY: bookmarkDropAnim },
                      { scale: bookmarkScaleAnim },
                    ],
                  },
                ]}
              >
                <Text style={styles.bookmarkIconTextLarge}>{activeBookmark.icon}</Text>
              </Animated.View>
            )}

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

              {/* Pagination Footer with Interactive Toggle Button */}
              <View style={[styles.paginationFooter, { borderTopColor: theme.dividerColor }]}>
                <Text style={styles.pageIndicator}>
                  Page {currentPage + 1} of {totalPages}
                </Text>

                {/* Bookmark Action Button with Dynamic Label */}
                <AnimatedPressable
                  onPress={toggleBookmark}
                  style={[
                    styles.bookmarkToggleBtn,
                    activeBookmark ? styles.bookmarkedActiveBtn : styles.unbookmarkedBtn,
                    { transform: [{ scale: bookmarkBtnScale }] },
                  ]}
                >
                  <Text style={styles.bookmarkToggleText}>
                    {activeBookmark
                      ? `${activeBookmark.icon} Bookmarked (Tap to Remove)`
                      : "🔖 Add Bookmark"}
                  </Text>
                </AnimatedPressable>
              </View>
            </Animated.View>

            {/* Character Companion Overlay with Floating Animation */}
            {isChildTheme && (
              <Animated.View
                style={[
                  styles.cartoonHelperCard,
                  { transform: [{ translateY: mascotFloatAnim }] },
                ]}
              >
                {activeCharacter.isStella ? (
                  <Image
                    source={stellaMascotImage}
                    style={styles.stellaMascotIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={styles.cartoonAvatar}>{activeCharacter.avatar}</Text>
                )}
                <View style={styles.cartoonSpeechBubble}>
                  <Text style={styles.cartoonName}>{activeCharacter.name}</Text>
                  <Text style={styles.cartoonTipText}>{activeCharacter.tip}</Text>
                </View>
              </Animated.View>
            )}

            {!isChildTheme && (
              <Animated.View
                style={[
                  styles.labStampCard,
                  { transform: [{ translateY: mascotFloatAnim }] },
                ]}
              >
                <Text style={styles.labStampIcon}>{activeLabStamp.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.labStampTitle}>{activeLabStamp.title}</Text>
                  <Text style={styles.labStampTipText}>{activeLabStamp.tip}</Text>
                </View>
              </Animated.View>
            )}

            <View style={styles.stickyTabsContainer} pointerEvents="box-none">
              <ScrollView
                contentContainerStyle={[
                  styles.stickyTabsScrollContent,
                  isCompressed && { gap: 4 },
                ]}
                showsVerticalScrollIndicator={false}
                pointerEvents="box-none"
              >
                {stickyTabs.map((tab, idx) => {
                  const isActive =
                    currentPage >= tab.pageIndex &&
                    (idx === stickyTabs.length - 1 || currentPage < stickyTabs[idx + 1].pageIndex);
                  const animVal = getStickyTabAnim(tab.pageIndex);

                  return (
                    <AnimatedPressable
                      key={`sticky-${idx}`}
                      style={[
                        styles.stickyArrowFlag,
                        {
                          backgroundColor: tab.color,
                          height: dynamicTabHeight,
                        },
                        isActive && styles.stickyArrowFlagActive,
                        { transform: [{ translateX: animVal }] },
                      ]}
                      onPress={() => jumpToPage(tab.pageIndex)}
                    >
                      <Text
                        style={[styles.stickyFlagText, { fontSize: dynamicFontSize }]}
                        numberOfLines={1}
                      >
                        {tab.label}
                      </Text>
                      <View
                        style={[
                          styles.arrowTip,
                          {
                            borderLeftColor: tab.color,
                            borderTopWidth: dynamicArrowSize,
                            borderBottomWidth: dynamicArrowSize,
                            borderLeftWidth: Math.round(dynamicArrowSize * 0.8),
                          },
                        ]}
                      />
                    </AnimatedPressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Side tap zones constrained to avoid interfering with footer controls */}
            {!selectedHighlighter && (
              <>
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
              </>
            )}
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreenWrapper: { flex: 1, backgroundColor: "#091426" },
  containerAnimatedWrapper: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    zIndex: 50,
  },
  backBtn: { paddingVertical: 6, paddingRight: 8 },
  backText: { color: "#e582ff", fontWeight: "900", fontSize: 14 },

  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
    paddingRight: 10,
  },

  toolbarRow: {
    backgroundColor: "#0f172a",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    zIndex: 40,
  },
  toolbarScroll: { flexDirection: "row", alignItems: "center", gap: 8 },
  toolbarLabel: { color: "#94a3b8", fontSize: 11, fontWeight: "700" },
  toolbarDivider: { width: 1, height: 16, backgroundColor: "#334155", marginHorizontal: 4 },
  colorSwatch: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#475569",
    justifyContent: "center",
    alignItems: "center",
  },
  swatchSelected: { borderColor: "#ffffff", borderWidth: 2 },
  designBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#1e293b",
  },
  designBadgeSelected: { backgroundColor: "#334155", borderWidth: 1, borderColor: "#e2e8f0" },

  notebookWrapper: { 
    flex: 1, 
    padding: 18, 
    paddingRight: 64, 
    paddingBottom: 40 
  },
  notebookPage: {
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
    marginLeft: 10,
  },
  bindingRing: {
    position: "absolute",
    left: -12,
    width: 24,
    height: 4,
    borderRadius: 2,
    zIndex: 2,
  },

  bookmarkRibbonLarge: {
    position: "absolute",
    top: -6,
    right: 32,
    width: 38,
    height: 64,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 6,
    zIndex: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  bookmarkIconTextLarge: { fontSize: 20 },

  cartoonHelperCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#ffd166",
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 6,
    gap: 6,
    elevation: 2,
  },
  cartoonAvatar: { fontSize: 18 },
  stellaMascotIcon: { width: 22, height: 22 },
  cartoonSpeechBubble: { flex: 1 },
  cartoonName: { fontSize: 10.5, fontWeight: "900", color: "#ff7043" },
  cartoonTipText: { fontSize: 10.5, fontWeight: "600", color: "#475569" },

  labStampCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 6,
    gap: 8,
  },
  labStampIcon: { fontSize: 16 },
  labStampTitle: { fontSize: 10, fontWeight: "900", color: "#334155", letterSpacing: 0.5 },
  labStampTipText: { fontSize: 10.5, fontWeight: "600", color: "#64748b" },

  stickyTabsContainer: {
    position: "absolute",
    right: -52,
    top: 20,
    bottom: 20,
    width: 56,
    zIndex: 25,
  },
  stickyTabsScrollContent: {
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  stickyArrowFlag: {
    width: 64,
    opacity: 0.9,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
    position: "relative",
    elevation: 4,
  },
  stickyArrowFlagActive: {
    opacity: 1.0,
    width: 74,
    right: 10,
    elevation: 8,
  },
  stickyFlagText: {
    color: "#ffffff",
    fontWeight: "900",
    textAlign: "center",
  },
  arrowTip: {
    position: "absolute",
    right: -12,
    top: 0,
    width: 0,
    height: 0,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },

  pageContentWrapper: { flex: 1, justifyContent: "space-between" },
  pageContent: { flex: 1 },
  scrollContentContainer: { paddingBottom: 20 },
  pageTitle: {
    color: "#1e293b",
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
  clickableWordText: {
    zIndex: 15,
  },
  bodyText: {
    color: "#475569",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 2,
    zIndex: 100,
  },
  pageIndicator: { color: "#94a3b8", fontSize: 13, fontWeight: "800" },

  bookmarkToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  unbookmarkedBtn: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#475569",
  },
  bookmarkedActiveBtn: {
    backgroundColor: "#ff4757",
    borderWidth: 1,
    borderColor: "#ff6b81",
  },
  bookmarkToggleText: { color: "#ffffff", fontSize: 12, fontWeight: "900" },

  tapZoneLeft: {
    position: "absolute",
    top: 0,
    bottom: 60,
    left: 0,
    width: "25%",
    zIndex: 10,
  },
  tapZoneRight: {
    position: "absolute",
    top: 0,
    bottom: 60,
    right: 0,
    width: "25%",
    zIndex: 10,
  },
});