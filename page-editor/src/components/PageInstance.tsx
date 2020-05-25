import React, { Component } from 'react';
import ComponentInstanceModel from 'models/ComponentInstance';
import ParameterModel from 'models/Parameter';
import Attribute from './Attribute';
import SelectorEditorProxy from 'services/SelectorEditorProxy';
import { createPopper } from '@popperjs/core';
import FocusTrap from 'focus-trap-react';
import Portal from './Portal';
import 'styles/Popup.sass';
import ComponentTypeSelector from './ComponentTypeSelector';
import PageInstanceModel from 'models/PageInstance';

export default class PageInstance extends Component<
    {
        page: PageInstanceModel;
        onSend: any;
    },
    {
        isOpen: boolean;
    }
> {
    triggerRef: any;
    popupRef: any;
    popper: any;

    constructor(props) {
        super(props);

        this.triggerRef = React.createRef();
        this.popupRef = React.createRef();

        this.state = {
            isOpen: false,
        };

        this.togglePopup = this.togglePopup.bind(this);
    }

    componentDidMount() {
        console.log(this.triggerRef.current);
        console.log(this.popupRef.current);

        this.popper = createPopper(this.triggerRef.current, this.popupRef.current, {
            placement: 'bottom-start',
            strategy: 'fixed',
            modifiers: [
                {
                    name: 'offset',
                    options: {
                        offset: [0, 2],
                    },
                },
            ],
        });
    }

    componentWillUnmount() {
        this.popper.destroy();
    }

    togglePopup() {
        this.setState(
            (state) => {
                return {
                    isOpen: !state.isOpen,
                };
            },
            () => {
                this.popper.forceUpdate();
            },
        );
    }

    onRename(event) {
        if (event.target.contentEditable === true) {
            event.target.contentEditable = false;
        } else {
            event.target.contentEditable = true;
        }
    }

    onNameKeyDown(event) {
        const newName = event.target.innerText.trim();
        if (!event.key.match(/[A-Za-z0-9_$]+/g)) {
            event.preventDefault();
            return;
        }
        if (event.key === 'Enter') {
            this.submitRename(event, this.props.page, newName);
            event.preventDefault();
        } else if (event.key === 'Escape') {
            this.submitRename(event, this.props.page, null);
        } else if (newName.length === 100) {
            event.preventDefault();
        }
    }

    onNameBlur(event) {
        const newName = event.target.innerText.trim();
        this.submitRename(event, this.props.page, newName);
    }

    submitRename(event, page, newName) {
        event.target.contentEditable = false;
        if (newName === null) {
            event.target.innerText = page.name;
            return;
        } else if (page.name === newName) {
            return;
        }

        page.name = newName;

        const message = {};
        message['type'] = 'update-component-instance';

        // message['moduleName'] = app.state.module; // TODO moduleName is required in the command
        message['data'] = page;
        const json = JSON.stringify(message);
        console.log('sent ' + json);
        this.props.onSend(json);

        const lastDot = page.id.lastIndexOf('.');
        page.id = page.id.substring(0, lastDot + 1) + newName;
    }

    editSelector = (component: PageInstanceModel, parameter: ParameterModel, valueIndex: number) => {
        SelectorEditorProxy.instance().sendMessage('edit-component-selector', {
            componentId: component.id,
            componentName: component.name,
            parameterName: parameter.name,
            parameterValueIndex: valueIndex,
            selector: parameter.values[valueIndex].value,
        });
    };

    editComponentType() {
        console.log('edit component type');
    }

    getName(id: string) {
        const arr = id.split('.');
        return arr[arr.length - 1].trim();
    }

    getTypeName(componentTypeId: string) {
        const arr = componentTypeId.split('.');
        return arr[arr.length - 1].trim();
    }

    render() {
        return (
            <span>
                <span className="trigger type-name" ref={this.triggerRef} onClick={this.togglePopup}>
                    {this.getTypeName(this.props.page.pageTypeId)}
                </span>

                <Portal>
                    <span className="popup__container" ref={this.popupRef}>
                        {this.state.isOpen && (
                            <FocusTrap
                                focusTrapOptions={{
                                    onDeactivate: this.togglePopup,
                                    clickOutsideDeactivates: true,
                                }}
                            >
                                <div className="popup">
                                    <div tabIndex={0}>
                                        <ComponentTypeSelector onSelected={this.editSelector} />
                                    </div>
                                </div>
                            </FocusTrap>
                        )}
                    </span>
                </Portal>

                <span
                    className={`field-name`}
                    title="Double Click to Edit Name"
                    onDoubleClick={this.onRename}
                    onKeyDown={this.onNameKeyDown}
                    onBlur={this.onNameBlur}
                >
                    {this.getName(this.props.page.id)}
                </span>
                {this.props.page.initializationAttribute && (
                    <Attribute
                        attribute={this.props.page.initializationAttribute}
                        onEditSelector={(parameter, valueIndex) =>
                            this.editSelector(this.props.page, parameter, valueIndex)
                        }
                    />
                )}
            </span>
        );
    }
}
