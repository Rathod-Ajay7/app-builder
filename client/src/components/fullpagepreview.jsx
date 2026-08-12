import React, { useMemo, useState } from 'react'
import { detectDependencies } from '../utils/sandpackUtils';
import SandpackErrorMonitor from './sandpackerrormonitor';
import { SandpackLayout, SandpackPreview, SandpackProvider } from '@codesandbox/sandpack-react';

const FullPagePreview = ({ files }) => {

    const [showerroroverlay, setshowerroroverlay] = useState(true);

    const sandpackfile = useMemo(() => {
        if (!files) return {};
        const spfiles = {};
        for (const [path, content] of Object.entries(files)) {
            const filecode = typeof content === "string" ? content : content?.content || "";
            spfiles[path] = {
                code: filecode,
            }
        }
        return spfiles;
    }, [files])

    //dependency

    const dependency = useMemo(() => {
        if (!files) return {};
        return detectDependencies(files);
    }, [files])



    return (
        <div className='h-screen w-screen bg-white overflow-hidden'>
            <SandpackProvider template='react' files={sandpackfile} customSetup={{ dependencies: dependency }} options={{
                externalResources: [
                    "https://cdn.tailwindcss.com",
                    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
                ],
                logLevel: 0,

            }}
                className="h-full w-full"

            >

                <SandpackErrorMonitor onerrorchange={setshowerroroverlay} />
                <SandpackLayout className='w-full h-full border-none bg-transparent '>
                    <SandpackPreview
                        showNavigator={false}
                        showRefreshButton={false}
                        showOpenInCodeSandbox={false} showSandpackErrorOverlay={showerroroverlay}
                        className='h-full w-full ' />

                </SandpackLayout>

            </SandpackProvider>
        </div>
    )
}

export default FullPagePreview