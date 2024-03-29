import React, { useEffect, useState } from 'react';
import SelectorValidator from 'services/SelectorValidatorService';
import SelectorHighlighter from 'services/SelectorHighlighterService';
import { observer } from 'mobx-react';
import { DependencyContainer } from 'inversify.config';
import IUrlSynchronizationService from 'services/IUrlSynchronizationService';
import XcssSelector from 'entities/XcssSelector';
import TYPES from 'inversify.types';

interface Props {
    selector: XcssSelector | null;
    parameterName?: string | null;
    onEdit?: () => void;
    onValidated?: (hasError) => void;
}

const Selector: React.FC<Props> = observer(({ parameterName, selector, onEdit, onValidated }) => {
    const selectorValidator: SelectorValidator = DependencyContainer.get<SelectorValidator>(TYPES.SelectorValidator);
    const selectorHighlighter: SelectorHighlighter = DependencyContainer.get<SelectorHighlighter>(
        TYPES.SelectorHighlighter,
    );
    const urlSynchronizationService: IUrlSynchronizationService = DependencyContainer.get<IUrlSynchronizationService>(
        TYPES.UrlSynchronizationService,
    );

    const [status, setStatus] = useState<number | undefined>(undefined);

    parameterName = parameterName ?? 'root';

    function validateCallback(validationResult: any) {
        // console.log(selector.xcss + ': ' + validationResult.count);
        setStatus(validationResult.count);
        onValidated && onValidated(validationResult.count === 0);
    }

    function validate() {
        if (selector) {
            selectorValidator.validate(selector, validateCallback);
        }
    }

    urlSynchronizationService.addUrlChangedListener(validate);

    useEffect(() => {
        validate();
    }, [selector]);

    // function submitRename(event, newName) {
    //     console.log('submit rename', event, newName);
    //     // event.target.contentEditable = false;
    //     // if (newName === null) {
    //     //     event.target.innerText = this.props.component.name;
    //     //     return;
    //     // } else if (this.props.component.name === newName) {
    //     //     return;
    //     // }
    //     // const param =
    //     //     this.props.component.initializationAttribute &&
    //     //     this.props.component.initializationAttribute.parameters.find((p) => p.name === this.props.parameterName);
    //     // console.log('param.name: ' + param?.name);
    //     // if (param !== null && param !== undefined) {
    //     //     param.values[this.props.index].value = newName;
    //     // }
    //     // console.log('param.index: ' + this.props.index);
    //     // const data = {};
    //     // data['type'] = 'update-component-instance';
    //     // data['data'] = this.props.component;
    //     // const json = JSON.stringify(data);
    //     // console.log('sent ' + json);
    //     // this.props.onSend(json);
    // }

    // function onRename(event) {
    //     console.log('onRename');
    //     if (event.target.contentEditable === true) {
    //         event.target.contentEditable = false;
    //     } else {
    //         event.target.contentEditable = true;
    //     }
    // }

    // function onNameKeyDown(event) {
    //     const newName = event.target.innerText.trim();
    //     // if (!event.key.match(/[A-Za-z0-9_$]+/g)) {
    //     //     event.preventDefault();
    //     //     return;
    //     // }
    //     console.log('onNameKeyDown');
    //     console.log(event.key);
    //     if (event.key === 'Enter') {
    //         submitRename(event, newName);
    //         event.preventDefault();
    //     } else if (event.key === 'Escape') {
    //         submitRename(event, null);
    //     } else if (newName.length === 100) {
    //         event.preventDefault();
    //     }
    // }

    // function onNameBlur(event) {
    //     const newName = event.target.innerText.trim();
    //     console.log('onNameBlur');
    //     submitRename(event, newName);
    // }

    function highlightSelector() {
        if (selector) {
            selectorHighlighter.highlight(selector);
        }
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
                    // onDoubleClick={(event) => onRename(event)}
                    // onKeyDown={(event) => onNameKeyDown(event)}
                    // onBlur={(event) => onNameBlur(event)}
                    onMouseDown={(e) => {
                        onEdit && onEdit();
                        e.preventDefault();
                    }}
                >
                    {`${selector ? selector.xcss : ''}`}
                </span>
                &quot;
            </span>
        </span>
    );
});

export default Selector;
