import { produce } from 'immer';
// import { composeWithDevTools } from "redux-devtools-extension";
// import logger from "redux-logger";
import React, { Dispatch, Reducer } from 'react';
import {
    IByteFormState,
    TFieldStore,
    MetaCache,
    MetaSource,
} from './@types/state';
import { PiplineStages } from './@types/stage';

export type TByteFormActionType =
    | ReturnType<typeof action.setState>
    | ReturnType<typeof action.pipeline>;

export type TByteFormReducer = Reducer<IByteFormState, TByteFormActionType>;

export interface IByteFormCtx {
    state: IByteFormState;
    dispatch: Dispatch<TByteFormActionType>;
}

export const initState: IByteFormState = {
    fieldStore: {} as TFieldStore,
    metaSource: {} as MetaSource,
    metaCache: {} as MetaCache,
    controlSchemaCache: [],
    bindToExternal: false,
};

export const reducer: Reducer<IByteFormState, TByteFormActionType> = (
    state,
    action,
) =>
    produce(state, draft => {
        switch (action.type) {
            case 'setState':
                draft = {
                    ...draft,
                    fieldStore: {
                        ...draft.fieldStore,
                        ...action.ps.fieldStore,
                    },
                    metaSource: {
                        ...draft.metaSource,
                        ...action.ps.metaSource,
                    },
                    metaCache: {
                        ...draft.metaCache,
                        ...action.ps.metaCache,
                    },
                    controlSchemaCache: [
                        ...(!!action.ps.controlSchemaCache
                            ? action.ps.controlSchemaCache
                            : []),
                    ],
                };
                break;
            case 'pipeline':
                draft = action.pip(draft);
                break;
            default:
                return;
        }
        return draft;
    }) as IByteFormState;

export const action = {
    setState: (ps: Partial<IByteFormState>) => ({
        type: 'setState' as 'setState',
        ps,
    }),
    pipeline: (pip: PiplineStages, pipName?: string) => ({
        type: 'pipeline' as 'pipeline',
        pip,
        pipName,
    }),
};

type TStateDual = [IByteFormState, Dispatch<TByteFormActionType>];

export let _globalState: Map<string, () => TStateDual> = new Map();

export const registerState = (id: string, getter: () => TStateDual) =>
    _globalState.set(id, getter);

export const getState = (id: string) => {
    const method = _globalState.get(id);
    if (method) return method()[0];
    else return initState;
};

export const getDispatch = (id: string) => {
    const method = _globalState.get(id);
    if (method) return method()[1];
    else return (value: TByteFormActionType) => {};
};
