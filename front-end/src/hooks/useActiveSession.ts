import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

function useActiveSection(sectionIds: string[]) {
  const location = useLocation();

  const [activeSection, setActiveSection] = useState<string>(() => {
    switch (location.pathname) {
      case "/":
        return "hero";
      case "/tracks":
        return "tracks";
      default:
        return "";
    }
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [sectionIds]);

  return activeSection;
}

export default useActiveSection;
