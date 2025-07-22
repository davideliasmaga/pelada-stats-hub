export interface AccountRequest {
  id: string;
  name: string;
  email: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'denied';
  approved_by?: string;
  approved_at?: string;
  role: 'admin' | 'mensalista' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface CreateAccountRequest {
  name: string;
  email: string;
  role?: 'admin' | 'mensalista' | 'viewer';
}