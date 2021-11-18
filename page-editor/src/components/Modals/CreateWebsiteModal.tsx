import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import { DependencyContainer, TYPES } from 'inversify.config';
import { observer } from 'mobx-react';
import React from 'react';
import ReactModal from 'react-modal';
import IProjectSynchronizationService from 'services/ISynchronizationService';

interface Props {
    isOpen: boolean;
    onRequestClose: () => void;
}

const CreateWebsiteModal: React.FC<Props> = observer(({ isOpen, onRequestClose }) => {
    const { projectStore, uiStore }: RootStore = useRootStore();
    const projectSynchronizationService = DependencyContainer.get<IProjectSynchronizationService>(
        TYPES.SynchronizationService,
    );

    let inputEl: any;

    function afterOpenModal() {
        inputEl.focus();
    }

    function onSubmit(e) {
        if (e.key === 'Enter' && inputEl.value) {
            const host = new URL(uiStore.currentUrl!).origin;
            projectSynchronizationService.createWebsite(inputEl.value, host);
            onRequestClose();
        }
    }

    return (
        <>
            <ReactModal
                isOpen={isOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={onRequestClose}
                className="create-modal"
                overlayClassName="modal-overlay flex-center"
            >
                <div className="header">New website in {uiStore.selectedProject}</div>
                <div className="flex-left name-input-container">
                    <i className="page-icon ws-icon-small" />
                    <input
                        type="text"
                        placeholder="Name"
                        ref={(_inputEl) => (inputEl = _inputEl)}
                        spellCheck="false"
                        onKeyDown={onSubmit}
                    ></input>
                </div>
            </ReactModal>
        </>
    );
});

export default CreateWebsiteModal;
