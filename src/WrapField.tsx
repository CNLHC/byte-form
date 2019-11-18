import { useContext, useEffect, useMemo } from 'react';
import { IByteFormCtx, action } from './models';
import { composePipeline, pipeInit, pipeSendBack } from './stage';
import React from 'react';
import { Tooltip, Icon, Form } from 'antd';
import { AllFieldMetaUnion } from './@types/schema';
import { IExtraField } from './@types/extraField';
import GetSwitchField from './SwitchField';

const GetWrapField = (FormCtx: React.Context<IByteFormCtx>) => (props: {
    fm: AllFieldMetaUnion;
}) => {
    const SwitchField = useMemo(() => GetSwitchField(FormCtx), []);
    const { dispatch, state } = useContext(FormCtx);
    const fstate = () => state.fieldStore[fm.key];
    const { fm } = props;
    if (fstate() === undefined)
        if (fm.disable)
            // useEffect(() => {
            //     dispatch(
            //         action.pipeline(
            //             composePipeline(
            //                 pipeInit(fm),
            //                 // pipeSendBack((e: any) => !!cb && cb(e)),
            //             ),
            //             `field meta change: ${fm.key}`,
            //         ),
            //     );
            // }, []);

            return null;

    const { required, validate, helpinfo, helptext } = fstate();
    const label = helptext ? (
        <Tooltip title={helptext}>
            <span>{fm.label}</span>
            <Icon type="question-circle-o" />
        </Tooltip>
    ) : (
        <span>{fm.label}</span>
    );

    return (
        <Form.Item
            label={label}
            key={fm.key}
            help={helpinfo}
            validateStatus={
                validate === undefined
                    ? 'success'
                    : validate
                    ? 'success'
                    : 'error'
            }
            required={required}
        >
            <SwitchField fm={fm} />
        </Form.Item>
    );
};

export default GetWrapField;
