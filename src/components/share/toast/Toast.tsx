"use client"
import React, { useState } from 'react'
import { X } from 'lucide-react';
import { ToastType } from '@/type/ToastType.type';

const Toast: React.FC<ToastType> = ({ text }) => {

    const [showToast, setShowToast] = useState(true);
    return (
        <div
            className={`w-96 fixed top-20 left-10 bg-sky-500 backdrop-blur-2xl text-white px-5 py-2 
        rounded-lg z-50 flex flex-row justify-start items-center gap-5
        transition-all duration-300 ease-in-out transform shadow-xl shaodw-black
        ${showToast ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
        >
            <div className=''>
                <X className='text-red-600 cursor-pointer text-2xl font-bold shadow shadow-red-500'
                    onClick={() => setShowToast(false)} />
            </div>
            <p className=' text-wrap'>
                {text}
            </p>
        </div>
    )
}

export default Toast;
