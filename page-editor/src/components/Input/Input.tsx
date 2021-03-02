import React, { useState } from 'react';
import './Input.sass';

interface Props {
    value: string;
    onClick: (value: string) => void;
    disabled?: boolean;
}

const Input: React.FC<Props> = (props: Props) => {
    const { value, onClick, disabled } = props;

    const [currentValue, setCurrentValue] = useState(value);

    const handleInput = (e) => {
        setCurrentValue(e.target.value);
    };

    const handleKeyboard = (e) => {
        switch (e.key) {
            case 'Escape': //escape
                setCurrentValue(value);
                break;
            case 'Enter': //enter
                onClick(currentValue);
                break;
        }
    };

    const handleFocusOut = () => {
        onClick(currentValue);
    };

    return (
        <div onKeyDown={handleKeyboard} onBlur={handleFocusOut} className="input-container">
            <input className="input-field" value={currentValue} onChange={handleInput} disabled={disabled} />
        </div>
    );
};

export default Input;
