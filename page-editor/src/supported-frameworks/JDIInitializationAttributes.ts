export class InitializationAttributes {
    static Css = 'Css';
    static XPath = 'XPath';
    static ByText = 'ByText';
    static WithText = 'WithText';
    static UI = 'UI';
    static FindBy = 'FindBy';
    static FindBys = 'FindBys';

    static Generic = [
        InitializationAttributes.Css,
        InitializationAttributes.XPath,
        InitializationAttributes.ByText,
        InitializationAttributes.WithText,
        InitializationAttributes.UI,
        InitializationAttributes.FindBy,
        InitializationAttributes.FindBys,
    ];

    static JTable = 'JTable';
    static JDropdown = 'JTable';
    static JMenu = 'JTable';

    static Specific = [
        InitializationAttributes.JTable,
        InitializationAttributes.JDropdown,
        InitializationAttributes.JMenu,
    ];
}

export class OptionalAttributes {}
