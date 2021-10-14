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

    function actionsList() {
        return actions.map((item, index) => {
            return (
                <li
                    key={item.name}
                    onClick={() => onSelected(item)}
                    className={`${index === selectedActionIndex ? 'selected' : ''}`}
                >
                    {item.name}
                </li>
            );
        });
    }

    return (
        <div className="component-type-selector">
            <ul>{actionsList()}</ul>
        </div>
    );
});

export default EditorPopup;
