import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import BackendTest from "./pages/BackendTest/BackendTest";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Projects from "./pages/Projects/Projects";
import Tasks from "./pages/Tasks/Tasks";
import Snippets from "./pages/Snippets/Snippets";
import Focus from "./pages/Focus/Focus";
import Activity from "./pages/Activity/Activity";
import Goals from "./pages/Goals/Goals";
import Team from "./pages/Team/Team";
import Analytics from "./pages/Analytics/Analytics";
import Settings from "./pages/Settings/Settings";
import GitHub from "./pages/github/GitHub";
import { NotificationProvider } from "./context/NotificationContext";
function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter>
          <NotificationProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/backend-test" element={<BackendTest />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/snippets" element={<Snippets />} />
                <Route path="/focus" element={<Focus />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/team" element={<Team />} />
                <Route path="/github" element={<GitHub />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  );
}
export default App;
 