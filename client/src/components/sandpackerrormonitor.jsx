import { useSandpack } from '@codesandbox/sandpack-react'
import React, { useEffect } from 'react'

const SandpackErrorMonitor = ({ onerrorchange }) => {

    const { sandpack } = useSandpack();
    const { error } = sandpack;
    useEffect(() => {
        if (error) {
            const msg = error.message || "";
            const isNetworkerror = msg.includes("failed to fetch") || msg.includes("col.csbops.io") || msg.includes("ERR_CONNECTION_TIMED_OUT") || msg.includes("net::ERR");

            if (isNetworkerror) {
                onerrorchange(false);
                return;
            }
        }
        onerrorchange(true);
    }, [error, onerrorchange])

    return null;
}

export default SandpackErrorMonitor