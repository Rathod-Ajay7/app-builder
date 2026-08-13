// Auto-fix common runtime code issues for client preview safely
export function sanitizeCode(code, path = "") {
    if (!code || typeof code !== "string") return "";
    let cleanCode = code;
    if (path.endsWith(".js") || path.endsWith(".jsx") || !path) {
        // Unconditionally remove the known-bad injected line from old codeValidator
        // This line was never part of legitimate AI output
        cleanCode = cleanCode.replace(/^[ \t]*const\s+draw\s*=\s*Array\.isArray\(boardRef\)[^\n]*\n?/gm, "");

        // Also remove any injected `const winCoords = typeof ...` or `const winCoords = null;`
        cleanCode = cleanCode.replace(/^[ \t]*const\s+winCoords\s*=\s*typeof\s+[^\n]*\n?/gm, "");
        cleanCode = cleanCode.replace(/^[ \t]*const\s+winCoords\s*=\s*null;\s*\n?/gm, "");
        cleanCode = cleanCode.replace(/^[ \t]*const\s+draw\s*=\s*false;\s*\n?/gm, function(match) {
            // Only remove if there's another draw declaration in the file
            const otherDraw = cleanCode.replace(match, "").match(/\b(?:const|let|var)\s+draw\b/);
            return otherDraw ? "" : match;
        });

        // Safe variable name alignment (e.g. if `isDraw` is declared, replace standalone `draw` with `isDraw`)
        if (/\b(?:const|let|var)\s+isDraw\b/.test(cleanCode) && /\b(?<!is)draw\b/.test(cleanCode) && !/\b(?:const|let|var|function|param)\s+draw\b/.test(cleanCode)) {
            cleanCode = cleanCode.replace(/\b(?<!is)draw\b/g, "isDraw");
        }
    }
    return cleanCode;
}

// Scans source files to detect npm dependencies from import statements
export function detectDependencies(files) {
    const deps = {};
    if (!files) return deps;

    const allCode = Object.values(files)
        .map(f => typeof f === "string" ? f : f?.content || "")
        .join("\n");
    const filePaths = Object.keys(files);

    const isLocalFileOrFolder = (pkgName) => {
        const name = pkgName.startsWith("@/") ? pkgName.substring(2) : pkgName;
        return (
            pkgName.startsWith("@/") ||
            pkgName === "@" ||
            filePaths.some(p => 
                p === `/${name}` || 
                p.startsWith(`/${name}/`) || 
                p.replace(/\.[^/.]+$/, "") === `/${name}`
            )
        );
    };

    const importRegex = /from\s+['"]([^./][^'"]*)['"]/g;
    let match;
    while ((match = importRegex.exec(allCode)) !== null) {
        const rawImport = match[1];

        // Scoped packages like @scope/package, normal packages like package
        const pkg = rawImport.startsWith("@") && !rawImport.startsWith("@/")
            ? rawImport.split("/").slice(0, 2).join("/")
            : rawImport.split("/")[0];

        // Skip react (included in template), react-dom, and local modules
        if (pkg !== "react" && pkg !== "react-dom" && !isLocalFileOrFolder(pkg)) {
            deps[pkg] = "latest";
        }
    }
    return deps;
}
