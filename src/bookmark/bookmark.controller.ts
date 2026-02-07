import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthGuard } from '../auth/auth.guard';
import type { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

@ApiTags('Bookmark')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Post()
  @ApiOperation({ summary: 'Add a bookmark' })
  async addBookmark(@Req() req: RequestWithUser, @Body() createBookmarkDto: CreateBookmarkDto) {
    return this.bookmarkService.addBookmark(req.user.id, createBookmarkDto.contentId);
  }

  @Delete(':contentId')
  @ApiOperation({ summary: 'Remove a bookmark by content ID' })
  async removeBookmark(
    @Req() req: RequestWithUser,
    @Param('contentId', ParseIntPipe) contentId: number,
  ) {
    return this.bookmarkService.removeBookmark(req.user.id, contentId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookmarks for the current user' })
  async getBookmarks(@Req() req: RequestWithUser) {
    return this.bookmarkService.getBookmarks(req.user.id);
  }

  @Get(':contentId/status')
  @ApiOperation({ summary: 'Check if a specific content is bookmarked' })
  async checkBookmarkStatus(
    @Req() req: RequestWithUser,
    @Param('contentId', ParseIntPipe) contentId: number,
  ) {
    return this.bookmarkService.isBookmarked(req.user.id, contentId);
  }
}
