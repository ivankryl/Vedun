// frontend/src/auth/RequireAuth.tsx
import { Navigate, useLocation } from "react-router-dom";
import { isAuthed } from "./token";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  if (!isAuthed()) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}
