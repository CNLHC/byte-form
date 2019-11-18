import { useEffect, useContext } from 'react';
import { ByteFormFieldState } from './@types/state';
import { IExtraField } from './@types/extraField';
import { IByteFormCtx, action } from './models';
import {
    composePipeline,
    pipeBindValue,
    pipeSendBack,
    pipeValidators,
    pipeMutation,
} from './stage';
import React from 'react';
import { Input, InputNumber, Select, DatePicker } from 'antd';
import { IMetaFieldSelect } from './@types/fields';
import { AllFieldMetaUnion } from './@types/schema';

const GetSwitchField = (FormCtx: React.Context<IByteFormCtx>) => (props: {
    fm: AllFieldMetaUnion;
}) => {
    const { dispatch, state } = useContext(FormCtx);
    const { fm } = props;
    const ffstate = () => state.fieldStore[fm.key];
    const fs = ffstate();
    if (fs === undefined) return null;
    const { type, preset } = fs;

    const handleChange = (e: ByteFormFieldState['value']) => {
        dispatch(
            action.pipeline(
                pipeBindValue(fs, e),
                // composePipeline(
                //     pipeValidators(fs),
                //     // pipeSendBack((e: any) => !!cb && cb(e)),
                //     pipeMutation(fs),
                // ),
                `handle change of ${fs.key}`,
            ),
        );
    };

    switch (type) {
        case 'datetime':
            return (
                <DatePicker
                    onChange={e => e && handleChange(e.unix())}
                    placeholder={fs.placeholder}
                    style={fs.style}
                    showTime
                />
            );
        case 'input':
            return (
                <Input
                    onChange={e => {
                        handleChange(e.target.value);
                    }}
                    value={fs.value}
                    style={fs.style}
                    placeholder={fs.placeholder}
                />
            );
        case 'number':
            return (
                <InputNumber
                    onChange={e => handleChange(e as number)}
                    value={fs.value as number}
                    style={fs.style}
                    placeholder={fs.placeholder}
                />
            );
        case 'select':
            return (
                <Select
                    onChange={(e: any) => handleChange(e as string)}
                    value={fs.value}
                    style={fs.style}
                    placeholder={fs.placeholder}
                    {...props}
                >
                    {!!(preset as IMetaFieldSelect['preset'])
                        ? (preset as Required<IMetaFieldSelect>['preset']).map(
                              e => (
                                  <Select.Option key={e.key} value={e.key}>
                                      {e.verbose}
                                  </Select.Option>
                              ),
                          )
                        : null}
                </Select>
            );
        default:
            // if (ef && ef[type]) {
            //     const Component = ef[type];
            //     return (
            //         <Component
            //             onChange={(e: any) => handleChange(e)}
            //             value={fs.value}
            //         />
            //     );
            // }
            return null;
    }
};

export default GetSwitchField;
