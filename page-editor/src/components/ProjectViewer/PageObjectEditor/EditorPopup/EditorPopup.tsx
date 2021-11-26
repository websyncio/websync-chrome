import React, { useLayoutEffect, useState } from 'react';
import { observer } from 'mobx-react';
import './EditorPopup.sass';
import IEditorPopupAction from './IEditorPopupAction';

interface Props {
    actions: IEditorPopupAction[];
    selectedActionIndex: number;
}

const EditorPopup: React.FC<Props> = observer(({ actions, selectedActionIndex }) => {
    function onSelected(action: IEditorPopupAction) {
        action.execute();
    }

    function actionIcon(item) {
        if (item.iconBase64) {
            return (
                <span className="action-image-icon">
                    <img className="" src={item.iconBase64} />
                </span>
            );
        }
        return (
            <span className="action-letter-icon">
                <span className="circle" style={{ backgroundColor: item.iconColor }} />
                <span className="letter" title={item.iconTitle}>
                    {item.iconLetter}
                </span>
            </span>
        );
    }

    function actionsList() {
        return actions.map((item, index) => {
            return (
                <li
                    key={item.name}
                    onClick={() => onSelected(item)}
                    className={`${index === selectedActionIndex ? 'selected' : ''} ${item.actionClass}`}
                >
                    {actionIcon(item)}
                    <span className={`action-name`}>{item.name}</span>
                </li>
            );
        });
    }

    return (
        <div className="editor-popup">
            {actions.length ? <ul>{actionsList()}</ul> : <div className="no-suggestions">No suggestions</div>}
        </div>
    );
});

export default EditorPopup;
