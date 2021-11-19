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

const CreateWebsiteModal: React.FC<Props> = observer(({ isOpen, onRequestClose }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const projectSynchronizationService = DependencyContainer.get<IProjectSynchronizationService>(
        TYPES.SynchronizationService,
    );

    function onSubmit(name: string): Promise<void> {
        const host = new URL(uiStore.currentUrl!).origin;
        return projectSynchronizationService.createWebsite(name, host);
    }

    return (
        <CreateModal
            isOpen={isOpen}
            title={`New website in ${uiStore.selectedProject}`}
            iconClass="website-icon"
            onRequestClose={onRequestClose}
            onSubmit={onSubmit}
        />
    );
});

export default CreateWebsiteModal;
