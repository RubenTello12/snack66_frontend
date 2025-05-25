import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Home, ClipboardList, Utensils, Archive, Settings } from "lucide-react";

type Props = {
  children?: ReactNode;
};

export default function AppLayout({ children }: Props) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [projectName, setProjectName] = useState(() => {
    return localStorage.getItem("projectName") || "Snack 66";
  });

  useEffect(() => {
    const savedLogo = localStorage.getItem("customLogo");
    if (savedLogo) {
      setLogoSrc(savedLogo);
    }

    const savedName = localStorage.getItem("projectName");
    if (savedName) {
      setProjectName(savedName);
    }

    const handleLogoUpdate = () => {
      const updatedLogo = localStorage.getItem("customLogo");
      setLogoSrc(updatedLogo || null);
    };

    const handleNameChange = () => {
      const updatedName = localStorage.getItem("projectName");
      setProjectName(updatedName || "Snack 66");
    };

    window.addEventListener("logoChanged", handleLogoUpdate);
    window.addEventListener("nameChanged", handleNameChange);

    return () => {
      window.removeEventListener("logoChanged", handleLogoUpdate);
      window.removeEventListener("nameChanged", handleNameChange);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-[#eeeeee] text-black">
      {/* Sidebar / Bottom nav */}
      <aside className="w-full md:w-20 light:bg-white shadow-md flex md:flex-col justify-between md:justify-start items-center py-2 md:py-6 px-4 md:px-0 gap-4 md:gap-6 fixed bottom-0 md:static z-10">
        <div className="flex flex-col items-center gap-1 md:gap-2">
          <img
            src={logoSrc || "/restaurante.png"}
            alt="Logo"
            className="w-8 h-8 md:w-10 md:h-10"
          />
          <p className="text-sm md:text-base font-bold hidden md:block">{projectName}</p>
        </div>

        <div className="flex md:flex-col gap-4 md:gap-6">
          <NavLink to="/" className={({ isActive }) =>
            `p-2 rounded-xl ${isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`
          }>
            <Home />
          </NavLink>

          <NavLink to="/orders" className={({ isActive }) =>
            `p-2 rounded-xl ${isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`
          }>
            <ClipboardList />
          </NavLink>

          <NavLink to="/menu" className={({ isActive }) =>
            `p-2 rounded-xl ${isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`
          }>
            <Utensils />
          </NavLink>

          <NavLink to="/inventory" className={({ isActive }) =>
            `p-2 rounded-xl ${isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`
          }>
            <Archive />
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) =>
            `p-2 rounded-xl ${isActive ? "bg-blue-500 text-white" : "hover:bg-blue-100"}`
          }>
            <Settings />
          </NavLink>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto p-6 pt-20 md:pt-6">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
