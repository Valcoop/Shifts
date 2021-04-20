
/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export interface AddAbsenceTypeInput {
    reason: string;
}

export interface AbsenceTypesInput {
    first?: number;
    after?: string;
}

export interface JobsInput {
    first?: number;
    after?: string;
}

export interface AddJobInput {
    name: string;
    color: string;
}

export interface RemoveJobInput {
    jobID: string;
}

export interface SlotsInput {
    startDate: Date;
    endDate: Date;
    active?: boolean;
    isFull?: boolean;
}

export interface BookSlotInput {
    userID: string;
    slotID: string;
    fullName: string;
    phoneNumber: string;
}

export interface CancelBookedSlotInput {
    userID: string;
    slotID: string;
    absenceTypeID: string;
    description?: string;
}

export interface AddSlotInput {
    startDate: Date;
    duration: number;
    jobID: string;
    totalPlace: number;
    active: boolean;
}

export interface RemoveSlotInput {
    slotID: string;
}

export interface UpdateSlotInput {
    slotID: string;
    startDate?: Date;
    duration?: number;
    jobID?: string;
    totalPlace?: number;
    active?: boolean;
}

export interface SlotAttendeesInput {
    first?: number;
    after?: string;
}

export interface UserSlotsInput {
    first?: number;
    after?: string;
}

export interface IQuery {
    absenceTypes(input?: AbsenceTypesInput): AbsenceTypeConnection | Promise<AbsenceTypeConnection>;
    jobs(input?: JobsInput): JobConnection | Promise<JobConnection>;
    slots(input?: SlotsInput): Slot[] | Promise<Slot[]>;
    user(userID: string): User | Promise<User>;
}

export interface IMutation {
    addAbsenceType(input: AddAbsenceTypeInput): AddAbsenceTypePayload | Promise<AddAbsenceTypePayload>;
    addJob(input: AddJobInput): AddJobPayload | Promise<AddJobPayload>;
    removeJob(input: RemoveJobInput): RemoveJobPayload | Promise<RemoveJobPayload>;
    bookSlot(input: BookSlotInput): BookSlotPayload | Promise<BookSlotPayload>;
    cancelBookedSlot(input: CancelBookedSlotInput): CancelBookedSlotPayload | Promise<CancelBookedSlotPayload>;
    addSlot(input: AddSlotInput): AddSlotPayload | Promise<AddSlotPayload>;
    removeSlot(input: RemoveSlotInput): RemoveSlotPayload | Promise<RemoveSlotPayload>;
    updateSlot(input: UpdateSlotInput): UpdateSlotPayload | Promise<UpdateSlotPayload>;
}

export interface AddAbsenceTypePayload {
    absenceType: AbsenceType;
}

export interface AbsenceTypeConnection {
    edges?: AbsenceTypeEdge[];
    pageInfo?: PageInfo;
    totalCount: number;
}

export interface AbsenceTypeEdge {
    cursor: string;
    node: AbsenceType;
}

export interface AbsenceType {
    id: string;
    reason: string;
}

export interface AddJobPayload {
    job: Job;
}

export interface RemoveJobPayload {
    job: Job;
}

export interface JobConnection {
    edges?: JobEdge[];
    pageInfo?: PageInfo;
    totalCount: number;
}

export interface JobEdge {
    cursor: string;
    node: Job;
}

export interface Job {
    id: string;
    name: string;
    color: string;
}

export interface PageInfo {
    hasNextPage: boolean;
    endCursor?: string;
}

export interface BookSlotPayload {
    slot: Slot;
}

export interface CancelBookedSlotPayload {
    slot: Slot;
}

export interface AddSlotPayload {
    slot: Slot;
}

export interface RemoveSlotPayload {
    slot: Slot;
}

export interface UpdateSlotPayload {
    slot: Slot;
}

export interface SlotConnection {
    edges?: SlotEdge[];
    pageInfo?: PageInfo;
    totalCount: number;
}

export interface SlotEdge {
    cursor: string;
    node: Slot;
}

export interface Slot {
    id: string;
    startDate: Date;
    duration: number;
    job: Job;
    attendees: UserConnection;
    totalPlace: number;
    active: boolean;
}

export interface UserConnection {
    edges?: UserEdge[];
    pageInfo?: PageInfo;
    totalCount: number;
}

export interface UserEdge {
    cursor: string;
    node: User;
}

export interface User {
    id: string;
    firstname: string;
    lastname: string;
    phoneNumber: string;
    slots: SlotConnection;
}
