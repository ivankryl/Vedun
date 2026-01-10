//  LoginPage.tsx

import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login as apiLogin} from "../api/client";
import { setAccessToken } from "../auth/token";

type LoginForm = {
  login: string;
  password: string;
};

function useNextPath(defaultPath = "/broker") {
  const location = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    const next = params.get("next");
    if (!next) return defaultPath;

    // защита от редиректа на внешний сайт
    if (!next.startsWith("/")) return defaultPath;

    return next;
  }, [location.search, defaultPath]);
}

export function LoginPage() {
  const navigate = useNavigate();
  const nextPath = useNextPath("/broker");

  const [form, setForm] = useState<LoginForm>({ login: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
      e.preventDefault();
      setError(null);

      const email = form.login.trim();
      const password = form.password;

      if (!email || !password) {
        setError("Введите логин и пароль.");
        return;
      }

      setSubmitting(true);
      try {
        const res = await apiLogin({ email, password });

        // если бэк вернёт именно access_token
        setAccessToken(res.access_token);

        navigate(nextPath, { replace: true });
      } catch (err: any) {
        setError(err?.message ?? "Не удалось войти. Попробуйте ещё раз.");
      } finally {
        setSubmitting(false);
      }
    }


  return (
    <div className="page page--container">
      <section className="card">
        <div className="card-header">
          <h2 style={{ margin: 0 }}>Вход</h2>
        </div>

        {error && (
          <div className="card error" style={{ marginBottom: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ color: "#6b7280", fontSize: 13 }}>Логин / Email</span>
            <input
              value={form.login}
              onChange={(e) => setForm((p) => ({ ...p, login: e.target.value }))}
              autoComplete="username"
              placeholder="company@example.com"
              style={{
                height: 40,
                padding: "0 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                outline: "none",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ color: "#6b7280", fontSize: 13 }}>Пароль</span>
            <input
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                height: 40,
                padding: "0 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                outline: "none",
              }}
            />
          </label>

          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? "Входим…" : "Войти"}
          </button>
        </form>
      </section>
    </div>
  );
}
