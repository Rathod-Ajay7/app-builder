import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/api";
import toast from "react-hot-toast"
import { Navigate, useNavigate } from "react-router-dom";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {

  const navigate = useNavigate()
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
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password })
      setUser(data.user)
      toast.success("welcome back!")
      navigate("/")
    } catch (error) {
      console.log("Login fail", error);
      const errmsg = error?.response?.data?.error || "Invalide email or password"
      toast.error(errmsg)
      throw new Error(errmsg)
    }
  }

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/register", { name, email, password })
      setUser(data.user)
      toast.success("Account Created Successfully!")
      navigate("/")
    } catch (error) {
      console.log("Registration fail", error);
      const errmsg = error?.response?.data?.error || "Registration fail"
      toast.error(errmsg)
      throw new Error(errmsg)
    }
  }


  return (
    <AppContext.Provider value={{
      user,
      loadingUser,
      login,
      register
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
