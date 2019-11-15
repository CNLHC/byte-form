interface MetaFieldBase {
    style?: React.CSSProperties;
}

export interface IMetaFieldDatetime extends MetaFieldBase {
    typename: 'datetime';
    value: string;
    preset?: string;
}
export interface IMetaFieldSelect extends MetaFieldBase {
    typename: 'select';
    value: string;
    preset?: Array<{
        key: string;
        verbose: string | JSX.Element;
    }>;
}
export interface IMetaFieldInput extends MetaFieldBase {
    typename: 'input';
    value: string;
    preset?: string;
}
export interface IMetaFieldNumber extends MetaFieldBase {
    typename: 'number';
    value: number;
    preset?: number;
}

export type GenricFieldBase = IMetaFieldDatetime | IMetaFieldNumber | IMetaFieldSelect | IMetaFieldInput;
