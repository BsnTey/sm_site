export interface CourseList {
    list: CourseSM[];
    pagination: Pagination;
}

export interface Pagination {
    limit: number;
    offset: number;
    total: number;
}

export interface CourseSM {
    id: number;
    title: string;
    image: string;
    tag: string;
    duration: number;
    points: number;
    stats: Stats;
    status: string;
}

export interface Stats {
    countLessons: number;
    countLessonsLearned: number;
}
