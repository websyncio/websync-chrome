import { types, Instance, cast } from 'mobx-state-tree';

export const IdeConnectionModel = types
    .model({
        type: types.string,
        name: types.optional(types.string, ''),
        description: types.optional(types.string, ''),
        projectsList: types.array(types.string),
    })
    .actions((self) => ({
        setProjectList(projectsList: string[]) {
            self.projectsList = cast(projectsList);
        },
        addProject(projectName: string) {
            if (!self.projectsList.includes(projectName)) {
                self.projectsList.push(projectName);
            }
        },
        removeProject(projectName: string) {
            self.projectsList.remove(projectName);
        },
    }));

export default interface IdeConnection extends Instance<typeof IdeConnectionModel> {}
