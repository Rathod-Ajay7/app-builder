import { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import { Await, Navigate, useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const navigate = useNavigate();
  //auth state
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  //states
  const [project, setProject] = useState([]);
  const [loadingProject, setLoadingProject] = useState(true);
  const [activeProject, setActiveProject] = useState(null)
  const [loadingactiveproject, setloadingactiveproject] = useState(true)
  const [chatloading, setchatloading] = useState(false)
  const [generatingproject, setgeneratingproject] = useState(false)
  const [activefile, setActivefile] = useState("/App.js")
  const [showcode, setshowcode] = useState(false)



  //auth action
  const checkSession = async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch (error) {
      console.log(error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setUser(data.user);
      toast.success("welcome back!");
      navigate("/");
    } catch (error) {
      console.log("Login fail", error);
      const errmsg =
        error?.response?.data?.error || "Invalide email or password";
      toast.error(errmsg);
      throw new Error(errmsg);
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setUser(data.user);
      toast.success("Account Created Successfully!");
      navigate("/");
    } catch (error) {
      console.log("Registration fail", error);
      const errmsg = error?.response?.data?.error || "Registration fail";
      toast.error(errmsg);
      throw new Error(errmsg);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout")
      setUser(null)
      setProject([])
      setActiveProject(null)
      toast.success("Logged out Successfully")
      navigate("/login")
    } catch (error) {
      console.log("logout failed", error)
      toast.error("logout failed")
    }
  }


  //project actions
  const loadProjects = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/api/projects")
      setProject(data)
    } catch (error) {
      console.error("fail to load projects", error);
      toast.error("failed to load project list");
    } finally {
      setLoadingProject(false);
    }
  }

  const loadproject = async (_id, silent = false) => {
    if (!user) return;
    if (!silent) setloadingactiveproject(true);
    try {
      const { data } = await api.get(`/api/projects/${_id}`)
      setActiveProject(data);

      //default file selection
      const files = Object.keys(data.files || {});
      if (files.length > 0) {
        setActivefile((prev) => {
          if (files.includes(prev)) return prev;
          if (files.includes("/App.js")) return "/App.js";
          return files[0];
        })
      }
    } catch (error) {
      console.error("fail to load project", error);
      if (!silent) {
        toast.error("failed to load project details");
        navigate("/")
      }
    } finally {
      if (!silent) {
        setloadingactiveproject(false);
      }
    }
  }
  //automatically poll active project status genrating or pending
  useEffect(() => {
    if (!activeProject?._id || !user) return;

    const isOngoing = activeProject.status === "genrating" || activeProject.status === "pending" || activeProject.status === "revising";

    if (isOngoing) {
      setchatloading(true);
      const interval = setInterval(() => {
        loadproject(activeProject._id, true);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setchatloading(false);
    }
  }, [activeProject?._id, activeProject?.status, loadproject, user?._id]);

  const handlegenrate = useCallback(
    async (prompt) => {
      if (!user) return;
      setgeneratingproject(true);
      try {
        const { data } = await api.post("/api/projects", { prompt });
        toast.success("AI agent is planing structure....");
        navigate(`/builder/${data._id}`);
      } catch (error) {
        console.error("failed to genrate project", error);
        toast.error(error?.response?.data?.error || "failed to genrate")
      } finally {
        setgeneratingproject(false);
      }
    }, [navigate, user]
  )
  const handledelet = useCallback(
    async (_id) => {
      if (!user) return;
      setgeneratingproject(true);
      try {
        const { data } = await api.delete(`/api/projects/${_id}`);
        setProject((prev) => prev.filter((p) => p._id !== _id))
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("failed to delete project", error);
        toast.error("failed to delete")
      }
    }, [user]
  )


  const handlechat = useCallback(
    async (prompt) => {
      if (!activeProject || !user) return;
      setchatloading(true);
      try {
        const { data } = await api.post(`/api/projects/${activeProject._id}/chat`, { prompt })
        setActiveProject(data);
        if (data.errors && data.errors.length > 0) {
          toast.error(`${data.errors.length} revision patch(es) falied`);
        }
        else {
          toast.success(`updated to version ${data.version}`);
        }

      } catch (err) {
        console.error("revision request failed", err);
        toast.error(err?.response?.data?.error || "revision request failed");

      } finally {
        setchatloading(false);
      }
    }, [activeProject, user]
  )
  const debouncedsave = useMemo(
    () => debounce(async (files, id) => {
      try {
        await api.put(`/api/projects/${id}/files`, { files })
      } catch (err) {
        console.error("failed to autosave files:", err)
        toast.error("failed to save code modification")
      }
    }, 1000), []
  )

  useEffect(() => {
    return () => {
      debouncedsave.cancel();
    }
  }, [debouncedsave])

  const updateprojectfiles = useCallback(
    async (files) => {
      if (!activeProject || !user) return;
      debouncedsave(files, activeProject._id)
    }, [activeProject, user, debouncedsave]
  )

  return (
    <AppContext.Provider
      value={{
        user,
        loadingUser,
        login,
        register,
        project,
        loadingProject,
        activeProject,
        loadingactiveproject,
        chatloading,
        generatingproject,
        activefile,
        showcode,
        setActivefile,
        setshowcode,
        loadProjects,
        loadproject,
        handlegenrate,
        handledelet,
        logout,
        updateprojectfiles
      }}
    >
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
