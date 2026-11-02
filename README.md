# 🌱 Biosphere Quest: Educational Mobile Game App

[![React Native](https://img.shields.io/badge/React%20Native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#FFFFFF)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> *An immersive, curriculum-aligned educational mobile game built with React Native and Expo, designed to make mathematics and science engaging for elementary students.*

## 🚀 Overview

**Biosphere Quest** is a gamified educational mobile application developed as part of our Mobile Computing coursework. It bridges software engineering principles with interactive pedagogy by aligning its learning modules and mini-games directly with the official **MATATAG Curriculum (Grades 1 to 6)**. Players embark on a learning adventure guided by mascots **Stella and Astro**, utilizing interactive digital notebooks, study schedulers, dashboards, and dynamic quiz engines.

## ✨ Key Features

* **MATATAG Curriculum Alignment:** Procedurally generated and curated math and science challenges tailored specifically for Grades 1 through 6.
* **Infinite Quiz Engine (`QuizGame.tsx`):** Features a timer-based, non-repeating question generator with multiple-choice mechanics, exact XP progression (+30 XP per correct answer), and anti-cheat constraints.
* **Engaging Mascots:** Guided interactive elements featuring Stella and Astro to enhance student motivation.
* **Digital Notebook & Dashboard:** Built-in productivity and study tools for tracking learning progress.
* **Cross-Platform Mobile Architecture:** Built with **React Native**, **Expo**, and **TypeScript** for seamless performance across mobile devices.

## 🛠️ Tech Stack

* **Framework:** React Native / Expo
* **Language:** TypeScript / ES6 JavaScript
* **Styling:** StyleSheet & Linear Gradients (`expo-linear-gradient`)
* **Audio/SFX:** `expo-audio` for interactive sound effects (Button clicks, correct/wrong answers)
* **Animations:** React Native `Animated` API for responsive touch feedback

## 📂 Project Structure

```
BiosphereQuest/
├── assets/                  # Sound effects, music, and mascot graphics
├── src/
│   ├── components/          # Reusable UI components & MinigameMotion wrapper
│   ├── screens/             # Main game screens, dashboards, and digital notebooks
│   └── data/                # Curriculum question generators and data sets
├── App.tsx                  # Root application entry point
└── README.md                # Project documentation
```

## ⚙️ Getting Started & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/biosphere-quest.git
   cd biosphere-quest
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npx expo start
   ```
   *Scan the generated QR code using the **Expo Go** app on your mobile device (iOS or Android).*

## 🎯 Academic & Development Context

Developed as an undergraduate Computer Science capstone/course project for Mobile Computing. It demonstrates mastery over mobile computing fundamentals, JavaScript/ES6 logic, ReactJS component design, and React Native mobile deployment.

---

*© 2026 Biosphere Quest Team. All rights reserved.*
