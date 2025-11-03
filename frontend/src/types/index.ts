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
  role: 'student' | 'teacher' | 'admin' | 'default' | 'organisation';
  retailerDetails?: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
    pincode?: string;
    state?: string;
    city?: string;
    status: 'active' | 'inactive' | 'pending';
  };
  distributorDetails?: {
    _id: string;
    name: string;
    address: string;
    latitude: string;
    longitude: string;
    contactNumber: string;
    email: string;
    pincode: string;
    state: string;
    city: string;
    gstNumber: string;
    status: 'active' | 'inactive' | 'pending';
  };
  firstName: string;
  lastName: string;
  avatar?: string;
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
