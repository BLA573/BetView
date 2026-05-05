import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeToggle = ({ compact = false }: { compact?: boolean }) => {
  const { theme, setTheme } = useTheme();

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <button
      onClick={cycle}
      title={`Theme: ${label}`}
      className="flex items-center gap-1.5 p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
    >
      <Icon className="w-4 h-4" />
      {!compact && <span className="text-xs hidden md:block">{label}</span>}
    </button>
  );
};

export default ThemeToggle;
