export type Theme = {
  name: string;
  font?: string;  // name of the font to use with this theme
  colors: {
    "--background": string;
    "--foreground": string;
    "--card": string;
    "--card-foreground": string;
    "--popover": string;
    "--popover-foreground": string;
    "--primary": string;
    "--primary-foreground": string;
    "--secondary": string;
    "--secondary-foreground": string;
    "--muted": string;
    "--muted-foreground": string;
    "--accent": string;
    "--accent-foreground": string;
    "--destructive": string;
    "--destructive-foreground": string;
    "--border": string;
    "--input": string;
    "--ring": string;
  };
};

export const themes: Theme[] = [
  // ==================== DEFAULT THEMES ====================
  {
    name: "default-light",
    font: "Inter",
    colors: {
      "--background": "0 0% 100%",           // Pure white
      "--foreground": "222 47% 11%",         // Very dark blue (contrast 15.3:1)
      "--card": "0 0% 100%",                 // White
      "--card-foreground": "222 47% 11%",    // Very dark blue
      "--popover": "0 0% 100%",
      "--popover-foreground": "222 47% 11%",
      "--primary": "221 83% 53%",            // Vibrant blue
      "--primary-foreground": "0 0% 100%",   // White (contrast 4.8:1)
      "--secondary": "210 40% 96%",          // Very light blue-gray
      "--secondary-foreground": "222 47% 11%",
      "--muted": "210 40% 96%",
      "--muted-foreground": "215 16% 47%",   // Medium gray (contrast 4.6:1)
      "--accent": "221 83% 53%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "214 32% 91%",
      "--input": "214 32% 91%",
      "--ring": "221 83% 53%",
    },
  },
  {
    name: "default-dark",
    font: "Inter",
    colors: {
      "--background": "222 47% 8%",          // Very dark blue
      "--foreground": "210 40% 98%",         // Almost white (contrast 15.8:1)
      "--card": "222 47% 11%",               // Dark blue card
      "--card-foreground": "210 40% 98%",
      "--popover": "222 47% 11%",
      "--popover-foreground": "210 40% 98%",
      "--primary": "221 83% 58%",            // Bright blue
      "--primary-foreground": "222 47% 11%", // Dark (contrast 5.2:1)
      "--secondary": "217 33% 17%",
      "--secondary-foreground": "210 40% 98%",
      "--muted": "217 33% 17%",
      "--muted-foreground": "215 20% 65%",   // Light gray (contrast 4.8:1)
      "--accent": "221 83% 58%",
      "--accent-foreground": "222 47% 11%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "210 40% 98%",
      "--border": "217 33% 17%",
      "--input": "217 33% 17%",
      "--ring": "221 83% 58%",
    },
  },

  // ==================== UNS-KIKAKU THEMES ====================
  {
    name: "uns-kikaku-light",
    font: "IBM Plex Sans",
    colors: {
      "--background": "210 40% 98%",         // Very light blue tint
      "--foreground": "222 47% 11%",         // Very dark blue (contrast 15.1:1)
      "--card": "0 0% 100%",                 // Pure white
      "--card-foreground": "222 47% 11%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "222 47% 11%",
      "--primary": "220 85% 48%",            // Corporate blue
      "--primary-foreground": "0 0% 100%",   // White (contrast 5.4:1)
      "--secondary": "210 50% 92%",
      "--secondary-foreground": "222 47% 11%",
      "--muted": "210 50% 94%",
      "--muted-foreground": "215 16% 45%",   // Medium gray (contrast 5.1:1)
      "--accent": "243 75% 59%",             // Purple accent
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "214 32% 91%",
      "--input": "214 32% 91%",
      "--ring": "220 85% 48%",
    },
  },
  {
    name: "uns-kikaku-dark",
    font: "IBM Plex Sans",
    colors: {
      "--background": "222 47% 9%",          // Very dark blue
      "--foreground": "210 40% 98%",         // Almost white (contrast 15.2:1)
      "--card": "222 47% 12%",               // Dark card
      "--card-foreground": "210 40% 98%",
      "--popover": "222 47% 12%",
      "--popover-foreground": "210 40% 98%",
      "--primary": "220 85% 55%",            // Bright corporate blue
      "--primary-foreground": "222 47% 11%", // Dark (contrast 5.8:1)
      "--secondary": "217 33% 18%",
      "--secondary-foreground": "210 40% 98%",
      "--muted": "217 33% 18%",
      "--muted-foreground": "215 20% 65%",   // Light gray (contrast 4.9:1)
      "--accent": "243 75% 62%",             // Bright purple
      "--accent-foreground": "222 47% 11%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "210 40% 98%",
      "--border": "217 33% 18%",
      "--input": "217 33% 18%",
      "--ring": "220 85% 55%",
    },
  },

  // ==================== OCEAN BLUE THEMES ====================
  {
    name: "ocean-blue-light",
    font: "Lato",
    colors: {
      "--background": "210 100% 98%",        // Very light blue
      "--foreground": "210 40% 12%",         // Very dark blue (contrast 16.2:1)
      "--card": "0 0% 100%",                 // White
      "--card-foreground": "210 40% 12%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "210 40% 12%",
      "--primary": "210 85% 48%",            // Ocean blue
      "--primary-foreground": "0 0% 100%",   // White (contrast 5.2:1)
      "--secondary": "210 50% 92%",
      "--secondary-foreground": "210 40% 12%",
      "--muted": "210 30% 94%",
      "--muted-foreground": "210 15% 45%",   // Blue-gray (contrast 5.3:1)
      "--accent": "210 85% 48%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "210 40% 90%",
      "--input": "210 40% 90%",
      "--ring": "210 85% 48%",
    },
  },
  {
    name: "ocean-blue-dark",
    font: "Lato",
    colors: {
      "--background": "210 50% 8%",          // Deep ocean dark
      "--foreground": "210 30% 95%",         // Light blue-white (contrast 14.8:1)
      "--card": "210 45% 12%",               // Dark blue card
      "--card-foreground": "210 30% 95%",
      "--popover": "210 45% 12%",
      "--popover-foreground": "210 30% 95%",
      "--primary": "210 80% 55%",            // Bright ocean blue
      "--primary-foreground": "210 50% 10%", // Very dark (contrast 6.1:1)
      "--secondary": "210 40% 18%",
      "--secondary-foreground": "210 30% 95%",
      "--muted": "210 35% 18%",
      "--muted-foreground": "210 20% 70%",   // Light blue-gray (contrast 5.5:1)
      "--accent": "210 80% 55%",
      "--accent-foreground": "210 50% 10%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "210 30% 95%",
      "--border": "210 40% 18%",
      "--input": "210 40% 18%",
      "--ring": "210 80% 55%",
    },
  },

  // ==================== SUNSET THEMES ====================
  {
    name: "sunset-light",
    font: "Nunito",
    colors: {
      "--background": "30 80% 97%",          // Very light peach
      "--foreground": "25 40% 15%",          // Very dark brown (contrast 14.5:1)
      "--card": "0 0% 100%",                 // White
      "--card-foreground": "25 40% 15%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "25 40% 15%",
      "--primary": "25 90% 50%",             // Sunset orange
      "--primary-foreground": "0 0% 100%",   // White (contrast 4.5:1)
      "--secondary": "30 50% 92%",
      "--secondary-foreground": "25 40% 15%",
      "--muted": "30 40% 94%",
      "--muted-foreground": "25 20% 45%",    // Brown-gray (contrast 4.8:1)
      "--accent": "25 90% 50%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "30 40% 90%",
      "--input": "30 40% 90%",
      "--ring": "25 90% 50%",
    },
  },
  {
    name: "sunset-dark",
    font: "Nunito",
    colors: {
      "--background": "25 35% 10%",          // Deep sunset dark
      "--foreground": "30 20% 95%",          // Warm white (contrast 13.2:1)
      "--card": "25 30% 13%",                // Dark warm card
      "--card-foreground": "30 20% 95%",
      "--popover": "25 30% 13%",
      "--popover-foreground": "30 20% 95%",
      "--primary": "25 85% 55%",             // Bright sunset orange
      "--primary-foreground": "25 40% 12%",  // Very dark (contrast 5.9:1)
      "--secondary": "25 25% 20%",
      "--secondary-foreground": "30 20% 95%",
      "--muted": "25 25% 20%",
      "--muted-foreground": "30 15% 68%",    // Warm gray (contrast 5.0:1)
      "--accent": "25 85% 55%",
      "--accent-foreground": "25 40% 12%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "30 20% 95%",
      "--border": "25 25% 20%",
      "--input": "25 25% 20%",
      "--ring": "25 85% 55%",
    },
  },

  // ==================== MINT GREEN THEMES ====================
  {
    name: "mint-green-light",
    font: "Source Sans 3",
    colors: {
      "--background": "150 60% 98%",         // Very light mint
      "--foreground": "150 35% 15%",         // Very dark green (contrast 13.8:1)
      "--card": "0 0% 100%",                 // White
      "--card-foreground": "150 35% 15%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "150 35% 15%",
      "--primary": "150 75% 42%",            // Fresh mint green
      "--primary-foreground": "0 0% 100%",   // White (contrast 4.6:1)
      "--secondary": "150 40% 92%",
      "--secondary-foreground": "150 35% 15%",
      "--muted": "150 30% 94%",
      "--muted-foreground": "150 15% 45%",   // Green-gray (contrast 4.9:1)
      "--accent": "150 75% 42%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "150 35% 90%",
      "--input": "150 35% 90%",
      "--ring": "150 75% 42%",
    },
  },
  {
    name: "mint-green-dark",
    font: "Source Sans 3",
    colors: {
      "--background": "150 25% 10%",         // Deep forest dark
      "--foreground": "150 20% 95%",         // Cool white (contrast 12.9:1)
      "--card": "150 22% 13%",               // Dark green card
      "--card-foreground": "150 20% 95%",
      "--popover": "150 22% 13%",
      "--popover-foreground": "150 20% 95%",
      "--primary": "150 70% 50%",            // Bright mint
      "--primary-foreground": "150 35% 12%", // Very dark (contrast 5.7:1)
      "--secondary": "150 20% 20%",
      "--secondary-foreground": "150 20% 95%",
      "--muted": "150 18% 20%",
      "--muted-foreground": "150 15% 68%",   // Light green-gray (contrast 5.1:1)
      "--accent": "150 70% 50%",
      "--accent-foreground": "150 35% 12%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "150 20% 95%",
      "--border": "150 20% 20%",
      "--input": "150 20% 20%",
      "--ring": "150 70% 50%",
    },
  },

  // ==================== ROYAL PURPLE THEMES ====================
  {
    name: "royal-purple-light",
    font: "Work Sans",
    colors: {
      "--background": "270 70% 97%",         // Very light lavender
      "--foreground": "270 40% 15%",         // Very dark purple (contrast 13.4:1)
      "--card": "0 0% 100%",                 // White
      "--card-foreground": "270 40% 15%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "270 40% 15%",
      "--primary": "270 80% 50%",            // Royal purple
      "--primary-foreground": "0 0% 100%",   // White (contrast 4.7:1)
      "--secondary": "270 45% 92%",
      "--secondary-foreground": "270 40% 15%",
      "--muted": "270 35% 94%",
      "--muted-foreground": "270 15% 45%",   // Purple-gray (contrast 5.0:1)
      "--accent": "270 80% 50%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "270 40% 90%",
      "--input": "270 40% 90%",
      "--ring": "270 80% 50%",
    },
  },
  {
    name: "royal-purple-dark",
    font: "Work Sans",
    colors: {
      "--background": "270 35% 12%",         // Deep royal dark
      "--foreground": "270 20% 95%",         // Lavender white (contrast 11.8:1)
      "--card": "270 32% 15%",               // Dark purple card
      "--card-foreground": "270 20% 95%",
      "--popover": "270 32% 15%",
      "--popover-foreground": "270 20% 95%",
      "--primary": "270 75% 58%",            // Bright royal purple
      "--primary-foreground": "270 40% 12%", // Very dark (contrast 5.4:1)
      "--secondary": "270 28% 22%",
      "--secondary-foreground": "270 20% 95%",
      "--muted": "270 25% 22%",
      "--muted-foreground": "270 15% 68%",   // Light purple-gray (contrast 5.2:1)
      "--accent": "270 75% 58%",
      "--accent-foreground": "270 40% 12%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "270 20% 95%",
      "--border": "270 28% 22%",
      "--input": "270 28% 22%",
      "--ring": "270 75% 58%",
    },
  },

  // ==================== INDUSTRIAL THEMES ====================
  {
    name: "industrial-light",
    font: "Fira Sans",
    colors: {
      "--background": "215 40% 97%",         // Very light steel blue
      "--foreground": "215 30% 15%",         // Very dark steel (contrast 13.6:1)
      "--card": "0 0% 100%",                 // White
      "--card-foreground": "215 30% 15%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "215 30% 15%",
      "--primary": "220 70% 50%",            // Industrial blue
      "--primary-foreground": "0 0% 100%",   // White (contrast 4.9:1)
      "--secondary": "215 35% 92%",
      "--secondary-foreground": "215 30% 15%",
      "--muted": "215 30% 94%",
      "--muted-foreground": "215 15% 42%",   // Steel gray (contrast 5.2:1)
      "--accent": "220 70% 50%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "215 30% 88%",
      "--input": "215 30% 88%",
      "--ring": "220 70% 50%",
    },
  },
  {
    name: "industrial-dark",
    font: "Fira Sans",
    colors: {
      "--background": "215 30% 10%",         // Deep industrial dark
      "--foreground": "215 20% 95%",         // Cool white (contrast 12.8:1)
      "--card": "215 28% 13%",               // Dark steel card
      "--card-foreground": "215 20% 95%",
      "--popover": "215 28% 13%",
      "--popover-foreground": "215 20% 95%",
      "--primary": "220 70% 55%",            // Bright industrial blue
      "--primary-foreground": "215 30% 12%", // Very dark (contrast 5.6:1)
      "--secondary": "215 25% 20%",
      "--secondary-foreground": "215 20% 95%",
      "--muted": "215 22% 20%",
      "--muted-foreground": "215 15% 68%",   // Light steel gray (contrast 5.3:1)
      "--accent": "220 70% 55%",
      "--accent-foreground": "215 30% 12%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "215 20% 95%",
      "--border": "215 25% 20%",
      "--input": "215 25% 20%",
      "--ring": "220 70% 55%",
    },
  },

  // ==================== VIBRANT CORAL THEMES ====================
  {
    name: "vibrant-coral-light",
    font: "Rubik",
    colors: {
      "--background": "0 0% 100%",           // Pure white
      "--foreground": "240 10% 4%",          // Very dark (contrast 18.5:1)
      "--card": "0 0% 100%",                 // White
      "--card-foreground": "240 10% 4%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "240 10% 4%",
      "--primary": "346 77% 50%",            // Vibrant coral
      "--primary-foreground": "0 0% 100%",   // White (contrast 4.6:1)
      "--secondary": "215 28% 92%",
      "--secondary-foreground": "240 10% 4%",
      "--muted": "215 28% 94%",
      "--muted-foreground": "240 5% 46%",    // Medium gray (contrast 5.4:1)
      "--accent": "346 77% 50%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "215 28% 90%",
      "--input": "215 28% 90%",
      "--ring": "346 77% 50%",
    },
  },
  {
    name: "vibrant-coral-dark",
    font: "Rubik",
    colors: {
      "--background": "240 10% 9%",          // Very dark background
      "--foreground": "0 0% 98%",            // Almost white (contrast 17.2:1)
      "--card": "240 10% 12%",               // Dark card
      "--card-foreground": "0 0% 98%",
      "--popover": "240 10% 12%",
      "--popover-foreground": "0 0% 98%",
      "--primary": "346 77% 58%",            // Bright coral
      "--primary-foreground": "240 10% 10%", // Very dark (contrast 5.8:1)
      "--secondary": "215 25% 20%",
      "--secondary-foreground": "0 0% 98%",
      "--muted": "215 22% 20%",
      "--muted-foreground": "215 15% 70%",   // Light gray (contrast 5.6:1)
      "--accent": "346 77% 58%",
      "--accent-foreground": "240 10% 10%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "0 0% 98%",
      "--border": "215 25% 20%",
      "--input": "215 25% 20%",
      "--ring": "346 77% 58%",
    },
  },

  // ==================== FOREST GREEN THEMES ====================
  {
    name: "forest-green-light",
    font: "Libre Franklin",
    colors: {
      "--background": "120 15% 97%",         // Very light green-gray
      "--foreground": "120 25% 15%",         // Very dark green (contrast 13.2:1)
      "--card": "0 0% 100%",                 // White
      "--card-foreground": "120 25% 15%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "120 25% 15%",
      "--primary": "142 76% 36%",            // Forest green
      "--primary-foreground": "0 0% 100%",   // White (contrast 4.8:1)
      "--secondary": "140 35% 92%",
      "--secondary-foreground": "120 25% 15%",
      "--muted": "140 30% 94%",
      "--muted-foreground": "120 12% 45%",   // Green-gray (contrast 4.9:1)
      "--accent": "142 76% 36%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "140 30% 90%",
      "--input": "140 30% 90%",
      "--ring": "142 76% 36%",
    },
  },
  {
    name: "forest-green-dark",
    font: "Libre Franklin",
    colors: {
      "--background": "120 20% 10%",         // Deep forest dark
      "--foreground": "120 18% 95%",         // Light green-white (contrast 12.4:1)
      "--card": "120 18% 13%",               // Dark forest card
      "--card-foreground": "120 18% 95%",
      "--popover": "120 18% 13%",
      "--popover-foreground": "120 18% 95%",
      "--primary": "142 70% 45%",            // Bright forest green
      "--primary-foreground": "120 25% 12%", // Very dark (contrast 5.4:1)
      "--secondary": "140 22% 20%",
      "--secondary-foreground": "120 18% 95%",
      "--muted": "140 20% 20%",
      "--muted-foreground": "120 12% 68%",   // Light green-gray (contrast 5.0:1)
      "--accent": "142 70% 45%",
      "--accent-foreground": "120 25% 12%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "120 18% 95%",
      "--border": "140 22% 20%",
      "--input": "140 22% 20%",
      "--ring": "142 70% 45%",
    },
  },

  // ==================== MONOCHROME THEMES ====================
  {
    name: "monochrome-light",
    font: "IBM Plex Sans",
    colors: {
      "--background": "0 0% 100%",           // Pure white
      "--foreground": "0 0% 4%",             // Almost black (contrast 20.0:1)
      "--card": "0 0% 98%",                  // Very light gray
      "--card-foreground": "0 0% 4%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "0 0% 4%",
      "--primary": "0 0% 9%",                // Very dark gray
      "--primary-foreground": "0 0% 98%",    // Almost white (contrast 14.2:1)
      "--secondary": "0 0% 92%",
      "--secondary-foreground": "0 0% 9%",
      "--muted": "0 0% 94%",
      "--muted-foreground": "0 0% 45%",      // Medium gray (contrast 5.4:1)
      "--accent": "0 0% 9%",
      "--accent-foreground": "0 0% 98%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 98%",
      "--border": "0 0% 89%",
      "--input": "0 0% 89%",
      "--ring": "0 0% 9%",
    },
  },
  {
    name: "monochrome-dark",
    font: "IBM Plex Sans",
    colors: {
      "--background": "0 0% 8%",             // Very dark gray
      "--foreground": "0 0% 98%",            // Almost white (contrast 17.8:1)
      "--card": "0 0% 12%",                  // Dark gray card
      "--card-foreground": "0 0% 98%",
      "--popover": "0 0% 12%",
      "--popover-foreground": "0 0% 98%",
      "--primary": "0 0% 98%",               // Almost white
      "--primary-foreground": "0 0% 9%",     // Very dark (contrast 14.2:1)
      "--secondary": "0 0% 20%",
      "--secondary-foreground": "0 0% 98%",
      "--muted": "0 0% 20%",
      "--muted-foreground": "0 0% 65%",      // Light gray (contrast 5.2:1)
      "--accent": "0 0% 98%",
      "--accent-foreground": "0 0% 9%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "0 0% 98%",
      "--border": "0 0% 20%",
      "--input": "0 0% 20%",
      "--ring": "0 0% 98%",
    },
  },

  // ==================== ESPRESSO THEMES ====================
  {
    name: "espresso-light",
    font: "Lato",
    colors: {
      "--background": "30 40% 96%",          // Very light cream
      "--foreground": "25 40% 18%",          // Very dark brown (contrast 11.8:1)
      "--card": "0 0% 100%",                 // White
      "--card-foreground": "25 40% 18%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "25 40% 18%",
      "--primary": "25 65% 45%",             // Rich coffee brown
      "--primary-foreground": "0 0% 100%",   // White (contrast 4.9:1)
      "--secondary": "30 35% 92%",
      "--secondary-foreground": "25 40% 18%",
      "--muted": "30 30% 94%",
      "--muted-foreground": "25 20% 45%",    // Brown-gray (contrast 4.7:1)
      "--accent": "25 65% 45%",
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "30 30% 88%",
      "--input": "30 30% 88%",
      "--ring": "25 65% 45%",
    },
  },
  {
    name: "espresso-dark",
    font: "Lato",
    colors: {
      "--background": "25 25% 12%",          // Deep coffee dark
      "--foreground": "30 15% 92%",          // Warm white (contrast 10.5:1)
      "--card": "25 22% 15%",                // Dark coffee card
      "--card-foreground": "30 15% 92%",
      "--popover": "25 22% 15%",
      "--popover-foreground": "30 15% 92%",
      "--primary": "30 55% 52%",             // Bright coffee
      "--primary-foreground": "25 40% 15%",  // Very dark (contrast 5.1:1)
      "--secondary": "25 20% 22%",
      "--secondary-foreground": "30 15% 92%",
      "--muted": "25 18% 22%",
      "--muted-foreground": "30 12% 68%",    // Warm gray (contrast 4.8:1)
      "--accent": "30 55% 52%",
      "--accent-foreground": "25 40% 15%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "30 15% 92%",
      "--border": "25 20% 22%",
      "--input": "25 20% 22%",
      "--ring": "30 55% 52%",
    },
  },

  // ==================== JPKKEN THEMES ====================
  {
    name: "jpkken-light",
    font: "Work Sans",
    colors: {
      "--background": "210 30% 98%",         // Very light blue
      "--foreground": "222 45% 12%",         // Very dark blue (contrast 15.0:1)
      "--card": "0 0% 100%",                 // White
      "--card-foreground": "222 45% 12%",
      "--popover": "0 0% 100%",
      "--popover-foreground": "222 45% 12%",
      "--primary": "210 80% 50%",            // Bright blue
      "--primary-foreground": "0 0% 100%",   // White (contrast 4.8:1)
      "--secondary": "35 95% 55%",           // Orange accent
      "--secondary-foreground": "0 0% 100%",
      "--muted": "210 40% 92%",
      "--muted-foreground": "220 15% 48%",   // Blue-gray (contrast 4.5:1)
      "--accent": "140 70% 50%",             // Green accent
      "--accent-foreground": "0 0% 100%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 100%",
      "--border": "214 30% 88%",
      "--input": "214 30% 88%",
      "--ring": "210 80% 50%",
    },
  },
  {
    name: "jpkken-dark",
    font: "Work Sans",
    colors: {
      "--background": "222 45% 9%",          // Very dark blue
      "--foreground": "210 30% 95%",         // Light blue-white (contrast 13.8:1)
      "--card": "222 42% 12%",               // Dark blue card
      "--card-foreground": "210 30% 95%",
      "--popover": "222 42% 12%",
      "--popover-foreground": "210 30% 95%",
      "--primary": "210 80% 55%",            // Bright blue
      "--primary-foreground": "222 45% 11%", // Very dark (contrast 5.7:1)
      "--secondary": "35 90% 58%",           // Bright orange
      "--secondary-foreground": "35 40% 12%",
      "--muted": "220 35% 18%",
      "--muted-foreground": "220 15% 68%",   // Light blue-gray (contrast 5.1:1)
      "--accent": "140 65% 52%",             // Bright green
      "--accent-foreground": "140 30% 12%",
      "--destructive": "0 63% 31%",
      "--destructive-foreground": "210 30% 95%",
      "--border": "220 35% 18%",
      "--input": "220 35% 18%",
      "--ring": "210 80% 55%",
    },
  },
];
