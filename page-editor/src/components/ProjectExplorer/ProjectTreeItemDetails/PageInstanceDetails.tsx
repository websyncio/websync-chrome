import React, { useState } from 'react';
import { observer } from 'mobx-react';
import PageInstance from 'entities/mst/PageInstance';
import Input from 'components/Input/Input';
import IIdeProxy from 'connections/IDE/IIdeConnection';
import './PageInstanceDetails.sass';

interface Props {
    pageInstance: PageInstance;
    ideProxy: IIdeProxy;
}

const PageInstanceDetails: React.FC<Props> = observer(({ pageInstance, ideProxy }) => {
    const [url, setUrl] = useState(pageInstance.url);

    const submitPageInstanceUrlRename = (val) => {
        setUrl(val);
        const newPageInstance = { ...pageInstance, url: val };
        pageInstance.updatePageInstanceUrl(newPageInstance, ideProxy);
    };

    return (
        <div className="details-wrap">
            <div className="pageinstance-name">
                <label>Name:</label>
                <span>{pageInstance.name}</span>
            </div>
            <div className="pageinstance-url">
                <label>Url:</label>
                <Input value={url} onChange={submitPageInstanceUrlRename} />
            </div>
        </div>
    );
});

export default PageInstanceDetails;
