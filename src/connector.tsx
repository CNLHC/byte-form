import React, { useEffect, useReducer, useContext, useState } from 'react';
import { reducer, initState, TByteFormReducer, IByteFormCtx } from './models';
import { Form, Button } from 'antd';
import { action } from './models';
import { pipeRefreshMetaCache, pipeBindToExternal } from './stage';
import { ColProps } from 'antd/lib/col';
import { FieldMetaList, IControlSchema } from './@types/schema';
import { IExtraField } from './@types/extraField';
import GetWrapField from './WrapField';

export interface IConnectorProps {
    formMeta: FieldMetaList;
    value?: { [key: string]: any };
    controlSchema?: IControlSchema;
    labelAlign?: 'left' | 'right';
    wrapperCol?: ColProps;
    labelCol?: ColProps;
    callback?: (e: any) => void;
}

interface innerProps {
    ef?: IExtraField;
}
const GetGeneratedForm = (FormCtx: React.Context<IByteFormCtx>) => (
    props: IConnectorProps & innerProps,
) => {
    const WrappedField = GetWrapField(FormCtx);
    const { state } = useContext(FormCtx);
    const metaSource = state.metaSource;
    const { callback, ef } = props;

    const items = Object.keys(metaSource).map(e => {
        return (
            <WrappedField fm={metaSource[e]} cb={callback} key={e} ef={ef} />
        );
    });

    return (
        <Form
            wrapperCol={props.wrapperCol}
            labelCol={props.labelCol}
            labelAlign={props.labelAlign}
        >
            {items}
        </Form>
    );
};

// export const GetConnector = (FormCtx: React.Context<IByteFormCtx>) => (props: IConnectorProps & innerProps) => {
//     const { controlSchema, value } = props;
//     const [state, dispatch] = useReducer<TByteFormReducer>(reducer, initState);

//     //I hope one day typescript can support rust-style local immutable variable shadow!
//     const tControlSchema = !!controlSchema ? controlSchema : [];

//     useEffect(() => {
//         dispatch(
//             action.setState({
//                 metaSource: props.formMeta
//                     .map(e => ({ [e.key]: e }))
//                     .reduce((acc, cur) => Object.assign(acc, { ...cur }), {}),
//             }),
//         );
//         return;
//     }, []);

//     useEffect(() => {
//         dispatch(action.pipeline(pipeRefreshMetaCache(props.formMeta), 'refresh meta cache'));
//         return;
//     }, [props.formMeta]);

//     useEffect(() => {
//         dispatch(
//             action.setState({
//                 controlSchemaCache: tControlSchema,
//             }),
//         );
//         return;
//     }, [tControlSchema]);

//     useEffect(() => {
//         dispatch(action.pipeline(pipeBindToExternal(props.formMeta, value), 'bind To external'));
//     }, [value]);

//     const GenedForm = GetGeneratedForm(FormCtx);

//     return (
//         <FormCtx.Provider value={{ state, dispatch }}>
//             <GenedForm {...props} />
//         </FormCtx.Provider>
//     );
// };

export const GetConnector = (FormCtx: React.Context<IByteFormCtx>) => (
    props: IConnectorProps & innerProps,
) => {
    const [a, b] = useState(1);

    return <Button>hhh{a}</Button>;
};
