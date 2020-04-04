import { testdata } from './data/testdata/testdata1';
// import PageType from './models/PageType';
import ComponentType from './models/ComponentType';
import Attribute, { Parameter } from './models/Attribute';
import ComponentInstance from './models/ComponentInstance';

test('attribute parameters contain correct values', () => {
    const pageObject = JSON.parse(testdata);

    // let pages: PageType[] = pageObject["pages"] as PageType[];
    const components: ComponentType[] = pageObject['components'] as ComponentType[];

    const component: ComponentType = components.filter((c) => c.id === 'PsiClass:AttributesTest')[0];
    const componentInstance: ComponentInstance = component.componentsInstances.filter(
        (c) => c.id === 'PsiClass:AttributesTest.PsiField:jTable',
    )[0];
    if (componentInstance.initializationAttribute instanceof Attribute) {
        const initializationAttribute: Attribute = componentInstance.initializationAttribute;
        const parameter: Parameter = initializationAttribute.parameters.filter((p) => p.name === 'header')[0];

        expect(parameter.values).not.toBeNull();
        expect(Array.isArray(parameter.values)).toBe(true);

        const array = parameter.values as Array<any>;
        expect(array.length).toBeGreaterThan(0);
        expect(typeof array[0]).toBe('string');
        expect(array[0]).toBe('header1');
    }
});
