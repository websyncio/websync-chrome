import WaitOverlay from 'components-common/WaitOverlay/WaitOverlay';
import { observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import ReactModal from 'react-modal';
import './CreateModal.sass';

interface Props {
    onRequestClose: () => void;
    onSubmit: (name: string) => Promise<void>;
    title: string;
    iconClass: string;
}

ReactModal.setAppElement('#root');

const CreateModal: React.FC<Props> = observer(({ onRequestClose, onSubmit, title, iconClass }) => {
    const [requestPromise, setRequestPromise] = useState<Promise<void> | null>(null);
    let inputEl: any;

    function afterOpenModal() {
        inputEl.focus();
    }

    function onKeyDown(e) {
        // What other validation do we need?
        if (e.key === 'Enter' && inputEl.value) {
            setRequestPromise(onSubmit(inputEl.value));
        }
    }

    return (
        <>
            {requestPromise ? (
                <WaitOverlay promise={requestPromise} onRequestClose={onRequestClose} />
            ) : (
                <ReactModal
                    isOpen={true}
                    onAfterOpen={afterOpenModal}
                    onRequestClose={onRequestClose}
                    className="create-modal"
                    overlayClassName="modal-overlay flex-center"
                >
                    <div className="header">{title}</div>
                    <div className="flex-left name-input-container">
                        <i className={`${iconClass} ws-icon-small`} />
                        <input
                            type="text"
                            placeholder="Name"
                            ref={(_inputEl) => (inputEl = _inputEl)}
                            spellCheck="false"
                            onKeyDown={onKeyDown}
                        ></input>
                    </div>
                </ReactModal>
            )}
        </>
    );
});

export default CreateModal;
