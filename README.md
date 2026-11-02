# 🌱 Biosphere Quest: Educational Mobile Game App

[![React Native](https://img.shields.io/badge/React%20Native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#FFFFFF)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MATATAG Curriculum](https://img.shields.io/badge/Curriculum-DepEd%20MATATAG%20(G1--6)-success?style=for-the-badge)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> *An immersive, gamified educational mobile application built with React Native and Expo, designed to bridge foundational Computer Science principles with the Philippine Department of Education's official MATATAG Curriculum (Grades 1 to 6).*

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [Educational Framework & Philosophy](#-educational-framework--philosophy)
3. [The 7 Core Mini-Games Suite](#-the-7-core-mini-games-suite)
4. [Mascot Companions (Stella & Astro)](#-mascot-companions-stella--astro)
5. [Technical Architecture & Tech Stack](#-technical-architecture--tech-stack)
6. [Project Directory Structure](#-project-directory-structure)
7. [Getting Started & Installation](#️-getting-started--installation)
8. [Academic & Coursework Context](#-academic--coursework-context)

---

## 🚀 Overview

**Biosphere Quest** is an enterprise-grade mobile game app engineered as an undergraduate Computer Science capstone/coursework project. It tackles modern e-learning challenges by transforming traditional elementary mathematics, science, and environmental education into interactive, rewarding quests. Guided by dynamic mascots **Stella** and **Astro**, students navigate through structured learning modules, progress via XP scaling systems, and test their competencies across a diverse collection of 7 distinct mini-games.

---

## 📚 Educational Framework & Philosophy

The application is structured around constructivist learning theories and gamification mechanics tailored for young learners:
* **Curriculum Compliance:** All questions, concept hurdles, and difficulty levels mirror the official **DepEd MATATAG Curriculum** for Grades 1 through 6.
* **Scaffolding & Progression:** Adapts from basic counting, pattern recognition, and ecological awareness (Grade 1) to advanced algebraic equations, geometry, fractions, and ecological equilibrium (Grade 6).
* **Positive Reinforcement Loop:** Immediate audiovisual feedback loops reward correct answers (+30 XP per success) while encouraging persistence without penalizing user advancement through unfair failure states.

---

## 🎮 The 7 Core Mini-Games Suite

To prevent repetitive gameplay and ensure holistic cognitive development, *Biosphere Quest* features 7 unique mini-games targeting different learning dimensions:

1. **🧠 MATATAG Quiz Challenge:** An infinite, procedurally generated multiple-choice timer game covering core curriculum questions across Math and Science with strict anti-cheat validations.
2. **♻️ Eco-Sort Swipe:** A fast-paced recycling sorting game where players categorize waste items into Biodegradable, Non-Biodegradable, and Recyclable bins.
3. **🔢 Number Whack / Math Smash:** A quick-fire number-pattern tapping game focusing on counting sequences, multiples, and divisibility rules.
4. **🃏 Flora & Fauna Memory Match:** A card-flipping memory game featuring endangered Philippine endemic species, flora, and fauna to foster ecological awareness.
5. **🔤 Word Scramble / Eco-Lexicon:** A vocabulary building puzzle where students unscramble letters to form core environmental and scientific terminology.
6. **🧩 Ecosystem Grid Builder:** A spatial puzzle game where learners connect food webs and ecological components to maintain biosphere balance.
7. **🚀 Rocket Launch Math Runner:** An action-packed calculation challenge where solving rapid math equations fuels Stella and Astro's rocket to subsequent planetary biospheres.

---

## 🪐 Mascot Companions (Stella & Astro)

* **Stella:** The brilliant ecological scientist who guides players through environmental stewardship, flora/fauna facts, and science modules.
* **Astro:** The adventurous navigator who assists students through mathematical challenges, data tracking, and rocket progression.

---

## 🛠️ Technical Architecture & Tech Stack

* **Cross-Platform Framework:** React Native with Expo SDK, ensuring fluid cross-platform compatibility (iOS & Android).
* **Language & Type Safety:** Written entirely in strict **TypeScript** to eliminate runtime type mismatches.
* **Audio Engine:** `expo-audio` integration handling low-latency sound effects (SFX for button clicks, correct answers, and incorrect selections).
* **Animation Framework:** React Native's native-driven `Animated` API for high-performance touch feedback and layout transitions.

---

## 📂 Project Directory Structure

```text
BiosphereQuest/
├── assets/
│   ├── BiosphereQuestSoundEffectsandMusic/
│   │   └── BiosphereQuestSFX/             # Audio files (.mp3 for clicks, correct/wrong cues)
│   └── images/                            # Mascot assets, backgrounds, & game sprites
├── src/
│   ├── components/
│   │   ├── MinigameMotion.tsx             # Reusable motion wrapper for smooth scene entries
│   │   ├── QuizGame.tsx                   # Core multi-choice quiz engine component
│   │   ├── EcoSortGame.tsx                # Eco-Sort Swipe mini-game component
│   │   ├── MemoryMatchGame.tsx            # Flora & Fauna Memory Match component
│   │   └── [Other Mini-Game Components]   # Remaining mini-game modules
│   ├── screens/                           # Dashboard, Digital Notebook, and Level Selectors
│   └── data/                              # Curriculum question generators and data sets
├── App.tsx                                # Root application entry point & navigation router
└── README.md                              # Project documentation
```

---

## ⚙️ Getting Started & Installation

To run **Biosphere Quest** locally on your development machine:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/biosphere-quest.git
   cd biosphere-quest
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server via Expo:**
   ```bash
   npx expo start
   ```

4. **Launch on a physical device or emulator:**
   * Download the **Expo Go** app on your iOS or Android device.
   * Scan the terminal QR code to load the application instantly.

---

## 🎯 Academic & Coursework Context

Developed to fulfill requirements for Mobile Computing coursework, *Biosphere Quest* successfully demonstrates mastery across the course modules:
* **Module 1:** Mobile computing paradigms, evolution, and classification.
* **Module 2-3:** Advanced JavaScript/ES6 programming and ReactJS ecosystem mastery.
* **Module 4:** Component-driven development, props, events, and React Hooks.
* **Module 5:** React Native environment deployment, styling sheets, and mobile state architectures.

---

*© 2026 Biosphere Quest Development Team. All rights reserved.*
