import React, { useEffect, useReducer, useContext, useMemo } from 'react';
import {
    reducer,
    initState,
    TByteFormReducer,
    IByteFormCtx,
    registerState,
} from './models';
import { Form } from 'antd';
import { action } from './models';
import { pipeRefreshMetaCache, pipeInitAll, composePipeline } from './stage';
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
    _id: string;
}

interface innerProps {
    ef?: IExtraField;
}
const GetGeneratedForm = (FormCtx: React.Context<IByteFormCtx>) => (
    props: IConnectorProps & innerProps,
) => {
    const WrappedField = useMemo(() => GetWrapField(FormCtx), []);
    const { state } = useContext(FormCtx);
    const metaSource = state.metaSource;

    const items = Object.keys(metaSource).map(e => {
        return <WrappedField fm={metaSource[e]} />;
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

export const GetConnector = (FormCtx: React.Context<IByteFormCtx>) => (
    props: IConnectorProps & innerProps,
) => {
    const [state, dispatch] = useReducer<TByteFormReducer>(reducer, initState);
    registerState(props._id, () => [state, dispatch]);

    //I hope one day typescript can support rust-style local immutable variable shadow!
    // const tControlSchema = !!controlSchema ? controlSchema : [];

    useEffect(() => {
        dispatch(
            action.setState({
                metaSource: props.formMeta
                    .map(e => ({ [e.key]: e }))
                    .reduce((acc, cur) => Object.assign(acc, { ...cur }), {}),
            }),
        );
        return;
    }, []);

    useEffect(() => {
        dispatch(
            action.pipeline(
                composePipeline(
                    pipeInitAll(props.formMeta),
                    pipeRefreshMetaCache(props.formMeta),
                ),
                'refresh meta cache',
            ),
        );
        return;
    }, [props.formMeta]);

    // useEffect(() => {
    //     dispatch(
    //         action.setState({
    //             controlSchemaCache: tControlSchema,
    //         }),
    //     );
    //     return;
    // }, [tControlSchema]);

    const GenedForm = useMemo(() => GetGeneratedForm(FormCtx), []);

    return (
        <FormCtx.Provider value={{ state, dispatch }}>
            <GenedForm {...props} />
        </FormCtx.Provider>
    );
};
