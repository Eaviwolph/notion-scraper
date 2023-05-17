import { Learning } from "./learnings"

export interface Course {
    id: string
    name: string
    learnings: Learning[]
}
