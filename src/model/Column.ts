export enum ColumnSize {FULL, HALF}

export interface ColumnOptions {
    size?: ColumnSize;
}

export interface ColumnEffectConfig {
    id: string;
    config: any;
}

export interface Column {

    id: string;
    name: string;
    wipLimit: number;

    options?: ColumnOptions;
    effects?: ColumnEffectConfig[];

}
