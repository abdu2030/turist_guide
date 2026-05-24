# 🏙️ Nova Crest Multimodal Tourist Kiosk

An interactive, voice-activated smart tourist guide kiosk designed for the vibrant, cosmopolitan coastal city of **Nova Crest**. Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**, this application demonstrates a premium, high-fidelity multimodal user experience combining touch navigation, natural language voice controls, speech synthesis, and real-time synthesized audio.

---

## 🌟 Key Features

*   **Multimodal Interaction:** Seamlessly switch between tactile touchscreen controls and natural-sounding voice navigation.
*   **Speech Recognition (Speech-to-Text):** Powered by the native Web Speech API. Users can speak naturally to search for locations, filter by category, go back, or request assistance.
*   **Speech Synthesis (Text-to-Speech):** Synthesizes high-quality, spoken voice descriptions of local hot spots, directions, ratings, and instructions using natural-sounding browser voices.
*   **Procedural Sound Synthesis:** Dynamic UI sound effects (taps, success chimes, voice-listening start/stop tones, error buzzes) are generated programmatically in real-time using the **Web Audio API**—no static audio assets or file requests required.
*   **Idle Screensaver & Inactivity Detection:** Returns to a gorgeous splash screen containing city stats and a live clock after 60 seconds of inactivity, protecting kiosk screens and welcoming the next visitor.
*   **Premium Visual Design:** Features glassmorphism, responsive sidebar navigation, interactive location grids, animated voice wave panels, custom star ratings, and tailored Tailwind gradients.

---

## 🛠️ Technology Stack

*   **Framework:** [React 19](https://react.dev/)
*   **Build Tool:** [Vite 7](https://vite.dev/)
*   **Language:** [TypeScript](https://www.typescript.org/)
*   **Styling:** [Tailwind CSS v4.0](https://tailwindcss.com/) (using `@tailwindcss/vite`)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **APIs:**
    *   [Web Speech API (SpeechRecognition)](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
    *   [Web Speech API (SpeechSynthesis)](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)
    *   [Web Audio API (AudioContext)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

## 📂 Project Architecture

The codebase is organized logically into modular components, custom hooks, and utilities:

```text
src/
├── App.tsx                        # Root routing, layout, and idle timer integration
├── components/
│   ├── screens/
│   │   ├── SplashScreen.tsx       # Welcoming screensaver and wake-word listener
│   │   └── KioskScreen.tsx        # Main dashboard displaying locations, categories, and panels
│   └── ui/
│       ├── TopBar.tsx             # Header displaying clock, date, and branding
│       ├── CategorySidebar.tsx    # Left-hand category filter tabs (Touch controls)
│       ├── SearchBar.tsx          # Real-time search query input field
│       ├── LocationCard.tsx       # Grid cards displaying item summary & gradients
│       ├── LocationDetail.tsx     # Full modal containing details, hours, and speech options
│       ├── VoicePanel.tsx         # Visual voice waveforms, transcripts, and status
│       └── StarRating.tsx         # Custom star display indicator
├── hooks/
│   ├── useSpeechRecognition.ts    # Custom hook wrapping the Web Speech API (Input)
│   ├── useSpeechSynthesis.ts      # Custom hook wrapping the Web Speech API (Output)
│   ├── useSoundEffects.ts         # Programmatic sound wave synthesizers (Web Audio API)
│   └── useIdleTimer.ts            # Activity listener to auto-return to splash screen
├── data/
│   └── locations.ts               # Local database containing 10 curated locations & helpers
├── utils/
│   ├── voiceCommands.ts           # Natural Language processing & command router
│   └── cn.ts                      # Class merging utility (clsx + tailwind-merge)
└── types/
    └── index.ts                   # TypeScript interfaces (AppState, Actions, etc.)
```

---

## 🎤 Supported Voice Commands

The voice processing system (`src/utils/voiceCommands.ts`) matches speech transcripts against key patterns and executes corresponding actions:

| Category | Example Phrases | Action Performed |
| :--- | :--- | :--- |
| **All Categories** | *"show all"*, *"home"*, *"reset"*, *"display everything"* | Resets filters to show all categories. |
| **Food & Dining** | *"show restaurants"*, *"where can I eat"*, *"I'm hungry"*, *"find coffee"* | Filters to show Food spots. |
| **Attractions** | *"show attractions"*, *"things to do"*, *"what can I visit"*, *"explore"* | Filters to show Attractions. |
| **Transport** | *"how do I travel"*, *"where is the metro"*, *"find a bus"*, *"ferry terminal"* | Filters to show Transport options. |
| **Search (Generic)** | *"search for pizza"*, *"find the art museum"*, *"where is Harbor View"* | Runs a full-text search query. |
| **Help & Guide** | *"help"*, *"options"*, *"what can I say"* | Plays a help description listing command options. |
| **Navigation / Close** | *"go back"*, *"close"*, *"dismiss"*, *"clear"* | Closes open modals or returns to the home view. |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended).

### Installation

1. Clone or copy the repository files.
2. In the project root, install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the local development server with hot-reloading:
```bash
npm run dev
```
Once started, open the local URL (usually `http://localhost:5173`) in your web browser.

### Building for Production

To compile the application code and bundle it into optimized static assets:
```bash
npm run build
```
The output files will be built inside the `dist` directory, packaged to run on any static web hosting provider.

---

## 🔒 Browser Compatibility

*   **Speech Recognition:** Best experienced in **Google Chrome** or **Microsoft Edge**, which support the native SpeechRecognition API fully out-of-the-box.
*   **Microphone Permissions:** The app will prompt for microphone permissions when clicking "Speak to Search" or when detecting voice inputs on the splash screen.
*   **Web Audio API:** Supported in all modern browsers (Chrome, Edge, Safari, Firefox).
