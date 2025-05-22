---
trigger: manual
---

Rule Description:
Maintain a consistent, scalable, and feature-driven folder structure throughout the codebase. Prevent file sprawl, ensure proper modularization, and enforce clear organization to support long-term growth and ease of collaboration.

📁 Base Structure (under src/)
graphql
Copy
Edit
src/
├── app/                 # App-wide setup (layout, styles, context, themes)
│   ├── layout/
│   ├── providers/
│   └── styles/
│
├── features/            # Feature-based modules (clients, tasks, sales, etc.)
│   └── [feature]/
│       ├── components/   # Feature-specific components
│       ├── api/          # RTK Query slices or API logic
│       ├── hooks/        # Custom hooks tied to the feature
│       ├── types/        # Feature-specific types
│       └── [feature].slice.ts
│
├── pages/               # Top-level route-based pages (Home, Clients, etc.)
│   └── [PageName]/       # Group components by page
│       └── index.tsx
│
├── shared/              # Reusable logic across features
│   ├── components/       # Global UI components
│   ├── hooks/
│   ├── utils/
│   └── types/
│
├── store/               # Global Redux store and reducers
│   ├── store.ts
│   └── rootReducer.ts
│
└── App.tsx              # Root component
🚦 Folder Rules & Enforcement
No folders without purpose. Each folder must have a clear role (feature, page, or shared utility).

No “misc”, “common2”, or “temp” folders. Use shared/ for common utilities or components.

Every features/ folder must include its own components/, api/, types/, and optionally hooks/.

Avoid flat files in features/—group into folders when more than one file exists.

All reusable logic goes in shared/, never duplicated in multiple features.

Pages should only contain route-based components and pull from features/ or shared/.

🔍 Naming & Structure Conventions
Use kebab-case for folders (e.g., client-details, not ClientDetails).

Use PascalCase for component files (e.g., ClientCard.tsx).

Feature slices must be named: [feature].slice.ts and kept in their feature folder.

Use barrel exports (index.ts) in all subfolders to simplify imports.

✅ Enforcement Guidance:
This rule should be applied during all file generation, code reviews, and structural updates. New contributors should be guided to this rule and the base structure to ensure scalable development practices.