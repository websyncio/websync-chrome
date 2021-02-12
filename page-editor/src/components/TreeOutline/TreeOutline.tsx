import React from 'react';
import './TreeOutline.sass';

interface Props {
    expanded: boolean;
    onClick?: () => void;
}

const TreeOutline: React.FC<Props> = (props: Props) => {
    const { expanded, onClick } = props;

    return (
        <button onClick={onClick} className="button">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                {expanded ? <path d="M5.5 9.5L9.25 4h-7.5" /> : <path d="M7.5 6L2 2.25v7.5" />}
            </svg>
        </button>
    );
};

export default TreeOutline;
