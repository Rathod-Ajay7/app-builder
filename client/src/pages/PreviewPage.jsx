import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Loading from "../components/Loading";
import { AlertCircleIcon } from "lucide-react";
import FullPagePreview from "../components/fullpagepreview";
import { useAppContext } from "../context/AppContext";

function PreviewPage() {

  const { id } = useParams();


  const { activeProject: project, loadingactiveproject: loading, loadproject } = useAppContext();

  useEffect(() => {
    if (id) {
      loadproject(id);

    }
  }, [id])

  if (loading || !project) {
    return <Loading />
  }
  return (
    <FullPagePreview files={project.files} />
  )
}



export default PreviewPage;

