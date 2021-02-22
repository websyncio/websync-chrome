import { observer } from 'mobx-react';
import React from 'react';
import Spinner from 'components-common/Spinner/Spinner';

interface Props {
    projectName: string;
    isSelected: boolean;
    onProjectSelected: () => void;
}

const IdeProject: React.FC<Props> = observer(({ projectName, isSelected, onProjectSelected }) => {
    return (
        <div key={projectName} className="ide-project" onClick={onProjectSelected}>
            {projectName}
            {isSelected && <Spinner />}
        </div>
    );
});

export default IdeProject;
