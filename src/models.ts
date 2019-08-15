import { createStore, Reducer, applyMiddleware, Store } from 'redux'
import { produce } from 'immer'
import { composeWithDevTools } from 'redux-devtools-extension';
import logger from 'redux-logger'
import { IByteFormState, TFieldStore, MetaCache, MetaSource } from './@types/state';
import { PiplineStages } from './@types/stage';
import { AllFieldMetaUnion } from './@types/schema';


const initState: IByteFormState = {
    fieldStore: {} as TFieldStore,
    metaSource: {} as MetaSource,
    metaCache: {} as MetaCache,
    controlSchemaCache: [],
    bindToExternal:false
}

const reducer: Reducer<IByteFormState, ByteFormActionType> =
    (state, action) => produce<IByteFormState | undefined, IByteFormState>(state, (draft) => {
        if (!!draft)
            switch (action.type) {
                case "setState":
                    draft = {
                        ...draft,
                        fieldStore: { ...draft.fieldStore, ...action.ps.fieldStore },
                        metaSource:{...draft.metaSource,...action.ps.metaSource},
                        metaCache: { ...draft.metaCache, ...action.ps.metaCache },
                        controlSchemaCache: [ ...(!!action.ps.controlSchemaCache ? action.ps.controlSchemaCache : [])]
                    }
                    break
                case "pipeline":
                    draft = action.pip(draft)
                    break
                default:
                    return
            }
        return draft
    }) as IByteFormState

export const action = {
    setState: (ps: Partial<IByteFormState>) => ({ type: "setState" as "setState", ps }),
    pipeline: (pip: PiplineStages,pipName?:string) => ({ type: "pipeline" as "pipeline", pip ,pipName})
}


type ByteFormActionType = ReturnType<typeof action.setState> | ReturnType<typeof action.pipeline>



const GetStore: () => Store<IByteFormState, ByteFormActionType> = () => createStore<IByteFormState, ByteFormActionType, any, any>(reducer, initState,
    process.env.NODE_ENV === 'production' ? undefined : composeWithDevTools(applyMiddleware(logger)))
    // process.env.NODE_ENV === 'production' ? undefined : undefined)





export { GetStore }