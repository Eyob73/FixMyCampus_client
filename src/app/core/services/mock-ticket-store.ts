import {
  Ticket,
  TechnicianDashboardStats,
  TicketFilterOptions,
  PaginatedTicketsResponse,
  TicketActivity,
  TicketStatus,
  TicketResolution,
  TicketAttachment,
  WorkNoteType,
} from '../models/ticket.model';

const STORAGE_KEY = 'fmc_technician_tickets_v1';

export class MockTicketStore {
  private static initialTickets: Ticket[] = [
    {
      id: 'T-1082',
      title: 'Broken Projector Equipment',
      description:
        'The ceiling-mounted HDMI projector in Lab 302 refuses to power on when pressing the wall control panel. Status light flashes red 3 times. Needed for upcoming chemistry symposium presentations.',
      category: 'Equipment & AV',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      location: {
        building: 'Science Building',
        room: 'Lab 302',
        floor: '3rd Floor',
        campusZone: 'North Academic Quad',
      },
      reporter: {
        id: 'rep-98421',
        name: 'Alex Chen',
        email: 'a.chen@univ.edu',
        phone: '+1 (555) 482-9912',
        studentStaffId: '98421',
        role: 'Student / Chemistry TA',
        department: 'Department of Chemistry',
      },
      assignedTechnician: {
        id: 'tech-101',
        name: 'Dave Miller',
        email: 'd.miller@campus.edu',
        department: 'AV & Media Facilities Services',
      },
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      assignedAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      attachments: [
        {
          id: 'att-1',
          fileName: 'error_code_flashing.jpg',
          fileUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
          fileSize: '1.8 MB',
          fileType: 'image/jpeg',
          uploadedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          uploadedBy: 'Alex Chen',
          isEvidence: false,
        },
      ],
      activities: [
        {
          id: 'act-1',
          ticketId: 'T-1082',
          type: 'STATUS_CHANGE',
          author: {
            id: 'rep-98421',
            name: 'Alex Chen',
            role: 'REPORTER',
          },
          timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          content: 'Ticket created and logged in facilities queue.',
          metadata: { newStatus: 'NEW' },
        },
        {
          id: 'act-2',
          ticketId: 'T-1082',
          type: 'ASSIGNMENT',
          author: {
            id: 'admin-001',
            name: 'Marcus Vance',
            role: 'ADMIN',
            department: 'Plant Superintendent',
          },
          timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
          content: 'Assigned work order to Dave Miller (AV & Media Services). Priority set to High.',
          metadata: { oldStatus: 'NEW', newStatus: 'ASSIGNED' },
        },
        {
          id: 'act-3',
          ticketId: 'T-1082',
          type: 'STATUS_CHANGE',
          author: {
            id: 'tech-101',
            name: 'Dave Miller',
            role: 'TECHNICIAN',
          },
          timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          content: 'Started diagnostic inspection on site.',
          metadata: { oldStatus: 'ASSIGNED', newStatus: 'IN_PROGRESS' },
        },
        {
          id: 'act-4',
          ticketId: 'T-1082',
          type: 'WORK_NOTE',
          noteType: 'DIAGNOSIS',
          author: {
            id: 'tech-101',
            name: 'Dave Miller',
            role: 'TECHNICIAN',
          },
          timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
          content:
            'Inspected projector power supply. Three red blinks indicate thermal shutoff or lamp ballast fault. Ordered replacement ballast module #OPT-921 from central warehouse.',
        },
      ],
    },
    {
      id: 'T-1085',
      title: 'Emergency Exit Strobe & Visual Alert Failure',
      description:
        'During routine scheduled system check, visual xenon strobe failed to flash on the 2nd floor landing of Stairwell B. Audio alarm remains active. Must be verified and cleared per university life safety code.',
      category: 'Safety & Security',
      priority: 'CRITICAL',
      status: 'ASSIGNED',
      location: {
        building: 'Engineering Hall',
        room: 'Stairwell B, 2nd Floor',
        floor: '2nd Floor',
        campusZone: 'South Engineering Complex',
      },
      reporter: {
        id: 'rep-44120',
        name: 'Dr. Aris Thorne',
        email: 'a.thorne@univ.edu',
        phone: '+1 (555) 302-8821',
        studentStaffId: 'FAC-4412',
        role: 'Faculty / Lab Safety Officer',
        department: 'Electrical Engineering',
      },
      assignedTechnician: {
        id: 'tech-101',
        name: 'Dave Miller',
        email: 'd.miller@campus.edu',
        department: 'AV & Media Facilities Services',
      },
      createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      assignedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
      attachments: [],
      activities: [
        {
          id: 'act-1085-1',
          ticketId: 'T-1085',
          type: 'STATUS_CHANGE',
          author: {
            id: 'rep-44120',
            name: 'Dr. Aris Thorne',
            role: 'REPORTER',
          },
          timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
          content: 'Emergency ticket submitted by Safety Officer.',
          metadata: { newStatus: 'NEW' },
        },
        {
          id: 'act-1085-2',
          ticketId: 'T-1085',
          type: 'ASSIGNMENT',
          author: {
            id: 'admin-001',
            name: 'Marcus Vance',
            role: 'ADMIN',
          },
          timestamp: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
          content: 'Dispatched to Dave Miller with urgent response SLA.',
          metadata: { oldStatus: 'NEW', newStatus: 'ASSIGNED' },
        },
      ],
    },
    {
      id: 'T-1079',
      title: 'HVAC Air Handler Temperature Discrepancy',
      description:
        'Thermostat reading in Organic Chemistry 104 is stuck at 62°F with continuous cold air dump. Reheat coil valve appears stuck closed. Reagents require stable 70°F ambient temperature.',
      category: 'HVAC & Heating',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      location: {
        building: 'Science Building',
        room: 'Chem 104',
        floor: '1st Floor',
        campusZone: 'North Academic Quad',
      },
      reporter: {
        id: 'rep-59110',
        name: 'Maria Gonzalez',
        email: 'm.gonzalez@univ.edu',
        phone: '+1 (555) 491-0194',
        studentStaffId: 'STF-5911',
        role: 'Staff / Laboratory Manager',
        department: 'Department of Chemistry',
      },
      assignedTechnician: {
        id: 'tech-101',
        name: 'Dave Miller',
        email: 'd.miller@campus.edu',
        department: 'AV & Media Facilities Services',
      },
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      assignedAt: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      dueDate: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
      attachments: [],
      activities: [
        {
          id: 'act-1079-1',
          ticketId: 'T-1079',
          type: 'STATUS_CHANGE',
          author: { id: 'rep-59110', name: 'Maria Gonzalez', role: 'REPORTER' },
          timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          content: 'Ticket submitted for climate control failure.',
        },
        {
          id: 'act-1079-2',
          ticketId: 'T-1079',
          type: 'STATUS_CHANGE',
          author: { id: 'tech-101', name: 'Dave Miller', role: 'TECHNICIAN' },
          timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
          content: 'Technician arrived on site, connected BMS diagnostic tool.',
          metadata: { oldStatus: 'ASSIGNED', newStatus: 'IN_PROGRESS' },
        },
        {
          id: 'act-1079-3',
          ticketId: 'T-1079',
          type: 'WORK_NOTE',
          noteType: 'MATERIALS_REQUIRED',
          author: { id: 'tech-101', name: 'Dave Miller', role: 'TECHNICIAN' },
          timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
          content: 'Belimo 24V modulating actuator has stripped internal nylon gear. Procuring replacement Belimo LM24-SR from HVAC shop.',
        },
      ],
    },
    {
      id: 'T-1090',
      title: 'Smart Podium HDMI Switcher & Audio Noise',
      description:
        'Lectern audio creates persistent 60Hz hum when connecting external laptops via HDMI or 3.5mm jack. Screen intermittently loses sync for 2-3 seconds every few minutes during lectures.',
      category: 'Equipment & AV',
      priority: 'HIGH',
      status: 'ASSIGNED',
      location: {
        building: 'Arts & Humanities Center',
        room: 'Auditorium 101',
        floor: 'Ground Floor',
        campusZone: 'Central Campus',
      },
      reporter: {
        id: 'rep-11930',
        name: 'Prof. William Davies',
        email: 'w.davies@univ.edu',
        phone: '+1 (555) 720-4100',
        studentStaffId: 'FAC-1193',
        role: 'Faculty / Professor of History',
        department: 'College of Arts and Sciences',
      },
      assignedTechnician: {
        id: 'tech-101',
        name: 'Dave Miller',
        email: 'd.miller@campus.edu',
        department: 'AV & Media Facilities Services',
      },
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      assignedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
      attachments: [],
      activities: [
        {
          id: 'act-1090-1',
          ticketId: 'T-1090',
          type: 'ASSIGNMENT',
          author: { id: 'admin-001', name: 'Marcus Vance', role: 'ADMIN' },
          timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
          content: 'Assigned to Dave Miller. Recommended checking isolation transformer and Crestron switcher firmware.',
          metadata: { newStatus: 'ASSIGNED' },
        },
      ],
    },
    {
      id: 'T-1065',
      title: 'Restroom Automated Flush Valve Sensor Failure',
      description:
        'Stall #2 automated flushometer sensor triggers continuously without occupancy. Water is running repeatedly every 15-20 seconds.',
      category: 'Plumbing',
      priority: 'LOW',
      status: 'ASSIGNED',
      location: {
        building: 'Student Union',
        room: "Ground Floor Men's Restroom",
        floor: 'Ground Floor',
        campusZone: 'Student Life Quad',
      },
      reporter: {
        id: 'rep-88204',
        name: 'Jordan Bell',
        email: 'j.bell@univ.edu',
        role: 'Student / Union Staff',
        department: 'Student Affairs',
      },
      assignedTechnician: {
        id: 'tech-101',
        name: 'Dave Miller',
        email: 'd.miller@campus.edu',
        department: 'AV & Media Facilities Services',
      },
      createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      assignedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
      attachments: [],
      activities: [],
    },
    {
      id: 'T-1054',
      title: 'Flickering Overhead LED Troffer Panels',
      description:
        'Two 2x4 LED troffers in row 3 of Study Hall 3A are rapidly flickering, causing headaches and eyestrain for students studying.',
      category: 'Electrical',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      location: {
        building: 'Library West',
        room: 'Study Hall 3A',
        floor: '3rd Floor',
        campusZone: 'North Academic Quad',
      },
      reporter: {
        id: 'rep-62019',
        name: 'Samantha Reed',
        email: 's.reed@univ.edu',
        role: 'Student',
      },
      assignedTechnician: {
        id: 'tech-101',
        name: 'Dave Miller',
        email: 'd.miller@campus.edu',
        department: 'AV & Media Facilities Services',
      },
      createdAt: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
      assignedAt: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      dueDate: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      attachments: [],
      activities: [
        {
          id: 'act-1054-1',
          ticketId: 'T-1054',
          type: 'STATUS_CHANGE',
          author: { id: 'tech-101', name: 'Dave Miller', role: 'TECHNICIAN' },
          timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          content: 'Started work: measured voltage output from 0-10V dimming driver.',
          metadata: { oldStatus: 'ASSIGNED', newStatus: 'IN_PROGRESS' },
        },
        {
          id: 'act-1054-2',
          ticketId: 'T-1054',
          type: 'RESOLUTION',
          author: { id: 'tech-101', name: 'Dave Miller', role: 'TECHNICIAN' },
          timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          content:
            'Replaced degraded Lutron constant-current LED driver module. Tested illumination at full brightness and 50% dimmed; zero flicker detected.',
          metadata: { oldStatus: 'IN_PROGRESS', newStatus: 'RESOLVED' },
        },
      ],
      resolution: {
        resolvedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        resolvedBy: 'Dave Miller (AV & Facilities Specialist)',
        resolutionDescription:
          'Diagnosed faulty driver circuit with capacitor breakdown causing 120Hz strobe ripple.',
        workPerformed:
          'Installed new universal 54W 0-10V programmable LED driver. Re-terminated low-voltage control harness, calibrated light sensor lux threshold.',
        materialsUsed: '1x MeanWell / Lutron 54W LED Driver #LCM-60, 4x Wago 221 lever nuts',
        additionalNotes: 'Fixture checked and operational with zero noise or optical flicker.',
      },
    },
    {
      id: 'T-1048',
      title: 'Server Room Magnetic Lock Release Alignment',
      description:
        'Electronic strike card reader activates correctly, but magnetic door shear lock does not release without heavy physical push. Risk of getting trapped.',
      category: 'Structural & Doors',
      priority: 'CRITICAL',
      status: 'CLOSED',
      location: {
        building: 'Engineering Hall',
        room: 'Server Room 201',
        floor: '2nd Floor',
        campusZone: 'South Engineering Complex',
      },
      reporter: {
        id: 'rep-71100',
        name: 'Mark Evans',
        email: 'm.evans@univ.edu',
        role: 'Staff / IT Systems Admin',
      },
      assignedTechnician: {
        id: 'tech-101',
        name: 'Dave Miller',
        email: 'd.miller@campus.edu',
        department: 'AV & Media Facilities Services',
      },
      createdAt: new Date(Date.now() - 140 * 3600 * 1000).toISOString(),
      assignedAt: new Date(Date.now() - 130 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      attachments: [],
      activities: [],
      resolution: {
        resolvedAt: new Date(Date.now() - 80 * 3600 * 1000).toISOString(),
        resolvedBy: 'Dave Miller',
        resolutionDescription: 'Realigned electromagnetic armature plate and adjusted door closer latch speed.',
        workPerformed: 'Replaced binding bracket screws, cleaned contact poles, tested 30 card-key swipe release cycles.',
        materialsUsed: 'Armature adjustment kit, Loctite threadlocker',
      },
    },
  ];

  static getTickets(): Ticket[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.saveTickets(this.initialTickets);
      return this.initialTickets;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return this.initialTickets;
    }
  }

  static saveTickets(tickets: Ticket[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }

  static getTicketById(id: string): Ticket | undefined {
    return this.getTickets().find((t) => t.id.toLowerCase() === id.toLowerCase());
  }

  static filterTickets(options: TicketFilterOptions): PaginatedTicketsResponse {
    let list = this.getTickets();

    // 1. Search text filter
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.location.building.toLowerCase().includes(q) ||
          (t.location.room && t.location.room.toLowerCase().includes(q)) ||
          t.reporter.name.toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (options.status && options.status !== 'ALL') {
      list = list.filter((t) => t.status === options.status);
    }

    // 3. Priority filter
    if (options.priority && options.priority !== 'ALL') {
      list = list.filter((t) => t.priority === options.priority);
    }

    // 4. Category filter
    if (options.category && options.category !== 'ALL') {
      list = list.filter((t) => t.category === options.category);
    }

    // 5. Building filter
    if (options.building && options.building !== 'ALL') {
      list = list.filter((t) => t.location.building.toLowerCase() === options.building?.toLowerCase());
    }

    // Sort order
    list.sort((a, b) => {
      if (options.sortBy === 'priority') {
        const priorityWeight: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        return options.sortOrder === 'asc' ? -diff : diff;
      }
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return options.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const total = list.length;
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paginated = list.slice(start, start + pageSize);

    return {
      tickets: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  static getDashboardStats(): TechnicianDashboardStats {
    const list = this.getTickets();

    const assigned = list.filter((t) => t.status === 'ASSIGNED').length;
    const inProgress = list.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = list.filter((t) => t.status === 'RESOLVED').length;
    const closed = list.filter((t) => t.status === 'CLOSED').length;
    const highPriority = list.filter((t) => t.priority === 'HIGH' || t.priority === 'CRITICAL').length;

    const criticalCount = list.filter((t) => t.priority === 'CRITICAL').length;
    const highCount = list.filter((t) => t.priority === 'HIGH').length;
    const mediumCount = list.filter((t) => t.priority === 'MEDIUM').length;
    const lowCount = list.filter((t) => t.priority === 'LOW').length;

    return {
      totalAssigned: list.length,
      newAssigned: assigned,
      inProgress,
      resolved,
      closed,
      highPriority,
      avgResolutionHours: 4.2,
      slaComplianceRate: 94,
      priorityCounts: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      statusCounts: {
        assigned,
        inProgress,
        resolved,
        closed,
      },
    };
  }

  static updateTicketStatus(
    id: string,
    newStatus: TicketStatus,
    authorName: string = 'Dave Miller',
    note?: string
  ): Ticket {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Ticket with ID ${id} not found.`);
    }

    const currentTicket = tickets[index];
    const oldStatus = currentTicket.status;

    const updatedActivities = [...(currentTicket.activities || [])];
    const newActivity: TicketActivity = {
      id: `act-${Date.now()}`,
      ticketId: currentTicket.id,
      type: 'STATUS_CHANGE',
      author: {
        id: 'tech-101',
        name: authorName,
        role: 'TECHNICIAN',
        department: 'AV & Facilities Services',
      },
      timestamp: new Date().toISOString(),
      content: note || `Status transitioned from ${oldStatus.replace('_', ' ')} to ${newStatus.replace('_', ' ')}.`,
      metadata: { oldStatus, newStatus },
    };
    updatedActivities.push(newActivity);

    const updatedTicket: Ticket = {
      ...currentTicket,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      activities: updatedActivities,
    };

    tickets[index] = updatedTicket;
    this.saveTickets(tickets);
    return updatedTicket;
  }

  static addWorkNote(
    id: string,
    content: string,
    noteType: WorkNoteType = 'GENERAL',
    authorName: string = 'Dave Miller'
  ): Ticket {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Ticket with ID ${id} not found.`);
    }

    const currentTicket = tickets[index];
    const updatedActivities = [...(currentTicket.activities || [])];

    const newActivity: TicketActivity = {
      id: `act-${Date.now()}`,
      ticketId: currentTicket.id,
      type: 'WORK_NOTE',
      noteType,
      author: {
        id: 'tech-101',
        name: authorName,
        role: 'TECHNICIAN',
        department: 'AV & Facilities Services',
      },
      timestamp: new Date().toISOString(),
      content,
    };
    updatedActivities.push(newActivity);

    const updatedTicket: Ticket = {
      ...currentTicket,
      updatedAt: new Date().toISOString(),
      activities: updatedActivities,
    };

    tickets[index] = updatedTicket;
    this.saveTickets(tickets);
    return updatedTicket;
  }

  static resolveTicket(
    id: string,
    resolution: Omit<TicketResolution, 'resolvedAt' | 'resolvedBy'>,
    authorName: string = 'Dave Miller'
  ): Ticket {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Ticket with ID ${id} not found.`);
    }

    const currentTicket = tickets[index];
    const fullResolution: TicketResolution = {
      ...resolution,
      resolvedAt: new Date().toISOString(),
      resolvedBy: `${authorName} (Facilities Technician)`,
    };

    const updatedActivities = [...(currentTicket.activities || [])];
    const newActivity: TicketActivity = {
      id: `act-${Date.now()}`,
      ticketId: currentTicket.id,
      type: 'RESOLUTION',
      author: {
        id: 'tech-101',
        name: authorName,
        role: 'TECHNICIAN',
      },
      timestamp: new Date().toISOString(),
      content: `Work completed and marked as RESOLVED. Work Performed: ${resolution.workPerformed}`,
      metadata: {
        oldStatus: currentTicket.status,
        newStatus: 'RESOLVED',
        materials: resolution.materialsUsed,
      },
    };
    updatedActivities.push(newActivity);

    const updatedTicket: Ticket = {
      ...currentTicket,
      status: 'RESOLVED',
      updatedAt: new Date().toISOString(),
      resolution: fullResolution,
      activities: updatedActivities,
    };

    tickets[index] = updatedTicket;
    this.saveTickets(tickets);
    return updatedTicket;
  }

  static addAttachment(
    id: string,
    attachment: Omit<TicketAttachment, 'id' | 'uploadedAt'>,
    authorName: string = 'Dave Miller'
  ): Ticket {
    const tickets = this.getTickets();
    const index = tickets.findIndex((t) => t.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new Error(`Ticket with ID ${id} not found.`);
    }

    const currentTicket = tickets[index];
    const newAttachment: TicketAttachment = {
      ...attachment,
      id: `att-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };

    const updatedAttachments = [...(currentTicket.attachments || []), newAttachment];

    const updatedActivities = [...(currentTicket.activities || [])];
    updatedActivities.push({
      id: `act-${Date.now()}`,
      ticketId: currentTicket.id,
      type: 'EVIDENCE_UPLOAD',
      author: {
        id: 'tech-101',
        name: authorName,
        role: 'TECHNICIAN',
      },
      timestamp: new Date().toISOString(),
      content: `Uploaded work evidence file: ${attachment.fileName} (${attachment.fileSize}).`,
      metadata: {
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
      },
    });

    const updatedTicket: Ticket = {
      ...currentTicket,
      updatedAt: new Date().toISOString(),
      attachments: updatedAttachments,
      activities: updatedActivities,
    };

    tickets[index] = updatedTicket;
    this.saveTickets(tickets);
    return updatedTicket;
  }
}
