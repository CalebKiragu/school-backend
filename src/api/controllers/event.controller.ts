import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { EventService, EventDto } from '../../event/event.service';

@ApiTags('events')
@ApiBearerAuth()
@Controller('api/events')
@UseGuards(AuthGuard('jwt'))
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOperation({ summary: 'Get upcoming events for authenticated user' })
  @ApiQuery({
    name: 'upcoming',
    required: false,
    description: 'Filter for upcoming events only',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit number of results',
  })
  @ApiResponse({ status: 200, description: 'Events retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getEvents(
    @Query('upcoming') upcoming?: string,
    @Query('limit') limit?: string,
    @Request() req?,
  ): Promise<EventDto[]> {
    const phoneNumber = req.user.phoneNumber;
    let events = await this.eventService.getUpcomingEvents(phoneNumber);

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        events = events.slice(0, limitNum);
      }
    }

    return events;
  }
}
