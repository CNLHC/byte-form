import { forwardRef, useContext, useEffect } from 'react';
import { IByteFormCtx, action } from './models';
import { composePipeline, pipeInit, pipeSendBack } from './stage';
import React from 'react';
import { Tooltip, Icon, Form } from 'antd';
import { AllFieldMetaUnion } from './@types/schema';
import { IExtraField } from './@types/extraField';
import GetSwitchField from './SwitchField';

const GetWrapField = (FormCtx: React.Context<IByteFormCtx>) =>
    forwardRef(
        (props: {
            fm: AllFieldMetaUnion;
            cb?: (e: any) => void;
            ef?: IExtraField;
            vff?: boolean;
        }) => {
            const SwitchField = GetSwitchField(FormCtx);
            const { fm, cb, ef, vff } = props;
            const { dispatch, state } = useContext(FormCtx);
            const fState = state.fieldStore[fm.key];
            useEffect(() => {
                dispatch(
                    action.pipeline(
                        composePipeline(
                            pipeInit(fm),
                            pipeSendBack((e: any) => !!cb && cb(e)),
                        ),
                        `field meta change: ${fm.key}`,
                    ),
                );
            }, [fm]);

            if (fm.disable) return null;

            if (!!fState) {
                const { required, validate, helpinfo, helptext } = fState;
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
                        <SwitchField fs={fState} cb={cb} ef={ef} vff={vff} />
                    </Form.Item>
                );
            } else return null;
        },
    );

export default GetWrapField;
