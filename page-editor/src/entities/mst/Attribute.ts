import { types, Instance } from 'mobx-state-tree';
import XcssSelector from 'entities/XcssSelector';

export const AttributeModel = types
    .model({
        // name: types.string,
        constructorArguments: types.array(types.string),
        namedArguments: types.map(types.union(types.string, types.number, types.boolean, types.null)),
        // parameters: types.array(ParameterModel),
    })
    .views((self) => ({
        // get shortName() {
        //     const lastDotIndex = self.name.lastIndexOf('.');
        //     return self.name.substring(lastDotIndex + 1);
        // },
        get rootSelectorXcss(): XcssSelector | null {
            const rootSelector = self.constructorArguments.length == 0 ? null : self.constructorArguments[0];
            return rootSelector ? new XcssSelector(rootSelector, null, null) : null;
        },
    }))
    .actions((self) => ({
        updateParameterValue(name, parameterValueIndex, parameterValue) {
            throw new Error('Not implemented');
            // const parameter = self.parameters.find((p) => p.name == name);
            // if (!parameter) {
            //     throw new Error(`No parameter with name '${name}' in initialization attribute.`);
            // }
            // parameter.updateValue(parameterValueIndex, parameterValue);
        },
    }));

export default interface Attribute extends Instance<typeof AttributeModel> {}
