import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { isAdminLoggedIn, subscribeAdminAuth } from "../utils/adminApi";

export function useAdminAccess() {
  const { pathname } = useLocation();
  const [loggedIn, setLoggedIn] = useState(() => isAdminLoggedIn());

  useEffect(() => {
    const sync = () => setLoggedIn(isAdminLoggedIn());
    sync();
    return subscribeAdminAuth(sync);
  }, [pathname]);

  return {
    loggedIn,
    adminPath: loggedIn ? "/admin" : "/admin/login",
    adminLabel: loggedIn ? "Dashboard" : "Admin",
  };
}
