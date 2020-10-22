import React from 'react';
import ComponentInstance from 'components/ProjectViewer/Editor/ComponentInstance';
import { observer } from 'mobx-react';
import { useRootStore } from 'context';
import 'styles/ComponentInstancesTree.sass';
import RootStore from 'mst/RootStore';
import ComponentsContainer from 'mst/ComponentsContainer';

interface Props {
    pageObject: ComponentsContainer;
}

const ComponentInstancesTree: React.FC<Props> = observer(({ pageObject }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();

    // function onRename(event, component) {
    //     if (event.target.contentEditable === true) {
    //         event.target.contentEditable = false;
    //     } else {
    //         event.target.contentEditable = true;
    //     }
    // }

    // function onNameKeyDown(event, component) {
    //     const newName = event.target.innerText.trim();
    //     if (!event.key.match(/[a-z_$][A-Za-z0-9_$]+/g)) {
    //         event.preventDefault();
    //         return;
    //     }
    //     if (event.key === 'Enter') {
    //         submitRename(event, component, newName);
    //         event.preventDefault();
    //     } else if (event.key === 'Escape') {
    //         submitRename(event, component, null);
    //     } else if (newName.length === 100) {
    //         event.preventDefault();
    //     }
    // }

    // function onNameBlur(event, component) {
    //     const newName = event.target.innerText.trim();
    //     submitRename(event, component, newName);
    // }

    // function submitRename(event, component, newName) {
    //     event.target.contentEditable = false;
    //     if (newName === null) {
    //         event.target.innerText = component.name;
    //         return;
    //     } else if (component.name === newName) {
    //         return;
    //     }

    //     component.name = newName;

    //     const message = {};
    //     message['type'] = 'update-component-instance';
    //     // message['moduleName'] = app.state.module; // TODO moduleName is required in the command
    //     message['data'] = component;
    //     const json = JSON.stringify(message);
    //     console.log('sent ' + json);
    //     //this.props.onSend(json);

    //     const lastDot = component.id.lastIndexOf('.');
    //     component.id = component.id.substring(0, lastDot + 1) + newName;
    // }

    function onSend() {
        console.log('onSend call from ComponentInstncesTree');
    }

    return (
        <div className="components-tree">
            <ul>
                {pageObject.componentsInstances.map((component) => [
                    <li key={component.id}>
                        <ComponentInstance component={component} onSend={onSend} />
                    </li>,
                    // <ComponentInstancesList componentInstancesList={component.selectedPageType.componentsInstances}/>
                ])}
            </ul>
        </div>
    );
});

export default ComponentInstancesTree;
