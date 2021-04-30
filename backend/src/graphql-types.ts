import { AbsenceType } from './absence-types/absence-types.entity';
import {
  AbsenceTypeConnection as GraphQLAbsenceTypeConnection,
  JobConnection as GraphQLJobConnection,
  UserConnection as GraphQLUserConnection,
  UserSlotConnection as GraphQLUserSlotConnection,
} from './graphql';
import { Job } from './jobs/jobs.entity';
import { UserSlot } from './user-slots/user-slots.entity';
import { User } from './users/users.entity';

export interface UserEdge {
  cursor: string;
  node: User;
}

export interface UserConnection extends Omit<GraphQLUserConnection, 'edges'> {
  edges?: UserEdge[];
}

export interface AbsenceTypeEdge {
  cursor: string;
  node: AbsenceType;
}

export interface AbsenceTypeConnection
  extends Omit<GraphQLAbsenceTypeConnection, 'edges'> {
  edges?: AbsenceTypeEdge[];
}

export interface JobEdge {
  cursor: string;
  node: Job;
}

export interface JobConnection extends Omit<GraphQLJobConnection, 'edges'> {
  edges?: JobEdge[];
}

export interface UserSlotEdge {
  cursor: string;
  node: UserSlot;
}

export interface UserSlotConnection
  extends Omit<GraphQLUserSlotConnection, 'edges'> {
  edges?: UserSlotEdge[];
}
