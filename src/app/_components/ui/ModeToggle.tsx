'use client'

import * as React from 'react'
import {Moon,Sun} from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ModeToggle(){
    const { theme, setTheme } = useTheme();

    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    const handleToggle = ()=>{
        if(theme === "dark" || theme === "system"){
            setTheme("light");
        } else {
            setTheme("dark");
        }
    }
    
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return(
        <Button
        variant={"ghost"}
        size={"icon"}
        onClick={handleToggle}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
        >
        <div className="h-[1.2rem] w-[1.2rem]">
            {isDark ? (
                <Moon className='h-full w-full transition-all text-white' />
            ) : (
                <Sun className='h-full w-full transition-all' />
            )}
        </div>
        </Button>
    )
}
