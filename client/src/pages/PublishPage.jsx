import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Loading from "../components/Loading";
import { AlertCircleIcon } from "lucide-react";
import FullPagePreview from "../components/fullpagepreview";

function PublishPage() {

  const { id } = useParams();
  const [project, setproject] = useState(null);
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchpublicproject = async () => {
      try {
        const { data } = await api.get(`/api/projects/public/${id}`);
        setproject(data);
      } catch (err) {
        console.error("failed to load public project");
        seterror(err?.response?.data?.error || "this website is not available");
      } finally {
        setloading(false);
      }
    }
    fetchpublicproject();
  }, [id])

  if (loading) {
    return <Loading />
  }

  if (error || !project) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-50 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-4">
          <AlertCircleIcon size={24} />
        </div>
        <h1 className="text-lg font-semibold text-zinc-900 mb-1.5">
          Website Unavailable
        </h1>
        <p className="text-sm text-zinc-500 max-w-sm leading-relaxed mb-6">
          {error}
        </p>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
          Builder AI
        </div>
      </div>
    )
  }

  return (
    <FullPagePreview files={project.files} />
  )
}



export default PublishPage;

