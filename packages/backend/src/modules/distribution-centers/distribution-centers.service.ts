import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCenterDto } from './dto/create-center.dto';
import { UpdateCenterDto } from './dto/update-center.dto';

@Injectable()
export class DistributionCentersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.distributionCenter.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const center = await this.prisma.distributionCenter.findUnique({
      where: { id },
      include: {
        _count: { select: { subscriptions: true } },
      },
    });

    if (!center) {
      throw new NotFoundException('Verteilpunkt nicht gefunden');
    }

    return center;
  }

  async create(dto: CreateCenterDto) {
    return this.prisma.distributionCenter.create({
      data: {
        name: dto.name,
        address: dto.address,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateCenterDto) {
    await this.findOne(id);

    return this.prisma.distributionCenter.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.address && { address: dto.address }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.distributionCenter.update({
      where: { id },
      data: { active: false },
    });
    return { message: 'Verteilpunkt deaktiviert' };
  }
}
