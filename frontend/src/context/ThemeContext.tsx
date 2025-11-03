import { createContext } from "react";

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light', // Default theme value
  toggleTheme: () => {}, // Default toggle function
});
