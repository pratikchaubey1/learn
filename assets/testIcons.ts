import { TestType } from '../types';

const mathIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm0 3h.008v.008H8.25v-.008zm3-6h.008v.008H11.25v-.008zm0 3h.008v.008H11.25v-.008zm0 3h.008v.008H11.25v-.008zm3-6h.008v.008H14.25v-.008zm0 3h.008v.008H14.25v-.008zm-3 6h3M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>`;
const readingIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>`;
const scienceIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M14.25 10.5a8.25 8.25 0 00-8.25 8.25v.01a8.25 8.25 0 008.25-8.25v-.01z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 12a.75.75 0 100-1.5.75.75 0 000 1.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>`;
const historyIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" /></svg>`;
const diagnosticIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>`;
const advancedIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 2.44A14.98 14.98 0 009.63 2.44v7.5A14.98 14.98 0 0015.59 14.37z" /></svg>`;

const testIcons: { [key: string]: string } = {
  // Categories
  'Diagnostic': diagnosticIcon,
  'Advanced': advancedIcon,
  
  // Subjects
  'Math': mathIcon,
  'Reading & Writing': readingIcon,
  'Science': scienceIcon,
  'History': historyIcon,
  'English': readingIcon,
  'Calculus': mathIcon,
  'Biology': scienceIcon,
  'Literature': readingIcon,
  'Physics': scienceIcon,
  'Algebra': mathIcon,
  'Geometry': mathIcon,
  'Chemistry': scienceIcon,
  'Psychology': historyIcon, // Use a generic "humanities" icon
  'Default': diagnosticIcon,
};

export const getIconForTest = (testType: TestType | string): string => {
    if (testType.includes('Math') || testType.includes('Algebra') || testType.includes('Geometry') || testType.includes('Calculus')) return testIcons['Math'];
    if (testType.includes('Reading') || testType.includes('Writing') || testType.includes('English') || testType.includes('Literature')) return testIcons['Reading & Writing'];
    if (testType.includes('Science') || testType.includes('Biology') || testType.includes('Physics') || testType.includes('Chemistry')) return testIcons['Science'];
    if (testType.includes('History') || testType.includes('Psychology')) return testIcons['History'];
    if (testType.includes('Diagnostic')) return testIcons['Diagnostic'];
    if (testType.includes('Adaptive')) return testIcons['Advanced'];
    return testIcons['Default'];
};
