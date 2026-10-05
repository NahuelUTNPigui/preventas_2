import { Role } from './role';

export class User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;

  avatar: string;
  role: Role;
  token?: string;
  record?: {
    username: string, name: string, nombre?: string;
    apellido?: string; avatar?: string; id?: string;
  };
  admin?: { email: string };

}
