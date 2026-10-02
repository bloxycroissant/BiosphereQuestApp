export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Impossible';

export type Lesson = { title: string; meaning: string; example: string; difficulty: Difficulty };
export type Subject = { title: string; icon: string; color: string; lessons: Lesson[] };

export const curriculumStandards = {
  mathematics: {
    primary: 'DepEd K to 12 Mathematics Curriculum Guide, Grades 1-6',
    international: 'Common Core State Standards for Mathematics',
    strands: ['Numbers and Number Sense', 'Measurement', 'Geometry', 'Patterns and Algebra', 'Statistics and Probability'],
  },
  science: {
    primary: 'DepEd K to 12 / MATATAG Science Curriculum Guide, Grades 1-6',
    international: 'Next Generation Science Standards',
    strands: ['Matter', 'Living Things and Environment', 'Force, Motion and Energy', 'Earth and Space'],
    earlyGradesNote: 'Grades 1-2 use integrated observation, health, body, and environmental foundations; standalone Science begins in Grade 3.',
  },
} as const;

type LessonInput = [string, string, string, Difficulty];
const lessonList = (items: LessonInput[]): Lesson[] => items.map(([title, meaning, example, difficulty]) => ({ title, meaning, example, difficulty }));
const subject = (title: string, icon: string, color: string, items: LessonInput[]): Subject => ({ title, icon, color, lessons: lessonList(items) });
const math = (items: LessonInput[]) => subject('Math', '📐', '#9c63e8', items);

const matter = (items: LessonInput[]) => subject('Matter', '🧊', '#4879e7', items);
const living = (items: LessonInput[]) => subject('Living Things & Environment', '🌱', '#4ea85f', items);
const force = (items: LessonInput[]) => subject('Force, Motion, & Energy', '⚡', '#dc8a32', items);
const earth = (items: LessonInput[]) => subject('Earth & Space', '🌎', '#318cce', items);

export const curriculum: Record<number, Subject[]> = {
  1: [
    math([['Counting and Number Sense', 'Numbers tell us how many objects there are and can be compared as more, fewer, or equal.', 'Count 8 stars and compare them with 5 stars.', 'Easy'], ['Shapes and Patterns', 'Shapes have features, and repeating patterns follow a predictable order.', 'Continue a pattern of circle, square, circle, square.', 'Easy'], ['Addition and Subtraction', 'Addition joins groups and subtraction takes objects away from a group.', 'Solve 4 + 3 and 9 - 2 using counters.', 'Medium']]),
    matter([['Colors, Shapes, and Sizes', 'Everyday objects have observable properties that we can name and compare.', 'Compare a red circle, a blue square, and a large triangle.', 'Easy'], ['Texture and Hardness', 'Texture describes how a surface feels, while hardness describes how easily it changes when pressed.', 'Sort cotton, sandpaper, and a wooden block by how they feel.', 'Easy'], ['Sorting and Grouping', 'Objects can be grouped when they share one or more physical properties.', 'Group classroom objects by color first, then regroup them by shape.', 'Medium']]),
    living([['The Five Senses', 'Eyes, ears, nose, tongue, and skin help us observe and describe our surroundings.', 'Use your eyes to identify a color and your ears to identify a sound.', 'Easy'], ['Living and Non-living', 'Living things grow, need resources, and carry out life processes; non-living things do not.', 'A plant is living, while a toy car is non-living.', 'Easy'], ['Plant Parts and Needs', 'Roots, stems, leaves, and flowers have different jobs that help a plant survive.', 'Roots take in water, the stem supports the plant, and leaves make food.', 'Medium']]),
    force([['Pushes and Pulls', 'A force is a push or pull that can start, stop, or change an object’s motion.', 'Push a toy car away or pull it toward you with a string.', 'Easy'], ['Ways Things Move', 'Objects can move straight, in a zig-zag, fast, or slow depending on the force.', 'Roll a ball straight, then guide it around cones in a zig-zag.', 'Easy'], ['Light and Sound', 'Light helps us see and sound helps us hear; both come from sources.', 'The Sun gives light and a drum makes a loud sound when struck.', 'Medium']]),
    earth([['The Day and Night Sky', 'The Sun is visible during the day, while the Moon and stars are easier to see at night.', 'Draw what you observe in the sky in the morning and evening.', 'Easy'], ['Weather Words', 'Sunny, rainy, windy, and cloudy are words used to describe daily weather.', 'Choose the weather symbol that matches today’s sky.', 'Easy'], ['Caring for Our Surroundings', 'People can protect their immediate environment by keeping places clean and safe.', 'Place litter in the correct bin and keep water sources clean.', 'Medium']]),
  ],
  2: [
    math([['Place Value to 1,000', 'A digit’s place tells its value as ones, tens, or hundreds.', 'In 472, the 7 represents 70.', 'Easy'], ['Addition and Subtraction Strategies', 'Numbers can be added and subtracted using place value, regrouping, and number lines.', 'Solve 236 + 148 by regrouping the ones and tens.', 'Medium'], ['Shapes and Measurement', 'Shapes can be described by sides and corners, while length can be measured with standard units.', 'Measure a table in centimeters and identify its rectangles.', 'Medium']]),
    matter([['Solids and Liquids', 'A solid keeps its own shape, while a liquid flows and takes the shape of its container.', 'Ice keeps its shape until it melts into water.', 'Easy'], ['Strength and Flexibility', 'Materials can be compared by how strong they are and how easily they bend.', 'A metal spoon is stronger than paper, while a rubber band is more flexible.', 'Medium'], ['Absorbing and Melting', 'Some materials absorb water, and heat can cause a reversible change such as melting.', 'A sponge absorbs water and an ice cube melts in a warm room.', 'Medium']]),
    living([['What Plants Need', 'Plants need light, water, air, and suitable soil to grow.', 'Place two seedlings in different light conditions and compare their growth.', 'Easy'], ['Animal Habitats', 'Habitats provide animals with food, water, air, and shelter.', 'A fish is suited to a water habitat, while a bird can live in a land-and-air habitat.', 'Medium'], ['Animal Groups and Parents', 'Animals can be grouped by what they eat, and young animals often resemble their parents.', 'A cow is a herbivore, while a cat is a carnivore.', 'Medium']]),
    force([['Pushes Change Distance', 'A larger push or pull can make an object travel farther.', 'Compare how far a gently pushed and strongly pushed ball travels.', 'Medium'], ['Static Electricity', 'Rubbing some materials can move electric charges and create a small attraction.', 'Rub a balloon on hair and observe it attract tiny paper pieces.', 'Medium'], ['Magnetic Forces', 'Magnets can attract some metals, and like poles repel while unlike poles attract.', 'Test which classroom objects a magnet can attract.', 'Hard']]),
    earth([['Landforms and Water Bodies', 'Mountains, valleys, rivers, lakes, and oceans are different features of Earth.', 'Identify the river, lake, mountain, and valley on a landscape map.', 'Medium'], ['Weather and Daily Choices', 'Weather affects the clothes, tools, and activities people choose.', 'Wear a raincoat on a rainy day and use shade on a sunny day.', 'Easy'], ['Seasonal Weather Patterns', 'Weather and the amount of sunlight follow patterns across the year.', 'Compare daylight and temperature during two different seasons.', 'Hard']]),
  ],
  3: [
    math([['Multiplication and Division', 'Multiplication combines equal groups, while division shares a total into equal groups.', 'Solve 4 x 6 and share 24 counters into 4 equal groups.', 'Medium'], ['Fractions on a Number Line', 'Fractions name equal parts of a whole and can be located between whole numbers.', 'Place 1/2 and 3/4 on a number line from 0 to 1.', 'Medium'], ['Area and Perimeter', 'Area measures the space inside a shape and perimeter measures the distance around it.', 'Find the area and perimeter of a rectangle 5 units by 3 units.', 'Hard']]),
    matter([['Solids, Liquids, and Gases', 'Matter exists as solids, liquids, and gases, each with different particle arrangements.', 'Water can be ice, liquid water, or water vapor.', 'Medium'], ['Physical Properties', 'Shape, volume, texture, and hardness help us identify and compare materials.', 'Measure the volume of water and compare the texture of sand and clay.', 'Medium'], ['Changes of State', 'Heating and cooling can cause melting, freezing, evaporation, and condensation.', 'Water evaporates from a dish and condenses on a cool lid.', 'Hard']]),
    living([['Sense Organs and Functions', 'Sense organs collect information so the brain can interpret the environment.', 'The eyes detect light while the ears detect vibrations as sound.', 'Medium'], ['Plant and Animal Groups', 'Living things can be classified by shared structures and characteristics.', 'Classify a bird, fish, tree, and flowering plant using observable traits.', 'Medium'], ['Animal Life Cycles', 'Animals pass through predictable stages as they grow and reproduce.', 'A butterfly changes from egg to larva, pupa, and adult.', 'Hard']]),
    force([['Push, Pull, and Gravity', 'Pushes and pulls change motion, while gravity attracts objects toward Earth.', 'A dropped ball falls because gravity pulls it downward.', 'Medium'], ['Light Sources', 'Natural and artificial sources produce light that can help us see.', 'Compare sunlight, a flashlight, and a candle as light sources.', 'Medium'], ['Sound and Heat', 'Sound comes from vibrations, while heat moves from warmer objects to cooler ones.', 'A vibrating guitar string makes sound, and a warm cup heats your hands.', 'Hard']]),
    earth([['Soil, Water, and Rocks', 'Earth’s surface contains soil, water, and rocks with different properties and uses.', 'Compare sandy soil, clay soil, a pebble, and a water sample.', 'Medium'], ['Weather Safety', 'Weather observations help people prepare for rain, strong winds, and storms.', 'Move indoors when lightning appears and follow a storm warning.', 'Medium'], ['The Sun, Moon, and Stars', 'The Sun, Moon, and stars are space objects that appear to follow patterns in the sky.', 'Track the Moon’s changing shape over several nights.', 'Hard']]),
  ],
  4: [
    math([['Multi-digit Operations', 'Place value strategies help us multiply and divide larger whole numbers accurately.', 'Solve 3,204 ÷ 4 and check the answer with multiplication.', 'Hard'], ['Equivalent Fractions and Decimals', 'Different fractions and decimals can represent the same amount.', 'Show that 1/2, 2/4, and 0.5 are equivalent.', 'Hard'], ['Angles and Geometry', 'Angles describe turns, and geometric figures can be classified by their properties.', 'Classify a triangle by its sides and measure one angle.', 'Medium']]),
    matter([['Absorption and Floating', 'Materials interact with water differently; some absorb it and some float or sink.', 'Test a sponge, coin, leaf, and plastic cap in water.', 'Medium'], ['Decay and Decomposition', 'Some materials break down naturally, while others remain for a long time.', 'Compare how a leaf and a plastic wrapper change in soil.', 'Hard'], ['Physical and Chemical Changes', 'A physical change changes form, while a chemical change creates a new substance.', 'Cutting paper is physical; rusting iron is chemical.', 'Hard']]),
    living([['Internal Organs and Health', 'The brain, heart, lungs, stomach, bones, and muscles work together to keep the body healthy.', 'The lungs take in oxygen and the heart moves oxygen-rich blood around the body.', 'Hard'], ['Habitat Adaptations', 'Adaptations are structures or behaviors that help organisms survive in their habitats.', 'A fish has gills for an aquatic habitat, while a cactus stores water.', 'Hard'], ['Metamorphosis', 'Some animals pass through distinct body stages before becoming adults.', 'A frog develops from egg to tadpole, froglet, and adult frog.', 'Medium']]),
    force([['Force Changes Motion and Shape', 'A force can bend, stretch, compress, speed up, slow down, or change an object’s direction.', 'Squeezing clay changes its shape; kicking a ball changes its motion.', 'Medium'], ['Simple Machines and Safety', 'Simple machines make work easier, but they must be used safely.', 'A ramp helps move a box upward with less lifting force.', 'Hard'], ['Light, Sound, and Heat Transfer', 'Energy can travel through materials, reflect from surfaces, or pass between objects.', 'A mirror reflects light and a metal spoon conducts heat from soup.', 'Hard']]),
    earth([['Soil and Erosion', 'Moving water and wind can carry soil away and change the land surface.', 'Plant roots help hold soil in place during heavy rain.', 'Hard'], ['The Water Cycle', 'Water evaporates, condenses into clouds, falls as precipitation, and collects again.', 'A puddle evaporates after sunshine and water later returns as rain.', 'Medium'], ['Weather Instruments', 'Thermometers, rain gauges, wind vanes, and anemometers measure weather conditions.', 'Use a rain gauge to compare rainfall on two days.', 'Hard']]),
  ],
  5: [
    math([['Fractions, Decimals, and Percentages', 'Fractions, decimals, and percentages are connected ways to describe parts of a whole.', 'Convert 3/4 to 0.75 and 75%.', 'Hard'], ['Ratios and Proportions', 'Ratios compare quantities, and equivalent ratios describe the same relationship.', 'A recipe uses 2 cups of rice for 3 cups of water; scale it for 6 cups of rice.', 'Hard'], ['Volume and Coordinate Grids', 'Volume measures space in three dimensions, and coordinates locate points on a grid.', 'Find the volume of a rectangular prism and plot its corners.', 'Hard']]),
    matter([['Materials and Their Uses', 'Durability, conductivity, flexibility, and other properties determine how materials are used.', 'Copper is useful in wires because it conducts electricity well.', 'Hard'], ['The Five Rs', 'Reduce, reuse, recycle, repair, and rot help manage waste responsibly.', 'Repair a torn bag and compost fruit peels instead of throwing them away.', 'Medium'], ['Heat and Oxygen Changes', 'Heat and oxygen can cause materials to change in ways that may not be reversible.', 'Iron rusts when exposed to oxygen and food cooks when heated.', 'Hard']]),
    living([['Human Growth and Puberty', 'Puberty brings physical and emotional changes as the body matures.', 'Growth of body hair and changes in voice are normal puberty changes.', 'Hard'], ['Plant Reproduction', 'Flowering plants reproduce using flowers, pollen, seeds, and fruits; other plants use spores or other structures.', 'A flower’s pollen can reach another flower and help form seeds.', 'Hard'], ['Animal Reproduction and Ecosystems', 'Animals reproduce in different ways, and ecosystems connect organisms with their habitats.', 'Fish lay eggs, while mammals give birth to live young in an estuary ecosystem.', 'Impossible']]),
    force([['Speed, Distance, and Time', 'Speed describes how much distance an object travels in a given amount of time.', 'A cyclist covering 100 meters in 20 seconds is faster than one taking 30 seconds.', 'Hard'], ['Series and Parallel Circuits', 'A series circuit has one path for current, while a parallel circuit has multiple paths.', 'In a parallel circuit, one bulb can stay lit if another bulb fails.', 'Hard'], ['Electromagnets', 'Electric current through a coil can create a temporary magnetic field.', 'Wrap wire around an iron nail and connect it to a battery to pick up paper clips.', 'Impossible']]),
    earth([['Weathering and Soil Erosion', 'Weathering breaks rocks apart and erosion transports the pieces to new places.', 'Rainwater can crack rock and carry loosened soil downhill.', 'Hard'], ['Tropical Cyclones', 'Tropical cyclones form over warm ocean water and bring strong winds and heavy rain.', 'Follow evacuation instructions and stay away from floodwater during a typhoon.', 'Hard'], ['Moon Phases and Constellations', 'The Moon appears to change shape as it orbits Earth, while constellations form recognizable star patterns.', 'The Moon progresses from new moon to crescent, quarter, gibbous, and full moon.', 'Impossible']]),
  ],
  6: [
    math([['Integers and Rational Numbers', 'Positive and negative numbers represent quantities on opposite sides of zero.', 'Order -3, 2, -1, and 0 from least to greatest.', 'Hard'], ['Expressions and Equations', 'Variables represent unknown values, and equations describe relationships that can be solved.', 'Solve 3x + 4 = 19.', 'Hard'], ['Statistics and Probability', 'Data can be summarized with measures and used to estimate the likelihood of outcomes.', 'Find the mean of 4, 6, 8, and 10 and describe the chance of rolling an even number.', 'Impossible']]),
    matter([['Mixtures and Their Properties', 'A mixture contains two or more substances that keep their own properties.', 'Salt water contains salt and water even though it looks uniform.', 'Medium'], ['Homogeneous and Heterogeneous Mixtures', 'Homogeneous mixtures look evenly mixed, while heterogeneous mixtures have visible parts.', 'Air and salt water are homogeneous; cereal in milk is heterogeneous.', 'Hard'], ['Separating Mixtures', 'Decantation, filtration, evaporation, sieving, and magnetism separate substances using their properties.', 'Filter sand from water, evaporate salt water, and use a magnet to collect iron filings.', 'Impossible']]),
    living([['Organ System Interactions', 'The digestive, respiratory, circulatory, and nervous systems work together to keep the body functioning.', 'Digestion provides nutrients and the circulatory system carries them to cells.', 'Impossible'], ['Vertebrates and Invertebrates', 'Animals can be classified by whether they have a backbone and by other body structures.', 'A frog is a vertebrate; a butterfly is an invertebrate.', 'Hard'], ['Rainforests, Reefs, and Mangroves', 'Tropical ecosystems support many organisms and need protection from pollution and habitat loss.', 'Mangrove roots provide shelter for young fish and reduce shoreline erosion.', 'Impossible']]),
    force([['Gravity and Friction', 'Gravity pulls objects together, while friction resists motion between surfaces.', 'A rough surface slows a sliding box more than a smooth surface.', 'Hard'], ['Potential and Kinetic Energy', 'Stored potential energy can transform into kinetic energy when an object moves.', 'A roller coaster has potential energy at the top and kinetic energy as it descends.', 'Hard'], ['Six Simple Machines', 'Levers, pulleys, inclined planes, screws, wedges, and wheels change the effort needed to do work.', 'A pulley lifts a load and an inclined plane moves it upward gradually.', 'Impossible']]),
    earth([['Plate Tectonics', 'Earth’s crust is divided into moving plates whose interactions shape landforms and cause earthquakes.', 'Two plates pushing together can form mountains.', 'Impossible'], ['Earthquakes and Volcanoes', 'Stored energy and pressure inside Earth can be released through earthquakes and volcanic eruptions.', 'During an earthquake, drop, cover, and hold until the shaking stops.', 'Hard'], ['The Solar System and Space Exploration', 'Planets orbit the Sun, rotate on their axes, and can be explored using technology.', 'Earth rotates to create day and night and revolves around the Sun to create a year.', 'Impossible']]),
  ],
};

const expandedMath: Record<number, LessonInput[]> = {
  1: [
    ['Ordinal Numbers', 'Ordinal numbers describe position in an order, such as first, second, third, and fourth.', 'In MATH, M is 1st, A is 2nd, T is 3rd, and H is 4th.', 'Easy'],
    ['Fractions', 'A fraction names equal parts of one whole.', 'Cut an apple into 2 equal parts to show 1/2, or fold paper into 4 equal parts to show 1/4.', 'Easy'],
    ['Time and Measurement', 'Objects can be measured with repeated units, and clocks show when events happen.', 'A desk is 6 pencils long. A short hand on 3 and long hand on 12 shows 3:00.', 'Medium'],
    ['Pictographs', 'A pictograph uses pictures or symbols to show how many items are in a group.', 'If one apple means one student, 4 apple drawings represent 4 students.', 'Easy'],
  ],
  2: [
    ['Multiplication and Division Concepts', 'Multiplication makes equal groups, while division shares a total equally.', '4 x 3 means 3 + 3 + 3 + 3 = 12. Sharing 12 candies among 3 friends gives 4 each.', 'Medium'],
    ['Symmetry and Shapes', 'A shape is symmetrical when one half matches the other half across a line.', 'A square has 4 equal sides, and folding a paper butterfly down the middle shows symmetry.', 'Medium'],
    ['Bar Graphs and Probability', 'Bar graphs compare amounts, while probability describes how likely an event is.', 'If 1 grid square equals 2 pets, a bar 4 squares tall represents 8 pets. A blue ball is impossible in a bag with only red balls.', 'Hard'],
  ],
  3: [
    ['Multiplication and Division Facts', 'Multiplication and division are related operations that describe equal groups and sharing.', '14 x 6 = 84. Dividing 45 by 4 gives 11 with a remainder of 1.', 'Medium'],
    ['Equivalent Fractions', 'Equivalent fractions name the same amount even when their numerators and denominators differ.', '1/2 is equal to 2/4 and 4/8 because each represents half of a whole.', 'Medium'],
    ['Lines, Angles, Area, and Perimeter', 'Lines can be parallel or intersecting, angles describe turns, perimeter measures distance around, and area measures space inside.', 'A 4 cm by 6 cm rectangle has perimeter 20 cm and area 24 square cm. A square corner is a 90 degree right angle.', 'Hard'],
    ['Tally Charts', 'Tally marks organize counts in groups so data can be read quickly.', 'Four tally marks plus three more tally marks represent 7 votes.', 'Easy'],
  ],
  4: [
    ['Factors, Multiples, GCF, and LCM', 'Factors divide a number exactly, multiples are products in a number sequence, and GCF and LCM compare numbers.', 'The factors of 12 are 1, 2, 3, 4, 6, and 12. GCF(12, 18) = 6 and LCM(4, 6) = 12.', 'Hard'],
    ['Fractions and Decimals', 'Fractions and decimals are two ways to represent parts of a whole.', '3/5 + 1/5 = 4/5. The decimal 0.45 equals 45/100, which simplifies to 9/20.', 'Hard'],
    ['Order of Operations', 'Order of operations gives a consistent sequence for evaluating expressions.', '12 + (6 x 2) / 3 = 12 + 12 / 3 = 16.', 'Hard'],
    ['Area and Elapsed Time', 'Area measures the inside of a shape, while elapsed time measures the duration between two times.', 'A triangle with base 8 cm and height 5 cm has area 20 square cm. From 2:15 PM to 4:05 PM is 1 hour 50 minutes.', 'Hard'],
  ],
  5: [
    ['Decimals, Ratios, and Percentages', 'Decimals, ratios, and percentages describe quantities and relationships in different forms.', '2.5 x 0.4 = 1.0. A class ratio of 12 boys to 15 girls simplifies to 4:5. A 20% discount on $50 saves $10.', 'Hard'],
    ['Polygons and Circles', 'Polygons have straight sides, while circles are described by radius, diameter, and circumference.', 'A 7-sided polygon is a heptagon. If r = 5 cm, d = 10 cm and C = 2 pi r is about 31.42 cm.', 'Hard'],
    ['Expressions and Area', 'Expressions combine numbers and operations, and area formulas measure two-dimensional space.', '3 x [4 + (8 - 3)^2] = 87. A circle with radius 3 cm has area about 28.27 square cm.', 'Impossible'],
    ['Pie Charts', 'A pie chart shows how a whole is divided into proportional parts.', 'A budget may show 50% for rent, 30% for food, and 20% for savings.', 'Medium'],
  ],
  6: [
    ['Integers and Word Problems', 'Integers include positive numbers, negative numbers, and zero and can represent movement or position.', '-5 + 8 = 3. A submarine at -50 meters rising 20 meters is at -30 meters.', 'Hard'],
    ['Similarity and Scale', 'Similar figures have equal corresponding angles and proportional corresponding sides.', 'Two triangles with a scale factor of 1:2 have matching angles and sides doubled in the larger triangle.', 'Hard'],
    ['Linear Equations', 'An equation can be solved by undoing operations while keeping both sides balanced.', '3x + 7 = 22, so 3x = 15 and x = 5.', 'Hard'],
    ['Volume, Speed, and Statistics', 'Volume measures three-dimensional space, speed compares distance and time, and statistics summarize data.', 'A cylinder with r = 3 cm and h = 10 cm has volume about 282.74 cubic cm. 150 km in 3 hours is 50 km/h. For 3, 5, 5, 6, 11, the mean is 6, median is 5, and mode is 5.', 'Impossible'],
  ],
};

const expandedScience: Record<number, LessonInput[]> = {
  1: [
    ['Texture and Grouping', 'Objects can be grouped by observable properties such as smooth, rough, soft, or hard.', 'A glass marble is smooth, tree bark is rough, and a cotton ball is soft.', 'Easy'],
    ['Needs of Living Things', 'Living things need resources such as water, food, air, sunlight, or shelter to survive.', 'A sunflower needs sunlight, water, and soil, while a rock does not grow or need food.', 'Easy'],
  ],
  2: [
    ['Changes of Matter', 'Heating and cooling can change matter from one state to another.', 'Heating ice turns it into liquid water. Water left in an open cup can slowly evaporate.', 'Medium'],
    ['Habitats and Diets', 'Animals are suited to habitats and can be grouped by what they eat.', 'Fish live in water, cows live on land, rabbits are herbivores, and humans are omnivores.', 'Medium'],
    ['Electricity and Magnetism', 'Static electricity can attract objects, while magnets attract some metals.', 'Rubbing a balloon on hair attracts individual hairs, and a magnet attracts an iron paperclip but not a plastic pen.', 'Hard'],
  ],
  3: [
    ['Three States of Matter', 'Solids have fixed shape and volume, liquids keep volume but take a container shape, and gases have neither fixed shape nor volume.', 'A wood block is a solid, milk is a liquid, and air inside a balloon is a gas.', 'Medium'],
    ['Animal Life Cycles', 'Different animal groups pass through different stages as they grow; comparing stages shows how young organisms develop into adults.', 'A frog develops from egg to tadpole to adult, while a butterfly develops from egg to caterpillar to chrysalis to adult.', 'Hard'],
    ['Gravity and Soil', 'Gravity pulls objects toward Earth, and soil contains materials with different properties.', 'A dropped apple falls because of gravity. Sand has coarse grains, clay is sticky when wet, and loam is rich in organic matter.', 'Hard'],
  ],
  4: [
    ['Physical and Chemical Changes', 'Evidence such as a new material can indicate a chemical change, while a change of state can happen without making a new substance.', 'A nail forms rust when iron reacts with oxygen; water freezes into ice without becoming a different substance.', 'Hard'],
    ['Organ Systems and Adaptations', 'Body systems work together, and adaptations help organisms survive in their habitats.', 'The skull protects the brain, ribs protect the heart and lungs, camels store fat in humps, and fish use gills.', 'Hard'],
    ['The Water Cycle', 'Water moves through evaporation, condensation, precipitation, and collection in a continuous cycle.', 'Heat causes evaporation, clouds form through condensation, and rain falls as precipitation.', 'Medium'],
  ],
  5: [
    ['The Five Rs', 'Repairing useful items and composting suitable organic waste are ways to keep materials in use and reduce what is discarded.', 'Mend a torn school bag so it can be used longer, and compost fruit peels to return organic matter to the soil.', 'Medium'],
    ['Plant Reproduction', 'Pollination transfers pollen to a flower part where fertilization can occur; seeds may then develop and be dispersed.', 'A bee carries pollen between flowers, and a mature fruit protects seeds that may be carried away by animals.', 'Hard'],
    ['Series and Parallel Circuits', 'Circuit arrangement affects whether components share one path or have separate branches that can operate independently.', 'With separate branches in a parallel circuit, opening one lamp branch does not necessarily break the path through another lamp.', 'Hard'],
    ['Weathering and Erosion', 'Weathering breaks material apart, while erosion moves the broken material elsewhere.', 'Plant roots can crack a rock through weathering, while rain can wash the dirt downhill through erosion.', 'Hard'],
  ],
  6: [
    ['Separating Mixtures', 'Sieving separates solid materials of different particle sizes by allowing smaller particles to pass through openings.', 'Pass a dry mixture of coarse grains and fine particles through a suitable sieve to collect the larger pieces separately.', 'Hard'],
    ['Body System Interactions', 'Body systems cooperate to move nutrients and oxygen to cells and remove waste.', 'The digestive system breaks food into nutrients, and the bloodstream carries those nutrients to cells.', 'Impossible'],
    ['Energy Transformations', 'Energy can change from one form into another while powering devices and processes.', 'A battery changes chemical energy into electrical energy, then a flashlight changes it into light and heat.', 'Hard'],
    ['Plate Tectonics and Space', 'Moving tectonic plates shape Earth, while rotation and revolution create predictable space patterns.', 'Colliding plates can form mountains and earthquakes. Earth rotates in 24 hours and revolves around the Sun in about 365.25 days.', 'Impossible'],
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

for (const grade of Object.keys(curriculum).map(Number)) {
  const mathSubject = curriculum[grade].find((item) => item.title === 'Math');
  if (mathSubject) mathSubject.lessons.push(...lessonList(expandedMath[grade]));
  for (const lesson of lessonList(expandedScience[grade])) {
    const target = curriculum[grade].find((item) => item.title === scienceSubjectByLesson[lesson.title]);
    target?.lessons.push(lesson);
  }
}

export const assetSourcePath = 'assets/BiosphereQuestAssets';
