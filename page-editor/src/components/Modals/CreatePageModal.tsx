import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import { DependencyContainer, TYPES } from 'inversify.config';
import { observer } from 'mobx-react';
import React from 'react';
import IProjectSynchronizationService from 'services/ISynchronizationService';
import CreateModal from './CreateModal/CreateModal';

interface Props {
    isOpen: boolean;
    onRequestClose: () => void;
}

const CreatePageModal: React.FC<Props> = observer(({ isOpen, onRequestClose }) => {
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
            isOpen={isOpen}
            title={`New Page in ${uiStore.matchingWebsite.name}`}
            iconClass="page-icon"
            onRequestClose={onRequestClose}
            onSubmit={onSubmit}
        />
    );
});

export default CreatePageModal;
