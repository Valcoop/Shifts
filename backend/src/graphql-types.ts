import { AbsenceType } from './absence-types/absence-types.entity';
import {
  AbsenceTypeConnection as GraphQLAbsenceTypeConnection,
  UserConnection as GraphQLUserConnection,
  SlotConnection as GraphQLSlotConnection,
} from './graphql';
import { Slot } from './slots/slots.entity';
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

export interface SlotEdge {
  cursor: string;
  node: Slot;
}

export interface SlotConnection extends Omit<GraphQLSlotConnection, 'edges'> {
  edges?: SlotEdge[];
}
