import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import BuilderHeader from "../components/builderHeader";
import { FolderTreeIcon, MessagesSquare, MessagesSquareIcon } from "lucide-react";
import ChatPanel from "../components/ChatPanel";
import Fileexplorer from "../components/Fileexplorer";
import Previewpanel from "../components/Previewpanel";
import AgentProgressDashboard from "../components/AgentProgressDashboard";
import PublishModel from "../components/publishmodel";
import api from "../api/api";
import toast from "react-hot-toast";
import { exportProjectZip } from "../utils/exportProject";

function BuilderPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [lefttab, setlefttab] = useState("chat");
  const [publishing, setpublishing] = useState(false);
  const [publishurl, setpublishurl] = useState(null);

  const handleopeprivew = () => {
    if (!id) return;
    window.open(`/preview/${id}`, "_blank");
  }
  const handlepublish = async () => {
    if (!id) return;
    setpublishing(true);
    try {
      await api.post(`/api/projects/${id}/publish`)
      const url = `${window.location.origin}/publish/${id}`;
      setpublishurl(url);
      toast.success("website published successfully")
    } catch (err) {
      console.error("publish failed", err);
      toast.error("publish failed");
    } finally {
      setpublishing(false);
    }
  }
  const handledownload = async () => {
    if (!activeProject) return;
    exportProjectZip(activeProject);
  }




  const { activeProject, loadingactiveproject, activefile, showcode, setActivefile, setshowcode, loadproject, logout, chatloading, handlechat } = useAppContext();

  useEffect(() => {
    if (!id) return;
    loadproject(id);
  }, [id])




  if (loadingactiveproject || !activeProject) {
    return <Loading />
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden text-zinc-900 relative">
      {/* top bar header*/}
      <BuilderHeader
        projectname={activeProject.name}
        version={activeProject.version}
        showcode={showcode}
        publishing={publishing}
        ontoggleshowcode={() => setshowcode(!showcode)}
        onopenpreview={handleopeprivew}
        onpublish={handlepublish}
        ondownload={handledownload}
        onback={() => navigate("/")}
        onlogout={logout}
      />
      {/*main lyout */}

      <div className="flex-1 flex overflow-hidden">
        {/*left side */}
        <div className="w-[320px] shrink-0 flex flex-col border-r border-zinc-200 bg-white">
          {/*sidebar tabs */}
          <div className="flex border-b border-zinc-100">
            <button onClick={() => setlefttab("chat")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${lefttab === "chat" ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-400 hover:text-zinc-700"}`}>
              <MessagesSquareIcon size={13} />Chat
            </button>
            <button onClick={() => setlefttab("files")} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer ${lefttab === "files" ? "text-zinc-900 border-b-2 border-zinc-900" : "text-zinc-400 hover:text-zinc-700"}`}>
              <FolderTreeIcon size={13} />Files
            </button>
          </div>

          {/*sidebar content */}
          <div className="flex-1 overflow-hidden">
            {
              lefttab === "chat" ? (
                <div className="h-full">
                  <ChatPanel massages={activeProject.messages} onsend={handlechat} loading={chatloading} />
                </div>
              ) : (
                <div className="h-full">
                  <Fileexplorer files={activeProject.files} activefile={activefile} onfileselect={(path) => { setActivefile(path); setshowcode(true) }} />
                </div>
              )
            }
          </div>
        </div>

        {/*right side */}

        <div className="flex-1 overflow-hidden">
          {activeProject.status === "pending" || activeProject.status === "generating" || activeProject.status === "failed" ? (
            <AgentProgressDashboard project={activeProject} />
          ) : (
            <Previewpanel project={activeProject} activefile={activefile} showcode={showcode} />
          )}
        </div>


      </div>

      {/*publish model */}

      {publishurl && (<PublishModel publishurl={publishurl} onclose={() => setpublishurl(null)} />)}

    </div >
  );
}

export default BuilderPage;
