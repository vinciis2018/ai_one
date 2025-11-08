// Shared types across the application

export interface UserLoginFormData {
  username?: string;
  password: string;
  email?: string;
}

export interface UserRegistrationFormData {
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  avatar?: string,
  password?: string,
  confirmPassword?: string,
  role: string,
}

export interface User {
  _id?: string;
  username: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin' | 'default' | 'organisation';
  firstName: string;
  lastName: string;
  avatar?: string;
  student_id?: string;
  teacher_id?: string;
}


export type JobStatus = 'stuck' | 'waiting' | 'active' | 'completed' | 'failed' | 'error' | 'not_found' | 'no_job' ;

export interface WebsocketStatusUpdate {
  jobId: string;
  status: JobStatus;
  progress: number;
  result?: {
    audit_report: Array<{ data: number[] } | Buffer>;
  },
  error?: string;
  stack?: unknown;
  state?: string;
}
