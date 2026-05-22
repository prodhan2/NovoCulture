import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import MobileBottomNav from "./MobileBottomNav.jsx";
import ExitIntentModal from "../common/ExitIntentModal.jsx";

function Layout() {
  const [isSidebarHidden, setIsSidebarHidden] = useState(() => {
    return localStorage.getItem("sidebarHidden") === "true";
  });

  const toggleSidebar = () => {
    const newState = !isSidebarHidden;
    setIsSidebarHidden(newState);
    localStorage.setItem("sidebarHidden", newState.toString());
  };

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    
    // Strict leave website confirmation (Browser Default)
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] text-[var(--text-brown)]">
      <Header isSidebarHidden={isSidebarHidden} toggleSidebar={toggleSidebar} />
      <div className={`transition-all duration-300 ${isSidebarHidden ? "lg:pl-0" : "lg:pl-[280px]"}`}>
        <main className="min-h-screen">
          <Outlet />
        </main>
        <Footer />
      </div>
      <MobileBottomNav />
      <ExitIntentModal />
    </div>
  );
}

export default Layout;
