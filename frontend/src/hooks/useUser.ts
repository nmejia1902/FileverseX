
import { useEffect, useState } from "react";
import axios from "axios";

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get("http://localhost:4000/api/auth/me", {
        headers: { Authorization: "Bearer " + token },
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch((err) => {
        console.error("Error cargando usuario", err);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, setUser, loading };
}
