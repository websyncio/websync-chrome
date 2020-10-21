import React from 'react';
import { observer } from 'mobx-react';
import PageInstance from 'mst/PageInstance';

interface Props {
    pageInstance: PageInstance;
}

const PageInstanceDetails: React.FC<Props> = observer(({ pageInstance }) => {
    return (
        <div className="details-wrap">
            <div className="pageinstance-name">
                <label>Name:</label>
                <span>{pageInstance.name}</span>
            </div>
            <div className="pageinstance-url">
                <label>Url:</label>
                <span>{pageInstance.url}</span>
            </div>
        </div>
    );
});

export default PageInstanceDetails;
