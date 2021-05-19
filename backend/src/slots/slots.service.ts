import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { buildPaginator } from 'typeorm-cursor-pagination';
import { SlotsInput } from '../graphql';
import { Job } from '../jobs/jobs.entity';
import { UserSlot } from '../user-slots/user-slots.entity';
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
    @InjectRepository(UserSlot)
    private userSlotRepository: Repository<UserSlot>,
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
      .leftJoinAndSelect('slot.userSlots', 'userSlot')
      .where('slot.isDeleted = false')
      .andWhere('slot.startDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (active != null) queryBuilder.andWhere('active = :active', { active });
    const slots = await queryBuilder.getMany();

    slots.forEach(slot => {
      slot.userSlots = slot.userSlots.filter(userSlot => userSlot.isDeleted !== true && userSlot.userSlotAbsenceID == null)
    })

    return isFull
      ? slots.filter((slot) => slot.userSlots.length >= slot.totalPlace)
      : slots.filter((slot) => slot.userSlots.length < slot.totalPlace);
  }

  findByID(id: number): Promise<Slot | undefined> {
    return this.slotRepository.findOne(id, { relations: ['job'] });
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
      .innerJoinAndSelect('user_slot.user', 'user')
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
      .innerJoinAndSelect('user_slot.user', 'user')
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
