import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import { DependencyContainer } from 'inversify.config';
import { observer } from 'mobx-react';
import React from 'react';
import IProjectSynchronizationService from 'services/ISynchronizationService';
import CreateModal from './CreateModal/CreateModal';
import TYPES from 'inversify.types';

interface Props {
    onRequestClose: () => void;
}

const CreatePageModal: React.FC<Props> = observer(({ onRequestClose }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const projectSynchronizationService = DependencyContainer.get<IProjectSynchronizationService>(
        TYPES.SynchronizationService,
    );

    function onSubmit(name: string) {
        const absolutePath = new URL(uiStore.currentUrl!).pathname;
        return projectSynchronizationService.createPageType(name, absolutePath, uiStore.matchingWebsite.id);
    }

    return (
        <CreateModal
            title={`New Page in ${uiStore.matchingWebsite.name}`}
            iconClass="page-icon"
            onRequestClose={onRequestClose}
            onSubmit={onSubmit}
        />
    );
});

export default CreatePageModal;
