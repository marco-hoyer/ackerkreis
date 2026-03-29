import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

@Controller('subscriptions')
@UseGuards(AuthGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    if (user.role === 'ADMIN') {
      return this.subscriptionsService.findAll(+page, +limit);
    }
    // Members only see their own subscription
    if (user.subscriptionId) {
      const subscription = await this.subscriptionsService.findOne(user.subscriptionId);
      return { data: [subscription], pagination: { page: 1, limit: 1, total: 1, totalPages: 1 } };
    }
    return { data: [], pagination: { page: 1, limit: 1, total: 0, totalPages: 0 } };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const subscription = await this.subscriptionsService.findOne(id);
    // Members can only view their own subscription
    if (user.role !== 'ADMIN' && user.subscriptionId !== subscription.id) {
      throw new Error('Keine Berechtigung');
    }
    return subscription;
  }

  @Get(':id/balance')
  async getBalance(@Param('id') id: string, @CurrentUser() user: any) {
    const subscription = await this.subscriptionsService.findOne(id);
    if (user.role !== 'ADMIN' && user.subscriptionId !== subscription.id) {
      throw new Error('Keine Berechtigung');
    }
    return this.subscriptionsService.getBalance(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateSubscriptionDto) {
    return this.subscriptionsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(id);
  }
}
