import { GetStore, action } from "./models";
import { IExtraField } from "./@types/extraField";
import { IConnectorProps, Connector } from "./genForm";
import { pipeForceValidate, pipeSetValue, pipeCleanValue } from "./stage";
import React from "react";

interface IGetFormOpt {
    extraField?: IExtraField,
}

export interface FormAction {
    setValue: (value: { [key: string]: any }) => void
    getValue: () => { [key: string]: any },
    getValidate: () => { [key: string]: boolean }
    forceValidate: () => void
    check: () => boolean
    cleanValue: () => void
}

function getForm(opt: IGetFormOpt): [FormAction, (props: IConnectorProps) => JSX.Element] {

    let extraField = { ...opt.extraField }

    const store = GetStore()

    const getValue = () =>
        Object.entries(store.getState().fieldStore)
            .reduce((acc, [k, v]) => ({ ...acc, [k]: v.value }), {})

    const getValidate = () =>
        Object.entries(store.getState().fieldStore)
            .reduce((acc, [k, v]) => ({ ...acc, [k]: v.validate }), {})

    const check = () =>
        Object.entries(store.getState().fieldStore)
            .reduce((acc, cur) => acc && cur[1].validate, true)

    const forceValidate = () =>
        store.dispatch(action.pipeline(pipeForceValidate(), "force Update"))

    const setValue = (value: { [key: string]: any }) =>
        store.dispatch(action.pipeline(pipeSetValue(value)))

    const cleanValue = () =>
        store.dispatch(action.pipeline(pipeCleanValue()))


    return [
        {
            getValue,
            forceValidate,
            getValidate,
            setValue,
            cleanValue,
            check,
        },
        (props) => <Connector {...props}
            callback={(e) => props.callback && props.callback(e)}
            ef={extraField}
            store={store}
        />
    ]
}
export default getForm