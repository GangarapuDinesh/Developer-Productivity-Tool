import { createContext, useContext, useState } from "react";
const SidebarContext = createContext(null);
export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsCollapsed((previous) => !previous);
  };
  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggleSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used inside SidebarProvider");
  }
  return context;
}
