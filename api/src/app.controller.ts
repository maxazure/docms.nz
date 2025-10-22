import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get API health status' })
  getHealth(): any {
    return this.appService.getHealth();
  }

  @Get('api')
  @ApiOperation({ summary: 'Get API information' })
  getApiInfo(): any {
    return this.appService.getApiInfo();
  }
}