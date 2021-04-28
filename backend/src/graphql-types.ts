import { AbsenceType } from './absence-types/absence-types.entity';
import {
  AbsenceTypeConnection as GraphQLAbsenceTypeConnection,
  JobConnection as GraphQLJobConnection,
  SlotConnection as GraphQLSlotConnection,
  UserConnection as GraphQLUserConnection,
  AttendeeConnection as GraphQLAttendeeConnection,
} from './graphql';
import { Job } from './jobs/jobs.entity';
import { Slot } from './slots/slots.entity';
import { UserSlot } from './users-slots/users-slots.entity';
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

export interface SlotEdge {
  cursor: string;
  node: Slot;
}

export interface SlotConnection extends Omit<GraphQLSlotConnection, 'edges'> {
  edges?: SlotEdge[];
}

export interface AttendeeEdge {
  cursor: string;
  node: UserSlot;
}

export interface AttendeeConnection
  extends Omit<GraphQLAttendeeConnection, 'edges'> {
  edges?: AttendeeEdge[];
}
