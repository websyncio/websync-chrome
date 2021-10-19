export function getNamespace(fullTypeName: string): string {
    return fullTypeName.substring(0, fullTypeName.lastIndexOf('.'));
}

export function getFullTypeName(typeName: string, namespace: string): string {
    return typeName + '.' + namespace;
}
