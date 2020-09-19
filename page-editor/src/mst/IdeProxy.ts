import { types, Instance, cast } from 'mobx-state-tree';

export const IdeProxyModel = types
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
    }));

export default interface IdeProxy extends Instance<typeof IdeProxyModel> {}
