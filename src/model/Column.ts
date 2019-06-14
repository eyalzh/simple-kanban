export enum ColumnSize {FULL, HALF}

export interface ColumnOptions {
    size?: ColumnSize;
    steamRelease?: boolean;
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
