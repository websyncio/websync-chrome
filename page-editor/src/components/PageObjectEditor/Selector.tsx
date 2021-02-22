import React, { Component, useEffect, useState } from 'react';
import ISelector from 'entities/mst/Selector';
import SelectorValidator from 'services/SelectorValidatorService';
import SelectorHighlighter from 'services/SelectorHighlighterService';
import { observer } from 'mobx-react';
import { DependencyContainer, TYPES } from 'inversify.config';
interface Props {
    parameterName: string | null;
    selector: ISelector;
    onEdit: () => void;
    onValidationError: () => void;
}

const Selector: React.FC<Props> = observer(({ parameterName, selector, onEdit, onValidationError }) => {
    const selectorValidator: SelectorValidator = DependencyContainer.get<SelectorValidator>(TYPES.SelectorValidator);
    const selectorHighlighter: SelectorHighlighter = DependencyContainer.get<SelectorHighlighter>(
        TYPES.SelectorHighlighter,
    );
    const [status, setStatus] = useState<number | undefined>(undefined);

    parameterName = parameterName ?? 'root';

    function validateCallback(validationResult: any) {
        console.log(selector.value + ': ' + validationResult.count);
        setStatus(validationResult.count);
        if (validationResult.count === 0) {
            onValidationError();
        }
    }

    function validate() {
        selectorValidator.validate(selector.scss, validateCallback);
    }

    useEffect(() => {
        validate();
    }, []);

    function submitRename(event, newName) {
        // event.target.contentEditable = false;
        // if (newName === null) {
        //     event.target.innerText = this.props.component.name;
        //     return;
        // } else if (this.props.component.name === newName) {
        //     return;
        // }
        // const param =
        //     this.props.component.initializationAttribute &&
        //     this.props.component.initializationAttribute.parameters.find((p) => p.name === this.props.parameterName);
        // console.log('param.name: ' + param?.name);
        // if (param !== null && param !== undefined) {
        //     param.values[this.props.index].value = newName;
        // }
        // console.log('param.index: ' + this.props.index);
        // const data = {};
        // data['type'] = 'update-component-instance';
        // data['data'] = this.props.component;
        // const json = JSON.stringify(data);
        // console.log('sent ' + json);
        // this.props.onSend(json);
    }

    function onRename(event) {
        console.log('onRename');
        if (event.target.contentEditable === true) {
            event.target.contentEditable = false;
        } else {
            event.target.contentEditable = true;
        }
    }

    function onNameKeyDown(event) {
        const newName = event.target.innerText.trim();
        // if (!event.key.match(/[A-Za-z0-9_$]+/g)) {
        //     event.preventDefault();
        //     return;
        // }
        console.log('onNameKeyDown');
        console.log(event.key);
        if (event.key === 'Enter') {
            submitRename(event, newName);
            event.preventDefault();
        } else if (event.key === 'Escape') {
            submitRename(event, null);
        } else if (newName.length === 100) {
            event.preventDefault();
        }
    }

    function onNameBlur(event) {
        const newName = event.target.innerText.trim();
        console.log('onNameBlur');
        submitRename(event, newName);
    }

    function highlightSelector() {
        selectorHighlighter.highlight(selector.scss);
    }

    function removeHighlighting() {
        selectorHighlighter.removeHighlighting();
    }

    return (
        <span
            key={parameterName}
            className={`parameter-value-wrap ${
                status === undefined || status === 1 ? '' : status === 0 ? 'zero-results' : 'multiple-results'
            }`}
        >
            <span className="parameter-name">{parameterName}:</span>
            &nbsp;
            <span className="parameter-value">
                &quot;
                <span
                    onMouseEnter={() => highlightSelector()}
                    onMouseLeave={() => removeHighlighting()}
                    onDoubleClick={(event) => onRename(event)}
                    onKeyDown={(event) => onNameKeyDown(event)}
                    onBlur={(event) => onNameBlur(event)}
                    onClick={onEdit}
                >
                    {`${selector.value}`}
                </span>
                &quot;
            </span>
        </span>
    );
});

export default Selector;
