import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SandpackCodeEditor, SandpackLayout, SandpackPreview, SandpackProvider, useSandpack } from '@codesandbox/sandpack-react';
import { detectDependencies } from '../utils/sandpackUtils';
import { useAppContext } from '../context/AppContext';
import SandpackErrorMonitor from './sandpackerrormonitor';

//watches for file edits inside sandpack editor and save changes to db & livesatate
function SandpackFileWatcher({ onlivefileschange }) {
    const { sandpack } = useSandpack();
    const { files } = sandpack;
    const { activeProject, updateprojectfiles } = useAppContext();
    const activeprojectref = useRef(activeProject);
    useEffect(() => {
        activeprojectref.current = activeProject;
    }, [activeProject])
    useEffect(() => {
        const project = activeprojectref.current;
        if (!project) return;
        const updatedfiles = {};
        let haschanges = false;
        for (const [path, fileObj] of Object.entries(files)) {
            const fileCode = fileObj.code;
            updatedfiles[path] = fileCode;
            const originalcontent = typeof project.files[path] === "string" ? project.files[path] : project.files[path]?.content;
            if (fileCode !== originalcontent) {
                haschanges = true;
            }
        }
        //sync live files to parent
        onlivefileschange(updatedfiles);
        if (haschanges) {
            updateprojectfiles(updatedfiles);
        }
    }, [files])
    return null;
}

const Previewpanel = ({ project, activefile, showcode }) => {

    const [showerroroverlay, setshowerroroverlay] = useState(true);
    //keep local state of files that updates as user type
    const [livefiles, setlivefiles] = useState(project.files);
    const [prevprojectkey, setprevprojectkey] = useState(`${project.id}-${project.version}`);
    const currentkey = `${project.id}-${project.version}`;

    if (prevprojectkey !== currentkey) {
        setlivefiles(project.files)
        setprevprojectkey(currentkey);
    }

    const handlelivefileschange = (newfiles) => {
        setlivefiles((prev) => {
            let changed = false;
            for (const [p, code] of Object.entries(newfiles)) {
                if (prev[p] !== code) {
                    changed = true;
                    break;
                }
            }
            return changed ? newfiles : prev;
        })
    }

    //live file to send pack formate
    const sandpackfile = useMemo(() => {
        const spfiles = {};
        for (const [path, content] of Object.entries(livefiles)) {
            const filecode = typeof content === "string" ? content : content?.content || "";
            spfiles[path] = {
                code: filecode,
                active: path === activefile,

            }
        }
        return spfiles;
    }, [livefiles, activefile])

    //dependency

    const dependency = useMemo(() => {
        return detectDependencies(livefiles);
    }, [livefiles])



    return (
        <div className='h-full w-full'>
            <SandpackProvider key={project._id} template='react' files={sandpackfile} customSetup={{ dependency }} options={{
                externalResources: [
                    "https://cdn.tailwindcss.com",
                    "https://cdnjs.cloudfare.con/ajax/libs/font-awesome/6.4.0/css/all.min.css",
                ],
                classes: {
                    "sp-wrapper": "sp-wrapper",
                    "sp-layout": "sp-layout",
                    "sp-preview": "sp-preview"
                },
                logLevel: 0,

            }} theme={{
                colors: {
                    surface1: "#ffffff",
                    surface2: "#f4f4f5",
                    surface3: "#e4e4e7",
                    clickable: "#72727a",
                    base: "#09090b",
                    disabled: "#a1a1aa",
                    hover: "19191b",
                    accent: "#18181b",
                    error: "#ef4444",
                    errorSurface: "#fef2f2",
                },
                font: {
                    body: "'Urbanist',system-ui,-apple-system,sans-serif ",
                    nano: "'Geist Mono',ui-monospace,monospace",
                    size: "13px",
                    lineHeight: "1.6",
                }
            }} >
                <SandpackFileWatcher onlivefileschange={handlelivefileschange} />
                <SandpackErrorMonitor onerrorchange={setshowerroroverlay} />
                <SandpackLayout
                    style={{
                        height: "100%",
                        border: "none",
                        borderRadius: 0,
                        background: "transparent",
                    }} >
                    {showcode && (
                        <SandpackCodeEditor
                            showTabs showLineNumbers showInlineErrors wrapContent style={{
                                height: "100%",
                                flex: 1,
                                minWidth: 0
                            }} />
                    )}
                    <SandpackPreview showNavigator={false} showRefreshButton showOpenInCodeSandbox={false} showSandpackErrorOverlay style={{ height: "100%", flex: showcode ? 1 : 2, minWidth: 0 }} />

                </SandpackLayout>

            </SandpackProvider>
        </div>
    )
}

export default Previewpanel