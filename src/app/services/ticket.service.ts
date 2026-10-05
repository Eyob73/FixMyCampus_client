import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  AssignTechnicianDto,
  CreateTicketDto,
  Ticket,
  TicketActivity,
  TicketFilterParams,
  TicketPriority,
  TicketStatus,
  UpdateTicketDto
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly apiUrl = `${environment.apiUrl}/tickets`;

  private readonly initialTickets: Ticket[] = [
    {
      id: 't-1082',
      ticketNumber: 'T-1082',
      title: 'HVAC Refrigerant Leakage & Severe Pressure Loss',
      description: 'Chilled water supply line in Room 304 is experiencing continuous condensation drip and erratic temperature spikes above 78°F. High-value biological specimens in cold storage units are at immediate risk of thermal degradation if ambient temperature is not stabilized within 4 hours.',
      category: 'HVAC',
      building: 'Physical Sciences Hall & Labs',
      floor: '3rd Floor',
      room: 'Lab 304',
      reporterId: 'rep-01',
      reporterName: 'Dr. Aris Thorne',
      reporterEmail: 'a.thorne@faculty.campus.edu',
      reporterPhone: '(555) 891-2345',
      reporterRole: 'Department Chair / Chemistry',
      assignedTechnicianId: 'tech-01',
      assignedTechnicianName: 'Marcus Vance',
      assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      assignedTechnicianSpecialty: 'HVAC & Climate Systems',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      createdAt: '2026-10-04T08:14:00Z',
      updatedAt: '2026-10-05T09:30:00Z',
      estimatedHours: 3.5,
      attachments: [
        {
          id: 'att-01',
          fileName: 'valve_manifold_corrosion.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/jpeg',
          fileSize: 2450000,
          uploadedAt: '2026-10-04T08:15:00Z'
        },
        {
          id: 'att-02',
          fileName: 'thermostat_telemetry_spike.png',
          fileUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
          fileType: 'image/png',
          fileSize: 1120000,
          uploadedAt: '2026-10-04T08:22:00Z'
        }
      ],
      activityLog: [
        {
          id: 'act-01',
          ticketId: 't-1082',
          action: 'Ticket Submitted',
          actorName: 'Dr. Aris Thorne',
          actorRole: 'Reporter',
          timestamp: '2026-10-04T08:14:00Z',
          comment: 'Reported critical temp rise in Lab 304 cold incubation bank.'
        },
        {
          id: 'act-02',
          ticketId: 't-1082',
          action: 'Priority Escalated',
          actorName: 'Central Dispatch',
          actorRole: 'System',
          timestamp: '2026-10-04T08:16:00Z',
          comment: 'Automatic escalation to CRITICAL due to bio-hazard specimen policy.'
        },
        {
          id: 'act-03',
          ticketId: 't-1082',
          action: 'Technician Assigned',
          actorName: 'Sarah Jenkins (Admin)',
          actorRole: 'Administrator',
          timestamp: '2026-10-04T08:30:00Z',
          comment: 'Assigned Senior HVAC Specialist Marcus Vance.'
        },
        {
          id: 'act-04',
          ticketId: 't-1082',
          action: 'Status Changed to In Progress',
          actorName: 'Marcus Vance',
          actorRole: 'Assigned Technician',
          timestamp: '2026-10-04T09:45:00Z',
          comment: 'On site with nitrogen pressure test kit and replacement bypass valve.'
        }
      ],
      internalNotes: [
        'Checked condenser coils. Schrader core valve has moderate seal leak.',
        'Parts requisitioned from Central Warehouse (Bin 14-C). ETA 45 mins.'
      ]
    },
    {
      id: 't-1081',
      ticketNumber: 'T-1081',
      title: 'Passenger Elevator #2 Hydraulic Pressure Fluctuation',
      description: 'Elevator cab jerky on descent between Floors 3 and 2. Cab safely parked at ground floor pending hydraulic valve solenoid inspection.',
      category: 'STRUCTURAL',
      building: 'Founders Administrative Tower',
      floor: 'Ground Floor',
      room: 'Elevator Shaft B',
      reporterId: 'rep-03',
      reporterName: 'Geraldine Brooks',
      reporterEmail: 'g.brooks@staff.campus.edu',
      reporterPhone: '(555) 673-4567',
      reporterRole: 'Staff / Administration',
      assignedTechnicianId: 'tech-04',
      assignedTechnicianName: 'Sarah Chen',
      assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      assignedTechnicianSpecialty: 'Building Envelope & Structural',
      priority: 'HIGH',
      status: 'ASSIGNED',
      createdAt: '2026-10-04T10:30:00Z',
      updatedAt: '2026-10-04T11:00:00Z',
      estimatedHours: 4.0,
      activityLog: [
        {
          id: 'act-05',
          ticketId: 't-1081',
          action: 'Ticket Created',
          actorName: 'Geraldine Brooks',
          actorRole: 'Staff',
          timestamp: '2026-10-04T10:30:00Z'
        },
        {
          id: 'act-06',
          ticketId: 't-1081',
          action: 'Technician Assigned',
          actorName: 'Admin System',
          actorRole: 'Admin',
          timestamp: '2026-10-04T11:00:00Z',
          comment: 'Assigned Sarah Chen for mechanical inspection.'
        }
      ]
    },
    {
      id: 't-1080',
      ticketNumber: 'T-1080',
      title: 'Main Floor Restroom High-Pressure Flushometer Leak',
      description: 'Flush valve on stall 3 continuously running with high volume overflow into adjacent floor drain. Water supply isolated at fixture shutoff.',
      category: 'PLUMBING',
      building: 'W.E.B. Du Bois Memorial Library',
      floor: '1st Floor',
      room: 'West Restroom 102',
      reporterId: 'rep-02',
      reporterName: 'Maya Lin',
      reporterEmail: 'm.lin@student.campus.edu',
      reporterRole: 'Student',
      assignedTechnicianId: 'tech-03',
      assignedTechnicianName: 'David Okafor',
      assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      assignedTechnicianSpecialty: 'Hydronic & Main Line Hydraulics',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      createdAt: '2026-10-04T14:10:00Z',
      updatedAt: '2026-10-05T08:00:00Z',
      estimatedHours: 1.5,
      activityLog: [
        {
          id: 'act-07',
          ticketId: 't-1080',
          action: 'Ticket Created',
          actorName: 'Maya Lin',
          actorRole: 'Student',
          timestamp: '2026-10-04T14:10:00Z'
        }
      ]
    },
    {
      id: 't-1079',
      ticketNumber: 'T-1079',
      title: 'Main Electrical Feeder Intermittent Voltage Drop',
      description: 'Flickering LED bay luminaires and 480V step-down transformer humming in Robotics laboratory bay B-12.',
      category: 'ELECTRICAL',
      building: 'Engineering Research Center',
      floor: 'Basement',
      room: 'Substation Bay 2',
      reporterId: 'rep-04',
      reporterName: 'Julian Henderson',
      reporterEmail: 'j.henderson@student.campus.edu',
      reporterRole: 'Student / Lab Assistant',
      assignedTechnicianId: 'tech-02',
      assignedTechnicianName: 'Elena Rostova',
      assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      assignedTechnicianSpecialty: 'High Voltage & Power Distribution',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      createdAt: '2026-10-03T16:20:00Z',
      updatedAt: '2026-10-05T07:45:00Z',
      estimatedHours: 5.0,
      activityLog: [
        {
          id: 'act-08',
          ticketId: 't-1079',
          action: 'Reported',
          actorName: 'Julian Henderson',
          actorRole: 'Reporter',
          timestamp: '2026-10-03T16:20:00Z'
        }
      ]
    },
    {
      id: 't-1078',
      ticketNumber: 'T-1078',
      title: 'Perimeter Barrier RFID Gate Actuator Offline',
      description: 'Boom barrier failing to open on valid RFID faculty badge scans. Gate has been locked open to prevent vehicular backup onto avenue.',
      category: 'IT_SECURITY',
      building: 'Founders Administrative Tower',
      floor: 'Ground Exterior',
      room: 'North Entrance Gate',
      reporterId: 'rep-03',
      reporterName: 'Geraldine Brooks',
      reporterEmail: 'g.brooks@staff.campus.edu',
      reporterRole: 'Staff',
      assignedTechnicianId: 'tech-05',
      assignedTechnicianName: 'James Reynolds',
      assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      assignedTechnicianSpecialty: 'Access Control & Electronic Security',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      createdAt: '2026-10-02T11:00:00Z',
      updatedAt: '2026-10-03T15:30:00Z',
      resolvedAt: '2026-10-03T15:30:00Z',
      estimatedHours: 2.0,
      activityLog: [
        {
          id: 'act-09',
          ticketId: 't-1078',
          action: 'Resolved',
          actorName: 'James Reynolds',
          actorRole: 'Technician',
          timestamp: '2026-10-03T15:30:00Z',
          comment: 'Replaced optical beam sensor and reset controller board.'
        }
      ]
    },
    {
      id: 't-1077',
      ticketNumber: 'T-1077',
      title: 'Ceiling Acoustic Tile Sagging Near Fire Sprinkler Head',
      description: 'Water staining visible on two ceiling tiles in Room 204. No active dripping currently observed.',
      category: 'STRUCTURAL',
      building: 'North Quad Residential Commons',
      floor: '2nd Floor',
      room: 'Study Lounge 204',
      reporterId: 'rep-05',
      reporterName: 'Prof. Evelyn Campbell',
      reporterEmail: 'e.campbell@faculty.campus.edu',
      reporterRole: 'Faculty',
      priority: 'MEDIUM',
      status: 'NEW',
      createdAt: '2026-10-05T07:15:00Z',
      updatedAt: '2026-10-05T07:15:00Z',
      activityLog: [
        {
          id: 'act-10',
          ticketId: 't-1077',
          action: 'Ticket Created',
          actorName: 'Prof. Evelyn Campbell',
          actorRole: 'Reporter',
          timestamp: '2026-10-05T07:15:00Z'
        }
      ]
    },
    {
      id: 't-1076',
      ticketNumber: 'T-1076',
      title: 'Aquatic Center Filtration Pump Excessive Vibration',
      description: 'Primary circulation pump #1 making grinding bearing noise. Secondary redundant pump engaged.',
      category: 'PLUMBING',
      building: 'Campus Pavilion & Aquatic Center',
      floor: 'Basement',
      room: 'Pump Room A',
      reporterId: 'rep-03',
      reporterName: 'Geraldine Brooks',
      reporterEmail: 'g.brooks@staff.campus.edu',
      reporterRole: 'Staff',
      priority: 'HIGH',
      status: 'NEW',
      createdAt: '2026-10-05T06:30:00Z',
      updatedAt: '2026-10-05T06:30:00Z',
      activityLog: [
        {
          id: 'act-11',
          ticketId: 't-1076',
          action: 'Ticket Created',
          actorName: 'Geraldine Brooks',
          actorRole: 'Staff',
          timestamp: '2026-10-05T06:30:00Z'
        }
      ]
    },
    {
      id: 't-1075',
      ticketNumber: 'T-1075',
      title: 'Emergency Stairwell Lighting Ballast Replacement',
      description: 'Emergency backup battery pack failed self-test during monthly fire marshall audit.',
      category: 'ELECTRICAL',
      building: 'Physical Sciences Hall & Labs',
      floor: 'Stairwell East',
      room: 'Floors 1-5',
      reporterId: 'rep-01',
      reporterName: 'Dr. Aris Thorne',
      reporterEmail: 'a.thorne@faculty.campus.edu',
      reporterRole: 'Faculty',
      assignedTechnicianId: 'tech-02',
      assignedTechnicianName: 'Elena Rostova',
      assignedTechnicianAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      assignedTechnicianSpecialty: 'High Voltage & Power Distribution',
      priority: 'LOW',
      status: 'CLOSED',
      createdAt: '2026-09-25T10:00:00Z',
      updatedAt: '2026-09-27T14:00:00Z',
      resolvedAt: '2026-09-27T14:00:00Z',
      activityLog: [
        {
          id: 'act-12',
          ticketId: 't-1075',
          action: 'Ticket Closed',
          actorName: 'Sarah Jenkins',
          actorRole: 'Admin',
          timestamp: '2026-09-27T14:00:00Z'
        }
      ]
    }
  ];

  private readonly ticketsSignal = signal<Ticket[]>(this.loadFromStorage());
  public readonly tickets = this.ticketsSignal.asReadonly();

  constructor(private http: HttpClient) {}

  private loadFromStorage(): Ticket[] {
    try {
      const stored = localStorage.getItem('fmc_tickets');
      return stored ? JSON.parse(stored) : this.initialTickets;
    } catch {
      return this.initialTickets;
    }
  }

  private persist(data: Ticket[]): void {
    this.ticketsSignal.set(data);
    try {
      localStorage.setItem('fmc_tickets', JSON.stringify(data));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  public getTickets(params?: TicketFilterParams): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.apiUrl, { params: params as any }).pipe(
      tap((apiTickets) => {
        if (apiTickets && apiTickets.length) {
          this.persist(apiTickets);
        }
      }),
      catchError(() => {
        let result = [...this.ticketsSignal()];
        if (!params) return of(result);

        if (params.search) {
          const s = params.search.toLowerCase();
          result = result.filter(
            (t) =>
              t.ticketNumber.toLowerCase().includes(s) ||
              t.title.toLowerCase().includes(s) ||
              t.building.toLowerCase().includes(s) ||
              t.reporterName.toLowerCase().includes(s) ||
              (t.assignedTechnicianName && t.assignedTechnicianName.toLowerCase().includes(s))
          );
        }

        if (params.status && params.status !== 'ALL') {
          result = result.filter((t) => t.status === params.status);
        }

        if (params.priority && params.priority !== 'ALL') {
          result = result.filter((t) => t.priority === params.priority);
        }

        if (params.category && params.category !== 'ALL') {
          result = result.filter((t) => t.category === params.category);
        }

        if (params.building && params.building !== 'ALL') {
          result = result.filter((t) => t.building === params.building);
        }

        if (params.assignedTechnicianId && params.assignedTechnicianId !== 'ALL') {
          if (params.assignedTechnicianId === 'UNASSIGNED') {
            result = result.filter((t) => !t.assignedTechnicianId);
          } else {
            result = result.filter((t) => t.assignedTechnicianId === params.assignedTechnicianId);
          }
        }

        return of(result);
      })
    );
  }

  public getTicketById(idOrNumber: string): Observable<Ticket | undefined> {
    return this.http.get<Ticket>(`${this.apiUrl}/${idOrNumber}`).pipe(
      catchError(() => {
        const found = this.ticketsSignal().find(
          (t) => t.id.toLowerCase() === idOrNumber.toLowerCase() || t.ticketNumber.toLowerCase() === idOrNumber.toLowerCase()
        );
        return of(found);
      })
    );
  }

  public createTicket(dto: CreateTicketDto): Observable<Ticket> {
    return this.http.post<Ticket>(this.apiUrl, dto).pipe(
      catchError(() => {
        const nextNum = 'T-' + (1083 + Math.floor(Math.random() * 100));
        const newTicket: Ticket = {
          id: 't-' + Math.random().toString(36).substring(2, 7),
          ticketNumber: nextNum,
          title: dto.title,
          description: dto.description,
          category: dto.category,
          building: dto.building,
          floor: dto.floor,
          room: dto.room,
          reporterId: 'rep-admin',
          reporterName: dto.reporterName || 'Admin Console',
          reporterEmail: dto.reporterEmail || 'admin@campus.edu',
          reporterRole: 'Administrator',
          assignedTechnicianId: dto.assignedTechnicianId,
          priority: dto.priority,
          status: dto.assignedTechnicianId ? 'ASSIGNED' : 'NEW',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          activityLog: [
            {
              id: 'act-' + Math.random().toString(36).substring(2, 6),
              ticketId: nextNum,
              action: 'Ticket Created',
              actorName: 'Admin Console',
              actorRole: 'Admin',
              timestamp: new Date().toISOString(),
              comment: 'Manual ticket creation via Admin Portal.'
            }
          ]
        };

        const updated = [newTicket, ...this.ticketsSignal()];
        this.persist(updated);
        return of(newTicket);
      })
    );
  }

  public updateTicket(id: string, dto: UpdateTicketDto): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, dto).pipe(
      catchError(() => {
        const updated = this.ticketsSignal().map((t) => {
          if (t.id === id || t.ticketNumber === id) {
            return {
              ...t,
              ...dto,
              updatedAt: new Date().toISOString()
            };
          }
          return t;
        });
        this.persist(updated);
        return of(updated.find((t) => t.id === id || t.ticketNumber === id)!);
      })
    );
  }

  public assignTechnician(ticketId: string, technicianId: string, technicianName: string, specialty?: string): Observable<Ticket> {
    const payload: AssignTechnicianDto = { ticketId, technicianId };
    return this.http.post<Ticket>(`${this.apiUrl}/${ticketId}/assign`, payload).pipe(
      catchError(() => {
        const updated = this.ticketsSignal().map((t) => {
          if (t.id === ticketId || t.ticketNumber === ticketId) {
            const activities = t.activityLog || [];
            activities.unshift({
              id: 'act-' + Math.random().toString(36).substring(2, 6),
              ticketId: t.id,
              action: 'Technician Assigned',
              actorName: 'Sarah Jenkins',
              actorRole: 'Admin',
              timestamp: new Date().toISOString(),
              comment: `Dispatched to ${technicianName} (${specialty || 'Specialist'})`
            });

            return {
              ...t,
              assignedTechnicianId: technicianId,
              assignedTechnicianName: technicianName,
              assignedTechnicianSpecialty: specialty,
              status: (t.status === 'NEW' ? 'ASSIGNED' : t.status) as TicketStatus,
              updatedAt: new Date().toISOString(),
              activityLog: activities
            };
          }
          return t;
        });
        this.persist(updated);
        return of(updated.find((t) => t.id === ticketId || t.ticketNumber === ticketId)!);
      })
    );
  }

  public updateStatus(ticketId: string, newStatus: TicketStatus, comment?: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${ticketId}/status`, { status: newStatus, comment }).pipe(
      catchError(() => {
        const updated = this.ticketsSignal().map((t) => {
          if (t.id === ticketId || t.ticketNumber === ticketId) {
            const activities = t.activityLog || [];
            activities.unshift({
              id: 'act-' + Math.random().toString(36).substring(2, 6),
              ticketId: t.id,
              action: `Status Changed to ${newStatus}`,
              actorName: 'Sarah Jenkins',
              actorRole: 'Admin',
              timestamp: new Date().toISOString(),
              previousStatus: t.status,
              newStatus: newStatus,
              comment: comment || `Status manually transitioned to ${newStatus}`
            });

            return {
              ...t,
              status: newStatus,
              resolvedAt: newStatus === 'RESOLVED' || newStatus === 'CLOSED' ? new Date().toISOString() : t.resolvedAt,
              updatedAt: new Date().toISOString(),
              activityLog: activities
            };
          }
          return t;
        });
        this.persist(updated);
        return of(updated.find((t) => t.id === ticketId || t.ticketNumber === ticketId)!);
      })
    );
  }

  public updatePriority(ticketId: string, priority: TicketPriority): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${ticketId}/priority`, { priority }).pipe(
      catchError(() => {
        const updated = this.ticketsSignal().map((t) => {
          if (t.id === ticketId || t.ticketNumber === ticketId) {
            return {
              ...t,
              priority,
              updatedAt: new Date().toISOString()
            };
          }
          return t;
        });
        this.persist(updated);
        return of(updated.find((t) => t.id === ticketId || t.ticketNumber === ticketId)!);
      })
    );
  }

  public addInternalNote(ticketId: string, note: string): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.apiUrl}/${ticketId}/notes`, { note }).pipe(
      catchError(() => {
        const updated = this.ticketsSignal().map((t) => {
          if (t.id === ticketId || t.ticketNumber === ticketId) {
            const currentNotes = t.internalNotes || [];
            const activities = t.activityLog || [];
            activities.unshift({
              id: 'act-' + Math.random().toString(36).substring(2, 6),
              ticketId: t.id,
              action: 'Internal Note Added',
              actorName: 'Sarah Jenkins',
              actorRole: 'Admin',
              timestamp: new Date().toISOString(),
              comment: note
            });

            return {
              ...t,
              internalNotes: [note, ...currentNotes],
              updatedAt: new Date().toISOString(),
              activityLog: activities
            };
          }
          return t;
        });
        this.persist(updated);
        return of(updated.find((t) => t.id === ticketId || t.ticketNumber === ticketId)!);
      })
    );
  }

  public deleteTicket(id: string): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      catchError(() => {
        const updated = this.ticketsSignal().filter((t) => t.id !== id && t.ticketNumber !== id);
        this.persist(updated);
        return of(true);
      })
    );
  }
}
