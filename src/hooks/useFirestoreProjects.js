import { useEffect, useState } from "react";
import { getProjects as fetchProjects } from "../services/firestore";

export default function useFirestoreProjects() {
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    let cancelled = false;
    setLoading(true);
    fetchProjects()
      .then((data) => {
        if (cancelled) return;
        setProjects(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
}
