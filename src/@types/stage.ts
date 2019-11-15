import { IByteFormState } from "./state";

export type PiplineStage = (e: IByteFormState) => IByteFormState;
export type PiplineStages = (e: IByteFormState) => IByteFormState;
