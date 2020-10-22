import { observer } from 'mobx-react';
import React from 'react';

interface Props {
    projectName: string;
    isSelected: boolean;
    onProjectSelected: () => void;
}

const IdeProject: React.FC<Props> = observer(({ projectName, isSelected, onProjectSelected }) => {
    return (
        <div key={projectName} className="ide-project" onClick={onProjectSelected}>
            {projectName}
            {isSelected && <span>loading...</span>}
        </div>
    );
});

export default IdeProject;
