import React from 'react';
import './CloseButton.sass';
import TimesIcon from './times.svg';

interface Props {
    onClick: () => void;
}

const CloseButton: React.FC<Props> = (props: Props) => {
    const { onClick } = props;
    return (
        <button className="close-button" onClick={onClick}>
            <TimesIcon />
        </button>
    );
};

export default CloseButton;
