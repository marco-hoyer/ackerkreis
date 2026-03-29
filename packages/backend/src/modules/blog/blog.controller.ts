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
import { BlogService } from './blog.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateBlogEntryDto } from './dto/create-blog-entry.dto';
import { UpdateBlogEntryDto } from './dto/update-blog-entry.dto';

@Controller('blog')
@UseGuards(AuthGuard)
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Get()
  async findPublished(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.blogService.findPublished(+page, +limit);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.blogService.findAll(+page, +limit);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreateBlogEntryDto, @CurrentUser() user: any) {
    return this.blogService.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() dto: UpdateBlogEntryDto) {
    return this.blogService.update(id, dto);
  }

  @Post(':id/publish')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async publish(@Param('id') id: string) {
    return this.blogService.publish(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
