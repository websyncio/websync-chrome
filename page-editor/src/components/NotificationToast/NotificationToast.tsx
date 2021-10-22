import { observer } from 'mobx-react';
import React from 'react';
import './NotificationToast.sass';

interface Props {
    title: string | null;
    message: string;
    isError: boolean;
}

export const NotificationToast: React.FC<Props> = observer(({ title, message, isError }) => {
    return (
        <div className={`notification ${isError ? 'error' : ''}`}>
            {title && <div className="title">{title}</div>}
            <div className="message">{message}</div>
        </div>
    );
});
