import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Repository } from 'typeorm';
import { BookSlotInput, CancelBookedSlotInput, SlotsInput } from '../graphql';
import { UserSlotAbsence } from '../users-slots/users-slots-absences.entity';
import { UserSlot } from '../users-slots/users-slots.entity';
import { Slot } from './slots.entity';

interface SlotDAO {
  active: boolean;
  userAdminCreated: number;
  lastUserAdminUpdated: number;
  startDate: Date;
  duration: number;
  jobID: number;
  totalPlace: number;
}

interface UserSlotDAO {
  fullName: string;
  phoneNumber: string;
}

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot) private slotRepository: Repository<Slot>,
    @InjectRepository(UserSlot)
    private userSlotRepository: Repository<UserSlot>,
    @InjectRepository(UserSlotAbsence)
    private userSlotAbsenceRepository: Repository<UserSlotAbsence>,
  ) {}

  async find({ active, endDate, startDate, isFull }: SlotsInput) {
    const slots = await this.slotRepository.find({
      where: {
        ...(active != null ? { active } : {}),
        startDate: Between(startDate, endDate),
      },
      order: { startDate: 1 },
    });

    if (isFull == undefined) return slots;

    const userSlotsCount = await Promise.all(
      slots.map((slot) =>
        this.userSlotRepository.count({ isDeleted: false, slotID: slot.id }),
      ),
    );

    return isFull
      ? slots.filter((slot, i) => userSlotsCount[i] >= slot.totalPlace)
      : slots.filter((slot, i) => userSlotsCount[i] < slot.totalPlace);
  }

  async book({ userID, slotID, fullName, phoneNumber }: BookSlotInput) {
    const slot = await this.slotRepository.findOne(slotID);
    // TODO: FIX ME
    if (!slot) throw new Error();

    const userSlotEntity = this.userSlotRepository.create({
      done: false,
      userID: Number(userID),
      slotID: Number(slotID),
      fullName,
      phoneNumber,
      isDeleted: false,
    });
    await this.userSlotRepository.save(userSlotEntity);

    return slot;
  }

  async cancelBooked({
    userSlotID,
    absenceTypeID,
    description,
  }: CancelBookedSlotInput) {
    const userSlot = await this.userSlotRepository.findOne(userSlotID);
    // TODO: FIX ME
    if (!userSlot) throw new Error();

    const userSlotAbsence = await this.userSlotAbsenceRepository.save(
      this.userSlotAbsenceRepository.create({
        userID: userSlot.userID,
        absenceTypeID: Number(absenceTypeID),
        description,
      }),
    );

    await this.userSlotRepository.save({
      id: userSlot.id,
      userSlotAbsenceID: userSlotAbsence.id,
      isDeleted: true,
    });

    const slot = await this.slotRepository.findOne(userSlot.slotID);
    // TODO: FIX ME
    if (!slot) throw new Error();
    return slot;
  }

  save(slotDAO: SlotDAO) {
    const slotEntity = this.slotRepository.create(slotDAO);
    return this.slotRepository.save(slotEntity);
  }

  async remove(slotID: number) {
    const slot = await this.slotRepository.findOne(slotID);
    // TODO: FIX ME
    if (!slot) throw new Error();
    await this.slotRepository.remove(slot);

    return slot;
  }

  update(slotID: number, slotDAO: Partial<SlotDAO>) {
    const slotEntity = this.slotRepository.create({ id: slotID, ...slotDAO });
    return this.slotRepository.save(slotEntity);
  }

  async getAttendeesAndCount(
    slotID: number,
    pagination: { first?: number; after?: string },
  ): Promise<[UserSlot[], number]> {
    return Promise.all([
      this.userSlotRepository.find({
        where: {
          slotID,
          isDeleted: false,
          ...(pagination.after && { id: LessThan(pagination.after) }),
        },
        take: pagination.first || 10,
      }),
      this.userSlotRepository.count({ where: { slotID, isDeleted: false } }),
    ]);
  }

  // UserSlot
  updateUserSlot(id: number, userSlotDAO: Partial<UserSlotDAO>) {
    return this.userSlotRepository.save(
      this.userSlotRepository.create({
        id,
        ...userSlotDAO,
      }),
    );
  }
}
