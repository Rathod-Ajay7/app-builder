import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/api";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {

  //auth state
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  //auth action
  const checkSession = async () => {
    try {
      const { data } = await api.get("/api/auth/me")
      setUser(data.user)
    } catch (error) {
      console.log(error);
      setUser(null)
    }
    finally {
      setLoadingUser(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [checkSession])

  return (
    <AppContext.Provider value={{
      user,
      loadingUser
    }}>
      {children}
    </AppContext.Provider>
  );
}
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }
  return context;
}
