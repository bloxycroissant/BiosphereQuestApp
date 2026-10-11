export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Impossible';

export type OldLesson = { title: string; meaning: string; example: string; difficulty: Difficulty };
export type OldSubject = { title: string; icon: string; color: string; lessons: OldLesson[] };

export const curriculumStandards = {
  mathematics: {
    primary: 'DepEd MATATAG Mathematics Curriculum Guide, Grades 1-6',
    international: 'Common Core State Standards for Mathematics',
    strands: ['Numbers and Number Sense', 'Measurement', 'Geometry', 'Patterns and Algebra', 'Statistics and Probability'],
  },
  science: {
    primary: 'DepEd MATATAG Science Curriculum Guide, Grades 3-6',
    international: 'Next Generation Science Standards',
    strands: ['Matter', 'Living Things and Environment', 'Force, Motion and Energy', 'Earth and Space'],
    earlyGradesNote: 'Grades 1-2 focus on foundational sensory observations, health, and environment; formal standalone Science begins in Grade 3 under the MATATAG curriculum.',
  },
} as const;

type LessonInput = [string, string, string, Difficulty];
const lessonList = (items: LessonInput[]): OldLesson[] => items.map(([title, meaning, example, difficulty]) => ({ title, meaning, example, difficulty }));
const subject = (title: string, icon: string, color: string, items: LessonInput[]): OldSubject => ({ title, icon, color, lessons: lessonList(items) });
const math = (items: LessonInput[]) => subject('Math', '📐', '#9c63e8', items);

const matter = (items: LessonInput[]) => subject('Matter', '🧊', '#4879e7', items);
const living = (items: LessonInput[]) => subject('Living Things & Environment', '🌱', '#4ea85f', items);
const force = (items: LessonInput[]) => subject('Force, Motion, & Energy', '⚡', '#dc8a32', items);
const earth = (items: LessonInput[]) => subject('Earth & Space', '🌎', '#318cce', items);

export const notebookCurriculum: Record<number, OldSubject[]> = {
  1: [
    math([
      // Chapters 1-4: Explanation, Description & Formulas
      ['Chapter 1: Counting and Number Sense', 'Numbers represent quantities up to 100. Key Concept: Comparing quantities using terms like more, fewer, or equal. Symbol Rules: > (greater than), < (less than), = (equal to).', 'Concept Study: Read and identify quantities from 1 to 100 on a number line.', 'Easy'],
      ['Chapter 2: Shapes and Patterns', '2D shapes (circles, triangles, squares, rectangles) have distinct physical attributes (number of sides and vertices). Pattern Rule: Repeating sequence A-B-C-A-B-C.', 'Concept Study: Observe geometric properties of shapes and identify pattern rules.', 'Easy'],
      ['Chapter 3: Addition Principles', 'Addition joins sets together to find a total sum. Formula/Model: Part + Part = Whole ($a + b = c$). Properties: Commutative Property ($a + b = b + a$).', 'Concept Study: Understand combining two groups to form a greater sum.', 'Medium'],
      ['Chapter 4: Subtraction Principles', 'Subtraction separates or takes away parts from a set to find the difference. Formula/Model: Total - Part = Remaining ($a - b = c$). Inverse Rule: Subtraction undoes addition.', 'Concept Study: Learn taking away items from a total quantity.', 'Medium'],
      // Chapters 5-7: Examples & Activity Exercises
      ['Chapter 5: Counting & Ordinals Practice', 'Worked Example: Count 12 calamansi fruits and compare with 8 fruits ($12 > 8$). Activity Exercise 1: Identify which set has more items. Exercise 2: Arrange 5, 12, 8, and 20 from least to greatest.', 'Example: Count 12 calamansi. Exercise: Solve 15 > ?', 'Easy'],
      ['Chapter 6: Pattern & Shapes Workout', 'Worked Example: Continue repeating tile pattern: Circle, Square, Triangle, Circle, Square, [?]. Activity Exercise 1: Draw the missing 6th shape. Exercise 2: Count sides of a rectangle.', 'Example: Complete pattern sequence. Exercise: Identify shape attributes.', 'Easy'],
      ['Chapter 7: Addition & Subtraction Lab', 'Worked Example: Solve $7 + 5 = 12$ using counters. Evaluate $9 - 4 = 5$. Activity Exercise 1: Solve $8 + 6 = ?$. Exercise 2: Solve $14 - 8 = ?$. Exercise 3: Complete word problem on sharing mangos.', 'Example: $7 + 5 = 12$, $9 - 4 = 5$. Exercise: Solve 10 word problems.', 'Medium']
    ]),
    matter([
      // Chapters 1-4: Explanation & Description
      ['Chapter 1: Physical Attributes', 'Objects in our surroundings can be described and classified by basic physical attributes such as color, shape, and size.', 'Concept Study: Learn to observe color, shape, and size parameters.', 'Easy'],
      ['Chapter 2: Texture and Hardness', 'Objects feel different when touched; surfaces can be rough or smooth, and materials can be soft or hard based on surface composition.', 'Concept Study: Define tactile traits (rough, smooth, soft, hard).', 'Easy'],
      ['Chapter 3: Sorting Principles', 'Sorting is the systematic grouping of objects into distinct sets based on one or more shared observable physical properties.', 'Concept Study: Understand single-attribute and multi-attribute classification rules.', 'Easy'],
      ['Chapter 4: Material Properties', 'Different objects are made from distinct natural or synthetic materials (wood, plastic, metal, fabric) with unique characteristics.', 'Concept Study: Identify wood, plastic, glass, and fabric properties.', 'Medium'],
      // Chapters 5-7: Examples & Activity Exercises
      ['Chapter 5: Attribute Sorting Workshop', 'Worked Example: Sort classroom materials into big red blocks and small blue counters. Activity Exercise 1: Group 10 objects by color. Exercise 2: Regroup them by size.', 'Example: Categorize red vs blue blocks. Exercise: Complete sorting matrix.', 'Easy'],
      ['Chapter 6: Texture & Hardness Test', 'Worked Example: Compare a rough coconut husk with a smooth plastic tray. Activity Exercise 1: Touch 4 items and label as Rough or Smooth. Exercise 2: Rank items by hardness.', 'Example: Rough husk vs smooth tray. Exercise: Classify 6 classroom materials.', 'Easy'],
      ['Chapter 7: Material Classification Challenge', 'Worked Example: Group local leaves by size first, then regroup them by color. Activity Exercise 1: Classify 8 household items by material type. Exercise 2: Solve material matching puzzle.', 'Example: Regrouping leaves. Exercise: Complete material property chart.', 'Medium']
    ]),
    living([
      ['Chapter 1: The Five Senses', 'Human sense organs (eyes, ears, nose, tongue, skin) detect environmental stimuli (sight, sound, smell, taste, touch) for perception.', 'Concept Study: Learn organ-to-sense mappings and protective sensory functions.', 'Easy'],
      ['Chapter 2: Living vs Non-Living', 'Living things possess key biological traits: growth, self-movement, respiration, and need for food/water. Non-living objects lack these processes.', 'Concept Study: Compare biological characteristics of living vs non-living things.', 'Easy'],
      ['Chapter 3: Plant Structure', 'Plants consist of specialized organs: roots (anchorage/water intake), stems (transport), leaves (food production), and flowers (reproduction).', 'Concept Study: Identify plant anatomy and essential survival needs (sunlight, air, water, soil).', 'Medium'],
      ['Chapter 4: Sensory Protection', 'Protecting sense organs from extreme light, loud noise, sharp items, and harmful substances maintains healthy organ function.', 'Concept Study: Review hygiene and safety practices for eyes, ears, and skin.', 'Medium'],
      ['Chapter 5: Sensory Discovery Lab', 'Worked Example: Use skin to feel warm water and nose to smell sampaguita. Activity Exercise 1: Match 5 sensory inputs to correct organs. Exercise 2: Identify safe vs unsafe sounds.', 'Example: Smell and touch test. Exercise: Complete sense organ worksheet.', 'Easy'],
      ['Chapter 6: Living Things Classifier', 'Worked Example: A pet dog is living (grows, eats); a wooden chair is non-living. Activity Exercise 1: Mark 8 items as Living or Non-living. Exercise 2: Explain why a plant is alive.', 'Example: Dog vs Chair analysis. Exercise: Solve living checklist quiz.', 'Easy'],
      ['Chapter 7: Plant Growth Experiment', 'Worked Example: Observe how roots absorb water while leaves face sunlight. Activity Exercise 1: Label the 4 main plant parts on a diagram. Exercise 2: Track seed growth in a 5-day chart.', 'Example: Root water absorption. Exercise: Complete plant needs diagram.', 'Medium']
    ]),
    force([
      ['Chapter 1: Forces in Motion', 'A force is a push or pull applied to an object. Forces can cause stationary objects to move, speed up, slow down, or stop.', 'Concept Study: Define pushes, pulls, and directional force application.', 'Easy'],
      ['Chapter 2: Motion Paths', 'Objects move along various spatial trajectories: straight, curved, zig-zag, rotational, fast, or slow motion.', 'Concept Study: Describe motion directions and relative speed.', 'Easy'],
      ['Chapter 3: Light Energy', 'Light energy illuminates objects enabling vision. Light originates from natural sources (Sun) or artificial sources (lamps) and travels in straight lines.', 'Concept Study: Differentiate natural and artificial light sources.', 'Medium'],
      ['Chapter 4: Sound Energy', 'Sound energy is produced by vibrating objects. Sound travels through air/materials as sound waves and varies in pitch and volume.', 'Concept Study: Learn how vibrations create audible sound waves.', 'Medium'],
      ['Chapter 5: Push and Pull Playground', 'Worked Example: Push a toy jeepney forward or pull it back with string. Activity Exercise 1: Identify 6 daily actions as Push or Pull. Exercise 2: Predict which push moves a car further.', 'Example: Toy jeepney movement. Exercise: Complete push/pull action sheet.', 'Easy'],
      ['Chapter 6: Motion Tracking Lab', 'Worked Example: Roll a marble straight down a ramp, then guide it in a zig-zag line. Activity Exercise 1: Draw 3 different motion paths. Exercise 2: Measure toy car speed.', 'Example: Marble ramp test. Exercise: Classify straight vs zig-zag movement.', 'Easy'],
      ['Chapter 7: Light & Sound Investigation', 'Worked Example: Sun provides daylight; fiesta drum vibrates to produce sound. Activity Exercise 1: Categorize 8 light sources. Exercise 2: Create vibrations with a rubber band.', 'Example: Sun and drum energy. Exercise: Complete light/sound source chart.', 'Medium']
    ]),
    earth([
      ['Chapter 1: Sky Observations', 'The sky undergoes regular cyclical changes between day and night due to Earth\'s rotation, showing the Sun by day and Moon/stars by night.', 'Concept Study: Observe objects and light differences in day vs night sky.', 'Easy'],
      ['Chapter 2: Weather Dynamics', 'Weather describes atmospheric conditions at a specific time and place (sunny, rainy, windy, cloudy, stormy).', 'Concept Study: Define weather terms and daily weather variability.', 'Easy'],
      ['Chapter 3: Environmental Care', 'Care for immediate surroundings (homes, schools, water bodies) protects living habitats and prevents pollution.', 'Concept Study: Learn waste segregation and habitat preservation rules.', 'Medium'],
      ['Chapter 4: Seasonal Basics', 'Weather patterns follow recurring cycles (wet and dry seasons in tropical regions) influencing community activities.', 'Concept Study: Differentiate sunny dry season traits from rainy wet season traits.', 'Medium'],
      ['Chapter 5: Day & Night Sky Explorer', 'Worked Example: Draw Sun in daytime sky and Moon with stars in nighttime sky. Activity Exercise 1: Identify 5 daytime activities. Exercise 2: Chart Moon shapes over 3 days.', 'Example: Day vs night drawing. Exercise: Solve sky observation sheet.', 'Easy'],
      ['Chapter 6: Weather Reporter Lab', 'Worked Example: Match rainy weather to umbrellas and sunny weather to sun hats. Activity Exercise 1: Log daily weather for 5 days. Exercise 2: Select proper clothing for 4 weather types.', 'Example: Umbrella vs hat decision. Exercise: Complete weekly weather log.', 'Easy'],
      ['Chapter 7: Eco-Guardian Mission', 'Worked Example: Segregate food scraps from plastic trash. Activity Exercise 1: Sort 10 trash items into Biodegradable or Recyclable. Exercise 2: Write 3 ways to keep rivers clean.', 'Example: Waste segregation. Exercise: Complete school cleanup plan.', 'Medium']
    ]),
  ],
  2: [
    math([
      ['Chapter 1: Place Value Fundamentals', 'Place value determines digit values based on position in a number: Hundreds, Tens, Ones. Expanded Form: $N = (100 \\times h) + (10 \\times t) + (1 \\times o)$.', 'Concept Study: Deconstruct 3-digit numbers into hundreds, tens, and ones.', 'Easy'],
      ['Chapter 2: Addition Strategies', 'Multi-digit addition combines place values. Regrouping Rule: If Ones $\\ge 10$, carry 1 Ten to Tens column ($10 \\text{ Ones} = 1 \\text{ Ten}$).', 'Concept Study: Learn mental addition, expanded form, and vertical column alignment.', 'Medium'],
      ['Chapter 3: Subtraction Strategies', 'Multi-digit subtraction finds differences between quantities. Borrowing Rule: If top digit < bottom digit, decompose 1 Ten into 10 Ones.', 'Concept Study: Master vertical subtraction with regrouping across place values.', 'Medium'],
      ['Chapter 4: Measurement Units', 'Standard length is measured in meters (m) or centimeters (cm). Conversion Formula: $1 \\text{ meter} = 100 \\text{ centimeters}$.', 'Concept Study: Compare non-standard units with standard metric rulers.', 'Medium'],
      ['Chapter 5: Place Value Master Class', 'Worked Example: In 583, digit 8 has value 80 (8 tens). Activity Exercise 1: Write expanded form of 742 ($700 + 40 + 2$). Exercise 2: Identify place value of 9 in 916.', 'Example: Decompose 583. Exercise: Complete 8 place value problems.', 'Easy'],
      ['Chapter 6: Addition & Subtraction Drill', 'Worked Example: Calculate $347 + 185 = 532$ by regrouping. Activity Exercise 1: Solve $428 + 275 = ?$. Exercise 2: Solve $652 - 284 = ?$. Exercise 3: Solve 2-step word problem.', 'Example: $347 + 185 = 532$. Exercise: Complete 10 regrouping equations.', 'Medium'],
      ['Chapter 7: Geometry & Measurement Lab', 'Worked Example: Measure a notebook using a cm ruler (21 cm). Activity Exercise 1: Measure 5 objects in cm. Exercise 2: Count sides and vertices of 4 geometric shapes.', 'Example: Notebook ruler test. Exercise: Complete shape & measurement table.', 'Medium']
    ]),
    matter([
      ['Chapter 1: States of Matter: Solids & Liquids', 'Solids retain a definite shape and volume. Liquids possess fixed volume but flow to take the shape of their container.', 'Concept Study: Differentiate shape stability and fluidity in solids vs liquids.', 'Easy'],
      ['Chapter 2: Strength and Flexibility', 'Materials vary in structural properties: durability (resistance to damage) and flexibility (ability to bend without fracturing).', 'Concept Study: Learn rigid vs flexible material attributes.', 'Medium'],
      ['Chapter 3: Absorbency', 'Porous materials absorb and hold liquid inside spaces, whereas non-porous materials repel water.', 'Concept Study: Understand porous absorption mechanics vs waterproof barriers.', 'Medium'],
      ['Chapter 4: Thermal Melting', 'Thermal energy transfer increases temperature, causing solid substances to transition into liquid state (Melting point).', 'Concept Study: Study solid-to-liquid state change driven by heat energy.', 'Medium'],
      ['Chapter 5: Solid & Liquid Sorting Lab', 'Worked Example: Pouring fruit juice into a tall glass changes its shape but keeps volume. Activity Exercise 1: Classify 8 items as Solid or Liquid. Exercise 2: Container shape test.', 'Example: Juice container test. Exercise: Complete state properties chart.', 'Easy'],
      ['Chapter 6: Material Flexibility Test', 'Worked Example: Rubber band stretches easily; bamboo stick is rigid. Activity Exercise 1: Test 5 items for flexibility. Exercise 2: Match 4 items to ideal construction uses.', 'Example: Rubber vs bamboo. Exercise: Complete material strength matrix.', 'Medium'],
      ['Chapter 7: Absorbency & Melting Challenge', 'Worked Example: Cotton cloth absorbs water quickly; plastic repels it. Ice melts when heated. Activity Exercise 1: Rank 4 fabrics by absorbency. Exercise 2: Heat melting experiment log.', 'Example: Cotton vs plastic test. Exercise: Solve absorbency & heat quiz.', 'Medium']
    ]),
    living([
      ['Chapter 1: Plant Survival Needs', 'Plants require 4 essential inputs for health and growth: Sunlight (energy), Air ($CO_2$), Water ($H_2O$), and Soil (nutrients).', 'Concept Study: Detail how each survival element supports plant physiology.', 'Easy'],
      ['Chapter 2: Animal Habitats', 'Habitats (terrestrial land, aquatic water, arboreal trees) provide organisms with shelter, food, water, and reproductive space.', 'Concept Study: Map animal adaptations to specific natural habitats.', 'Medium'],
      ['Chapter 3: Animal Classification', 'Animals are grouped by body coverings (fur, feathers, scales), movement method, and diet (herbivore, carnivore, omnivore).', 'Concept Study: Classify vertebrates based on physical structures and diets.', 'Medium'],
      ['Chapter 4: Offspring & Inheritance', 'Animals reproduce so species survive; young animal offspring inherit physical traits that resemble their adult parents.', 'Concept Study: Observe parent-offspring trait similarities across animal species.', 'Medium'],
      ['Chapter 5: Plant Growth Investigation', 'Worked Example: Compare a watered plant in sunlight with a dark, dry plant. Activity Exercise 1: List 4 plant needs. Exercise 2: Diagnose why a wilted plant is dying.', 'Example: Sunlight vs dark plant. Exercise: Complete plant survival sheet.', 'Easy'],
      ['Chapter 6: Habitat Matching Workshop', 'Worked Example: Bangus lives in water; Philippine eagle lives in forest canopy. Activity Exercise 1: Match 8 animals to correct habitats. Exercise 2: Group animals by diet.', 'Example: Bangus vs Eagle habitat. Exercise: Complete habitat matching grid.', 'Medium'],
      ['Chapter 7: Life Cycle & Traits Challenge', 'Worked Example: A chick hatches from an egg and grows to resemble adult hen/rooster. Activity Exercise 1: Order 4 life stages of a chicken. Exercise 2: Match offspring to parents.', 'Example: Chick growth stages. Exercise: Complete parent-offspring quiz.', 'Medium']
    ]),
    force([
      ['Chapter 1: Force Magnitude', 'The distance an object travels depends on force magnitude: a greater force produces greater acceleration and distance.', 'Concept Study: Analyze relationship between applied force strength and distance moved.', 'Medium'],
      ['Chapter 2: Static Electricity', 'Friction between distinct materials transfers electrons, creating electrostatic charges that attract lightweight non-conductive objects.', 'Concept Study: Understand triboelectric charging and electrostatic attraction.', 'Medium'],
      ['Chapter 3: Magnetic Forces', 'Magnets exert non-contact forces. Rule: Opposite poles attract ($N-S$), like poles repel ($N-N$ or $S-S$). Ferrous metals (iron, steel) are attracted.', 'Concept Study: Learn magnetic pole interactions and magnetic materials.', 'Hard'],
      ['Chapter 4: Friction Basics', 'Friction is a contact force opposing relative motion between surfaces. Rough surfaces generate greater friction than smooth surfaces.', 'Concept Study: Examine surface roughness impact on frictional resistance.', 'Hard'],
      ['Chapter 5: Force & Distance Experiment', 'Worked Example: Kick a ball gently (short distance), then kick with greater force (long distance). Activity Exercise 1: Compare toy car distance under 3 push strengths.', 'Example: Ball kick test. Exercise: Log push strength vs distance traveled.', 'Medium'],
      ['Chapter 6: Static Charge Lab', 'Worked Example: Rub a plastic comb on dry hair to pick up small paper bits. Activity Exercise 1: Test static charge with 3 materials. Exercise 2: Explain charge transfer.', 'Example: Comb static test. Exercise: Complete static electricity worksheet.', 'Medium'],
      ['Chapter 7: Magnet Field Challenge', 'Worked Example: Test if a magnet attracts paperclips, wooden sticks, or aluminum. Activity Exercise 1: Classify 10 items as Magnetic or Non-Magnetic. Exercise 2: Predict pole reactions.', 'Example: Paperclip magnet test. Exercise: Complete magnetic force matrix.', 'Hard']
    ]),
    earth([
      ['Chapter 1: Landforms & Water Bodies', 'Earth\'s lithosphere and hydrosphere consist of landforms (mountains, volcanoes, valleys, plains) and water bodies (rivers, lakes, seas, oceans).', 'Concept Study: Identify physical characteristics of primary geographical features.', 'Medium'],
      ['Chapter 2: Weather Preparedness', 'Daily weather dictates human decision-making regarding attire, outdoor safety precautions, and disaster preparedness.', 'Concept Study: Connect weather forecasts to safety precautions and attire.', 'Easy'],
      ['Chapter 3: Tropical Seasons', 'Tropical climates exhibit predictable 2-season patterns: Wet Season (high rainfall) and Dry Season (low rainfall, warm temperatures).', 'Concept Study: Analyze seasonal weather traits in tropical geographical zones.', 'Hard'],
      ['Chapter 4: Natural Resource Care', 'Soil, water, and forests are essential natural resources requiring conservation to prevent depletion and pollution.', 'Concept Study: Review sustainable practices for protecting local land and water.', 'Hard'],
      ['Chapter 5: Philippine Geography Lab', 'Worked Example: Locate Mount Mayon (volcano) and Pasig River on a Philippine map. Activity Exercise 1: Identify 5 landforms on a map. Exercise 2: Categorize freshwater vs saltwater.', 'Example: Map search Mayon & Pasig. Exercise: Complete land/water identification sheet.', 'Medium'],
      ['Chapter 6: Weather & Safety Workshop', 'Worked Example: Wear raincoat on typhoon days; light cotton during summer. Activity Exercise 1: Match 4 weather scenarios to safe choices. Exercise 2: Pack emergency bag list.', 'Example: Raincoat vs cotton choice. Exercise: Complete typhoon safety checklist.', 'Easy'],
      ['Chapter 7: Tropical Season Tracker', 'Worked Example: Heavy rain occurs frequently during wet season months (June-Nov). Activity Exercise 1: Classify 6 months by season. Exercise 2: Compare wet vs dry activities.', 'Example: Wet season rainfall pattern. Exercise: Complete seasonal weather grid.', 'Hard']
    ]),
  ],
  3: [
    math([
      ['Chapter 1: Multiplication Principles', 'Multiplication is repeated addition of equal groups. Formula: $a \\times b = c$ (Factor $\\times$ Factor = Product). Array Model: Rows $\\times$ Columns.', 'Concept Study: Master multiplication as equal group accumulation.', 'Medium'],
      ['Chapter 2: Division Principles', 'Division partitions a total into equal sets. Formula: $a \\div b = c$ (Dividend $\\div$ Divisor = Quotient). Inverse Rule: If $a \\times b = c$, then $c \\div b = a$.', 'Concept Study: Understand equal sharing and division array models.', 'Medium'],
      ['Chapter 3: Fractions on Number Lines', 'Fractions express equal parts of a unit whole ($a/b$). Number line rule: Partition interval [0, 1] into $b$ equal segments; count $a$ steps.', 'Concept Study: Plot and compare proper fractions between 0 and 1.', 'Medium'],
      ['Chapter 4: Area & Perimeter Formulas', 'Perimeter ($P$) is boundary length: $P = 2l + 2w$ (Rectangle) or $P = 4s$ (Square). Area ($A$) is enclosed surface: $A = l \\times w$ (Rectangle) or $A = s^2$ (Square).', 'Concept Study: Learn linear perimeter measure vs square-unit area measure.', 'Hard'],
      ['Chapter 5: Multiplication & Division Workshop', 'Worked Example: Multiply $7 \\times 8 = 56$. Divide 56 mangos equally among 8 children ($56 \\div 8 = 7$). Activity Exercise 1: Solve 10 multiplication facts. Exercise 2: Solve 10 division facts.', 'Example: $7 \\times 8 = 56$, $56 \\div 8 = 7$. Exercise: Complete 15 fact family equations.', 'Medium'],
      ['Chapter 6: Fraction Number Line Lab', 'Worked Example: Mark 1/2, 2/4, and 3/4 accurately on a number line from 0 to 1. Activity Exercise 1: Plot 1/3, 2/3 on number line. Exercise 2: Compare 2/4 and 3/4 using < or >.', 'Example: Number line 1/2 and 3/4. Exercise: Complete fraction plotting sheet.', 'Medium'],
      ['Chapter 7: Area & Perimeter Challenge', 'Worked Example: Square garden with 4m sides: $P = 4(4) = 16\\text{ m}$, $A = 4 \\times 4 = 16\\text{ sq m}$. Activity Exercise 1: Find P and A for $6\\text{m} \\times 3\\text{m}$ room. Exercise 2: Solve perimeter word problem.', 'Example: Square 4m garden. Exercise: Complete 5 area/perimeter problem sets.', 'Hard']
    ]),
    matter([
      ['Chapter 1: Three Primary States of Matter', 'Matter occupies space and has mass. 3 States: Solids (fixed shape & volume), Liquids (variable shape, fixed volume), Gases (variable shape & volume).', 'Concept Study: Define particle arrangement in solids, liquids, and gases.', 'Medium'],
      ['Chapter 2: Physical Measurement Tools', 'Physical properties are quantified using standard instruments: Mass (balance scale in g/kg), Liquid Volume (graduated cylinder in mL/L).', 'Concept Study: Learn standard metric measurement techniques for matter.', 'Medium'],
      ['Chapter 3: Phase Changes', 'Phase transitions occur via thermal energy transfer: Melting (solid $\\rightarrow$ liquid), Freezing (liquid $\\rightarrow$ solid), Evaporation (liquid $\\rightarrow$ gas), Condensation (gas $\\rightarrow$ liquid).', 'Concept Study: Map temperature increases/decreases to phase state changes.', 'Hard'],
      ['Chapter 4: Gas Properties', 'Gases consist of widely spaced particles that move rapidly to expand and fill any closed container, exerting pressure on walls.', 'Concept Study: Examine gas compressibility, mass, and expansion dynamics.', 'Hard'],
      ['Chapter 5: States Identification Lab', 'Worked Example: Water exists as ice (solid), water (liquid), and steam (gas). Activity Exercise 1: Classify 10 substances into 3 states. Exercise 2: Describe gas behavior in balloons.', 'Example: Ice, water, and steam analysis. Exercise: Complete matter state matrix.', 'Medium'],
      ['Chapter 6: Volume & Mass Measurement Workshop', 'Worked Example: Measure 250 mL liquid in a graduated cylinder and 500 g flour on a scale. Activity Exercise 1: Read 4 cylinder levels. Exercise 2: Compare mass of 3 objects.', 'Example: Graduated cylinder reading. Exercise: Solve metric measurement quiz.', 'Medium'],
      ['Chapter 7: Phase Change Experiment', 'Worked Example: Water vapor condenses into droplets on a cold metal lid. Activity Exercise 1: Match 4 scenarios to Melting, Freezing, Evaporation, Condensation. Exercise 2: Phase change diagram.', 'Example: Cold lid condensation. Exercise: Complete phase transition worksheet.', 'Hard']
    ]),
    living([
      ['Chapter 1: Sensory System Physiology', 'Human sense organs contain specialized receptors that detect environmental stimuli and send nervous signals to the brain for interpretation.', 'Concept Study: Detail neural pathways from sensory organs to brain processing.', 'Medium'],
      ['Chapter 2: Plant & Animal Taxonomy', 'Organisms are classified by structural features: Flowering vs Non-flowering plants; Vertebrates (with backbone) vs Invertebrates (without backbone).', 'Concept Study: Master classification criteria for major plant and animal groups.', 'Medium'],
      ['Chapter 3: Metamorphosis & Life Cycles', 'Animals undergo sequential developmental stages. Complete Metamorphosis: Egg $\\rightarrow$ Larva $\\rightarrow$ Pupa $\\rightarrow$ Adult. Incomplete: Egg $\\rightarrow$ Nymph $\\rightarrow$ Adult.', 'Concept Study: Contrast complete vs incomplete insect metamorphosis stages.', 'Hard'],
      ['Chapter 4: Ecosystem Basics', 'Ecosystems consist of biotic living organisms interacting with abiotic non-living components (air, water, soil, sunlight).', 'Concept Study: Examine biotic and abiotic interactions in local environments.', 'Hard'],
      ['Chapter 5: Sensory System Lab', 'Worked Example: Retina receives light signals; auditory nerve transmits sound signals. Activity Exercise 1: Trace signal path from ear to brain. Exercise 2: Identify sensory overload causes.', 'Example: Retina and auditory nerve test. Exercise: Complete nervous system chart.', 'Medium'],
      ['Chapter 6: Taxonomy Sorting Challenge', 'Worked Example: Classify ferns, orchids, milkfish, and dragonflies into major groups. Activity Exercise 1: Sort 8 species as Vertebrate or Invertebrate. Exercise 2: Flowering plant test.', 'Example: Plant/Animal classification. Exercise: Complete taxonomic tree.', 'Medium'],
      ['Chapter 7: Life Cycle Mapping Workshop', 'Worked Example: Mosquito develops through Egg, Larva (wriggler), Pupa, and Adult. Activity Exercise 1: Order frog life cycle stages. Exercise 2: Compare mosquito vs butterfly stages.', 'Example: Mosquito 4-stage cycle. Exercise: Complete life cycle diagram sheet.', 'Hard']
    ]),
    force([
      ['Chapter 1: Gravity & Falling Motion', 'Gravity is a non-contact attractive force exerted by Earth pulling objects toward its center. Acceleration due to gravity pulls objects downward.', 'Concept Study: Understand gravitational pull on free-falling bodies.', 'Medium'],
      ['Chapter 2: Light Propagation & Transmission', 'Light travels in straight rays. Materials interact with light as: Transparent (passes all light), Translucent (scatters light), Opaque (blocks light, forms shadows).', 'Concept Study: Analyze light ray paths through transparent, translucent, and opaque media.', 'Medium'],
      ['Chapter 3: Sound & Heat Energy', 'Sound is produced by mechanical vibrations moving through matter. Thermal energy (heat) flows spontaneously from higher temperature objects to lower temperature objects.', 'Concept Study: Examine vibration frequency/pitch and heat conduction pathways.', 'Hard'],
      ['Chapter 4: Simple Force Interactions', 'Balanced forces produce zero net force (no motion change); unbalanced forces produce net force causing directional acceleration.', 'Concept Study: Calculate net force from opposing directional forces.', 'Hard'],
      ['Chapter 5: Gravity Investigation', 'Worked Example: Ripe mango falling from a branch is pulled downward by gravity. Activity Exercise 1: Predict drop times for ball vs feather in air. Exercise 2: Identify gravity directions.', 'Example: Falling mango observation. Exercise: Complete gravity motion sheet.', 'Medium'],
      ['Chapter 6: Light Transmission Testing', 'Worked Example: Shine flashlight through clear glass (transparent), wax paper (translucent), cardboard (opaque). Activity Exercise 1: Classify 8 items. Exercise 2: Shadow size test.', 'Example: Flashlight transmission test. Exercise: Complete light interaction table.', 'Medium'],
      ['Chapter 7: Sound & Thermal Energy Lab', 'Worked Example: Plucked guitar string vibrates to make sound; heat warms cold spoon in hot soup. Activity Exercise 1: Vibration testing. Exercise 2: Trace heat flow between 2 items.', 'Example: Guitar vibration & hot spoon. Exercise: Complete sound & heat worksheet.', 'Hard']
    ]),
    earth([
      ['Chapter 1: Soil Composition & Types', 'Soil forms from weathered rock and organic matter. 3 Main Types: Sandy (large grains, fast drainage), Clay (tiny particles, high water retention), Loam (balanced, fertile).', 'Concept Study: Differentiate soil textures, grain sizes, and water retention capacities.', 'Medium'],
      ['Chapter 2: Weather Hazards & Safety', 'Severe weather (typhoons, heavy rainfall, flash floods) requires monitoring advisories, preparing emergency kits, and executing evacuation plans.', 'Concept Study: Review weather monitoring signals and emergency safety protocols.', 'Medium'],
      ['Chapter 3: Celestial Motion Patterns', 'Earth\'s rotation causes apparent daily motion of Sun, Moon, and stars. The Moon orbits Earth every 29.5 days, displaying changing visible phases.', 'Concept Study: Map monthly lunar phases and daytime Sun elevation tracks.', 'Hard'],
      ['Chapter 4: Freshwater Resources', 'Freshwater exists in rivers, lakes, groundwater aquifers, and glaciers, requiring conservation to ensure clean water supplies.', 'Concept Study: Study natural water storage systems and pollution prevention.', 'Hard'],
      ['Chapter 5: Soil Texture & Drainage Lab', 'Worked Example: Compare water retention in clay soil vs fertile garden loam. Activity Exercise 1: Test drainage of Sand, Clay, and Loam. Exercise 2: Select ideal soil for plants.', 'Example: Clay vs loam water test. Exercise: Complete soil properties grid.', 'Medium'],
      ['Chapter 6: Emergency Preparedness Workshop', 'Worked Example: Secure loose roof sheets and prepare emergency supply bags before a typhoon. Activity Exercise 1: Assemble emergency kit list. Exercise 2: Read warning signals.', 'Example: Typhoon kit preparation. Exercise: Complete disaster preparedness plan.', 'Medium'],
      ['Chapter 7: Lunar Phase Tracking Challenge', 'Worked Example: Observe and record visible Moon shapes over a 1-month cycle. Activity Exercise 1: Label 4 primary Moon phases. Exercise 2: Match Moon phase to day count.', 'Example: Monthly Moon log. Exercise: Complete lunar phase calendar.', 'Hard']
    ]),
  ],
  4: [
    math([
      ['Chapter 1: Multi-Digit Multiplication & Division', 'Standard long multiplication and division algorithms. Division Rule: $\\text{Dividend} = (\\text{Divisor} \\times \\text{Quotient}) + \\text{Remainder}$.', 'Concept Study: Master vertical multi-digit algorithms and verification.', 'Hard'],
      ['Chapter 2: Equivalent Fractions & Decimals', 'Fractions convert to decimals by dividing numerator by denominator ($a/b = a \\div b$). Decimals express place values ($0.1 = 1/10$, $0.01 = 1/100$).', 'Concept Study: Convert between fractional representations and decimal notation.', 'Hard'],
      ['Chapter 3: Angle Classification & Geometry', 'Angles are measured in degrees ($^\\circ$) using protractors. Types: Acute ($< 90^\\circ$), Right ($= 90^\\circ$), Obtuse ($> 90^\\circ \\text{ and } < 180^\\circ$), Straight ($= 180^\\circ$). Polygons classified by sides.', 'Concept Study: Measure interior angles and classify regular/irregular polygons.', 'Medium'],
      ['Chapter 4: Factors, Multiples, GCF, and LCM', 'Factors divide a number evenly. Multiples are products of a number. GCF is greatest shared factor; LCM is smallest shared multiple.', 'Concept Study: Find GCF and LCM using prime factorization trees.', 'Hard'],
      ['Chapter 5: Multi-Digit Computation Lab', 'Worked Example: Calculate $4,328 \\div 16 = 270.5$ (or $270 \\text{ R } 8$). Verify: $(16 \\times 270) + 8 = 4,328$. Activity Exercise 1: Solve $3,214 \\times 25$. Exercise 2: Solve $5,832 \\div 18$.', 'Example: $4,328 \\div 16$ with check. Exercise: Complete 8 long arithmetic problems.', 'Hard'],
      ['Chapter 6: Fraction-Decimal Conversion Workshop', 'Worked Example: Convert $3/5$ into $6/10 = 0.6$. Activity Exercise 1: Convert $1/4, 2/5, 3/8$ to decimals. Exercise 2: Convert $0.45, 0.8, 0.125$ to reduced fractions.', 'Example: $3/5 = 0.6$. Exercise: Complete conversion matrix.', 'Hard'],
      ['Chapter 7: Angle Measurement & Factor Challenge', 'Worked Example: Identify $90^\\circ$ right angle in window frame. Find GCF of 12 and 18 ($= 6$). Activity Exercise 1: Measure 5 angles with protractor. Exercise 2: Find LCM of 4 and 6.', 'Example: Protractor measurement & GCF test. Exercise: Solve geometry & factor set.', 'Medium']
    ]),
    matter([
      ['Chapter 1: Density & Porosity in Water', 'Density controls floating/sinking ($d = m/V$). Objects less dense than water ($1\\text{ g/cm}^3$) float; denser objects sink. Porous materials absorb water into internal pores.', 'Concept Study: Analyze density ratios and porosity interaction with fluids.', 'Medium'],
      ['Chapter 2: Decomposition & Waste Types', 'Biodegradable wastes are organic materials broken down naturally by microorganisms (decomposers). Non-biodegradable wastes persist indefinitely.', 'Concept Study: Examine aerobic decomposition, composting, and environmental impacts.', 'Hard'],
      ['Chapter 3: Physical vs Chemical Changes', 'Physical changes alter form, phase, or size without changing chemical identity. Chemical changes alter atomic bonds to synthesize new chemical substances.', 'Concept Study: Identify indicators of chemical change (gas, heat, color change, precipitate).', 'Hard'],
      ['Chapter 4: Environmental Waste Management', 'Solid waste management requires proper segregation, reduction, reuse, recycling, and safe disposal to protect ecosystems.', 'Concept Study: Apply solid waste management hierarchy rules.', 'Hard'],
      ['Chapter 5: Sink, Float & Absorption Lab', 'Worked Example: Test dry sponge (absorbs/floats), coin (sinks), wooden block (floats), pumice stone (floats). Activity Exercise 1: Predict sink/float for 8 items. Exercise 2: Porosity test.', 'Example: Sponge, coin, wood, pumice test. Exercise: Complete fluid interaction sheet.', 'Medium'],
      ['Chapter 6: Decomposition Study Workshop', 'Worked Example: Fruit peels decay in soil within weeks; plastic wrappers remain unchanged. Activity Exercise 1: Classify 10 waste items as Biodegradable or Non-biodegradable.', 'Example: Organic vs plastic decay test. Exercise: Complete composting log.', 'Hard'],
      ['Chapter 7: Physical vs Chemical Change Challenge', 'Worked Example: Tearing paper is physical change; burning wood into ash is chemical change. Activity Exercise 1: Classify 8 scenarios (Rusting, Melting, Baking, Cutting).', 'Example: Paper tearing vs wood burning. Exercise: Complete reaction analysis grid.', 'Hard']
    ]),
    living([
      ['Chapter 1: Human Organ Systems Physiology', 'Major internal organs maintain homeostasis: Brain (nervous control), Heart (circulation), Lungs (gas exchange), Stomach/Intestines (digestion), Kidneys (excretory).', 'Concept Study: Map physiological functions and organ interactions in human body.', 'Hard'],
      ['Chapter 2: Structural & Behavioral Adaptations', 'Organisms possess specialized adaptations suited for biomes: Structural (physical attributes like webbed feet) and Behavioral (actions like migration).', 'Concept Study: Analyze survival adaptations across aquatic, desert, and forest biomes.', 'Hard'],
      ['Chapter 3: Insect Metamorphosis Types', 'Complete Metamorphosis (4 stages: Egg, Larva, Pupa, Adult). Incomplete Metamorphosis (3 stages: Egg, Nymph, Adult). Nymphs resemble miniature adults.', 'Concept Study: Contrast complete vs incomplete metamorphosis life cycles.', 'Medium'],
      ['Chapter 4: Body System Care', 'Proper nutrition, regular physical activity, adequate rest, and personal hygiene maintain human organ system health and prevent disease.', 'Concept Study: Formulate daily wellness routines for organ system health.', 'Hard'],
      ['Chapter 5: Human Organ Systems Lab', 'Worked Example: Lungs absorb oxygen into blood; heart pumps oxygenated blood throughout body. Activity Exercise 1: Label major internal organs. Exercise 2: Trace food pathway.', 'Example: Lungs & heart interaction. Exercise: Complete organ system diagram.', 'Hard'],
      ['Chapter 6: Habitat Adaptations Workshop', 'Worked Example: Mangrove trees have stilt roots for stability and salt balance in tidal waters. Activity Exercise 1: Identify adaptations of cactus, camel, duck, and fish.', 'Example: Mangrove stilt root adaptation. Exercise: Complete adaptation matrix.', 'Hard'],
      ['Chapter 7: Metamorphosis Comparison Challenge', 'Worked Example: Butterfly undergoes complete metamorphosis; grasshopper undergoes incomplete metamorphosis. Activity Exercise 1: Sequence 4 butterfly stages.', 'Example: Butterfly vs grasshopper. Exercise: Complete metamorphosis chart.', 'Medium']
    ]),
    force([
      ['Chapter 1: Force, Motion & Shape Alteration', 'Applied force alters velocity (speed/direction) or deforms physical shape. Net force equation: $F_{\\text{net}} = m \\times a$.', 'Concept Study: Evaluate how force magnitude and direction change motion and form.', 'Medium'],
      ['Chapter 2: Simple Machines Principles', 'Simple machines alter required force magnitude or direction to perform work ($W = F \\times d$). 6 Types: Inclined plane, Lever, Wedge, Screw, Pulley, Wheel-and-axle.', 'Concept Study: Calculate mechanical advantage principles of simple machines.', 'Hard'],
      ['Chapter 3: Energy Transfer Mechanisms', 'Heat transfer occurs via Conduction (direct contact), Convection (fluid circulation), Radiation (electromagnetic waves). Light transfers via Reflection & Refraction.', 'Concept Study: Analyze thermal conduction, convection, radiation, and light reflection.', 'Hard'],
      ['Chapter 4: Machine Safety Practices', 'Proper usage of simple and compound machines prevents injuries and reduces mechanical wear.', 'Concept Study: Review workplace and household tool safety guidelines.', 'Hard'],
      ['Chapter 5: Force & Motion Playground', 'Worked Example: Squeezing empty bottle changes shape; hitting shuttlecock changes direction. Activity Exercise 1: Identify force effects in 6 sports scenarios.', 'Example: Bottle squeeze & shuttlecock hit. Exercise: Complete force effect sheet.', 'Medium'],
      ['Chapter 6: Simple Machines Lab', 'Worked Example: Use a wooden ramp (inclined plane) to push heavy furniture into a truck easily. Activity Exercise 1: Classify 8 tools as Lever, Wedge, Screw, etc.', 'Example: Inclined plane ramp test. Exercise: Complete simple machine matching sheet.', 'Hard'],
      ['Chapter 7: Thermal & Light Energy Workshop', 'Worked Example: Heat conducts through a metal pan; light reflects off a flat glass mirror. Activity Exercise 1: Identify Conduction, Convection, Radiation in 6 diagrams.', 'Example: Pan conduction & mirror reflection. Exercise: Complete energy transfer quiz.', 'Hard']
    ]),
    earth([
      ['Chapter 1: Soil Weathering & Erosion', 'Soil erosion is the transport of topsoil by water, wind, ice, or human activities. Plant root systems anchor soil particles, preventing erosion.', 'Concept Study: Examine erosion agents and bio-engineering conservation strategies.', 'Hard'],
      ['Chapter 2: The Hydrologic Cycle', 'The water cycle continuously redistributes global water. Processes: Evaporation (surface $H_2O \\rightarrow$ gas), Transpiration (plant emission), Condensation (cloud formation), Precipitation (rain/snow).', 'Concept Study: Map solar energy inputs and gravity drives across the water cycle.', 'Medium'],
      ['Chapter 3: Meteorological Instruments', 'Meteorologists measure weather variables: Thermometer (temperature), Rain Gauge (precipitation volume), Wind Vane (wind direction), Anemometer (wind speed).', 'Concept Study: Learn operational mechanics of standard weather instruments.', 'Hard'],
      ['Chapter 4: Watershed Protection', 'Watersheds drain rainfall into shared river basins and coastal oceans. Protecting watersheds maintains clean water reserves and prevents flash flooding.', 'Concept Study: Review watershed ecology and river basin protection.', 'Hard'],
      ['Chapter 5: Soil Erosion Control Lab', 'Worked Example: Planting trees and vetiver grass on hillsides reduces topsoil erosion during heavy rain. Activity Exercise 1: Compare erosion in bare vs vegetated soil.', 'Example: Vetiver grass erosion test. Exercise: Complete soil conservation grid.', 'Hard'],
      ['Chapter 6: Water Cycle Diagram Workshop', 'Worked Example: Water evaporates from oceans, condenses into clouds, and falls as rain. Activity Exercise 1: Label 4 stages on a water cycle diagram. Exercise 2: Define transpiration.', 'Example: Ocean evaporation to rain. Exercise: Complete water cycle worksheet.', 'Medium'],
      ['Chapter 7: Weather Station Challenge', 'Worked Example: Record wind speed with anemometer and daily rainfall with rain gauge. Activity Exercise 1: Match 4 weather tools to measured parameters.', 'Example: Anemometer & rain gauge test. Exercise: Complete weather station log sheet.', 'Hard']
    ]),
  ],
  5: [
    math([
      ['Chapter 1: Proportional Values: Fractions, Decimals, Percentages', 'Proportional conversions. Percentage Formula: $\\text{Part} = \\text{Base} \\times \\text{Rate}$ ($P = B \\times R$). Conversion: $a/b = d = r\\%$.', 'Concept Study: Convert between fractional, decimal, and percentage equivalents.', 'Hard'],
      ['Chapter 2: Ratios and Proportions', 'A ratio compares two quantities ($a:b$). A proportion states equal ratios ($a/b = c/d$). Cross-Multiplication Rule: $a \\times d = b \\times c$.', 'Concept Study: Solve direct and inverse proportional scaling problems.', 'Hard'],
      ['Chapter 3: Volume & Coordinate Systems', 'Volume ($V$) measures 3D space: $V = l \\times w \\times h$ (Rectangular Prism) in cubic units ($u^3$). Coordinate grid locates points $(x, y)$ from origin $(0,0)$.', 'Concept Study: Master 3D volume formulas and Cartesian coordinate plotting.', 'Hard'],
      ['Chapter 4: Circles & Circumference', 'Circle geometry: Radius ($r$), Diameter ($d = 2r$). Circumference ($C$) formula: $C = \\pi d = 2\\pi r$, where $\\pi \\approx 3.14159$ or $22/7$.', 'Concept Study: Calculate circle circumference and area ($A = \\pi r^2$).', 'Hard'],
      ['Chapter 5: Proportional Conversion Lab', 'Worked Example: Convert $4/5$ into decimal $0.80$ and percentage $80\\%$. Calculate $15\\%$ discount on 200 pesos bill ($200 \\times 0.15 = 30$ pesos). Activity Exercise 1: Convert 5 values.', 'Example: $4/5 = 0.80 = 80\\%$. Exercise: Complete 8 percentage word problems.', 'Hard'],
      ['Chapter 6: Ratio & Scaling Workshop', 'Worked Example: Recipe requires 2 cups sugar for 5 cups flour ($2:5$). Calculate flour for 6 cups sugar ($2/5 = 6/x \\rightarrow 2x = 30 \\rightarrow x = 15$ cups).', 'Example: Recipe ratio scaling. Exercise: Complete 6 proportion problems.', 'Hard'],
      ['Chapter 7: 3D Volume & Coordinate Challenge', 'Worked Example: Volume of box ($6\\text{cm} \\times 4\\text{cm} \\times 3\\text{cm}$): $V = 6 \\times 4 \\times 3 = 72\\text{ cm}^3$. Circumference of $10\\text{cm}$ circle: $C = 3.14 \\times 10 = 31.4\\text{ cm}$.', 'Example: Box volume & circle circumference. Exercise: Complete volume & grid worksheet.', 'Hard']
    ]),
    matter([
      ['Chapter 1: Material Selection & Engineering Traits', 'Material selection depends on physical/chemical properties: Electrical Conductivity, Thermal Conductivity, Malleability, Ductility, Corrosion Resistance.', 'Concept Study: Evaluate material suitability for industrial and domestic applications.', 'Hard'],
      ['Chapter 2: The 5 Rs Waste Management Framework', '5 Rs: Refuse (reject unnecessary waste), Reduce (minimize consumption), Reuse (re-purpose items), Recycle (reprocess materials), Rot (compost organics).', 'Concept Study: Apply 5 Rs framework rules to municipal solid waste.', 'Medium'],
      ['Chapter 3: Chemical Oxidation: Combustion & Rusting', 'Combustion: $\\text{Fuel} + O_2 + \\text{Heat} \\rightarrow CO_2 + H_2O + \\text{Energy}$. Rusting: $4Fe + 3O_2 + xH_2O \\rightarrow 2Fe_2O_3\\cdot xH_2O$ (Iron Oxide).', 'Concept Study: Analyze chemical reactions requiring atmospheric oxygen.', 'Hard'],
      ['Chapter 4: Material Degradation Control', 'Preventing unwanted oxidation: Protective coatings (painting, galvanizing steel with zinc) isolate metals from moist air.', 'Concept Study: Study anti-corrosion techniques and oxidation inhibitors.', 'Hard'],
      ['Chapter 5: Material Selection Lab', 'Worked Example: Copper is used in electrical wiring due to high electrical conductivity. Activity Exercise 1: Select optimal materials for 5 engineering tasks.', 'Example: Copper wiring analysis. Exercise: Complete material selection matrix.', 'Hard'],
      ['Chapter 6: 5 Rs Environmental Audit', 'Worked Example: Repair broken umbrellas and compost kitchen vegetable scraps. Activity Exercise 1: Categorize 10 household actions under correct R.', 'Example: Umbrella repair & composting. Exercise: Complete 5 Rs action plan.', 'Medium'],
      ['Chapter 7: Oxidation & Combustion Challenge', 'Worked Example: Iron nails rust when exposed to moist air containing oxygen. Activity Exercise 1: Identify 3 conditions required for rusting.', 'Example: Iron nail rusting experiment. Exercise: Complete chemical reaction quiz.', 'Hard']
    ]),
    living([
      ['Chapter 1: Human Reproductive Physiology & Puberty', 'Puberty involves endocrine-driven maturation of reproductive systems and development of secondary sex characteristics in males and females.', 'Concept Study: Detail human reproductive anatomy, endocrine hormones, and hygiene.', 'Hard'],
      ['Chapter 2: Angiosperm & Non-Flowering Reproduction', 'Flowering Plants (Angiosperms): Sexual reproduction via Pollination (transfer of pollen) and Fertilization. Non-Flowering Plants: Spore formation (Ferns/Mosses).', 'Concept Study: Contrast seed plant sexual reproduction with spore plant reproduction.', 'Hard'],
      ['Chapter 3: Animal Reproductive Strategies', 'Sexual Reproduction: Oviparous (egg-laying) vs Viviparous (live birth). Asexual Reproduction: Binary fission, budding, regeneration.', 'Concept Study: Classify animal reproductive modes and developmental strategies.', 'Hard'],
      ['Chapter 4: Estuary & Mangrove Ecosystems', 'Estuaries and mangrove swamps are high-biodiversity brackish water transitional zones acting as marine nurseries and coastal storm buffers.', 'Concept Study: Analyze ecological services and food webs in estuarine biomes.', 'Impossible'],
      ['Chapter 5: Puberty & Health Workshop', 'Worked Example: Secondary sex characteristics develop healthily during adolescence under hormonal control. Activity Exercise 1: List 4 puberty physical changes.', 'Example: Adolescence maturation overview. Exercise: Complete puberty health guide.', 'Hard'],
      ['Chapter 6: Plant Pollination Lab', 'Worked Example: Bees transfer pollen between flowers to enable seed and fruit development. Activity Exercise 1: Label flower parts (stamen, pistil, ovary).', 'Example: Bee pollination process. Exercise: Complete plant reproduction diagram.', 'Hard'],
      ['Chapter 7: Animal Modes & Ecosystem Challenge', 'Worked Example: Estuaries and mangroves serve as critical breeding grounds for aquatic species. Activity Exercise 1: Classify 8 animals as Oviparous or Viviparous.', 'Example: Estuary nursery function. Exercise: Complete ecosystem food web chart.', 'Impossible']
    ]),
    force([
      ['Chapter 1: Kinematics: Speed, Distance, Time', 'Speed ($v$) is rate of motion: $v = d/t$. Distance: $d = v \\times t$. Time: $t = d/v$. Units: meters per second (m/s) or kilometers per hour (km/h).', 'Concept Study: Calculate uniform linear motion parameters using kinematic equations.', 'Hard'],
      ['Chapter 2: Electrical Circuits: Series vs Parallel', 'Series Circuits: Single current path; total resistance $R_T = R_1 + R_2$; one open breaks circuit. Parallel Circuits: Multiple branches; independent operation.', 'Concept Study: Analyze voltage, current, and resistance in series and parallel circuits.', 'Hard'],
      ['Chapter 3: Electromagnetism Principles', 'An electric current flowing through a conductor generates a magnetic field. Coiling wire around a ferrous core forms an Electromagnet. Field strength increases with turns/current.', 'Concept Study: Master electromagnetic induction and field strength variables.', 'Impossible'],
      ['Chapter 4: Electrical Safety Systems', 'Fuses and circuit breakers interrupt excessive current flow to prevent electrical fires and equipment damage.', 'Concept Study: Review household electrical safety mechanisms.', 'Hard'],
      ['Chapter 5: Speed Calculation Lab', 'Worked Example: Bus traveling 120 km in 2 hours moves at $v = 120/2 = 60\\text{ km/h}$. Activity Exercise 1: Calculate speed for $d = 150\\text{ m}, t = 30\\text{ s}$. Exercise 2: Distance problem.', 'Example: $v = 120/2 = 60\\text{ km/h}$. Exercise: Solve 6 speed-distance-time problems.', 'Hard'],
      ['Chapter 6: Series vs Parallel Circuit Workshop', 'Worked Example: Household parallel wiring ensures turning off one switch leaves other lights on. Activity Exercise 1: Draw series vs parallel schematics.', 'Example: Parallel home wiring test. Exercise: Complete circuit analysis worksheet.', 'Hard'],
      ['Chapter 7: Electromagnet Construction Challenge', 'Worked Example: Wrap insulated wire around iron nail attached to D-cell battery to lift steel paperclips. Activity Exercise 1: Test clip pickup across 10 vs 30 wire coils.', 'Example: Nail electromagnet test. Exercise: Complete electromagnetism lab report.', 'Impossible']
    ]),
    earth([
      ['Chapter 1: Mechanical & Chemical Weathering', 'Mechanical Weathering: Physical disintegration without chemical change (frost wedging, root wedging). Chemical Weathering: Molecular breakdown (dissolution, oxidation).', 'Concept Study: Differentiate agents of mechanical breakdown vs chemical decay.', 'Hard'],
      ['Chapter 2: Tropical Cyclone Meteorology', 'Tropical Cyclones (Typhoons) are low-pressure systems forming over warm tropical oceans ($> 26.5^\\circ\\text{C}$). Structure: Eye, Eyewall, Rainbands. Hazards: Storm Surge, Heavy Rainfall.', 'Concept Study: Examine PAGASA tropical cyclone wind signals and storm surge dynamics.', 'Hard'],
      ['Chapter 3: Lunar Phases & Constellations', 'Moon Phases result from changing Sun-Earth-Moon orbital geometry over 29.5 days. Constellations are star patterns used for navigation and seasonal tracking.', 'Concept Study: Map 8 lunar phases and seasonal star constellation positions.', 'Impossible'],
      ['Chapter 4: Coastal Protection Engineering', 'Natural coastal protection (mangroves, coral reefs, sand dunes) mitigates storm surges and wave erosion better than artificial sea walls.', 'Concept Study: Evaluate bio-shield coastal defenses vs hard engineering structures.', 'Hard'],
      ['Chapter 5: Weathering Investigation Lab', 'Worked Example: Plant roots wedged into rock crevices split rock over time (mechanical weathering). Activity Exercise 1: Classify 6 weathering examples.', 'Example: Root wedging test. Exercise: Complete rock disintegration chart.', 'Hard'],
      ['Chapter 6: Typhoon Advisory Workshop', 'Worked Example: Understand storm surge warnings and PAGASA Typhoon Signal advisories. Activity Exercise 1: Match Signal levels (1-5) to expected wind speeds.', 'Example: PAGASA signal analysis. Exercise: Complete emergency cyclone plan.', 'Hard'],
      ['Chapter 7: Astronomy & Lunar Tracker', 'Worked Example: Track transition from New Moon to First Quarter, Full Moon, and Last Quarter. Activity Exercise 1: Plot 8 Moon phases on orbital diagram.', 'Example: Monthly lunar tracking log. Exercise: Complete astronomy matching sheet.', 'Impossible']
    ]),
  ],
  6: [
    math([
      ['Chapter 1: Integers & Signed Rational Numbers', 'Integers ($\\mathbb{Z}$) consist of positive whole numbers, negative whole numbers, and zero. Absolute Value ($|x|$): Distance from 0 on real number line.', 'Concept Study: Perform signed integer operations ($+,-,\\times,\\div$) and ordering.', 'Hard'],
      ['Chapter 2: Algebraic Expressions & Linear Equations', 'Algebraic Expressions combine variables, constants, and operators. Linear Equations ($ax + b = c$) state equivalences solved via inverse operations.', 'Concept Study: Solve single-variable linear equations and algebraic word problems.', 'Hard'],
      ['Chapter 3: Statistical Measures & Data Analysis', 'Data metrics: Mean ($\\bar{x} = \\frac{\\sum x}{n}$), Median (middle value), Mode (most frequent value), Range ($X_{\\max} - X_{\\min}$).', 'Concept Study: Calculate statistical central tendencies and construct bar/line graphs.', 'Impossible'],
      ['Chapter 4: Probability Theory Basics', 'Theoretical Probability $P(E) = \\frac{\\text{Favorable Outcomes}}{\\text{Total Possible Outcomes}}$. Range: $0 \\le P(E) \\le 1$.', 'Concept Study: Compute simple and compound event probabilities.', 'Hard'],
      ['Chapter 5: Integer Arithmetic Lab', 'Worked Example: Order set $\\{-8, +5, -2, 0, +3\\} \\rightarrow \\{-8, -2, 0, +3, +5\\}$. Submarine at $-30\\text{m}$ dives $20\\text{m}$ deeper $\\rightarrow -50\\text{m}$. Activity Exercise 1: Solve 10 integer problems.', 'Example: $-30 - 20 = -50$. Exercise: Complete signed integer worksheet.', 'Hard'],
      ['Chapter 6: Linear Equation Workshop', 'Worked Example: Solve $4x - 7 = 25 \\rightarrow 4x = 32 \\rightarrow x = 8$. Activity Exercise 1: Solve $3y + 5 = 26$. Exercise 2: Solve $5z - 12 = 18$. Exercise 3: Algebraic word problem.', 'Example: $4x - 7 = 25 \\rightarrow x = 8$. Exercise: Complete 8 linear equation problems.', 'Hard'],
      ['Chapter 7: Statistics & Probability Challenge', 'Worked Example: Mean score of $\\{85, 90, 88, 92, 95\\}$: $\\bar{x} = 450 / 5 = 90$. Activity Exercise 1: Find Mean, Median, Mode, Range for data set. Exercise 2: Calculate dice probability.', 'Example: Data mean calculation. Exercise: Complete statistics & probability test.', 'Impossible']
    ]),
    matter([
      ['Chapter 1: Mixtures & Physical Properties', 'A Mixture combines 2 or more substances that retain their chemical identities. Components are separated via physical methods without chemical reactions.', 'Concept Study: Examine physical mixture traits and component retention.', 'Medium'],
      ['Chapter 2: Homogeneous vs Heterogeneous Mixtures', 'Homogeneous Mixtures (Solutions): Uniform composition throughout; solute dissolves in solvent. Heterogeneous Mixtures (Suspensions/Colloids): Distinct phases visible.', 'Concept Study: Classify solutions, suspensions, and colloids.', 'Hard'],
      ['Chapter 3: Separation Techniques in Chemistry', 'Separation methods exploit physical property differences: Filtration (particle size), Evaporation (boiling point), Decantation (density), Magnetism (ferrous state), Distillation.', 'Concept Study: Master technical separation processes for complex mixtures.', 'Impossible'],
      ['Chapter 4: Solution Concentration & Solubility', 'Solubility is maximum solute dissolved in solvent at given temperature. States: Unsaturated, Saturated, Supersaturated.', 'Concept Study: Calculate concentration ratios and temperature solubility curves.', 'Hard'],
      ['Chapter 5: Mixture Classification Lab', 'Worked Example: Salt dissolved in water forms homogeneous solution; oil floating on water forms heterogeneous mixture. Activity Exercise 1: Classify 8 mixtures.', 'Example: Saltwater vs oil-water test. Exercise: Complete mixture classification sheet.', 'Hard'],
      ['Chapter 6: Separation Techniques Workshop', 'Worked Example: Separate sand and water through filtration; evaporate saltwater to isolate salt crystals; use magnet for iron filings. Activity Exercise 1: Match 5 mixtures to separation method.', 'Example: Filtration, evaporation, magnetism. Exercise: Complete lab procedure guide.', 'Impossible'],
      ['Chapter 7: Industrial Mixture Separation Challenge', 'Worked Example: Use fine mesh sieve to separate fine flour from coarse husks. Activity Exercise 1: Design 3-step separation plan for Sand + Salt + Iron filings mixture.', 'Example: Mesh sieving analysis. Exercise: Solve complex mixture separation puzzle.', 'Impossible']
    ]),
    living([
      ['Chapter 1: Human Organ Systems Interdependence', 'Human body systems work collaboratively: Digestive (nutrient extraction) $\\rightarrow$ Circulatory (transport) $\\rightarrow$ Respiratory (gas exchange) $\\rightarrow$ Nervous (control).', 'Concept Study: Detail systemic interactions supporting cellular metabolism.', 'Impossible'],
      ['Chapter 2: Vertebrate vs Invertebrate Zoology', 'Vertebrates (backbone): Mammals, Birds, Reptiles, Amphibians, Fish. Invertebrates (no backbone): Porifera, Cnidaria, Mollusca, Arthropoda, Annelida, Echinodermata.', 'Concept Study: Master comparative anatomy across major animal phyla.', 'Hard'],
      ['Chapter 3: Tropical Ecosystem Ecology', 'Tropical Rainforests, Coral Reefs, and Mangrove Swamps provide critical ecosystem services: biodiversity conservation, carbon sequestration, and shoreline protection.', 'Concept Study: Examine food webs, energy pyramids, and symbiotic relationships.', 'Impossible'],
      ['Chapter 4: Biodiversity Conservation', 'Human impacts (habitat destruction, pollution, invasive species, overexploitation) cause biodiversity loss requiring active conservation.', 'Concept Study: Review conservation strategies for threatened ecosystems.', 'Hard'],
      ['Chapter 5: Organ Systems Interaction Lab', 'Worked Example: Digestive system breaks down food; circulatory system transports nutrients to tissue cells; respiratory provides $O_2$. Activity Exercise 1: Trace $O_2$ path.', 'Example: Digestive-circulatory interaction. Exercise: Complete organ interaction matrix.', 'Impossible'],
      ['Chapter 6: Animal Kingdom Zoology Challenge', 'Worked Example: Carabao is a vertebrate mammal; sea anemone is an invertebrate cnidarian. Activity Exercise 1: Classify 10 species into 5 vertebrate classes or invertebrate phyla.', 'Example: Carabao vs anemone classification. Exercise: Complete zoology chart.', 'Hard'],
      ['Chapter 7: Ecosystem Ecology Workshop', 'Worked Example: Coral reefs protect shorelines from wave erosion and provide marine habitats. Activity Exercise 1: Construct food web for rainforest ecosystem.', 'Example: Coral reef protective function. Exercise: Complete ecosystem energy pyramid.', 'Impossible']
    ]),
    force([
      ['Chapter 1: Dynamics: Gravity & Friction Forces', 'Gravity pulls mass downward toward Earth ($F_g = mg$). Friction acts parallel to contact surfaces opposing sliding motion ($F_f = \\mu N$). Treaded soles increase friction.', 'Concept Study: Calculate gravitational force and surface friction coefficients.', 'Hard'],
      ['Chapter 2: Mechanical Energy: Potential & Kinetic', 'Mechanical Energy $E_m = PE + KE$. Potential Energy $PE = mgh$ (stored position). Kinetic Energy $KE = \\frac{1}{2}mv^2$ (motion). Energy transfers continuously.', 'Concept Study: Solve conservation of mechanical energy problems ($PE_1 + KE_1 = PE_2 + KE_2$).', 'Hard'],
      ['Chapter 3: The Six Simple Machines & Mechanical Advantage', 'Simple machines alter effort force via Mechanical Advantage ($MA = F_{\\text{output}} / F_{\\text{input}}$). 6 Machines: Lever, Inclined Plane, Wedge, Screw, Wheel-and-Axle, Pulley.', 'Concept Study: Calculate mechanical advantage for compound machine systems.', 'Impossible'],
      ['Chapter 4: Energy Transformation Laws', 'Law of Conservation of Energy: Energy cannot be created or destroyed, only transformed between Radiant, Electrical, Chemical, Thermal, and Mechanical forms.', 'Concept Study: Trace multi-step energy conversions across technological devices.', 'Hard'],
      ['Chapter 5: Gravity & Friction Friction Workshop', 'Worked Example: Treaded shoe soles increase friction to prevent slipping on smooth wet surfaces. Activity Exercise 1: Calculate $PE$ of $2\\text{kg}$ weight held $5\\text{m}$ high ($PE = 2 \\times 9.8 \\times 5 = 98\\text{ J}$).', 'Example: Tread friction & $PE = mgh$. Exercise: Solve 6 mechanical force problems.', 'Hard'],
      ['Chapter 6: Energy Transformation Lab', 'Worked Example: Pendulum possesses max $PE$ at peak height and max $KE$ at lowest swing point. Solar panels convert radiant light directly into electrical energy.', 'Example: Pendulum $PE-KE$ transfer & solar cells. Exercise: Trace 5 energy transformation paths.', 'Hard'],
      ['Chapter 7: Simple Machines Engineering Challenge', 'Worked Example: Use double-pulley system ($MA = 2$) to hoist heavy container with half effort force. Activity Exercise 1: Calculate $MA$ for $4\\text{m}$ ramp rising $1\\text{m}$ ($MA = 4/1 = 4$).', 'Example: Pulley mechanical advantage. Exercise: Complete machine engineering set.', 'Impossible']
    ]),
    earth([
      ['Chapter 1: Tectonic Plate Dynamics', 'Earth\'s lithosphere is divided into tectonic plates driven by mantle convection currents. Plate Boundaries: Convergent (collision/subduction), Divergent (spreading), Transform (sliding).', 'Concept Study: Map plate boundaries to mountain building, trenches, and rift valleys.', 'Impossible'],
      ['Chapter 2: Seismology & Volcanism', 'Earthquakes release accumulated elastic strain energy along geological faults (Focus & Epicenter). Volcanism occurs where magma pierces crust.', 'Concept Study: Analyze seismic wave propagation ($P$ & $S$ waves) and volcanic landforms.', 'Hard'],
      ['Chapter 3: Solar System Architecture', 'The Solar System consists of Sun, 8 Planets (Terrestrial: Mercury, Venus, Earth, Mars; Gas/Ice Giants: Jupiter, Saturn, Uranus, Neptune), moons, asteroids, comets.', 'Concept Study: Compare planetary orbits, rotational periods, and spatial scale.', 'Impossible'],
      ['Chapter 4: Earthquake Safety Protocols', 'Disaster risk reduction requires understanding seismic hazards and practicing "Drop, Cover, and Hold On" during earthquake emergencies.', 'Concept Study: Formulate earthquake safety drills and evacuation procedures.', 'Hard'],
      ['Chapter 5: Plate Tectonics Geology Lab', 'Worked Example: Plate collision along convergent boundaries forms mountain ranges (Himalayas) and deep ocean trenches. Activity Exercise 1: Classify 3 boundary types.', 'Example: Convergent boundary landforms. Exercise: Complete plate geology sheet.', 'Impossible'],
      ['Chapter 6: Seismology & Emergency Drill Workshop', 'Worked Example: Practice "Drop, Cover, and Hold On" during earthquake emergency drills. Activity Exercise 1: Differentiate Earthquake Focus vs Epicenter.', 'Example: Earthquake safety drill. Exercise: Complete disaster preparedness guide.', 'Hard'],
      ['Chapter 7: Solar System Astronomy Challenge', 'Worked Example: Earth\'s 24-hour axial rotation creates day/night; $365.25$-day revolution creates full year. Activity Exercise 1: Rank 8 planets by distance from Sun.', 'Example: Planetary rotation & revolution. Exercise: Complete solar system map worksheet.', 'Impossible']
    ]),
  ],
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