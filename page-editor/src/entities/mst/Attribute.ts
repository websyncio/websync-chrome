import { types, Instance } from 'mobx-state-tree';
import { ParameterModel } from './Parameter';

export const AttributeModel = types
    .model({
        name: types.string,
        parameters: types.array(ParameterModel),
    })
    .views((self) => ({
        get shortName() {
            const lastDotIndex = self.name.lastIndexOf('.');
            return self.name.substring(lastDotIndex + 1);
        },
    }))
    .actions((self) => ({
        updateParameterValue(name, parameterValueIndex, parameterValue) {
            const parameter = self.parameters.find((p) => p.name == name);
            if (!parameter) {
                throw new Error(`No parameter with name '${name}' in attribute '${self.name}'.`);
            }
            parameter.updateValue(parameterValueIndex, parameterValue);
        },
    }));

export default interface Attribute extends Instance<typeof AttributeModel> {}
