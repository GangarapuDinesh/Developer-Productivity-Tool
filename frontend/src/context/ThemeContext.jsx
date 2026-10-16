import { createContext, useContext, useEffect, useState } from "react";
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("devflow-theme");
    return ["light", "dark", "eye"].includes(savedTheme)
      ? savedTheme
      : "light";
  });
  useEffect(() => {
    localStorage.setItem("devflow-theme", theme);
  }, [theme]);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`theme-shell theme-${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
