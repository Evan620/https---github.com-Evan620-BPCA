import React from "react";

export function BlueprintBackground() {
    return (
        <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black" suppressHydrationWarning>
            <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" suppressHydrationWarning></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]" suppressHydrationWarning></div>
        </div>
    );
}
