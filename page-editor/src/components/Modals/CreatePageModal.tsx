import { useRootStore } from 'context';
import RootStore from 'entities/mst/RootStore';
import { DependencyContainer, TYPES } from 'inversify.config';
import { observer } from 'mobx-react';
import React, { useRef } from 'react';
import ReactModal from 'react-modal';
import IProjectSynchronizationService from 'services/ISynchronizationService';
import './CreateModal.sass';

interface Props {
    isOpen: boolean;
    onRequestClose: () => void;
}

ReactModal.setAppElement('#root');

const CreatePageModal: React.FC<Props> = observer(({ isOpen, onRequestClose }) => {
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
            const absolutePath = new URL(uiStore.currentUrl!).pathname;
            projectSynchronizationService.createPageType(inputEl.value, absolutePath, uiStore.matchingWebsite.id);
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
                <div className="header">New Page in {uiStore.matchingWebsite.name}</div>
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

export default CreatePageModal;
