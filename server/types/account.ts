export interface Account {
  account_id: number;
  name: string;
  description?: string;
  balance: number;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAccountDTO {
  name: string;
  description?: string;
  user_id: number;
}