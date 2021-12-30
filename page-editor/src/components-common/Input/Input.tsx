import React, { useState, useEffect } from 'react';
import './Input.sass';

interface Props {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const Input: React.FC<Props> = (props: Props) => {
    const { value, onChange, disabled } = props;

    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleInput = (e) => {
        setCurrentValue(e.target.value);
        onChange(e.target.value);
    };

    // const handleKeyboard = (e) => {
    //     switch (e.key) {
    //         case 'Escape': //escape
    //             setCurrentValue(value);
    //             break;
    //         case 'Enter': //enter
    //             onChange(currentValue);
    //             break;
    //     }
    // };

    // const handleFocusOut = () => {
    //     onChange(currentValue);
    // };

    return (
        // <div onKeyDown={handleKeyboard} onBlur={handleFocusOut} className="input-container">
        <input
            className="input-field"
            value={currentValue}
            onChange={handleInput}
            disabled={disabled}
            spellCheck={false}
        />
        // </div>
    );
};

export default Input;
