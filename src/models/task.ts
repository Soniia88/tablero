export type TaskStatus = "TODO" | "DOING" | "DONE";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  color: string;
}
