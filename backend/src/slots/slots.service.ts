import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { SlotsInput } from '../graphql';
import { Job } from '../jobs/jobs.entity';
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
  job: Job;
  totalPlace: number;
  isDeleted: boolean;
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

  async find({
    active,
    endDate,
    startDate,
    isFull,
  }: SlotsInput): Promise<Slot[]> {
    if (isFull == undefined) {
      return this.slotRepository.find({
        where: {
          ...(active != null ? { active } : {}),
          startDate: Between(startDate, endDate),
          isDeleted: false,
        },
        relations: ['job'],
      });
    }

    const queryBuilder = await this.slotRepository
      .createQueryBuilder('slot')
      .leftJoinAndSelect('slot.userSlots', 'userSlot', 'slot.isDeleted = false')
      .where('slot.startDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .where('userSlot.isDeleted = FALSE')
      .where('userSlot.userSlotAbsenceID IS NULL');

    if (active != null) queryBuilder.where('active = :active', { active });
    const slots = await queryBuilder.getMany();

    return isFull
      ? slots.filter((slot) => slot.userSlots.length >= slot.totalPlace)
      : slots.filter((slot) => slot.userSlots.length < slot.totalPlace);
  }

  findByID(id: number): Promise<Slot | undefined> {
    return this.slotRepository.findOne(id);
  }

  // TODO: question : should it be moved to userslot ?
  async book(
    userID: number,
    slotID: number,
    { fullName, phoneNumber }: { fullName: string; phoneNumber: string },
  ): Promise<Slot> {
    const [slot, user] = await Promise.all([
      this.slotRepository.findOne({ where: { id: slotID, isDeleted: false } }),
      this.userRepository.findOne(userID),
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

  // TODO: question : should it be moved to userslot ?
  async cancelBooked(
    userSlotID: number,
    {
      absenceTypeID,
      description,
    }: { absenceTypeID: number; description?: string },
  ): Promise<Slot> {
    const userSlot = await this.userSlotRepository.findOne(userSlotID, {
      relations: ['slot', 'user'],
    });
    // TODO: FIX ME
    if (!userSlot) throw new Error();

    const userSlotAbsence = await this.userSlotAbsenceRepository.save(
      this.userSlotAbsenceRepository.create({
        userID: userSlot.user.id,
        absenceTypeID,
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

  save(slotDAO: SlotDAO): Promise<Slot> {
    return this.slotRepository.save(this.slotRepository.create(slotDAO));
  }

  delete(slot: Slot): Promise<Slot> {
    return this.slotRepository.save({ ...slot, isDeleted: true });
  }

  update(slot: Slot, slotDAO: Partial<SlotDAO>): Promise<Slot> {
    return this.slotRepository.save(
      this.slotRepository.create({ ...slot, ...slotDAO }),
    );
  }

  // UserSlot
  countUserSlots(slotID: number): Promise<number> {
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
}
