import { Injectable, NotFoundException } from '@nestjs/common';

export interface VideoResponse {
  id: number;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  featured: boolean;
  visibility: 'public' | 'private';
  views: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class VideosService {
  private videos: VideoResponse[] = [
    { id: 1, title: 'How to Use Blood Pressure Monitor', description: 'Tutorial on using BP monitor', category: 'Tutorials', videoUrl: '/videos/bp-monitor.mp4', thumbnailUrl: '/videos/bp-monitor-thumb.jpg', duration: '5:30', featured: true, visibility: 'public', views: 1250, createdAt: '2026-07-15T10:00:00Z', updatedAt: '2026-07-15T10:00:00Z' },
  ];

  async findAll(): Promise<VideoResponse[]> {
    return this.videos;
  }

  async findOne(id: number): Promise<VideoResponse> {
    const video = this.videos.find(v => v.id === id);
    if (!video) throw new NotFoundException(`Video with id ${id} not found`);
    return video;
  }

  async create(dto: any): Promise<VideoResponse> {
    const newVideo: VideoResponse = {
      id: this.videos.length + 1,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      videoUrl: dto.videoUrl || '',
      thumbnailUrl: dto.thumbnailUrl || '',
      duration: dto.duration || '0:00',
      featured: dto.featured || false,
      visibility: dto.visibility || 'public',
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.videos.push(newVideo);
    return newVideo;
  }

  async update(id: number, dto: any): Promise<VideoResponse> {
    const video = await this.findOne(id);
    Object.assign(video, dto);
    video.updatedAt = new Date().toISOString();
    return video;
  }

  async remove(id: number): Promise<{ message: string }> {
    const video = await this.findOne(id);
    this.videos = this.videos.filter(v => v.id !== id);
    return { message: `Video "${video.title}" deleted` };
  }
}
