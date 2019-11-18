import { action, getState, getDispatch } from './models';
import { pipeForceValidate, pipeCleanValue, pipeSetValue } from './stage';

export const getFormAction = (id: string) => {
    const getValue = () =>
        Object.entries(getState(id).fieldStore).reduce(
            (acc, [k, v]) => ({ ...acc, [k]: v.value }),
            {},
        );

    const getValidate = () =>
        Object.entries(getState(id).fieldStore).reduce(
            (acc, [k, v]) => ({ ...acc, [k]: v.validate }),
            {},
        );

    const check = () =>
        Object.entries(getState(id).fieldStore).reduce(
            (acc, cur) => acc && cur[1].validate,
            true,
        );

    const forceValidate = () =>
        getDispatch(id)(action.pipeline(pipeForceValidate(), 'force Update'));

    const setValue = (value: { [key: string]: any }) =>
        getDispatch(id)(action.pipeline(pipeSetValue(value)));

    const cleanValue = () => getDispatch(id)(action.pipeline(pipeCleanValue()));

    return {
        getValue,
        getValidate,
        check,
        forceValidate,
        setValue,
        cleanValue,
    };
};
export type TFormAction = ReturnType<typeof getFormAction>;
