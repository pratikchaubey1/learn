import { TestType } from '../types';

// New, modern, abstract illustrations designed as backgrounds

const mathIllustration = `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="newMathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3730a3"/>
      <stop offset="100%" stop-color="#5b21b6"/>
    </linearGradient>
    <filter id="mathGlow"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>
  <rect width="100" height="125" fill="url(#newMathGrad)"/>
  <path d="M-10 120 L110 50" stroke="#a78bfa" stroke-width="10" opacity="0.2" filter="url(#mathGlow)"/>
  <path d="M-10 80 L110 10" stroke="#c4b5fd" stroke-width="15" opacity="0.2" filter="url(#mathGlow)"/>
  <circle cx="80" cy="20" r="15" fill="#f472b6" opacity="0.5" filter="url(#mathGlow)"/>
  <rect x="10" y="70" width="30" height="30" rx="5" stroke="#e9d5ff" stroke-width="2" fill="none" transform="rotate(-15 25 85)"/>
  <path d="M-10 40 L40 50 L-10 60 Z" fill="#c4b5fd" opacity="0.4"/>
</svg>`;

const readingIllustration = `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="newReadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <rect width="100" height="125" fill="url(#newReadGrad)"/>
  <path d="M-5 0 C 40 20, 60 0, 105 20 V 105 C 60 85, 40 105, -5 85 Z" fill="#fbbf24" opacity="0.3"/>
  <path d="M-5 20 C 40 40, 60 20, 105 40 V 125 C 60 105, 40 125, -5 105 Z" fill="#fcd34d" opacity="0.3"/>
  <path d="M20 50 H 80 M 20 60 H 70 M 20 70 H 80 M 20 80 H 60" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
</svg>`;

const scienceIllustration = `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="newSciGrad" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
    <filter id="sciGlow"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="100" height="125" fill="url(#newSciGrad)"/>
  <circle cx="50" cy="62.5" r="40" stroke="#6ee7b7" stroke-width="1" fill="none" opacity="0.5"/>
  <ellipse cx="50" cy="62.5" rx="40" ry="15" stroke="#a7f3d0" stroke-width="1.5" fill="none" opacity="0.8"/>
  <ellipse cx="50" cy="62.5" rx="40" ry="15" stroke="#a7f3d0" stroke-width="1.5" fill="none" opacity="0.8" transform="rotate(60 50 62.5)"/>
  <ellipse cx="50" cy="62.5" rx="40" ry="15" stroke="#a7f3d0" stroke-width="1.5" fill="none" opacity="0.8" transform="rotate(120 50 62.5)"/>
  <circle cx="50" cy="62.5" r="8" fill="#ccfbf1" filter="url(#sciGlow)"/>
</svg>`;

const historyIllustration = `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="newHistGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
  </defs>
  <rect width="100" height="125" fill="url(#newHistGrad)"/>
  <rect x="15" y="-10" width="15" height="145" fill="#fecaca" opacity="0.2" transform="rotate(10 22.5 62.5)"/>
  <rect x="45" y="-10" width="10" height="145" fill="#fecaca" opacity="0.2" transform="rotate(10 50 62.5)"/>
  <rect x="70" y="-10" width="20" height="145" fill="#fecaca" opacity="0.2" transform="rotate(10 80 62.5)"/>
  <path d="M10 110 Q 50 100 90 110" stroke="#fed7d7" stroke-width="2" fill="none"/>
  <path d="M10 20 Q 50 30 90 20" stroke="#fed7d7" stroke-width="2" fill="none"/>
</svg>`;

const diagnosticIllustration = `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="newDiagGrad" x1="100%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="diagGlow"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="100" height="125" fill="url(#newDiagGrad)"/>
  <path d="M-10 10 L 110 115 M 110 10 L -10 115" stroke="#94a3b8" stroke-width="1" opacity="0.3"/>
  <circle cx="50" cy="62.5" r="30" stroke="#e2e8f0" stroke-width="3" fill="none"/>
  <path d="M75 87.5 L 90 105" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round"/>
  <path d="M50 45 L 50 80 M 32.5 62.5 L 67.5 62.5" stroke="#f1f5f9" stroke-width="2.5" stroke-linecap="round" filter="url(#diagGlow)"/>
</svg>`;

const chemistryIllustration = `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="newChemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="chemGlow"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="100" height="125" fill="url(#newChemGrad)"/>
  <path d="M 30 110 L 20 50 H 50 L 40 110 Z" stroke="#a7f3d0" stroke-width="2" fill="#6ee7b7" opacity="0.3"/>
  <path d="M 70 110 L 60 40 L 90 60 L 80 110 Z" stroke="#a7f3d0" stroke-width="2" fill="#6ee7b7" opacity="0.3" transform="rotate(10 75 75)"/>
  <circle cx="25" cy="25" r="5" fill="#d1fae5" filter="url(#chemGlow)"/>
  <circle cx="50" cy="30" r="8" fill="#d1fae5" filter="url(#chemGlow)"/>
  <circle cx="75" cy="20" r="6" fill="#d1fae5" filter="url(#chemGlow)"/>
</svg>`;

const psychologyIllustration = `<svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="newPsychGrad" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="100" height="125" fill="url(#newPsychGrad)"/>
  <circle cx="50" cy="62.5" r="40" fill="#c4b5fd" opacity="0.1"/>
  <path d="M 50 22.5 C 25 22.5, 25 62.5, 50 62.5 C 75 62.5, 75 22.5, 50 22.5 Z" stroke="#e9d5ff" stroke-width="2" fill="none" opacity="0.5"/>
  <path d="M 50 102.5 C 25 102.5, 25 62.5, 50 62.5 C 75 62.5, 75 102.5, 50 102.5 Z" stroke="#e9d5ff" stroke-width="2" fill="none" opacity="0.5"/>
  <circle cx="50" cy="62.5" r="5" fill="#f5f3ff"/>
</svg>`;

export const testIllustrations: Record<TestType, string> = {
  [TestType.ADAPTIVE_SAT_MATH]: mathIllustration,
  [TestType.ADAPTIVE_ACT_MATH]: mathIllustration,
  [TestType.SAT_DIAGNOSTIC]: diagnosticIllustration,
  [TestType.ACT_DIAGNOSTIC]: diagnosticIllustration,
  [TestType.AP_DIAGNOSTIC]: diagnosticIllustration,
  [TestType.SAT_MATH]: mathIllustration,
  [TestType.SAT_RW]: readingIllustration,
  [TestType.ACT_MATH]: mathIllustration,
  [TestType.ACT_SCIENCE]: scienceIllustration,
  [TestType.ACT_READING]: readingIllustration,
  [TestType.AP_CALC_AB]: mathIllustration,
  [TestType.AP_USH]: historyIllustration,
  [TestType.AP_BIOLOGY]: scienceIllustration,
  [TestType.AP_LIT]: readingIllustration,
  [TestType.AP_PHYSICS_1]: scienceIllustration,
  [TestType.SAT_ALGEBRA]: mathIllustration,
  [TestType.SAT_GEOMETRY]: mathIllustration,
  [TestType.ACT_ENGLISH]: readingIllustration,
  [TestType.ACT_WRITING]: readingIllustration,
  [TestType.AP_WORLD_HISTORY]: historyIllustration,
  [TestType.AP_CHEMISTRY]: chemistryIllustration,
  [TestType.AP_PSYCHOLOGY]: psychologyIllustration,
  [TestType.DAILY_QUIZ]: diagnosticIllustration,
  [TestType.CONCEPT_CHECK_QUIZ]: diagnosticIllustration,

  // Mocks - map to existing illustrations
  [TestType.SAT_MATH_MOCK]: mathIllustration,
  [TestType.SAT_RW_MOCK]: readingIllustration,
  [TestType.SAT_ALGEBRA_MOCK]: mathIllustration,
  [TestType.SAT_GEOMETRY_MOCK]: mathIllustration,
  [TestType.ACT_MATH_MOCK]: mathIllustration,
  [TestType.ACT_SCIENCE_MOCK]: scienceIllustration,
  [TestType.ACT_READING_MOCK]: readingIllustration,
  [TestType.ACT_ENGLISH_MOCK]: readingIllustration,
  [TestType.AP_CALC_AB_MOCK]: mathIllustration,
  [TestType.AP_USH_MOCK]: historyIllustration,
  [TestType.AP_BIOLOGY_MOCK]: scienceIllustration,
};