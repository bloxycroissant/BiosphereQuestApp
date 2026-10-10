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
      ['Counting and Number Sense', 'Numbers represent quantities up to 100 and can be compared using terms like more, fewer, or equal.', 'Count 12 calamansi fruits and show that 12 is greater than 8.', 'Easy'],
      ['Shapes and Patterns', '2D shapes (circles, triangles, squares, rectangles) have distinct attributes and create repeating patterns.', 'Continue a repeating tile pattern: circle, square, triangle, circle, square.', 'Easy'],
      ['Addition and Subtraction', 'Addition joins sets together while subtraction separates or takes away parts from a set.', 'Solve 7 + 5 using counters or finger counting, and evaluate 9 - 4.', 'Medium']
    ]),
    matter([
      ['Colors, Shapes, and Sizes', 'Objects in our surroundings can be classified by basic physical attributes such as color, shape, and size.', 'Sort classroom materials into big red blocks and small blue counters.', 'Easy'],
      ['Texture and Hardness', 'Objects feel different when touched; surfaces can be rough or smooth, and materials can be soft or hard.', 'Compare a rough coconut husk with a smooth plastic tray.', 'Easy'],
      ['Sorting and Grouping', 'Objects can be sorted into distinct sets based on one or more observable physical properties.', 'Group local leaves by size first, then regroup them by color.', 'Medium']
    ]),
    living([
      ['The Five Senses', 'Our eyes, ears, nose, tongue, and skin allow us to observe, discover, and describe our environment.', 'Use your skin to feel warm water and your nose to smell a sampaguita flower.', 'Easy'],
      ['Living and Non-living', 'Living things grow, move on their own, and need food/water, while non-living things do not.', 'A pet dog is a living organism; a wooden chair is a non-living object.', 'Easy'],
      ['Plant Parts and Needs', 'Roots, stems, leaves, and flowers help plants grow; plants need air, water, sunlight, and soil.', 'Observe how roots absorb water from soil while leaves face toward sunlight.', 'Medium']
    ]),
    force([
      ['Pushes and Pulls', 'Forces are pushes or pulls that can make stationary objects move or stop moving objects.', 'Push a toy jeepney to make it move forward or pull it back with a string.', 'Easy'],
      ['Ways Things Move', 'Objects move in various directions: straight, curved, zig-zag, fast, or slow.', 'Roll a marble straight down a wooden ramp, then guide it in a zig-zag line.', 'Easy'],
      ['Light and Sound', 'Light enables vision and sound is heard; both come from natural or man-made sources.', 'The Sun provides light during daytime; a fiesta drum produces sound when hit.', 'Medium']
    ]),
    earth([
      ['The Day and Night Sky', 'The sky changes from day to night; the Sun shines during the day, while the Moon and stars appear at night.', 'Draw the Sun in the daytime sky and the Moon with stars at night.', 'Easy'],
      ['Weather Words', 'Weather changes daily and can be described as sunny, rainy, windy, or cloudy.', 'Identify if today requires an umbrella (rainy) or a sun hat (sunny).', 'Easy'],
      ['Caring for Our Surroundings', 'Keeping homes, school grounds, and waterways clean protects living habitats.', 'Segregate food scraps from plastic trash and keep school grounds clean.', 'Medium']
    ]),
  ],
  2: [
    math([
      ['Place Value to 1,000', 'A digit’s value depends on its place in a number: hundreds, tens, or ones.', 'In 583, the digit 8 has a value of 80 (8 tens).', 'Easy'],
      ['Addition and Subtraction Strategies', 'Multi-digit numbers can be added and subtracted using mental math, expanded form, or regrouping.', 'Calculate 347 + 185 by regrouping ones and tens.', 'Medium'],
      ['Shapes and Measurement', '2D and 3D shapes have specific features (sides, corners, faces), and lengths can be measured in meters or centimeters.', 'Measure a study notebook using a centimeter ruler.', 'Medium']
    ]),
    matter([
      ['Solids and Liquids', 'Solids retain a definite shape and volume, whereas liquids flow and take the shape of their container.', 'Pouring fruit juice into a tall glass changes its shape but keeps its volume.', 'Easy'],
      ['Strength and Flexibility', 'Materials vary in durability and flexibility; some bend easily without breaking while others stay rigid.', 'A rubber band stretches and bends easily, while a bamboo stick is rigid.', 'Medium'],
      ['Absorbing and Melting', 'Porous materials absorb liquids, while heat can cause solid substances like ice or wax to melt.', 'A cotton cloth absorbs spilled water quickly, whereas plastic repels it.', 'Medium']
    ]),
    living([
      ['What Plants Need', 'Plants require appropriate amounts of sunlight, clean air, water, and nutrient-rich soil to grow healthily.', 'Compare a watered plant kept in sunlight with a dark, dry plant.', 'Easy'],
      ['Animal Habitats', 'Habitats (land, water, air) supply animals with shelter, food, water, and space for survival.', 'A milkfish (bangus) lives in water, while a Philippine eagle lives in forest canopy trees.', 'Medium'],
      ['Animal Groups and Parents', 'Animals can be classified according to body coverings and diets; offspring resemble their adult parents.', 'A chick hatches from an egg and grows into a hen or rooster.', 'Medium']
    ]),
    force([
      ['Pushes Change Distance', 'Applying a stronger push or pull causes an object to travel a greater distance.', 'Kick a soccer ball gently, then kick it with greater force to compare distances.', 'Medium'],
      ['Static Electricity', 'Friction between certain materials can transfer electrical charges, causing small electrostatic attractions.', 'Rub a plastic comb on dry hair to pick up small bits of paper.', 'Medium'],
      ['Magnetic Forces', 'Magnets exert non-contact forces, attracting magnetic materials like iron while repelling like magnetic poles.', 'Test whether a magnet attracts paperclips, wooden sticks, or aluminum cans.', 'Hard']
    ]),
    earth([
      ['Landforms and Water Bodies', 'Earth’s surface consists of landforms (mountains, volcanoes, valleys) and water bodies (rivers, lakes, seas).', 'Locate Mount Mayon and the Pasig River on a map of the Philippines.', 'Medium'],
      ['Weather and Daily Choices', 'Daily weather influences decisions regarding clothing, safety precautions, and outdoor activities.', 'Wear a raincoat on typhoon days and light cotton clothes during summer.', 'Easy'],
      ['Seasonal Weather Patterns', 'Weather patterns and sunlight duration change predictably across wet and dry seasons.', 'Observe that heavy rain happens frequently during wet season months.', 'Hard']
    ]),
  ],
  3: [
    math([
      ['Multiplication and Division', 'Multiplication represents repeated addition of equal groups; division represents equal sharing or grouping.', 'Multiply 7 x 8 = 56 and divide 56 mangos equally among 8 children.', 'Medium'],
      ['Fractions on a Number Line', 'Fractions represent equal parts of a whole or set and can be plotted between whole numbers on a line.', 'Mark 1/2, 2/4, and 3/4 accurately on a number line from 0 to 1.', 'Medium'],
      ['Area and Perimeter', 'Perimeter is the total distance around a shape; area is the space enclosed inside measured in square units.', 'A square vegetable garden with 4m sides has perimeter 16m and area 16 sq m.', 'Hard']
    ]),
    matter([
      ['Solids, Liquids, and Gases', 'Matter exists in three primary states defined by mass, shape, volume, and particle movement.', 'Water exists as ice (solid), water (liquid), and steam/vapor (gas).', 'Medium'],
      ['Physical Properties', 'Mass, texture, hardness, flexibility, and temperature help identify and classify substances.', 'Measure liquid volume with a graduated cylinder and observe texture changes.', 'Medium'],
      ['Changes of State', 'Temperature changes cause matter to undergo physical changes: melting, freezing, evaporation, and condensation.', 'Water vapor condenses into droplets on cold metal lids.', 'Hard']
    ]),
    living([
      ['Sense Organs and Functions', 'Human sense organs (eyes, ears, nose, tongue, skin) transmit sensory information to the brain for interpretation.', 'The retina receives light signals and the auditory nerve transmits sound signals.', 'Medium'],
      ['Plant and Animal Groups', 'Organisms are grouped by physical attributes: flowering/non-flowering plants; vertebrates/invertebrates.', 'Classify ferns, orchids, milkfish, and dragonflies into major categories.', 'Medium'],
      ['Animal Life Cycles', 'Animals undergo sequential stages of development from birth/egg to mature, reproducing adults.', 'A mosquito develops through egg, larva (wriggler), pupa, and adult stages.', 'Hard']
    ]),
    force([
      ['Push, Pull, and Gravity', 'Force causes changes in motion; gravity pulls objects downward toward the center of Earth.', 'A ripe mango falling from a tree branch is pulled down by gravity.', 'Medium'],
      ['Light Sources', 'Light comes from natural sources (Sun, stars) or artificial sources (bulbs, candles) and travels in straight lines.', 'Shine a flashlight through clear glass, wax paper, and cardboard.', 'Medium'],
      ['Sound and Heat', 'Vibrations produce sound energy; thermal energy moves naturally from warmer objects to cooler ones.', 'A plucked guitar string vibrates to make sound; heat warms a cold spoon in hot soup.', 'Hard']
    ]),
    earth([
      ['Soil, Water, and Rocks', 'Earth consists of rocks, water bodies, and soils (sandy, clay, loam) that support life.', 'Compare water retention in clay soil versus fertile garden loam soil.', 'Medium'],
      ['Weather Safety', 'Monitoring weather forecasts helps communities prepare for heavy rainfall, flooding, and tropical storms.', 'Secure loose roof sheets and prepare emergency bags before a typhoon hits.', 'Medium'],
      ['The Sun, Moon, and Stars', 'Celestial bodies exhibit predictable motion patterns in the sky day and night.', 'Observe and record the visible shapes of the Moon over a one-month cycle.', 'Hard']
    ]),
  ],
  4: [
    math([
      ['Multi-digit Operations', 'Standard algorithms and place value strategies enable efficient multiplication and division of large whole numbers.', 'Calculate 4,328 ÷ 16 and verify the quotient using multiplication.', 'Hard'],
      ['Equivalent Fractions and Decimals', 'Fractions and decimals are alternate ways to express fractional parts of whole numbers.', 'Convert 3/5 into 6/10 and express it as the decimal 0.6.', 'Hard'],
      ['Angles and Geometry', 'Angles (acute, right, obtuse) describe geometric turns; polygons are classified by side lengths and interior angles.', 'Identify a right angle (90°) in a window frame and measure it with a protractor.', 'Medium']
    ]),
    matter([
      ['Absorption and Floating', 'Materials interact with water based on density and porosity; some absorb water while others float or sink.', 'Test whether a dry sponge, coin, wooden block, and pumice stone sink or float.', 'Medium'],
      ['Decay and Decomposition', 'Biodegradable wastes break down naturally through decomposers, while non-biodegradable wastes persist.', 'Compare how fruit peels decay in soil while plastic wrappers remain unchanged.', 'Hard'],
      ['Physical and Chemical Changes', 'Physical changes alter form without changing composition; chemical changes produce new chemical substances.', 'Tearing paper is a physical change; burning wood into ash is a chemical change.', 'Hard']
    ]),
    living([
      ['Internal Organs and Health', 'Major human body systems (brain, heart, lungs, stomach, intestines, bones, muscles) sustain life.', 'The lungs absorb oxygen and the heart pumps oxygenated blood throughout the body.', 'Hard'],
      ['Habitat Adaptations', 'Organisms possess specialized structural and behavioral adaptations suited for survival in specific biomes.', 'Mangrove trees have stilt roots for stability in muddy tidal waters.', 'Hard'],
      ['Metamorphosis', 'Insects undergo complete (egg, larva, pupa, adult) or incomplete (egg, nymph, adult) metamorphosis.', 'A butterfly undergoes complete metamorphosis; a grasshopper undergoes incomplete metamorphosis.', 'Medium']
    ]),
    force([
      ['Force Changes Motion and Shape', 'Applying force to an object can alter its speed, direction of movement, or physical shape.', 'Squeezing an empty plastic bottle changes its shape; hitting a shuttlecock changes its direction.', 'Medium'],
      ['Simple Machines and Safety', 'Inclined planes, levers, wedges, screws, pulleys, and wheel-and-axles make work easier.', 'Use a wooden ramp (inclined plane) to push heavy furniture into a truck easily.', 'Hard'],
      ['Light, Sound, and Heat Transfer', 'Energy transfers across systems through conduction, convection, radiation, reflection, and absorption.', 'Heat conducts through a metal pan; light reflects off a flat glass mirror.', 'Hard']
    ]),
    earth([
      ['Soil and Erosion', 'Flowing water, wind, and human activities cause soil erosion; plant root systems prevent topsoil loss.', 'Planting trees and vetiver grass on hillsides reduces soil erosion during heavy rains.', 'Hard'],
      ['The Water Cycle', 'Solar energy drives the continuous global movement of water via evaporation, transpiration, condensation, and precipitation.', 'Water evaporates from ocean surfaces, condenses into clouds, and falls as rain.', 'Medium'],
      ['Weather Instruments', 'Meteorological instruments (thermometer, rain gauge, wind vane, anemometer) measure weather variables.', 'Record wind speed with an anemometer and daily rainfall with a rain gauge.', 'Hard']
    ]),
  ],
  5: [
    math([
      ['Fractions, Decimals, and Percentages', 'Fractions, decimals, and percentages express proportional values of a whole quantity.', 'Convert 4/5 into decimal 0.80 and percentage 80%.', 'Hard'],
      ['Ratios and Proportions', 'A ratio compares two quantities; equal ratios form a proportion that can solve scaled real-world problems.', 'In a recipe requiring 2 cups of sugar for 5 cups of flour, calculate flour needed for 6 cups of sugar.', 'Hard'],
      ['Volume and Coordinate Grids', 'Volume measures 3D space in cubic units; points on a coordinate plane are located using ordered pairs (x, y).', 'Find the volume of a rectangular box (V = l × w × h) measuring 6cm × 4cm × 3cm.', 'Hard']
    ]),
    matter([
      ['Materials and Their Uses', 'Physical and chemical properties determine whether materials are suitable for construction, clothing, or electronics.', 'Copper is used in electrical wiring because of its high electrical conductivity.', 'Hard'],
      ['The Five Rs', 'Environmental management applies Reduce, Reuse, Recycle, Repair, and Rot to minimize waste.', 'Repair broken umbrellas and compost vegetable kitchen scraps.', 'Medium'],
      ['Heat and Oxygen Changes', 'Combustion and rusting are chemical processes driven by heat and reaction with oxygen.', 'Iron nails rust when exposed to moist air containing oxygen.', 'Hard']
    ]),
    living([
      ['Human Growth and Puberty', 'Puberty involves physical, emotional, and social transformations as reproductive systems mature.', 'Development of secondary sex characteristics during adolescence is healthy and normal.', 'Hard'],
      ['Plant Reproduction', 'Flowering plants undergo pollination, fertilization, seed production, and dispersal; non-flowering plants use spores.', 'Bees transfer pollen between flowers to enable seed and fruit development.', 'Hard'],
      ['Animal Reproduction and Ecosystems', 'Animals reproduce sexually (oviparous or viviparous) or asexually; interspecies relationships support food webs.', 'Estuaries and mangrove swamps act as breeding grounds for aquatic animals.', 'Impossible']
    ]),
    force([
      ['Speed, Distance, and Time', 'Speed measures distance traveled per unit time ($v = d/t$).', 'A bus traveling 120 kilometers in 2 hours moves at an average speed of 60 km/h.', 'Hard'],
      ['Series and Parallel Circuits', 'Series circuits have a single current path; parallel circuits have multiple independent branches.', 'In household parallel wiring, turning off one light switch leaves other lights operational.', 'Hard'],
      ['Electromagnets', 'An electric current flowing through a wire coil wrapped around an iron core creates a temporary magnetic field.', 'Wrap insulated wire around an iron nail and attach it to a D-cell battery to lift steel paperclips.', 'Impossible']
    ]),
    earth([
      ['Weathering and Soil Erosion', 'Mechanical and chemical weathering break down rocks; wind and water transport eroded sediments.', 'Plant roots wedged into rock crevices split the rock apart over time.', 'Hard'],
      ['Tropical Cyclones', 'Tropical cyclones (typhoons) form over warm ocean waters, bringing destructive winds and heavy rainfall.', 'Understand storm surge warnings and PAGASA weather advisories.', 'Hard'],
      ['Moon Phases and Constellations', 'Moon phases result from changing lunar angles relative to Earth and Sun; star patterns form constellations.', 'Track the transition from New Moon to First Quarter, Full Moon, and Last Quarter.', 'Impossible']
    ]),
  ],
  6: [
    math([
      ['Integers and Rational Numbers', 'Integers include positive numbers, negative numbers, and zero; they are placed on real number lines.', 'Order the set {-8, +5, -2, 0, +3} from least to greatest value.', 'Hard'],
      ['Expressions and Equations', 'Algebraic expressions combine constants, variables, and operations; equations state two expressions are equal.', 'Solve for $x$ in $4x - 7 = 25$.', 'Hard'],
      ['Statistics and Probability', 'Statistical measures (mean, median, mode, range) analyze data; probability quantifies event likelihood.', 'Determine the mean score of test results: {85, 90, 88, 92, 95}.', 'Impossible']
    ]),
    matter([
      ['Mixtures and Their Properties', 'A mixture combines two or more physical substances that maintain their original chemical properties.', 'A mixture of sand and water can be separated through filtration.', 'Medium'],
      ['Homogeneous and Heterogeneous Mixtures', 'Homogeneous mixtures (solutions) appear uniform throughout; heterogeneous mixtures have distinguishable phases.', 'Salt dissolved in water forms a solution; oil floats on water forming a heterogeneous mixture.', 'Hard'],
      ['Separating Mixtures', 'Mixtures are separated using techniques such as decantation, filtration, evaporation, distillation, and magnetism.', 'Evaporate saltwater to isolate salt crystals or use a magnet to extract iron filings from sand.', 'Impossible']
    ]),
    living([
      ['Organ System Interactions', 'Human body systems (circulatory, respiratory, digestive, nervous, excretory) interact collaboratively.', 'The digestive system breaks down food into nutrients, which the circulatory system transports to tissue cells.', 'Impossible'],
      ['Vertebrates and Invertebrates', 'Animals are classified as vertebrates (mammals, birds, reptiles, amphibians, fish) or invertebrates.', 'Identify a carabao as a vertebrate mammal and a sea anemone as an invertebrate.', 'Hard'],
      ['Rainforests, Reefs, and Mangroves', 'Tropical rainforests, coral reefs, and mangrove forests provide ecological services and rich biodiversity.', 'Coral reefs protect shorelines from wave action and provide habitats for marine species.', 'Impossible']
    ]),
    force([
      ['Gravity and Friction', 'Gravity pulls objects toward Earth\'s center; friction acts parallel to surfaces opposing motion.', 'Treaded shoe soles increase friction to prevent slipping on smooth wet surfaces.', 'Hard'],
      ['Potential and Kinetic Energy', 'Mechanical energy transitions between stored potential energy and active kinetic energy.', 'A pendulum possesses maximum potential energy at its highest peak and maximum kinetic energy at its lowest point.', 'Hard'],
      ['Six Simple Machines', 'Levers, inclined planes, wedges, screws, wheel-and-axles, and pulleys modify mechanical advantage.', 'Use a double-pulley system to hoist a heavy container upward with reduced input effort.', 'Impossible']
    ]),
    earth([
      ['Plate Tectonics', 'Earth\'s lithosphere consists of tectonic plates whose convergent, divergent, and transform movements shape geology.', 'Plate collision along convergent boundaries forms mountain ranges and ocean trenches.', 'Impossible'],
      ['Earthquakes and Volcanoes', 'Energy releases along faults trigger earthquakes; magma pressure creates volcanic eruptions.', 'Practice "Drop, Cover, and Hold On" during earthquake emergency drills.', 'Hard'],
      ['The Solar System and Space Exploration', 'The Solar System consists of the Sun, planets, moons, asteroids, and comets bound by gravity.', 'Earth\'s rotation on its axis creates day and night; its revolution around the Sun creates a full year.', 'Impossible']
    ]),
  ],
};

const expandedMath: Record<number, LessonInput[]> = {
  1: [
    ['Ordinal Numbers', 'Ordinal numbers identify the relative position of objects in an ordered sequence (1st, 2nd, 3rd, 4th, etc.).', 'In the word "PHILIPPINES", P is 1st, H is 2nd, and I is 3rd.', 'Easy'],
    ['Fractions', 'Fractions describe one or more equal parts of a single whole unit or set.', 'Fold a paper square in half equally to demonstrate 1/2.', 'Easy'],
    ['Time and Measurement', 'Non-standard and standard tools measure lengths; analog clocks display hours and half-hours.', 'Measure desk length using paperclips, and read 4:00 on an analog clock face.', 'Medium'],
    ['Pictographs', 'Pictographs present categorized counts using picture symbols with defined keys.', 'If 1 drawn apple symbol equals 2 real apples, 3 symbols represent 6 apples.', 'Easy'],
  ],
  2: [
    ['Multiplication and Division Concepts', 'Multiplication models equal arrays/groups; division models equal sharing into groups.', '4 groups of 5 mangos equals 20 mangos ($4 \\times 5 = 20$).', 'Medium'],
    ['Symmetry and Shapes', 'A shape possesses line symmetry if a center dividing line reflects identical folding halves.', 'Draw a line of symmetry down the middle of a leaf or isosceles triangle.', 'Medium'],
    ['Bar Graphs and Probability', 'Bar graphs represent comparative quantities visually; simple probability predicts outcome likelihood.', 'Construct a vertical bar graph showing students\' favorite fruits.', 'Hard'],
  ],
  3: [
    ['Multiplication and Division Facts', 'Mastery of basic multiplication tables and inverse division facts solves complex operations.', 'Multiply $12 \\times 6 = 72$ and divide $72 \\div 6 = 12$.', 'Medium'],
    ['Equivalent Fractions', 'Equivalent fractions represent identical numerical values despite different numerators and denominators.', 'Show that 1/2, 2/4, and 4/8 represent equal shaded region areas.', 'Medium'],
    ['Lines, Angles, Area, and Perimeter', 'Geometric lines can be parallel, intersecting, or perpendicular; perimeter and area quantify boundary and surface.', 'Calculate the area ($6 \\text{ cm} \\times 3 \\text{ cm} = 18 \\text{ cm}^2$) and perimeter ($18 \\text{ cm}$) of a rectangle.', 'Hard'],
    ['Tally Charts', 'Tally charts record frequencies in clustered groups of 5 for efficient data collection.', 'Count 13 survey responses using two sets of 5 tallies and 3 single tallies.', 'Easy'],
  ],
  4: [
    ['Factors, Multiples, GCF, and LCM', 'Factors divide numbers without remainders; Greatest Common Factor (GCF) and Least Common Multiple (LCM) solve numeric problems.', 'The GCF of 12 and 18 is 6; the LCM of 4 and 6 is 12.', 'Hard'],
    ['Fractions and Decimals', 'Fractions and decimals convert back and forth; fractional operations require common denominators.', 'Add $1/4 + 2/4 = 3/4$ and write 0.75 as the fraction $3/4$.', 'Hard'],
    ['Order of Operations', 'The PMDAS/GMDAS convention defines precedence rules for multi-operation arithmetic expressions.', 'Evaluate $15 + (8 \\times 2) \\div 4 = 15 + 16 \\div 4 = 19$.', 'Hard'],
    ['Area and Elapsed Time', 'Area formulas quantify 2D polygon space; elapsed time measures total duration between start and end times.', 'Calculate elapsed time between 8:15 AM and 11:45 AM (3 hours 30 minutes).', 'Hard'],
  ],
  5: [
    ['Decimals, Ratios, and Percentages', 'Decimals, ratios, and percentages express relative parts, proportions, and percentage values.', 'Calculate a 15% tip or discount on a 200 pesos meal bill.', 'Hard'],
    ['Polygons and Circles', 'Polygons are closed plane figures with straight line segments; circles are measured by radius, diameter, and circumference.', 'Calculate the circumference ($C = \\pi d$) of a circle with a 10 cm diameter.', 'Hard'],
    ['Expressions and Area', 'Algebraic expressions evaluate unknown variables; composite geometric shapes combine area formulas.', 'Evaluate $3x + 5$ when $x = 4$ ($3(4) + 5 = 17$).', 'Impossible'],
    ['Pie Charts', 'Pie charts (circle graphs) display numerical data proportional to 360-degree sector angles.', 'Interpret a pie chart showing household expenditure allocation.', 'Medium'],
  ],
  6: [
    ['Integers and Word Problems', 'Real-world situations involving elevation, temperature, or financial debt are represented by signed integers.', 'A submarine at -30 meters diving down 20 more meters reaches -50 meters.', 'Hard'],
    ['Similarity and Scale', 'Similar figures share equal corresponding interior angles and proportional corresponding side lengths.', 'A 1:50 scale model map represents a 100-meter field as 2 meters on paper.', 'Hard'],
    ['Linear Equations', 'Linear equations express balanced algebraic equivalences solved by inverse arithmetic operations.', 'Solve $5y - 8 = 22$ by adding 8 and dividing by 5 ($y = 6$).', 'Hard'],
    ['Volume, Speed, and Statistics', '3D volume ($V$), uniform speed ($s = d/t$), and statistical data metrics summarize quantitative measures.', 'Compute the average speed of a car covering 180 km in 3 hours ($60 \\text{ km/h}$).', 'Impossible'],
  ],
};

const expandedScience: Record<number, LessonInput[]> = {
  1: [
    ['Texture and Grouping', 'Objects can be observed and grouped according to sensory traits like rough, smooth, hard, or soft.', 'Group smooth glass marbles separately from rough gravel stones.', 'Easy'],
    ['Needs of Living Things', 'Living organisms require basic survival elements: fresh air, clean water, nourishment, and shelter.', 'A growing pet kitten requires food, clean water, air, and warm shelter.', 'Easy'],
  ],
  2: [
    ['Changes of Matter', 'Thermal energy transfer alters matter phase states reversibly or irreversibly.', 'Ice melts when exposed to heat; liquid water freezes when cooled in a freezer.', 'Medium'],
    ['Habitats and Diets', 'Animals inhabit suited terrestrial or aquatic habitats and are categorized as herbivores, carnivores, or omnivores.', 'A carabao eats grass (herbivore); a tarsier eats insects (carnivore).', 'Medium'],
    ['Electricity and Magnetism', 'Static electric charge separation attracts light materials; magnetic fields exert forces on ferrous metals.', 'A charged plastic ruler attracts small torn paper scraps.', 'Hard'],
  ],
  3: [
    ['Three States of Matter', 'Solids retain fixed shape; liquids flow and match container shapes; gases expand to fill total volume.', 'Identify a wooden desk as solid, coconut oil as liquid, and air inside a tire as gas.', 'Medium'],
    ['Animal Life Cycles', 'Organisms undergo distinct developmental life stages from birth to reproduction and death.', 'Trace the life cycle of a frog: egg, tadpole, young froglet, adult frog.', 'Hard'],
    ['Gravity and Soil', 'Earth\'s gravitational pull pulls mass toward its center; soil composed of weathered rock and organic matter supports plant growth.', 'A mango drops straight down due to gravity; sandy soil drains water faster than clay soil.', 'Hard'],
  ],
  4: [
    ['Physical and Chemical Changes', 'Physical changes preserve original molecular identity; chemical changes alter atomic structure forming new substances.', 'Boiling water is physical; rusting an iron gate exposed to rain is chemical.', 'Hard'],
    ['Organ Systems and Adaptations', 'Skeletal and muscular systems provide structure and movement; evolutionary adaptations aid survival in specific habitats.', 'Bones protect internal organs and work with skeletal muscles to enable walking.', 'Hard'],
    ['The Water Cycle', 'Evaporation, transpiration, condensation, and precipitation drive global water recycling.', 'Sunlight evaporates ocean water into vapor, forming clouds that precipitate rain.', 'Medium'],
  ],
  5: [
    ['The Five Rs', 'Applying Refuse, Reduce, Reuse, Recycle, and Repair decreases solid waste environmental impact.', 'Reuse glass jars as storage containers and repair torn clothes.', 'Medium'],
    ['Plant Reproduction', 'Sexual reproduction in plants occurs via flower pollination and seed formation; vegetative propagation occurs asexually.', 'Butterflies transport pollen between flowers to facilitate cross-pollination.', 'Hard'],
    ['Series and Parallel Circuits', 'Electrical circuits connect components in single paths (series) or multiple branching sub-paths (parallel).', 'Bulbs in parallel remain lit when one bulb burns out or is removed.', 'Hard'],
    ['Weathering and Erosion', 'Physical and chemical weathering disintegrate rocks; surface water runoff and wind transport loose sediments.', 'Ocean waves wear away coastal rock cliffs over time through mechanical weathering.', 'Hard'],
  ],
  6: [
    ['Separating Mixtures', 'Mixture separation techniques exploit physical property differences like particle size, boiling point, or magnetism.', 'Use a fine mesh sieve to separate fine flour grains from coarse husks.', 'Hard'],
    ['Body System Interactions', 'Interactive body systems (respiratory, circulatory, digestive) supply oxygen and nutrients while purging metabolic waste.', 'The lungs take in oxygen, which red blood cells transport throughout the body.', 'Impossible'],
    ['Energy Transformations', 'The law of conservation of energy states energy converts between mechanical, chemical, electrical, thermal, and radiant forms.', 'A solar panel converts solar radiant energy directly into electrical energy.', 'Hard'],
    ['Plate Tectonics and Space', 'Tectonic plate boundary interactions create geological structures; planetary rotation and revolution cause cycles.', 'Earth\'s 24-hour axial rotation produces day and night.', 'Impossible'],
  ],
};

const scienceSubjectByLesson: Record<string, string> = {
  'Texture and Grouping': 'Matter',
  'Needs of Living Things': 'Living Things & Environment',
  'Changes of Matter': 'Matter',
  'Habitats and Diets': 'Living Things & Environment',
  'Electricity and Magnetism': 'Force, Motion, & Energy',
  'Three States of Matter': 'Matter',
  'Animal Life Cycles': 'Living Things & Environment',
  'Gravity and Soil': 'Force, Motion, & Energy',
  'Physical and Chemical Changes': 'Matter',
  'Organ Systems and Adaptations': 'Living Things & Environment',
  'The Water Cycle': 'Earth & Space',
  'The Five Rs': 'Matter',
  'Plant Reproduction': 'Living Things & Environment',
  'Series and Parallel Circuits': 'Force, Motion, & Energy',
  'Weathering and Erosion': 'Earth & Space',
  'Separating Mixtures': 'Matter',
  'Body System Interactions': 'Living Things & Environment',
  'Energy Transformations': 'Force, Motion, & Energy',
  'Plate Tectonics and Space': 'Earth & Space',
};

for (const grade of Object.keys(notebookCurriculum).map(Number)) {
  const mathSubject = notebookCurriculum[grade].find((item) => item.title === 'Math');
  if (mathSubject) mathSubject.lessons.push(...lessonList(expandedMath[grade]));
  for (const lesson of lessonList(expandedScience[grade])) {
    const target = notebookCurriculum[grade].find((item) => item.title === scienceSubjectByLesson[lesson.title]);
    target?.lessons.push(lesson);
  }
}