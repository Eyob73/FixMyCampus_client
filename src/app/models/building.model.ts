export type CampusZone = 'NORTH_CAMPUS' | 'SOUTH_CAMPUS' | 'STEM_COMPLEX' | 'EAST_RESIDENCE' | 'WEST_ATHLETICS' | 'CENTRAL_QUAD';

export interface Building {
  id: string;
  code: string; // e.g. "SCI-101", "ENG-A"
  name: string;
  zone: CampusZone;
  floors: number;
  totalRooms: number;
  activeTicketsCount: number;
  managerName: string;
  managerContact: string;
  status: 'OPERATIONAL' | 'MAINTENANCE_SURGE' | 'RESTRICTED';
  createdAt: string;
}

export interface CreateBuildingDto {
  code: string;
  name: string;
  zone: CampusZone;
  floors: number;
  totalRooms: number;
  managerName: string;
  managerContact: string;
}
