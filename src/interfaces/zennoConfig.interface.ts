export interface ZennoConfig {
    mobile: DifficultyLevelItem;
}

export interface DifficultyLevelItem {
    easy: EasyItem[];
    heavy: HeavyItem[];
}

export interface EasyItem {
    todo: string;
    name: string;
    active: boolean;
}

export interface HeavyItem extends EasyItem {
    courses: Course[];
}

export interface Course {
    id: number;
    name: string;
    count: number;
    active: boolean;
}


export interface ConcatZennoConfig extends EasyItem, HeavyItem {}
