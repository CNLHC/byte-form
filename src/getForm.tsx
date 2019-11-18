import { IExtraField } from './@types/extraField';
import { IConnectorProps, GetConnector } from './connector';
import React, { useMemo } from 'react';
import { IByteFormCtx } from './models';
import { TFormAction, getFormAction } from './formAction';

interface IGetFormOpt {
    extraField?: IExtraField;
}

const getFormHOC: (
    opt: IGetFormOpt,
    id: string,
) => () => [TFormAction, (props: IConnectorProps) => JSX.Element] = (
    opt,
    id,
) => () => {
    let extraField = { ...opt.extraField };

    const ByteFormCtx = React.createContext<IByteFormCtx>({} as IByteFormCtx);
    const Connector = GetConnector(ByteFormCtx);

    return [
        getFormAction(id),
        props => (
            <Connector
                {...props}
                callback={e => props.callback && props.callback(e)}
                ef={extraField}
                _id={id}
            />
        ),
    ];
};

const useForm = (opt: IGetFormOpt) => {
    const id = useMemo(
        () =>
            Math.random()
                .toString(36)
                .substr(2, 10),
        [],
    );
    const gF = useMemo(() => getFormHOC(opt, id), []);
    return gF();
};

export default useForm;
