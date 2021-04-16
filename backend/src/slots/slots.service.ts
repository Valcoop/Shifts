import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Repository } from 'typeorm';
import { BookSlotInput, CancelBookedSlotInput, SlotsInput } from '../graphql';
import { User } from '../users/users.entity';
import { Slot } from './slots.entity';
import { UserSlotAbsence } from './users-slots-absences.entity';
import { UserSlot } from './users-slots.entity';

interface SlotDAO {
  active: boolean;
  userAdminCreated: number;
  lastUserAdminUpdated: number;
  startDate: Date;
  duration: number;
  jobID: number;
  totalPlace: number;
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

  find({ active, duration, startDate }: SlotsInput) {
    return this.slotRepository.find({
      where: {
        ...(active && { active }),
        startDate: MoreThan(startDate),
        duration,
      },
    });
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
    slotID,
    userID,
    absenceTypeID,
    description,
  }: CancelBookedSlotInput) {
    const slot = await this.slotRepository.findOne(slotID);
    // TODO: FIX ME
    if (!slot) throw new Error();

    const userSlot = await this.userSlotRepository.findOne({
      where: { slotID, userID },
    });

    const userSlotAbsenceEntity = this.userSlotAbsenceRepository.create({
      userID: Number(userID),
      absenceTypeID: Number(absenceTypeID),
      description,
    });
    const userSlotAbsence = await this.userSlotAbsenceRepository.save(
      userSlotAbsenceEntity,
    );

    // TODO: check if the update is correct
    await this.userSlotRepository.save({
      ...userSlot,
      userSlotAbsenceID: userSlotAbsence.id,
    });

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
    this.slotRepository.remove(slot);

    return slot;
  }

  update(slotID: number, slotDAO: Partial<SlotDAO>) {
    const slotEntity = this.slotRepository.create({ id: slotID, ...slotDAO });
    return this.slotRepository.save(slotEntity);
  }

  async getAttendeesAndCount(
    slotID: number,
    pagination: { first?: number; after?: string },
  ): Promise<[User[], number]> {
    const [usersSlots, totalCount] = await Promise.all([
      this.userSlotRepository.find({
        where: {
          ...(pagination.after && { id: LessThan(pagination.after) }),
          slotID,
        },
        take: pagination.first || 10,
      }),
      this.userSlotRepository.count({ where: { slotID } }),
    ]);

    return [
      await this.userRepository.find({
        where: { id: In(usersSlots.map((userSlot) => userSlot.id)) },
      }),
      totalCount,
    ];
  }
}
