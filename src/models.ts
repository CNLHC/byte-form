import { produce } from "immer";
// import { composeWithDevTools } from "redux-devtools-extension";
// import logger from "redux-logger";
import React, { Dispatch, Reducer } from "react";
import {
  IByteFormState,
  TFieldStore,
  MetaCache,
  MetaSource
} from "./@types/state";
import { PiplineStages } from "./@types/stage";

export type TByteFormActionType =
  | ReturnType<typeof action.setState>
  | ReturnType<typeof action.pipeline>;

export type TByteFormReducer = Reducer<IByteFormState, TByteFormActionType>;

interface IByteFormCtx {
  state: IByteFormState;
  dispatch: Dispatch<TByteFormActionType>;
}

export const initState: IByteFormState = {
  fieldStore: {} as TFieldStore,
  metaSource: {} as MetaSource,
  metaCache: {} as MetaCache,
  controlSchemaCache: [],
  bindToExternal: false
};

export const reducer: Reducer<IByteFormState, TByteFormActionType> = (
  state,
  action
) =>
  produce(state, draft => {
    if (!!draft)
      switch (action.type) {
        case "setState":
          draft = {
            ...draft,
            fieldStore: { ...draft.fieldStore, ...action.ps.fieldStore },
            metaSource: { ...draft.metaSource, ...action.ps.metaSource },
            metaCache: { ...draft.metaCache, ...action.ps.metaCache },
            controlSchemaCache: [
              ...(!!action.ps.controlSchemaCache
                ? action.ps.controlSchemaCache
                : [])
            ]
          };
          break;
        case "pipeline":
          draft = action.pip(draft);
          break;
        default:
          return;
      }
    return draft;
  }) as IByteFormState;

export const action = {
  setState: (ps: Partial<IByteFormState>) => ({
    type: "setState" as "setState",
    ps
  }),
  pipeline: (pip: PiplineStages, pipName?: string) => ({
    type: "pipeline" as "pipeline",
    pip,
    pipName
  })
};

export const ByteFormCtx = React.createContext<IByteFormCtx>(
  {} as IByteFormCtx
);
