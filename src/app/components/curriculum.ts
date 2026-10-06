export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Impossible';

export type Lesson = {
  title: string;
  meaning: string;
  example: string;
  difficulty: Difficulty;
};

export type Subject = {
  title: string;
  icon: string;
  color: string;
  lessons: Lesson[];
};

export const curriculumStandards = {
  mathematics: {
    primary: 'DepEd K to 12 Mathematics Curriculum Guide, Grades 1-6',
    international: 'Common Core State Standards for Mathematics',
    strands: [
      'Numbers and Number Sense',
      'Measurement',
      'Geometry',
      'Patterns and Algebra',
      'Statistics and Probability',
    ],
  },
  science: {
    primary: 'DepEd K to 12 / MATATAG Science Curriculum Guide, Grades 1-6',
    international: 'Next Generation Science Standards',
    strands: [
      'Matter',
      'Living Things and Environment',
      'Force, Motion and Energy',
      'Earth and Space',
    ],
    earlyGradesNote:
      'Grades 1-2 use integrated observation, health, body, and environmental foundations; standalone Science begins in Grade 3.',
  },
} as const;

type LessonInput = [string, string, string, Difficulty];

const lessonList = (items: LessonInput[]): Lesson[] =>
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
): Subject => ({
  title,
  icon,
  color,
  lessons: lessonList(items),
});

const math = (items: LessonInput[]) => subject('Math', '📐', '#9c63e8', items);
const matter = (items: LessonInput[]) => subject('Matter', '🧊', '#4879e7', items);
const living = (items: LessonInput[]) => subject('Living Things & Environment', '🌱', '#4ea85f', items);
const force = (items: LessonInput[]) => subject('Force, Motion, & Energy', '⚡', '#dc8a32', items);
const earth = (items: LessonInput[]) => subject('Earth & Space', '🌎', '#318cce', items);

export const curriculum: Record<number, Subject[]> = {
  1: [
    math([
      [
        'Counting and Number Sense',
        'Numbers tell us how many objects there are and help us compare amounts!',
        'Count 5 shiny stars ⭐ and see that 5 is more than 3 stars.',
        'Easy',
      ],
      [
        'Shapes and Patterns',
        'Shapes have sides and corners, and patterns repeat in a predictable order.',
        'Circle 🔴, Square 🟦, Circle 🔴... the next shape is Square 🟦!',
        'Easy',
      ],
      [
        'Addition and Subtraction',
        'Addition puts groups together to make more (+). Subtraction takes things away (-).',
        'Have 4 apples 🍎 and add 3 more to make 7 apples in total!',
        'Medium',
      ],
    ]),
    matter([
      [
        'Colors, Shapes, and Sizes',
        'Objects around us have colors, shapes, and sizes we can easily see and name.',
        'A round red apple 🍎 is smaller than a big green watermelon 🍉.',
        'Easy',
      ],
      [
        'Texture and Hardness',
        'Texture is how something feels when touched (soft, rough, or smooth).',
        'A fluffy cotton ball ☁️ is soft, but a wooden desk is hard and smooth.',
        'Easy',
      ],
      [
        'Sorting and Grouping',
        'Sorting means putting objects together that share the same color or shape.',
        'Put all yellow crayons 🖍️ in one cup and all blue crayons in another.',
        'Medium',
      ],
    ]),
    living([
      [
        'The Five Senses',
        'Our eyes, ears, nose, tongue, and skin help us explore and discover the world.',
        'Eyes see bright colors 👀, and your tongue tastes sweet mangoes 🥭.',
        'Easy',
      ],
      [
        'Living and Non-living',
        'Living things grow and need food and water. Non-living things do not grow.',
        'A growing puppy 🐶 is living; a plastic toy car 🚗 is non-living.',
        'Easy',
      ],
      [
        'Plant Parts and Needs',
        'Plants need sunlight, water, and soil, using their roots and green leaves to grow.',
        'Roots drink water from the soil like tiny straws 🌱.',
        'Medium',
      ],
    ]),
    force([
      [
        'Pushes and Pulls',
        'A force is a push or pull that makes things start moving or stop.',
        'Push a swing forward 🎠, or pull a wagon by its handle.',
        'Easy',
      ],
      [
        'Ways Things Move',
        'Things can roll, slide, zig-zag, move super fast, or go slow.',
        'A round soccer ball rolls smoothly across the green grass ⚽.',
        'Easy',
      ],
      [
        'Light and Sound',
        'Light helps our eyes see, and sound makes vibrations our ears can hear.',
        'The sun gives us light ☀️, and drumming makes a loud beat 🥁.',
        'Medium',
      ],
    ]),
    earth([
      [
        'The Day and Night Sky',
        'The sun shines bright during the day, while the moon and stars light up the night.',
        'Look up to see the warm sun in the morning ☀️ and glowing stars at bedtime ✨.',
        'Easy',
      ],
      [
        'Weather Words',
        'Weather describes what the sky looks and feels like each day.',
        'Put on a raincoat on rainy days 🌧️ and enjoy the breeze on windy days 🍃.',
        'Easy',
      ],
      [
        'Caring for Our Surroundings',
        'We keep our school and home clean and safe by picking up trash.',
        'Toss candy wrappers into the trash bin to keep our playground clean 🗑️.',
        'Medium',
      ],
    ]),
  ],
  2: [
    math([
      [
        'Place Value to 1,000',
        'A digit’s position tells its value in ones, tens, or hundreds.',
        'In the number 345, the 3 means 300, the 4 means 40, and the 5 means 5.',
        'Easy',
      ],
      [
        'Addition and Subtraction Strategies',
        'Break numbers into tens and ones to add and subtract larger amounts quickly.',
        'To solve 25 + 14, add the tens (20 + 10 = 30) and ones (5 + 4 = 9) to get 39!',
        'Medium',
      ],
      [
        'Shapes and Measurement',
        'Shapes have straight sides and corners, and rulers measure length in centimeters.',
        'A notebook has 4 corners and can be measured using a 30 cm ruler 📏.',
        'Medium',
      ],
    ]),
    matter([
      [
        'Solids and Liquids',
        'A solid holds its own shape, while a liquid flows and fills any container.',
        'An ice cube is solid 🧊, but when it warms up, it melts into liquid water 💧.',
        'Easy',
      ],
      [
        'Strength and Flexibility',
        'Materials can be strong and rigid, or flexible enough to bend without snapping.',
        'A metal ruler is strong and stiff, while a rubber band stretches easily.',
        'Medium',
      ],
      [
        'Absorbing and Melting',
        'Some items soak up water like a sponge, while heat can melt solids into liquids.',
        'A dry sponge absorbs spilled juice 🧽, and hot sunshine melts ice cream 🍦.',
        'Medium',
      ],
    ]),
    living([
      [
        'What Plants Need',
        'Plants need sunlight, fresh air, water, and healthy soil to grow tall and strong.',
        'Give a seedling water and place it near a sunny window to watch it sprout 🌱.',
        'Easy',
      ],
      [
        'Animal Habitats',
        'A habitat is a natural home where an animal finds food, water, and safety.',
        'A clownfish lives in coral reefs 🐠, while an eagle nests in tall forest trees 🦅.',
        'Medium',
      ],
      [
        'Animal Groups and Parents',
        'Baby animals grow up looking very similar to their animal parents.',
        'A fluffy duckling grows feathers and quacks just like its mother duck 🦆.',
        'Medium',
      ],
    ]),
    force([
      [
        'Pushes Change Distance',
        'A gentle push moves a toy a short distance, but a strong push sends it far!',
        'Push a toy car gently and it rolls a little; push it hard and it zooms across the room!',
        'Medium',
      ],
      [
        'Static Electricity',
        'Rubbing items together can create electric charges that pull light things close.',
        'Rub a balloon on your shirt and watch it pick up tiny pieces of paper 🎈!',
        'Medium',
      ],
      [
        'Magnetic Forces',
        'Magnets have invisible forces that pull metals like iron and push matching poles.',
        'A magnet snaps onto a steel refrigerator door or picks up metal paperclips 🧲.',
        'Hard',
      ],
    ]),
    earth([
      [
        'Landforms and Water Bodies',
        'Earth has high mountains, flat plains, flowing rivers, and deep oceans.',
        'Mount Mayon is a tall volcano 🌋, and the Pasig River is a flowing body of water 🌊.',
        'Medium',
      ],
      [
        'Weather and Daily Choices',
        'Weather helps us decide what clothes to wear and what outdoor games to play.',
        'Wear a wide hat on sunny days 🧢, and stay indoors when thunderstorms boom ⚡.',
        'Easy',
      ],
      [
        'Seasonal Weather Patterns',
        'Weather changes predictably throughout the year between sunny dry and rainy wet seasons.',
        'In the Philippines, dry months bring lots of sunshine, followed by rainy monsoon months 🌧️.',
        'Hard',
      ],
    ]),
  ],
  3: [
    math([
      [
        'Multiplication and Division',
        'Multiplication is adding equal groups together. Division is sharing equally.',
        '3 bags with 4 cookies each make 3 × 4 = 12 delicious cookies 🍪!',
        'Medium',
      ],
      [
        'Fractions on a Number Line',
        'Fractions name equal parts of a whole between 0 and 1 on a number line.',
        'Fold a ribbon in half to find 1/2 right in the middle between start and finish 🎀.',
        'Medium',
      ],
      [
        'Area and Perimeter',
        'Perimeter is the distance all the way around; area is the flat space inside.',
        'Walk around the border of a garden for perimeter, or tile the floor for area 🟩.',
        'Hard',
      ],
    ]),
    matter([
      [
        'Solids, Liquids, and Gases',
        'Matter comes in three states: solids hold shape, liquids flow, and gases spread out.',
        'Ice is a solid 🧊, drinking water is a liquid 🥛, and steam from soup is a gas 💨.',
        'Medium',
      ],
      [
        'Physical Properties',
        'We identify materials by checking their color, smell, texture, weight, and hardness.',
        'Smooth river stones feel cool and heavy compared to light, dry sand 🏖️.',
        'Medium',
      ],
      [
        'Changes of State',
        'Heating makes liquids evaporate into gas; cooling condenses gas back into liquid droplets.',
        'A hot puddle dries up in the sun because the water evaporates into the air ☁️.',
        'Hard',
      ],
    ]),
    living([
      [
        'Sense Organs and Functions',
        'Sense organs gather signals from outside and send them to your brain.',
        'Ears catch sound waves from a bell 🔔 and your brain recognizes the school chime.',
        'Medium',
      ],
      [
        'Plant and Animal Groups',
        'Scientists sort animals into groups like birds, fish, mammals, and reptiles.',
        'Birds have feathers and beaks 🦜, while fish have scales and fins 🐟.',
        'Medium',
      ],
      [
        'Animal Life Cycles',
        'Animals go through orderly stages of growth from egg or birth to full adult.',
        'A butterfly starts as an egg 🥚, crawls as a caterpillar 🐛, rests in a chrysalis, and flies as an adult 🦋.',
        'Hard',
      ],
    ]),
    force([
      [
        'Push, Pull, and Gravity',
        'Gravity is an invisible pull from Earth that brings dropped things down.',
        'Drop an apple and it falls straight to the ground because gravity pulls it 🍎.',
        'Medium',
      ],
      [
        'Light Sources',
        'Light comes from natural sources like the sun and artificial sources like lamps.',
        'Sunlight warms the Earth during the day ☀️, and flashlights guide us in dark rooms 🔦.',
        'Medium',
      ],
      [
        'Sound and Heat',
        'Sounds are made when things vibrate, and heat flows from warm items to cooler ones.',
        'Pluck a guitar string to see it buzz and make sound 🎸!',
        'Hard',
      ],
    ]),
    earth([
      [
        'Soil, Water, and Rocks',
        'Earth’s crust is packed with different soils, fresh water, and hard mineral rocks.',
        'Clay soil feels sticky and molds easily, while sandy soil drains water quickly 🪴.',
        'Medium',
      ],
      [
        'Weather Safety',
        'Checking weather warnings helps families stay prepared and safe from storms.',
        'Pack an emergency bag with flashlights and food before strong typhoons hit 🎒.',
        'Medium',
      ],
      [
        'The Sun, Moon, and Stars',
        'The sun is a star, and the moon orbits Earth showing different bright shapes each week.',
        'Notice how the moon changes from a thin crescent 🌙 to a full glowing circle 🌕.',
        'Hard',
      ],
    ]),
  ],
  4: [
    math([
      [
        'Multi-digit Operations',
        'Multiply and divide larger whole numbers by working place by place.',
        'Solve 450 ÷ 5 by thinking 45 tens divided by 5 equals 9 tens, which is 90!',
        'Hard',
      ],
      [
        'Equivalent Fractions and Decimals',
        'Fractions and decimals can represent the exact same part of a whole.',
        '1/2 of a dollar is the same as 50 cents ($0.50) 🪙.',
        'Hard',
      ],
      [
        'Angles and Geometry',
        'Angles measure turns in degrees; triangles have three sides and three angles.',
        'A square corner makes a 90° right angle, just like the corner of your textbook 📐.',
        'Medium',
      ],
    ]),
    matter([
      [
        'Absorption and Floating',
        'Some objects float on top of water while denser objects sink straight to the bottom.',
        'A light plastic bottle cap floats on water 🧴, but a metal coin sinks immediately 🪙.',
        'Medium',
      ],
      [
        'Decay and Decomposition',
        'Organic waste breaks down naturally into nutrient-rich soil over time.',
        'Fallen banana peels turn dark and rot into rich garden soil 🍌.',
        'Hard',
      ],
      [
        'Physical and Chemical Changes',
        'Physical changes alter shape without making new materials; chemical changes create new substances.',
        'Folding paper is a physical change 📄, but burning wood into ash is a chemical change 🔥.',
        'Hard',
      ],
    ]),
    living([
      [
        'Internal Organs and Health',
        'Your brain, heart, lungs, and stomach work together inside your body every second.',
        'Lungs breathe in oxygen 🫁, and your heart pumps it through your bloodstream ❤️.',
        'Hard',
      ],
      [
        'Habitat Adaptations',
        'Adaptations are special body parts or behaviors that help creatures survive in their habitat.',
        'A camel stores energy in its hump to cross dry deserts without frequent water 🐪.',
        'Hard',
      ],
      [
        'Metamorphosis',
        'Some animals transform through distinct body stages before becoming adults.',
        'A frog begins as an egg in water, hatches into a swimming tadpole, and becomes an adult frog 🐸.',
        'Medium',
      ],
    ]),
    force([
      [
        'Force Changes Motion and Shape',
        'Forces can speed things up, slow them down, change direction, or squish their shape.',
        'Squeezing playdough squashes its shape, and kicking a ball changes where it flies ⚽.',
        'Medium',
      ],
      [
        'Simple Machines and Safety',
        'Simple machines like ramps, levers, and pulleys make heavy lifting much easier.',
        'Walking up a ramp lets you roll heavy cargo upward with less effort than lifting 🛒.',
        'Hard',
      ],
      [
        'Light, Sound, and Heat Transfer',
        'Energy travels through materials; light reflects, and heat conducts through metals.',
        'A metal spoon left in hot soup warms up quickly because metal conducts heat 🍲.',
        'Hard',
      ],
    ]),
    earth([
      [
        'Soil and Erosion',
        'Strong winds and heavy rain can wash fertile soil away from bare hills.',
        'Tree roots hold soil tight on hillsides to protect against mudslides 🌳.',
        'Hard',
      ],
      [
        'The Water Cycle',
        'Water continuously evaporates into clouds, falls as rain, and flows into rivers.',
        'Sunlight heats the sea, water vapor rises to form rain clouds, and rain falls again 🌧️.',
        'Medium',
      ],
      [
        'Weather Instruments',
        'Meteorologists use special tools like thermometers and rain gauges to measure the weather.',
        'A thermometer reads temperature in degrees Celsius to show how hot or cool the day is 🌡️.',
        'Hard',
      ],
    ]),
  ],
  5: [
    math([
      [
        'Fractions, Decimals, and Percentages',
        'Fractions, decimals, and percents are different ways of showing parts of a whole.',
        '3/4 of a pizza is the same as 0.75, or 75% of the entire pizza 🍕!',
        'Hard',
      ],
      [
        'Ratios and Proportions',
        'A ratio compares two quantities to show how their amounts relate.',
        'A recipe uses 2 cups of rice for every 3 cups of water—that is a 2:3 ratio 🍚.',
        'Hard',
      ],
      [
        'Volume and Coordinate Grids',
        'Volume measures 3D space in cubic units; coordinate grids pinpoint exact locations with (x, y).',
        'A toy box 4 units long, 2 units wide, and 3 units high holds 24 cubic units of toys 📦.',
        'Hard',
      ],
    ]),
    matter([
      [
        'Materials and Their Uses',
        'We choose materials based on their properties like strength, weight, and conductivity.',
        'Copper is used inside electrical wires because electric current flows through it easily 🔌.',
        'Hard',
      ],
      [
        'The Five Rs',
        'Reduce, Reuse, Recycle, Repair, and Rot help protect the environment from excess waste.',
        'Sew a torn backpack instead of throwing it away to keep our planet cleaner 🎒.',
        'Medium',
      ],
      [
        'Heat and Oxygen Changes',
        'Exposing materials to intense heat or oxygen can trigger irreversible chemical changes.',
        'Iron left outside in wet air reacts with oxygen to form reddish-brown rust 🧲.',
        'Hard',
      ],
    ]),
    living([
      [
        'Human Growth and Puberty',
        'Puberty is a natural stage of growing up when bodies develop into young adulthood.',
        'Growth spurts and voice changes are healthy, normal parts of growing up tall and strong 🌱.',
        'Hard',
      ],
      [
        'Plant Reproduction',
        'Flowering plants produce seeds through pollination, often helped by busy insects and wind.',
        'Honeybees collect nectar and carry yellow pollen grains from flower to flower 🐝🌻.',
        'Hard',
      ],
      [
        'Animal Reproduction and Ecosystems',
        'Animals reproduce to continue their species and maintain balance in food webs.',
        'Coral reefs provide nurseries where juvenile fish grow and feed safely 🐠🪸.',
        'Impossible',
      ],
    ]),
    force([
      [
        'Speed, Distance, and Time',
        'Speed tells how fast something travels over distance in a specific amount of time.',
        'A cyclist pedaling 30 kilometers in 2 hours travels at a speed of 15 km/h 🚲.',
        'Hard',
      ],
      [
        'Series and Parallel Circuits',
        'Series circuits have one path; parallel circuits have separate branches for electric current.',
        'In home lights wired in parallel, turning off bedroom lights keeps the kitchen lights on 💡.',
        'Hard',
      ],
      [
        'Electromagnets',
        'Running electricity through a coiled wire creates a temporary, controllable magnet.',
        'Wrap wire around an iron nail and attach a battery to pick up paperclips 🔋🧲.',
        'Impossible',
      ],
    ]),
    earth([
      [
        'Weathering and Soil Erosion',
        'Weathering cracks rocks into fragments, and erosion carries those pieces to new places.',
        'Ocean waves crash against rocky cliffs, slowly grinding them into sandy beaches 🏖️.',
        'Hard',
      ],
      [
        'Tropical Cyclones',
        'Tropical cyclones are powerful rotating storms that form over warm ocean waters.',
        'Typhoons bring heavy rainfall, strong gusting winds, and storm surges along coastlines 🌀.',
        'Hard',
      ],
      [
        'Moon Phases and Constellations',
        'The moon orbits Earth creating changing lit phases, while stars form constellations.',
        'The Southern Cross and Orion are famous patterns of stars visible in clear night skies ✨.',
        'Impossible',
      ],
    ]),
  ],
  6: [
    math([
      [
        'Integers and Rational Numbers',
        'Integers include positive numbers, negative numbers, and zero along a number line.',
        'A submarine dives 20 meters below sea level (-20) and rises 5 meters to reach -15 m 🌊.',
        'Hard',
      ],
      [
        'Expressions and Equations',
        'Equations use letters as unknown variables and balance two sides with an equals sign.',
        'In the equation 2x + 4 = 10, subtracting 4 gives 2x = 6, meaning x = 3 ✏️.',
        'Hard',
      ],
      [
        'Statistics and Probability',
        'Data sets can be summarized using the mean (average), and probability predicts chance.',
        'Flipping a standard coin gives a 1 out of 2 (50%) probability of landing on heads 🪙.',
        'Impossible',
      ],
    ]),
    matter([
      [
        'Mixtures and Their Properties',
        'A mixture combines two or more substances that each keep their original properties.',
        'Fruit salad mixes mangoes, bananas, and apples while keeping their original flavors 🥗.',
        'Medium',
      ],
      [
        'Homogeneous and Heterogeneous Mixtures',
        'Homogeneous mixtures look completely uniform; heterogeneous mixtures have visible parts.',
        'Stirred salt water looks identical throughout, but oil floating on water separates clearly 🧪.',
        'Hard',
      ],
      [
        'Separating Mixtures',
        'Mixtures can be separated using filtration, evaporation, magnets, or sieves.',
        'Boil salt water to evaporate the water and leave crystal salt behind in the pan 🧂.',
        'Impossible',
      ],
    ]),
    living([
      [
        'Organ System Interactions',
        'Your body systems cooperate: digestion absorbs nutrients and blood circulates them.',
        'The digestive system breaks down lunch, and the bloodstream delivers energy to muscles 🏃.',
        'Impossible',
      ],
      [
        'Vertebrates and Invertebrates',
        'Vertebrates have internal backbones, while invertebrates have soft bodies or exoskeletons.',
        'Frogs and eagles are vertebrates 🦅; butterflies and crabs are invertebrates 🦀.',
        'Hard',
      ],
      [
        'Rainforests, Reefs, and Mangroves',
        'Tropical ecosystems support thousands of plant and animal species that protect coastlines.',
        'Mangrove root forests trap silt and protect young fish from ocean predators 🌿🐟.',
        'Impossible',
      ],
    ]),
    force([
      [
        'Gravity and Friction',
        'Gravity pulls objects toward Earth, while friction resists sliding between two surfaces.',
        'Rubber sneakers grip gym floors with high friction so you do not slip during games 👟.',
        'Hard',
      ],
      [
        'Potential and Kinetic Energy',
        'Potential energy is stored energy; kinetic energy is the energy of active motion.',
        'A roller coaster car at the very top of a hill holds potential energy before it zooms down 🎢.',
        'Hard',
      ],
      [
        'Six Simple Machines',
        'Levers, pulleys, inclined planes, screws, wedges, and wheels make work easier.',
        'A flagpole uses a pulley wheel at the top to lift flags smoothly from the ground 🚩.',
        'Impossible',
      ],
    ]),
    earth([
      [
        'Plate Tectonics',
        'Earth’s crust is split into giant moving plates whose collisions build mountain ranges.',
        'Two continental plates pushing against each other crumple upward to create high peaks 🏔️.',
        'Impossible',
      ],
      [
        'Earthquakes and Volcanoes',
        'Pressure built up deep inside Earth releases energy through quakes and volcanic vents.',
        'During earthquake shaking, remember to Drop, Cover, and Hold Under a sturdy desk 🪑.',
        'Hard',
      ],
      [
        'The Solar System and Space Exploration',
        'Eight planets orbit the Sun, while Earth rotates daily to create day and night.',
        'Earth completes one full rotation every 24 hours and orbits the Sun once every year 🌍☀️.',
        'Impossible',
      ],
    ]),
  ],
};

const expandedMath: Record<number, LessonInput[]> = {
  1: [
    [
      'Ordinal Numbers',
      'Ordinal numbers tell the position or rank of something in an ordered line.',
      'In a race: 1st is First 🥇, 2nd is Second 🥈, and 3rd is Third 🥉!',
      'Easy',
    ],
    [
      'Fractions',
      'A fraction represents equal parts of one whole object.',
      'Slice an apple into 2 equal halves: each piece is 1/2 of the apple 🍎.',
      'Easy',
    ],
    [
      'Time and Measurement',
      'Clocks tell time with hour and minute hands, and rulers measure length.',
      'Short hand pointing at 3 and long hand at 12 means it is 3:00 o’clock 🕒.',
      'Medium',
    ],
    [
      'Pictographs',
      'A pictograph uses pictures and symbols to show and compare quantities.',
      'Drawing 4 apple icons 🍎🍎🍎🍎 means 4 students voted for apples.',
      'Easy',
    ],
  ],
  2: [
    [
      'Multiplication and Division Concepts',
      'Multiplication combines equal groups, while division shares a total fairly.',
      '3 plates with 2 cookies each make 3 × 2 = 6 cookies 🍪.',
      'Medium',
    ],
    [
      'Symmetry and Shapes',
      'A shape is symmetrical when both halves match perfectly across a center line.',
      'A butterfly’s left wing matches its right wing in size and pattern 🦋.',
      'Medium',
    ],
    [
      'Bar Graphs and Probability',
      'Bar graphs use colored bars to compare quantities between categories.',
      'A bar 5 blocks tall shows that 5 children chose dogs as their favorite pet 🐕.',
      'Hard',
    ],
  ],
  3: [
    [
      'Multiplication and Division Facts',
      'Knowing basic multiplication facts helps you solve real-world math fast.',
      'Knowing that 6 × 7 = 42 helps you divide 42 candies among 6 friends equally.',
      'Medium',
    ],
    [
      'Equivalent Fractions',
      'Different fractions can name the same amount if they cover the same area.',
      'Eating 2/4 of a pancake is the exact same amount as eating 1/2 🥞.',
      'Medium',
    ],
    [
      'Lines, Angles, Area, and Perimeter',
      'Parallel lines never touch, right angles make square corners, and area tiles space.',
      'Train tracks run side-by-side as parallel lines 🛤️.',
      'Hard',
    ],
    [
      'Tally Charts',
      'Tally marks count items in easy bundles of five so data is quick to read.',
      'Four vertical marks crossed by a fifth diagonal mark represents 5 counts 📊.',
      'Easy',
    ],
  ],
  4: [
    [
      'Factors, Multiples, GCF, and LCM',
      'Factors divide numbers evenly; multiples are products in skip-counting patterns.',
      'The factors of 12 are 1, 2, 3, 4, 6, and 12 because they divide 12 with no remainder.',
      'Hard',
    ],
    [
      'Fractions and Decimals',
      'Fractions and decimals can be added and converted between forms.',
      'Adding 1/4 and 2/4 gives 3/4, which is written in decimal form as 0.75.',
      'Hard',
    ],
    [
      'Order of Operations',
      'PEMDAS rules guide which operation to solve first in multi-step equations.',
      'In 5 + 3 × 2, multiply first (3 × 2 = 6) and then add 5 to get 11 🧮.',
      'Hard',
    ],
    [
      'Area and Elapsed Time',
      'Area measures surface space, while elapsed time measures hours passed.',
      'A movie starting at 1:00 PM and ending at 2:30 PM lasts 1 hour and 30 minutes 🎬.',
      'Hard',
    ],
  ],
  5: [
    [
      'Decimals, Ratios, and Percentages',
      'Percentages represent parts per 100, connecting directly to decimal numbers.',
      'A test score of 80 out of 100 is 80%, or 0.80 in decimal form 💯.',
      'Hard',
    ],
    [
      'Polygons and Circles',
      'Polygons have straight sides; circles are measured by radius and diameter.',
      'The distance from the center of a circular wheel to its outer rim is the radius 🚲.',
      'Hard',
    ],
    [
      'Expressions and Area',
      'Evaluate multi-bracket expressions and calculate area for various geometric shapes.',
      'Multiply base by height and divide by 2 to calculate the area of any triangle 📐.',
      'Impossible',
    ],
    [
      'Pie Charts',
      'A pie chart shows parts of a whole budget or survey as circular slices.',
      'Half of a circle chart (50%) shows that half the class chose science as their favorite 🥧.',
      'Medium',
    ],
  ],
  6: [
    [
      'Integers and Word Problems',
      'Combine positive gains and negative drops to solve real-world problems.',
      'Starting with ₱50, spending ₱30 (-30), and earning ₱20 (+20) leaves you with ₱40 💵.',
      'Hard',
    ],
    [
      'Similarity and Scale',
      'Similar figures have the same shape with proportional matching side lengths.',
      'A toy car built at 1:10 scale has every part measured 10 times smaller than the real car 🏎️.',
      'Hard',
    ],
    [
      'Linear Equations',
      'Solve linear equations by applying the same operation to both sides of the equal sign.',
      'For 4x = 24, divide both sides by 4 to discover that x = 6 🎯.',
      'Hard',
    ],
    [
      'Volume, Speed, and Statistics',
      'Calculate 3D space, find travel speeds, and analyze mean and median data.',
      'Driving 120 kilometers in 2 hours means traveling at an average speed of 60 km/h 🚗.',
      'Impossible',
    ],
  ],
};

const expandedScience: Record<number, LessonInput[]> = {
  1: [
    [
      'Texture and Grouping',
      'Group items by whether their surface is smooth, rough, prickly, or fuzzy.',
      'A shiny glass marble is smooth 🔮, while tree bark feels rough 🪵.',
      'Easy',
    ],
    [
      'Needs of Living Things',
      'All living animals and plants need air, water, and food to survive.',
      'A potted plant placed in sunshine and given water blooms with green leaves 🌻.',
      'Easy',
    ],
  ],
  2: [
    [
      'Changes of Matter',
      'Adding heat melts ice into water, while cooling freezes water into solid ice.',
      'Hot sunshine warms an ice cube until it turns into a puddle of water ☀️💧.',
      'Medium',
    ],
    [
      'Habitats and Diets',
      'Herbivores eat plants, carnivores eat meat, and omnivores eat both.',
      'A deer eats grass in meadows 🦌, while a sea turtle grazes on marine seagrass 🐢.',
      'Medium',
    ],
    [
      'Electricity and Magnetism',
      'Magnets attract iron objects, and static charges can pull lightweight materials.',
      'A horseshoe magnet lifts steel paper clips right off your desk 🧲.',
      'Hard',
    ],
  ],
  3: [
    [
      'Three States of Matter',
      'Solids keep their form, liquids take container shape, and gases spread freely.',
      'A wooden block is solid, milk fills a glass, and helium fills a balloon 🎈.',
      'Medium',
    ],
    [
      'Animal Life Cycles',
      'Different animals develop through unique, orderly life cycle stages.',
      'Frogs hatch as swimming tadpoles before growing legs and lungs to live on land 🐸.',
      'Hard',
    ],
    [
      'Gravity and Soil',
      'Gravity keeps our feet on the ground, while rich soil nourishes plant roots.',
      'A ripe mango drops to the ground when it detaches from a branch 🥭.',
      'Hard',
    ],
  ],
  4: [
    [
      'Physical and Chemical Changes',
      'Rusting and baking create new substances, while tearing paper only alters shape.',
      'A bicycle chain left out in the rain rusts as iron reacts with moist air 🚲.',
      'Hard',
    ],
    [
      'Organ Systems and Adaptations',
      'Body bones protect vital organs, and special traits help wildlife survive.',
      'Your strong skull protects your brain from bumps and injuries 🧠.',
      'Hard',
    ],
    [
      'The Water Cycle',
      'Sunlight evaporates water, water vapor condenses into clouds, and rain falls.',
      'Watch warm steam rise from a hot cup and condense into water drops on a cool lid ☕.',
      'Medium',
    ],
  ],
  5: [
    [
      'The Five Rs',
      'Repairing worn clothes and composting organic peels keeps trash out of landfills.',
      'Compost banana and vegetable scraps to make healthy soil for garden vegetables 🍌🌱.',
      'Medium',
    ],
    [
      'Plant Reproduction',
      'Pollination moves pollen between flowers so fruit and seeds can develop.',
      'Butterflies sipping flower nectar transfer pollen on their legs 🦋🌸.',
      'Hard',
    ],
    [
      'Series and Parallel Circuits',
      'Parallel wiring lets other lights stay bright even if one light bulb burns out.',
      'Classroom lights stay illuminated even if one light bulb in the hallway is unplugged 💡.',
      'Hard',
    ],
    [
      'Weathering and Erosion',
      'Weathering breaks big rocks apart, and wind or rain carries the gravel away.',
      'Tree roots growing into rock crevices can slowly split solid boulders over time 🌲🪨.',
      'Hard',
    ],
  ],
  6: [
    [
      'Separating Mixtures',
      'Use sieves to separate particles by size, or use magnets to pull iron filings.',
      'Pour sandy water through a paper coffee filter to trap the sand while clean water passes 🧪.',
      'Hard',
    ],
    [
      'Body System Interactions',
      'Lungs supply fresh oxygen, and your beating heart pumps it to hardworking muscles.',
      'When you sprint, your breathing quickens to deliver more oxygen to leg muscles 🏃💨.',
      'Impossible',
    ],
    [
      'Energy Transformations',
      'Batteries convert chemical energy into electricity, which light bulbs turn into light.',
      'Turning on a flashlight turns stored battery power into a bright beam of light 🔦.',
      'Hard',
    ],
    [
      'Plate Tectonics and Space',
      'Tectonic collisions create earthquakes, while Earth’s yearly orbit brings seasons.',
      'Earth rotates on its axis every 24 hours to give us daytime and nighttime 🌏.',
      'Impossible',
    ],
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
    const target = curriculum[grade].find(
      (item) => item.title === scienceSubjectByLesson[lesson.title],
    );
    target?.lessons.push(lesson);
  }
}

export const assetSourcePath = 'assets/BiosphereQuestAssets';