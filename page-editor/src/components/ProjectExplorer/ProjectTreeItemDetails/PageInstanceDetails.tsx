import React from 'react';
import { observer } from 'mobx-react';
import PageInstance from 'entities/mst/PageInstance';
import Input from 'components/Input/Input';
import './PageInstanceDetails.sass';
import { DependencyContainer, TYPES } from 'inversify.config';
import ISynchronizationService from 'services/ISynchronizationService';

interface Props {
    pageInstance: PageInstance;
}

const PageInstanceDetails: React.FC<Props> = observer(({ pageInstance }) => {
    const synchronizationService = DependencyContainer.get<ISynchronizationService>(TYPES.SynchronizationService);

    function onChangeUrl(newUrl: string) {
        synchronizationService.updatePageInstanceUrl(pageInstance, newUrl);
    }

    return (
        <div className="details-wrap">
            <div className="pageinstance-name">
                <label>Name:</label>
                <span>{pageInstance.name}</span>
            </div>
            <div className="pageinstance-url">
                <label>Url:</label>
                <Input value={pageInstance.url} onChange={onChangeUrl} />
            </div>
        </div>
    );
});

export default PageInstanceDetails;
