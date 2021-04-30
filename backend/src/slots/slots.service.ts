import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { BookSlotInput, CancelBookedSlotInput, SlotsInput } from '../graphql';
import { UserSlotAbsence } from '../user-slots/user-slots-absences.entity';
import { UserSlot } from '../user-slots/user-slots.entity';
import { User } from '../users/users.entity';
import { Slot } from './slots.entity';

interface SlotDAO {
  active: boolean;
  userAdminCreated: number;
  lastUserAdminUpdated: number;
  startDate: Date;
  duration: number;
  jobID: number;
  totalPlace: number;
  isDeleted: boolean;
}

interface UserSlotDAO {
  fullName: string;
  phoneNumber: string;
  startDate: Date;
}

@Injectable()
export class SlotsService {
  constructor(
    @InjectRepository(Slot) private slotRepository: Repository<Slot>,
    @InjectRepository(User) private userRepository: Repository<User>,
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
        isDeleted: false,
      },
      order: { startDate: 1 },
    });

    if (isFull == undefined) return slots;

    const userSlotsCount = await Promise.all(
      slots.map((slot) =>
        this.userSlotRepository.count({ isDeleted: false, slot }),
      ),
    );

    return isFull
      ? slots.filter((slot, i) => userSlotsCount[i] >= slot.totalPlace)
      : slots.filter((slot, i) => userSlotsCount[i] < slot.totalPlace);
  }

  findOne(slotID: number) {
    return this.slotRepository.findOne(slotID);
  }

  async book({ userID, slotID, fullName, phoneNumber }: BookSlotInput) {
    const [slot, user] = await Promise.all([
      this.slotRepository.findOne({ where: { id: slotID, isDeleted: false } }),
      this.userRepository.findOne({ where: { id: userID } }),
    ]);
    // TODO: FIX ME
    if (!slot) throw new Error();
    // TODO: FIX ME
    if (!user) throw new Error();

    await this.userSlotRepository.save(
      this.userSlotRepository.create({
        done: false,
        user,
        slot,
        fullName,
        phoneNumber,
        startDate: slot.startDate,
        isDeleted: false,
      }),
    );

    return slot;
  }

  async cancelBooked({
    userSlotID,
    absenceTypeID,
    description,
  }: CancelBookedSlotInput) {
    const userSlot = await this.userSlotRepository.findOne(userSlotID, {
      relations: ['slot', 'user'],
    });
    // TODO: FIX ME
    if (!userSlot) throw new Error();

    const userSlotAbsence = await this.userSlotAbsenceRepository.save(
      this.userSlotAbsenceRepository.create({
        userID: userSlot.user.id,
        absenceTypeID: Number(absenceTypeID),
        description,
      }),
    );

    await this.userSlotRepository.save({
      id: userSlot.id,
      userSlotAbsenceID: userSlotAbsence.id,
      isDeleted: true,
    });

    return userSlot.slot;
  }

  save(slotDAO: SlotDAO) {
    const slotEntity = this.slotRepository.create(slotDAO);
    return this.slotRepository.save(slotEntity);
  }

  delete(slot: Slot) {
    return this.slotRepository.save({ ...slot, isDeleted: true });
  }

  update(slotID: number, slotDAO: Partial<SlotDAO>) {
    return this.slotRepository.save(
      this.slotRepository.create({ id: slotID, ...slotDAO }),
    );
  }

  countUserSlots(slotID: number) {
    return this.userSlotRepository
      .createQueryBuilder('user_slot')
      .innerJoinAndSelect('user_slot.slot', 'slot')
      .where('user_slot.slotID = :slotID', { slotID })
      .andWhere('user_slot.isDeleted = false')
      .andWhere('slot.isDeleted = false')
      .andWhere('user_slot.userSlotAbsenceID IS NULL')
      .getCount();
  }

  getUserSlots(
    slotID: number,
    pagination?: { first?: number; after?: string },
  ) {
    const queryBuilder = this.userSlotRepository
      .createQueryBuilder('user_slot')
      .innerJoinAndSelect('user_slot.slot', 'slot')
      .where('user_slot.slotID = :slotID', { slotID })
      .andWhere('user_slot.isDeleted = false')
      .andWhere('slot.isDeleted = false')
      .andWhere('user_slot.userSlotAbsenceID IS NULL');

    const nextPaginator = buildPaginator({
      entity: UserSlot,
      alias: 'user_slot',
      paginationKeys: ['id'],
      query: {
        limit: pagination?.first || 10,
        order: 'ASC',
        afterCursor: pagination?.after,
      },
    });

    return nextPaginator.paginate(queryBuilder);
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
