import { ArrowLeftIcon, Code2Icon, DownloadIcon, ExternalLinkIcon, EyeIcon, GlobeIcon, Loader2Icon } from 'lucide-react'
import React from 'react'

function builderHeader({
    projectname, version, showcode, publishing, ontoggleshowcode, onopenpreview, onpublish, ondownload, onback, onlogout,
}) {

    return (
        <header className='h-12 shrink-0 flex items-center justify-between px-3 border-b vorder-zinc-200 bg-white'>
            <div className='flex item-center gap-2'>
                <button className='p-1.5 rounded-md text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 cursor-pointer'
                    onClick={onback}>
                    <ArrowLeftIcon size={16} />
                </button>
                <img src="/logo.svg" alt="" className='invert size-5' />
                <span className='text-sm font-semibold truncate max-w-38 md:max-w-50'>
                    {projectname}
                </span>
                <span className='text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-medium'>
                    v{version}
                </span>

            </div>
            <div className='flex items-center gap-1.5'>
                <button onClick={ontoggleshowcode} className={`inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 text-xs font-medium rounded-lg cursor-pointer bg-white ${showcode ? "bg-zinc-100" : ""}`}>
                    {showcode ? (
                        <>
                            <EyeIcon size={13} /> preview
                        </>
                    ) :
                        <>
                            <Code2Icon size={13} /> code
                        </>
                    }
                </button>
                <button onClick={onopenpreview} className='inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 text-xs font-medium rounded-lg cursor-pointer bg-white'>
                    <ExternalLinkIcon size={13} />
                    open privew
                </button>

                <button onClick={onpublish} disabled={publishing} className='inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 text-xs font-medium rounded-lg cursor-pointer bg-white'>
                    {publishing ? <Loader2Icon size={13} className='animate-spin' /> : <GlobeIcon size={13} />}
                    publish
                </button>

                <button
                    onClick={ondownload}
                    className='inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 text-xs font-medium rounded-lg cursor-pointer bg-white'>
                    <DownloadIcon size={13} /> Export
                </button>

                <button
                    onClick={onlogout}
                    className='inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 text-xs font-medium rounded-lg cursor-pointer bg-white'>
                    Sign Out
                </button>
            </div>

        </header>
    )
}

export default builderHeader