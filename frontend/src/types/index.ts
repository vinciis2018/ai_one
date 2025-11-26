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
  subjects?: string[];
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


// notes update
export interface SelectionBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type BlockType = 'text' | 'drawing';

export interface BlockSettings {
  width?: number; // 25, 50, 75, 100 (percentage)
  align?: 'flex-start' | 'center' | 'flex-end';
}

export interface ContentBlock {
  id: string;
  type: BlockType;
  content?: string; // Markdown text for text blocks; Caption/Explanation for drawing blocks
  box_2d?: number[]; // [ymin, xmin, ymax, xmax] for drawings
  imageUrl?: string; // Cropped base64 image for drawings
  settings?: BlockSettings;
}