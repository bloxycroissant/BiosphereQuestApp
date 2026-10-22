export type Difficulty = "Easy" | "Medium" | "Hard" | "Impossible";

export type OldLesson = {
  title: string;
  meaning: string;
  example: string;
  difficulty: Difficulty;
};
export type OldSubject = {
  title: string;
  icon: string;
  color: string;
  lessons: OldLesson[];
};

export const curriculumStandards = {
  mathematics: {
    primary: "DepEd MATATAG Mathematics Curriculum Guide, Grades 1-6",
    international: "Common Core State Standards for Mathematics",
    strands: [
      "Numbers and Number Sense",
      "Measurement",
      "Geometry",
      "Patterns and Algebra",
      "Statistics and Probability",
    ],
  },
  science: {
    primary: "DepEd MATATAG Science Curriculum Guide, Grades 3-6",
    international: "Next Generation Science Standards",
    strands: [
      "Matter",
      "Living Things and Environment",
      "Force, Motion and Energy",
      "Earth and Space",
    ],
    earlyGradesNote:
      "Grades 1-2 focus on foundational sensory observations, health, and environment; formal standalone Science begins in Grade 3 under the MATATAG curriculum.",
  },
} as const;

type LessonInput = [string, string, string, Difficulty];
const lessonList = (items: LessonInput[]): OldLesson[] =>
  items.map(([title, meaning, example, difficulty]) => ({
    title,
    meaning,
    example,
    difficulty,
  }));
const subject = (
  title: string,
  icon: string,
  color: string,
  items: LessonInput[],
): OldSubject => ({ title, icon, color, lessons: lessonList(items) });
const math = (items: LessonInput[]) => subject("Math", "📐", "#9c63e8", items);
const matter = (items: LessonInput[]) =>
  subject("Matter", "🧊", "#4879e7", items);
const living = (items: LessonInput[]) =>
  subject("Living Things & Environment", "🌱", "#4ea85f", items);
const force = (items: LessonInput[]) =>
  subject("Force, Motion, & Energy", "⚡", "#dc8a32", items);
const earth = (items: LessonInput[]) =>
  subject("Earth & Space", "🌎", "#318cce", items);

export const notebookCurriculum: Record<number, OldSubject[]> = {
  1: [
    math([
      [
        "Chapter 1: Counting with Visual Objects",
        "Numbers represent quantities up to 100. Visual Practice: Counting actual objects like 🍎 apples, ⭐ stars, and counting fingers 🖐️ to compare more or fewer.",
        "Visual Study: Count 12 calamansi fruits and compare with 8 fruits [🍊🍊🍊🍊🍊🍊🍊🍊🍊🍊🍊🍊] > [🍊🍊🍊🍊🍊🍊🍊🍊].",
        "Easy",
      ],
      [
        "Chapter 2: Shapes and Visual Patterns",
        "2D shapes (circles, triangles, squares, rectangles) have distinct attributes. Pattern Rule: Visual repeating sequences using shapes and colors.",
        "Visual Study: Complete shape pattern sequence [🔴 🟦 🔺 🔴 🟦 🔺].",
        "Easy",
      ],
      [
        "Chapter 3: Addition with Object Sets",
        "Addition joins sets together. Visual Model: Grouping actual counters or fruit pieces to find total sums.",
        "Visual Study: Combine 4 mangos with 3 mangos [🥭🥭🥭🥭] + [🥭🥭🥭] = 7 mangos.",
        "Medium",
      ],
      [
        "Chapter 4: Subtraction by Taking Away",
        "Subtraction takes away objects from a set to find the remaining difference.",
        "Visual Study: Start with 9 bananas [🍌🍌🍌🍌🍌🍌🍌🍌🍌], take away 4 [🍌🍌🍌🍌], leaving 5 bananas.",
        "Medium",
      ],
      [
        "Chapter 5: Counting & Ordinals Practice",
        "Worked Example: Count 12 calamansi fruits and compare with 8 fruits ($12 > 8$). Activity Exercise 1: Identify which set has more items. Exercise 2: Arrange 5, 12, 8, and 20 from least to greatest.",
        "Example: Count 12 calamansi. Exercise: Solve 15 > ?",
        "Easy",
      ],
      [
        "Chapter 6: Pattern & Shapes Workout",
        "Worked Example: Continue repeating tile pattern: Circle, Square, Triangle, Circle, Square, [?]. Activity Exercise 1: Draw the missing 6th shape. Exercise 2: Count sides of a rectangle.",
        "Example: Complete pattern sequence. Exercise: Identify shape attributes.",
        "Easy",
      ],
      [
        "Chapter 7: Addition & Subtraction Lab",
        "Worked Example: Solve $7 + 5 = 12$ using counters. Evaluate $9 - 4 = 5$. Activity Exercise 1: Solve $8 + 6 = ?$. Exercise 2: Solve $14 - 8 = ?$. Exercise 3: Complete word problem on sharing mangos.",
        "Example: $7 + 5 = 12$, $9 - 4 = 5$. Exercise: Solve 10 word problems.",
        "Medium",
      ],
    ]),
    matter([
      [
        "Chapter 1: Physical Attributes",
        "Objects in our surroundings can be described and classified by basic physical attributes such as color, shape, and size.",
        "Concept Study: Learn to observe color, shape, and size parameters.",
        "Easy",
      ],
      [
        "Chapter 2: Texture and Hardness",
        "Objects feel different when touched; surfaces can be rough or smooth, and materials can be soft or hard based on surface composition.",
        "Concept Study: Define tactile traits (rough, smooth, soft, hard).",
        "Easy",
      ],
      [
        "Chapter 3: Sorting Principles",
        "Sorting is the systematic grouping of objects into distinct sets based on one or more shared observable physical properties.",
        "Concept Study: Understand single-attribute and multi-attribute classification rules.",
        "Easy",
      ],
      [
        "Chapter 4: Material Properties",
        "Different objects are made from distinct natural or synthetic materials (wood, plastic, metal, fabric) with unique characteristics.",
        "Concept Study: Identify wood, plastic, glass, and fabric properties.",
        "Medium",
      ],
      [
        "Chapter 5: Attribute Sorting Workshop",
        "Worked Example: Sort classroom materials into big red blocks and small blue counters. Activity Exercise 1: Group 10 objects by color. Exercise 2: Regroup them by size.",
        "Example: Categorize red vs blue blocks. Exercise: Complete sorting matrix.",
        "Easy",
      ],
      [
        "Chapter 6: Texture & Hardness Test",
        "Worked Example: Compare a rough coconut husk with a smooth plastic tray. Activity Exercise 1: Touch 4 items and label as Rough or Smooth. Exercise 2: Rank items by hardness.",
        "Example: Rough husk vs smooth tray. Exercise: Classify 6 classroom materials.",
        "Easy",
      ],
      [
        "Chapter 7: Material Classification Challenge",
        "Worked Example: Group local leaves by size first, then regroup them by color. Activity Exercise 1: Classify 8 household items by material type. Exercise 2: Solve material matching puzzle.",
        "Example: Regrouping leaves. Exercise: Complete material property chart.",
        "Medium",
      ],
    ]),
    living([
      [
        "Chapter 1: The Five Senses",
        "Human sense organs (eyes, ears, nose, tongue, skin) detect environmental stimuli (sight, sound, smell, taste, touch) for perception.",
        "Concept Study: Learn organ-to-sense mappings and protective sensory functions.",
        "Easy",
      ],
      [
        "Chapter 2: Living vs Non-Living",
        "Living things possess key biological traits: growth, self-movement, respiration, and need for food/water. Non-living objects lack these processes.",
        "Concept Study: Compare biological characteristics of living vs non-living things.",
        "Easy",
      ],
      [
        "Chapter 3: Plant Structure",
        "Plants consist of specialized organs: roots (anchorage/water intake), stems (transport), leaves (food production), and flowers (reproduction).",
        "Concept Study: Identify plant anatomy and essential survival needs (sunlight, air, water, soil).",
        "Medium",
      ],
      [
        "Chapter 4: Sensory Protection",
        "Protecting sense organs from extreme light, loud noise, sharp items, and harmful substances maintains healthy organ function.",
        "Concept Study: Review hygiene and safety practices for eyes, ears, and skin.",
        "Medium",
      ],
      [
        "Chapter 5: Sensory Discovery Lab",
        "Worked Example: Use skin to feel warm water and nose to smell sampaguita. Activity Exercise 1: Match 5 sensory inputs to correct organs. Exercise 2: Identify safe vs unsafe sounds.",
        "Example: Smell and touch test. Exercise: Complete sense organ worksheet.",
        "Easy",
      ],
      [
        "Chapter 6: Living Things Classifier",
        "Worked Example: A pet dog is living (grows, eats); a wooden chair is non-living. Activity Exercise 1: Mark 8 items as Living or Non-living. Exercise 2: Explain why a plant is alive.",
        "Example: Dog vs Chair analysis. Exercise: Solve living checklist quiz.",
        "Easy",
      ],
      [
        "Chapter 7: Plant Growth Experiment",
        "Worked Example: Observe how roots absorb water while leaves face sunlight. Activity Exercise 1: Label the 4 main plant parts on a diagram. Exercise 2: Track seed growth in a 5-day chart.",
        "Example: Root water absorption. Exercise: Complete plant needs diagram.",
        "Medium",
      ],
    ]),
    force([
      [
        "Chapter 1: Forces in Motion",
        "A force is a push or pull applied to an object. Forces can cause stationary objects to move, speed up, slow down, or stop.",
        "Concept Study: Define pushes, pulls, and directional force application.",
        "Easy",
      ],
      [
        "Chapter 2: Motion Paths",
        "Objects move along various spatial trajectories: straight, curved, zig-zag, rotational, fast, or slow motion.",
        "Concept Study: Describe motion directions and relative speed.",
        "Easy",
      ],
      [
        "Chapter 3: Light Energy",
        "Light energy illuminates objects enabling vision. Light originates from natural sources (Sun) or artificial sources (lamps) and travels in straight lines.",
        "Concept Study: Differentiate natural and artificial light sources.",
        "Medium",
      ],
      [
        "Chapter 4: Sound Energy",
        "Sound energy is produced by vibrating objects. Sound travels through air/materials as sound waves and varies in pitch and volume.",
        "Concept Study: Learn how vibrations create audible sound waves.",
        "Medium",
      ],
      [
        "Chapter 5: Push and Pull Playground",
        "Worked Example: Push a toy jeepney forward or pull it back with string. Activity Exercise 1: Identify 6 daily actions as Push or Pull. Exercise 2: Predict which push moves a car further.",
        "Example: Toy jeepney movement. Exercise: Complete push/pull action sheet.",
        "Easy",
      ],
      [
        "Chapter 6: Motion Tracking Lab",
        "Worked Example: Roll a marble straight down a ramp, then guide it in a zig-zag line. Activity Exercise 1: Draw 3 different motion paths. Exercise 2: Measure toy car speed.",
        "Example: Marble ramp test. Exercise: Classify straight vs zig-zag movement.",
        "Easy",
      ],
      [
        "Chapter 7: Light & Sound Investigation",
        "Worked Example: Sun provides daylight; fiesta drum vibrates to produce sound. Activity Exercise 1: Categorize 8 light sources. Exercise 2: Create vibrations with a rubber band.",
        "Example: Sun and drum energy. Exercise: Complete light/sound source chart.",
        "Medium",
      ],
    ]),
    earth([
      [
        "Chapter 1: Sky Observations",
        "The sky undergoes regular cyclical changes between day and night due to Earth's rotation, showing the Sun by day and Moon/stars by night.",
        "Concept Study: Observe objects and light differences in day vs night sky.",
        "Easy",
      ],
      [
        "Chapter 2: Weather Dynamics",
        "Weather describes atmospheric conditions at a specific time and place (sunny, rainy, windy, cloudy, stormy).",
        "Concept Study: Define weather terms and daily weather variability.",
        "Easy",
      ],
      [
        "Chapter 3: Environmental Care",
        "Care for immediate surroundings (homes, schools, water bodies) protects living habitats and prevents pollution.",
        "Concept Study: Learn waste segregation and habitat preservation rules.",
        "Medium",
      ],
      [
        "Chapter 4: Seasonal Basics",
        "Weather patterns follow recurring cycles (wet and dry seasons in tropical regions) influencing community activities.",
        "Concept Study: Differentiate sunny dry season traits from rainy wet season traits.",
        "Medium",
      ],
      [
        "Chapter 5: Day & Night Sky Explorer",
        "Worked Example: Draw Sun in daytime sky and Moon with stars in nighttime sky. Activity Exercise 1: Identify 5 daytime activities. Exercise 2: Chart Moon shapes over 3 days.",
        "Example: Day vs night drawing. Exercise: Solve sky observation sheet.",
        "Easy",
      ],
      [
        "Chapter 6: Weather Reporter Lab",
        "Worked Example: Match rainy weather to umbrellas and sunny weather to sun hats. Activity Exercise 1: Log daily weather for 5 days. Exercise 2: Select proper clothing for 4 weather types.",
        "Example: Umbrella vs hat decision. Exercise: Complete weekly weather log.",
        "Easy",
      ],
      [
        "Chapter 7: Eco-Guardian Mission",
        "Worked Example: Segregate food scraps from plastic trash. Activity Exercise 1: Sort 10 trash items into Biodegradable or Recyclable. Exercise 2: Write 3 ways to keep rivers clean.",
        "Example: Waste segregation. Exercise: Complete school cleanup plan.",
        "Medium",
      ],
    ]),
  ],
  2: [
    math([
      [
        "Chapter 1: Place Value with Visual Base-10 Blocks",
        "Place value determines digit values using visual blocks: Flats (Hundreds), Rods (Tens), Units (Ones).",
        "Visual Study: Representing numbers up to 1,000 using tactile base-10 block drawings [🟦][🟩🟩][🟨🟨🟨].",
        "Easy",
      ],
      [
        "Chapter 2: Addition Strategies with Regrouping",
        "Multi-digit addition combines place values with visual carrying steps.",
        "Visual Study: Adding 2-digit numbers using vertical place-value alignment and regrouping markers.",
        "Medium",
      ],
      [
        "Chapter 3: Subtraction with Visual Borrowing",
        "Multi-digit subtraction finds differences by decomposing tens into ones visually.",
        "Visual Study: Subtracting numbers with visual borrowing steps.",
        "Medium",
      ],
      [
        "Chapter 4: Standard Measurement Units",
        "Standard length is measured in meters (m) or centimeters (cm) using visual rulers.",
        "Visual Study: Measuring objects in centimeters starting from the 0 mark.",
        "Medium",
      ],
      [
        "Chapter 5: Place Value Master Class",
        "Worked Example: In 583, digit 8 has value 80 (8 tens). Activity Exercise 1: Write expanded form of 742 ($700 + 40 + 2$). Exercise 2: Identify place value of 9 in 916.",
        "Example: Decompose 583. Exercise: Complete 8 place value problems.",
        "Easy",
      ],
      [
        "Chapter 6: Addition & Subtraction Drill",
        "Worked Example: Calculate $347 + 185 = 532$ by regrouping. Activity Exercise 1: Solve $428 + 275 = ?$. Exercise 2: Solve $652 - 284 = ?$. Exercise 3: Solve 2-step word problem.",
        "Example: $347 + 185 = 532$. Exercise: Complete 10 regrouping equations.",
        "Medium",
      ],
      [
        "Chapter 7: Geometry & Measurement Lab",
        "Worked Example: Measure a notebook using a cm ruler (21 cm). Activity Exercise 1: Measure 5 objects in cm. Exercise 2: Count sides and vertices of 4 geometric shapes.",
        "Example: Notebook ruler test. Exercise: Complete shape & measurement table.",
        "Medium",
      ],
    ]),
    matter([
      [
        "Chapter 1: States of Matter: Solids & Liquids",
        "Solids retain a definite shape and volume. Liquids possess fixed volume but flow to take the shape of their container.",
        "Concept Study: Differentiate shape stability and fluidity in solids vs liquids.",
        "Easy",
      ],
      [
        "Chapter 2: Strength and Flexibility",
        "Materials vary in structural properties: durability (resistance to damage) and flexibility (ability to bend without fracturing).",
        "Concept Study: Learn rigid vs flexible material attributes.",
        "Medium",
      ],
      [
        "Chapter 3: Absorbency",
        "Porous materials absorb and hold liquid inside spaces, whereas non-porous materials repel water.",
        "Concept Study: Understand porous absorption mechanics vs waterproof barriers.",
        "Medium",
      ],
      [
        "Chapter 4: Thermal Melting",
        "Thermal energy transfer increases temperature, causing solid substances to transition into liquid state (Melting point).",
        "Concept Study: Study solid-to-liquid state change driven by heat energy.",
        "Medium",
      ],
      [
        "Chapter 5: Solid & Liquid Sorting Lab",
        "Worked Example: Pouring fruit juice into a tall glass changes its shape but keeps volume. Activity Exercise 1: Classify 8 items as Solid or Liquid. Exercise 2: Container shape test.",
        "Example: Juice container test. Exercise: Complete state properties chart.",
        "Easy",
      ],
      [
        "Chapter 6: Material Flexibility Test",
        "Worked Example: Rubber band stretches easily; bamboo stick is rigid. Activity Exercise 1: Test 5 items for flexibility. Exercise 2: Match 4 items to ideal construction uses.",
        "Example: Rubber vs bamboo. Exercise: Complete material strength matrix.",
        "Medium",
      ],
      [
        "Chapter 7: Absorbency & Melting Challenge",
        "Worked Example: Cotton cloth absorbs water quickly; plastic repels it. Ice melts when heated. Activity Exercise 1: Rank 4 fabrics by absorbency. Exercise 2: Heat melting experiment log.",
        "Example: Cotton vs plastic test. Exercise: Solve absorbency & heat quiz.",
        "Medium",
      ],
    ]),
    living([
      [
        "Chapter 1: Plant Survival Needs",
        "Plants require 4 essential inputs for health and growth: Sunlight (energy), Air ($CO_2$), Water ($H_2O$), and Soil (nutrients).",
        "Concept Study: Detail how each survival element supports plant physiology.",
        "Easy",
      ],
      [
        "Chapter 2: Animal Habitats",
        "Habitats (terrestrial land, aquatic water, arboreal trees) provide organisms with shelter, food, water, and reproductive space.",
        "Concept Study: Map animal adaptations to specific natural habitats.",
        "Medium",
      ],
      [
        "Chapter 3: Animal Classification",
        "Animals are grouped by body coverings (fur, feathers, scales), movement method, and diet (herbivore, carnivore, omnivore).",
        "Concept Study: Classify vertebrates based on physical structures and diets.",
        "Medium",
      ],
      [
        "Chapter 4: Offspring & Inheritance",
        "Animals reproduce so species survive; young animal offspring inherit physical traits that resemble their adult parents.",
        "Concept Study: Observe parent-offspring trait similarities across animal species.",
        "Medium",
      ],
      [
        "Chapter 5: Plant Growth Investigation",
        "Worked Example: Compare a watered plant in sunlight with a dark, dry plant. Activity Exercise 1: List 4 plant needs. Exercise 2: Diagnose why a wilted plant is dying.",
        "Example: Sunlight vs dark plant. Exercise: Complete plant survival sheet.",
        "Easy",
      ],
      [
        "Chapter 6: Habitat Matching Workshop",
        "Worked Example: Bangus lives in water; Philippine eagle lives in forest canopy. Activity Exercise 1: Match 8 animals to correct habitats. Exercise 2: Group animals by diet.",
        "Example: Bangus vs Eagle habitat. Exercise: Complete habitat matching grid.",
        "Medium",
      ],
      [
        "Chapter 7: Life Cycle & Traits Challenge",
        "Worked Example: A chick hatches from an egg and grows to resemble adult hen/rooster. Activity Exercise 1: Order 4 life stages of a chicken. Exercise 2: Match offspring to parents.",
        "Example: Chick growth stages. Exercise: Complete parent-offspring quiz.",
        "Medium",
      ],
    ]),
    force([
      [
        "Chapter 1: Force Magnitude",
        "The distance an object travels depends on force magnitude: a greater force produces greater acceleration and distance.",
        "Concept Study: Analyze relationship between applied force strength and distance moved.",
        "Medium",
      ],
      [
        "Chapter 2: Static Electricity",
        "Friction between distinct materials transfers electrons, creating electrostatic charges that attract lightweight non-conductive objects.",
        "Concept Study: Understand triboelectric charging and electrostatic attraction.",
        "Medium",
      ],
      [
        "Chapter 3: Magnetic Forces",
        "Magnets exert non-contact forces. Rule: Opposite poles attract ($N-S$), like poles repel ($N-N$ or $S-S$). Ferrous metals (iron, steel) are attracted.",
        "Concept Study: Learn magnetic pole interactions and magnetic materials.",
        "Hard",
      ],
      [
        "Chapter 4: Friction Basics",
        "Friction is a contact force opposing relative motion between surfaces. Rough surfaces generate greater friction than smooth surfaces.",
        "Concept Study: Examine surface roughness impact on frictional resistance.",
        "Hard",
      ],
      [
        "Chapter 5: Force & Distance Experiment",
        "Worked Example: Kick a ball gently (short distance), then kick with greater force (long distance). Activity Exercise 1: Compare toy car distance under 3 push strengths.",
        "Example: Ball kick test. Exercise: Log push strength vs distance traveled.",
        "Medium",
      ],
      [
        "Chapter 6: Static Charge Lab",
        "Worked Example: Rub a plastic comb on dry hair to pick up small paper bits. Activity Exercise 1: Test static charge with 3 materials. Exercise 2: Explain charge transfer.",
        "Example: Comb static test. Exercise: Complete static electricity worksheet.",
        "Medium",
      ],
      [
        "Chapter 7: Magnet Field Challenge",
        "Worked Example: Test if a magnet attracts paperclips, wooden sticks, or aluminum. Activity Exercise 1: Classify 10 items as Magnetic or Non-Magnetic. Exercise 2: Predict pole reactions.",
        "Example: Paperclip magnet test. Exercise: Complete magnetic force matrix.",
        "Hard",
      ],
    ]),
    earth([
      [
        "Chapter 1: Landforms & Water Bodies",
        "Earth's lithosphere and hydrosphere consist of landforms (mountains, volcanoes, valleys, plains) and water bodies (rivers, lakes, seas, oceans).",
        "Concept Study: Identify physical characteristics of primary geographical features.",
        "Medium",
      ],
      [
        "Chapter 2: Weather Preparedness",
        "Daily weather dictates human decision-making regarding attire, outdoor safety precautions, and disaster preparedness.",
        "Concept Study: Connect weather forecasts to safety precautions and attire.",
        "Easy",
      ],
      [
        "Chapter 3: Tropical Seasons",
        "Tropical climates exhibit predictable 2-season patterns: Wet Season (high rainfall) and Dry Season (low rainfall, warm temperatures).",
        "Concept Study: Analyze seasonal weather traits in tropical geographical zones.",
        "Hard",
      ],
      [
        "Chapter 4: Natural Resource Care",
        "Soil, water, and forests are essential natural resources requiring conservation to prevent depletion and pollution.",
        "Concept Study: Review sustainable practices for protecting local land and water.",
        "Hard",
      ],
      [
        "Chapter 5: Philippine Geography Lab",
        "Worked Example: Locate Mount Mayon (volcano) and Pasig River on a Philippine map. Activity Exercise 1: Identify 5 landforms on a map. Exercise 2: Categorize freshwater vs saltwater.",
        "Example: Map search Mayon & Pasig. Exercise: Complete land/water identification sheet.",
        "Medium",
      ],
      [
        "Chapter 6: Weather & Safety Workshop",
        "Worked Example: Wear raincoat on typhoon days; light cotton during summer. Activity Exercise 1: Match 4 weather scenarios to safe choices. Exercise 2: Pack emergency bag list.",
        "Example: Raincoat vs cotton choice. Exercise: Complete typhoon safety checklist.",
        "Easy",
      ],
      [
        "Chapter 7: Tropical Season Tracker",
        "Worked Example: Heavy rain occurs frequently during wet season months (June-Nov). Activity Exercise 1: Classify 6 months by season. Exercise 2: Compare wet vs dry activities.",
        "Example: Wet season rainfall pattern. Exercise: Complete seasonal weather grid.",
        "Hard",
      ],
    ]),
  ],
  3: [
    math([
      [
        "Chapter 1: Multiplication Arrays & Equal Groups",
        "Multiplication is repeated addition of equal rows and columns. Visual Array Model: Rows $\\times$ Columns.",
        "Visual Study: 3 rows of 4 stars [⭐⭐⭐⭐ / ⭐⭐⭐⭐ / ⭐⭐⭐⭐] = 3 × 4 = 12 stars ⭐!",
        "Medium",
      ],
      [
        "Chapter 2: Division as Equal Sharing",
        "Division partitions a total set into equal parts. Visual Sharing: Dividing 12 candies equally among 3 friends.",
        "Visual Study: Share 12 items into 3 equal groups [🟡🟡🟡][🟡🟡🟡][🟡🟡🟡][🟡🟡🟡].",
        "Medium",
      ],
      [
        "Chapter 3: Fractions on Number Lines & Shapes",
        "Fractions express equal parts of a unit whole ($a/b$). Visual partition of shapes and number lines between 0 and 1.",
        "Visual Study: Plotting 1/2, 1/4, and 3/4 on a visual strip.",
        "Medium",
      ],
      [
        "Chapter 4: Area & Perimeter Grids",
        "Perimeter is boundary length; area is counting square units inside a shape.",
        "Visual Study: Tiling a 4m × 3m grid to find area and boundary perimeter.",
        "Hard",
      ],
      [
        "Chapter 5: Multiplication & Division Workshop",
        "Worked Example: Multiply $7 \\times 8 = 56$. Divide 56 mangos equally among 8 children ($56 \\div 8 = 7$). Activity Exercise 1: Solve 10 multiplication facts. Exercise 2: Solve 10 division facts.",
        "Example: $7 \\times 8 = 56$, $56 \\div 8 = 7$. Exercise: Complete 15 fact family equations.",
        "Medium",
      ],
      [
        "Chapter 6: Fraction Number Line Lab",
        "Worked Example: Mark 1/2, 2/4, and 3/4 accurately on a number line from 0 to 1. Activity Exercise 1: Plot 1/3, 2/3 on number line. Exercise 2: Compare 2/4 and 3/4 using < or >.",
        "Example: Number line 1/2 and 3/4. Exercise: Complete fraction plotting sheet.",
        "Medium",
      ],
      [
        "Chapter 7: Area & Perimeter Challenge",
        "Worked Example: Square garden with 4m sides: $P = 4(4) = 16\\text{ m}$, $A = 4 \\times 4 = 16\\text{ sq m}$. Activity Exercise 1: Find P and A for $6\\text{m} \\times 3\\text{m}$ room. Exercise 2: Solve perimeter word problem.",
        "Example: Square 4m garden. Exercise: Complete 5 area/perimeter problem sets.",
        "Hard",
      ],
    ]),
    matter([
      [
        "Chapter 1: Three Primary States of Matter",
        "Matter occupies space and has mass. 3 States: Solids (fixed shape & volume), Liquids (variable shape, fixed volume), Gases (variable shape & volume).",
        "Concept Study: Define particle arrangement in solids, liquids, and gases.",
        "Medium",
      ],
      [
        "Chapter 2: Physical Measurement Tools",
        "Physical properties are quantified using standard instruments: Mass (balance scale in g/kg), Liquid Volume (graduated cylinder in mL/L).",
        "Concept Study: Learn standard metric measurement techniques for matter.",
        "Medium",
      ],
      [
        "Chapter 3: Phase Changes",
        "Phase transitions occur via thermal energy transfer: Melting (solid $\\rightarrow$ liquid), Freezing (liquid $\\rightarrow$ solid), Evaporation (liquid $\\rightarrow$ gas), Condensation (gas $\\rightarrow$ liquid).",
        "Concept Study: Map temperature increases/decreases to phase state changes.",
        "Hard",
      ],
      [
        "Chapter 4: Gas Properties",
        "Gases consist of widely spaced particles that move rapidly to expand and fill any closed container, exerting pressure on walls.",
        "Concept Study: Examine gas compressibility, mass, and expansion dynamics.",
        "Hard",
      ],
      [
        "Chapter 5: States Identification Lab",
        "Worked Example: Water exists as ice (solid), water (liquid), and steam (gas). Activity Exercise 1: Classify 10 substances into 3 states. Exercise 2: Describe gas behavior in balloons.",
        "Example: Ice, water, and steam analysis. Exercise: Complete matter state matrix.",
        "Medium",
      ],
      [
        "Chapter 6: Volume & Mass Measurement Workshop",
        "Worked Example: Measure 250 mL liquid in a graduated cylinder and 500 g flour on a scale. Activity Exercise 1: Read 4 cylinder levels. Exercise 2: Compare mass of 3 objects.",
        "Example: Graduated cylinder reading. Exercise: Solve metric measurement quiz.",
        "Medium",
      ],
      [
        "Chapter 7: Phase Change Experiment",
        "Worked Example: Water vapor condenses into droplets on a cold metal lid. Activity Exercise 1: Match 4 scenarios to Melting, Freezing, Evaporation, Condensation. Exercise 2: Phase change diagram.",
        "Example: Cold lid condensation. Exercise: Complete phase transition worksheet.",
        "Hard",
      ],
    ]),
    living([
      [
        "Chapter 1: Sensory System Physiology",
        "Human sense organs contain specialized receptors that detect environmental stimuli and send nervous signals to the brain for interpretation.",
        "Concept Study: Detail neural pathways from sensory organs to brain processing.",
        "Medium",
      ],
      [
        "Chapter 2: Plant & Animal Taxonomy",
        "Organisms are classified by structural features: Flowering vs Non-flowering plants; Vertebrates (with backbone) vs Invertebrates (without backbone).",
        "Concept Study: Master classification criteria for major plant and animal groups.",
        "Medium",
      ],
      [
        "Chapter 3: Metamorphosis & Life Cycles",
        "Animals undergo sequential developmental stages. Complete Metamorphosis: Egg $\\rightarrow$ Larva $\\rightarrow$ Pupa $\\rightarrow$ Adult. Incomplete: Egg $\\rightarrow$ Nymph $\\rightarrow$ Adult.",
        "Concept Study: Contrast complete vs incomplete insect metamorphosis stages.",
        "Hard",
      ],
      [
        "Chapter 4: Ecosystem Basics",
        "Ecosystems consist of biotic living organisms interacting with abiotic non-living components (air, water, soil, sunlight).",
        "Concept Study: Examine biotic and abiotic interactions in local environments.",
        "Hard",
      ],
      [
        "Chapter 5: Sensory System Lab",
        "Worked Example: Retina receives light signals; auditory nerve transmits sound signals. Activity Exercise 1: Trace signal path from ear to brain. Exercise 2: Identify sensory overload causes.",
        "Example: Retina and auditory nerve test. Exercise: Complete nervous system chart.",
        "Medium",
      ],
      [
        "Chapter 6: Taxonomy Sorting Challenge",
        "Worked Example: Classify ferns, orchids, milkfish, and dragonflies into major groups. Activity Exercise 1: Sort 8 species as Vertebrate or Invertebrate. Exercise 2: Flowering plant test.",
        "Example: Plant/Animal classification. Exercise: Complete taxonomic tree.",
        "Medium",
      ],
      [
        "Chapter 7: Life Cycle Mapping Workshop",
        "Worked Example: Mosquito develops through Egg, Larva (wriggler), Pupa, and Adult. Activity Exercise 1: Order frog life cycle stages. Exercise 2: Compare mosquito vs butterfly stages.",
        "Example: Mosquito 4-stage cycle. Exercise: Complete life cycle diagram sheet.",
        "Hard",
      ],
    ]),
    force([
      [
        "Chapter 1: Gravity & Falling Motion",
        "Gravity is a non-contact attractive force exerted by Earth pulling objects toward its center. Acceleration due to gravity pulls objects downward.",
        "Concept Study: Understand gravitational pull on free-falling bodies.",
        "Medium",
      ],
      [
        "Chapter 2: Light Propagation & Transmission",
        "Light travels in straight rays. Materials interact with light as: Transparent (passes all light), Translucent (scatters light), Opaque (blocks light, forms shadows).",
        "Concept Study: Analyze light ray paths through transparent, translucent, and opaque media.",
        "Medium",
      ],
      [
        "Chapter 3: Sound & Heat Energy",
        "Sound is produced by mechanical vibrations moving through matter. Thermal energy (heat) flows spontaneously from higher temperature objects to lower temperature objects.",
        "Concept Study: Examine vibration frequency/pitch and heat conduction pathways.",
        "Hard",
      ],
      [
        "Chapter 4: Simple Force Interactions",
        "Balanced forces produce zero net force (no motion change); unbalanced forces produce net force causing directional acceleration.",
        "Concept Study: Calculate net force from opposing directional forces.",
        "Hard",
      ],
      [
        "Chapter 5: Gravity Investigation",
        "Worked Example: Ripe mango falling from a branch is pulled downward by gravity. Activity Exercise 1: Predict drop times for ball vs feather in air. Exercise 2: Identify gravity directions.",
        "Example: Falling mango observation. Exercise: Complete gravity motion sheet.",
        "Medium",
      ],
      [
        "Chapter 6: Light Transmission Testing",
        "Worked Example: Shine flashlight through clear glass (transparent), wax paper (translucent), cardboard (opaque). Activity Exercise 1: Classify 8 items. Exercise 2: Shadow size test.",
        "Example: Flashlight transmission test. Exercise: Complete light interaction table.",
        "Medium",
      ],
      [
        "Chapter 7: Sound & Thermal Energy Lab",
        "Worked Example: Plucked guitar string vibrates to make sound; heat warms cold spoon in hot soup. Activity Exercise 1: Vibration testing. Exercise 2: Trace heat flow between 2 items.",
        "Example: Guitar vibration & hot spoon. Exercise: Complete sound & heat worksheet.",
        "Hard",
      ],
    ]),
    earth([
      [
        "Chapter 1: Soil Composition & Types",
        "Soil forms from weathered rock and organic matter. 3 Main Types: Sandy (large grains, fast drainage), Clay (tiny particles, high water retention), Loam (balanced, fertile).",
        "Concept Study: Differentiate soil textures, grain sizes, and water retention capacities.",
        "Medium",
      ],
      [
        "Chapter 2: Weather Hazards & Safety",
        "Severe weather (typhoons, heavy rainfall, flash floods) requires monitoring advisories, preparing emergency kits, and executing evacuation plans.",
        "Concept Study: Review weather monitoring signals and emergency safety protocols.",
        "Medium",
      ],
      [
        "Chapter 3: Celestial Motion Patterns",
        "Earth's rotation causes apparent daily motion of Sun, Moon, and stars. The Moon orbits Earth every 29.5 days, displaying changing visible phases.",
        "Concept Study: Map monthly lunar phases and daytime Sun elevation tracks.",
        "Hard",
      ],
      [
        "Chapter 4: Freshwater Resources",
        "Freshwater exists in rivers, lakes, groundwater aquifers, and glaciers, requiring conservation to ensure clean water supplies.",
        "Concept Study: Study natural water storage systems and pollution prevention.",
        "Hard",
      ],
      [
        "Chapter 5: Soil Texture & Drainage Lab",
        "Worked Example: Compare water retention in clay soil vs fertile garden loam. Activity Exercise 1: Test drainage of Sand, Clay, and Loam. Exercise 2: Select ideal soil for plants.",
        "Example: Clay vs loam water test. Exercise: Complete soil properties grid.",
        "Medium",
      ],
      [
        "Chapter 6: Emergency Preparedness Workshop",
        "Worked Example: Secure loose roof sheets and prepare emergency supply bags before a typhoon. Activity Exercise 1: Assemble emergency kit list. Exercise 2: Read warning signals.",
        "Example: Typhoon kit preparation. Exercise: Complete disaster preparedness plan.",
        "Medium",
      ],
      [
        "Chapter 7: Lunar Phase Tracking Challenge",
        "Worked Example: Observe and record visible Moon shapes over a 1-month cycle. Activity Exercise 1: Label 4 primary Moon phases. Exercise 2: Match Moon phase to day count.",
        "Example: Monthly Moon log. Exercise: Complete lunar phase calendar.",
        "Hard",
      ],
    ]),
  ],
  4: [],
  5: [],
  6: [],
};

const expandedMath: Record<number, LessonInput[]> = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
};

const expandedScience: Record<number, LessonInput[]> = {
  1: [],
  2: [],
  3: [],
  4: [],
  5: [],
  6: [],
};

const scienceSubjectByLesson: Record<string, string> = {};
