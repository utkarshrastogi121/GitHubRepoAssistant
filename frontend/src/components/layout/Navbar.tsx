import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.svg";
import { useRepo } from "@/contexts/RepoContext";

const NAV_ITEMS = [
  { to: "/", label: "Repositories" },
  { to: "/chat", label: "Chat" },
  { to: "/docs", label: "Docs" },
  { to: "/review", label: "Review" },
];

export function Navbar() {
  const location = useLocation();
  const { activeRepo } = useRepo();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-7 w-7" />
          <span className="font-semibold text-gray-900">AI Repo Assistant</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="text-sm text-gray-500">
          {activeRepo ? (
            <span>
              Active: <span className="font-medium text-gray-800">{activeRepo.owner}/{activeRepo.name}</span>
            </span>
          ) : (
            <span>No repository selected</span>
          )}
        </div>
      </div>
    </header>
  );
}
