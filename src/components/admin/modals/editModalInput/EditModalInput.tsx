// File: src/components/EditModalInput.tsx
"use client";

import React, { useState } from 'react';
import { Pen } from "lucide-react";
import { ModalInputType } from '@/type/ModalInputType.type';

const EditModalInput: React.FC<ModalInputType> = ({
    placeholder,
    id,
    value: initialValue,
    inputType,
    onUpdateInputs,
    fieldKey,
    fields,
}) => {
    const [data, setData] = useState(initialValue);
    const field = fields[fieldKey];

    const UpdateInputs = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value;
        setData(newValue);
        onUpdateInputs(id, newValue);
    };

    return (
        <div className="input-group" >
            <div className="w-full flex flex-row items-center border-2 border-transparent rounded-lg gap-1">
                {inputType !== "hidden" && <Pen className="bg-transparent m-1px" />}
                {inputType === "textarea" ? (
                    <textarea
                        placeholder={placeholder}
                        id={id}
                        name={field.name}
                        key={field.key}
                        value={data}
                        className="input-style"
                        onChange={UpdateInputs}
                    />
                ) : (
                    <input
                        type={inputType}
                        placeholder={placeholder}
                        id={id}
                        name={field.name}
                        key={field.key}
                        value={data}
                        className="input-style"
                        onChange={UpdateInputs}
                        min={inputType === 'number' ? 0 : undefined}
                    />
                )}
            </div>
            {field.errors && (
                <p className="text-md bg-red-300/50 backdrop-blur-2xl mt-2 p-1 rounded-2xl">
                    {field.errors.join(", ")}
                </p>
            )}
        </div>
    );
};

export default EditModalInput;