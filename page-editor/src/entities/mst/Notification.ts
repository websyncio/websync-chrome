import { types, Instance } from 'mobx-state-tree';

export const NotificationModel = types.model({
    isError: types.boolean,
    title: types.maybeNull(types.string),
    message: types.string,
});

export default interface ComponentType extends Instance<typeof NotificationModel> {}
