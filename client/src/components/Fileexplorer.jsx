import { FileCodeIcon, FileTextIcon, FolderIcon } from 'lucide-react';
import React, { Children, useMemo } from 'react'

function buildtree(paths) {
    const root = [];
    for (const filepath of [...paths].sort()) {
        const parts = filepath.split("/").filter(Boolean)
        let current = root;
        for (let i = 0; i < parts.length; i++) {
            const name = parts[i];
            const islast = i === parts.length - 1;
            const fullpath = "/" + parts.slice(0, i + 1).join("/");
            let existing = current.find((n) => n.name === name)
            if (!existing) {
                existing = {
                    name,
                    path: fullpath,
                    isDir: !islast,
                    Children: [],
                };
                current.push(existing);
            }
            current = existing.Children;
        }

    }
    return root;
}

function getfileicon(name) {
    if (name.endsWith(".css")) return <FileTextIcon size={14} className='text-sky-500' />
    if (name.endsWith(".js") || name.endsWith(".jsx")) return <FileCodeIcon size={14} className='text-amber-500' />
    if (name.endsWith(".json")) return <FileTextIcon size={14} className='text-emerald-500' />
    return <FileTextIcon size={14} className='text-zinc-500' />

}

function TreeItem({ node, activefile, onfileselect, depth = 0 }) {
    const isActive = node.path === activefile;
    if (node.isDir) {
        return (
            <div>
                <div className='flex items-center gap-2 py-1 px-2 text-xs text-zinc-400 select-none' style={{ paddingLeft: `${depth * 12 + 8}px` }}>
                    <FolderIcon size={14} className='text-zinc-800 opacity-60' />
                    <span>
                        {node.name}
                    </span>
                </div>
                {node.Children.map((child) => (
                    <TreeItem key={child.path} node={child} activefile={activefile} onfileselect={onfileselect} depth={depth + 1} />
                ))}
            </div>
        )
    }
    return (
        <button onClick={() => onfileselect(node.path)} className={`w-full flex items-center gap-2 py-1.5 px-2 text-xs transition-colors rounded-md cursor-pointer ${isActive ? "bg-zinc-100 text-zinc-950 font-medium" : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}>
            {getfileicon(node.name)}
            <span className='truncate'>
                {node.name}
            </span>

        </button>
    )
}

function Fileexplorer({ files, activefile, onfileselect }) {

    const tree = useMemo(() => buildtree(Object.keys(files || {})), [files]);

    return (
        <div className='py-2 overflow-y-auto hide-scrollbar'>
            <p className='px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400'>Files</p>
            {tree.map((node) => (
                <TreeItem key={node.path} node={node} activefile={activefile} onfileselect={onfileselect} />
            ))}
        </div>
    )
}

export default Fileexplorer