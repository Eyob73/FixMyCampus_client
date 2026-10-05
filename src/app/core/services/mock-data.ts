import { User } from '../models/user.model';
import { Ticket } from '../models/ticket.model';
import { AppNotification } from '../models/notification.model';

export const CURRENT_REPORTER: User = {
  id: 'usr-reporter-101',
  name: 'Alex Chen',
  email: 'alex.chen@university.edu',
  phone: '(555) 392-8419',
  role: 'reporter',
  affiliation: 'Student / Undergraduate (Junior)',
  departmentOrHall: 'North Residential Hall, Room 204B',
  accountStatus: 'verified',
  createdAt: '2025-08-20T09:00:00.000Z',
  notificationPreferences: {
    email: true,
    ticketStatusChanges: true,
    ticketComments: true,
    campusAlerts: false
  }
};

export const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'T-1082',
    reporterId: 'usr-reporter-101',
    reporterName: 'Alex Chen',
    reporterEmail: 'alex.chen@university.edu',
    title: 'Broken Projector Equipment',
    description: 'The ceiling projector in Lab 302 flickers continuously and emits a red lamp warning indicator. It shuts off automatically after 5 minutes of operation.',
    category: 'Equipment',
    building: 'Science Building',
    room: 'Lab 302',
    priority: 'high',
    status: 'in_progress',
    assignedTechnician: {
      id: 'tech-201',
      name: 'Marcus Vance',
      specialty: 'AV & Electronic Systems',
      phone: '(555) 482-1940'
    },
    attachments: [
      {
        id: 'att-1',
        name: 'projector_error_light.jpg',
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        sizeBytes: 1420000,
        type: 'image/jpeg',
        uploadedAt: '2026-10-24T09:14:00.000Z'
      }
    ],
    comments: [
      {
        id: 'c-1',
        ticketId: 'T-1082',
        authorId: 'tech-201',
        authorName: 'Marcus Vance',
        authorRole: 'technician',
        content: 'I have tested the ballast unit. A replacement bulb module has been requested from Central Facilities inventory and should arrive by 2:00 PM.',
        createdAt: '2026-10-24T11:30:00.000Z'
      },
      {
        id: 'c-2',
        ticketId: 'T-1082',
        authorId: 'usr-reporter-101',
        authorName: 'Alex Chen',
        authorRole: 'reporter',
        content: 'Thank you Marcus! The physics seminar starts tomorrow morning at 9:00 AM so having it running by then would be wonderful.',
        createdAt: '2026-10-24T12:05:00.000Z'
      }
    ],
    activities: [
      {
        id: 'act-1',
        ticketId: 'T-1082',
        type: 'STATUS_CHANGE',
        content: 'Issue reported by Alex Chen via Reporter Portal.',
        author: {
          id: 'u-1',
          name: 'Alex Chen',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-24T08:45:00.000Z'
      },
      {
        id: 'act-2',
        ticketId: 'T-1082',
        type: 'STATUS_CHANGE',
        content: 'Assigned to Marcus Vance (AV & Electronic Systems).',
        author: {
          id: 'u-1',
          name: 'Facilities Dispatch',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-24T09:30:00.000Z'
      },
      {
        id: 'act-3',
        ticketId: 'T-1082',
        type: 'STATUS_CHANGE',
        content: 'Diagnostic completed on projector ballast and power circuit.',
        author: {
          id: 'u-1',
          name: 'Marcus Vance',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-24T11:15:00.000Z'
      }
    ],
    additionalDetails: 'Lab is open between 8:00 AM and 6:00 PM on weekdays.',
    createdAt: '2026-10-24T08:45:00.000Z',
    updatedAt: '2026-10-24T11:30:00.000Z'
  },
  {
    id: 'T-1079',
    reporterId: 'usr-reporter-101',
    reporterName: 'Alex Chen',
    reporterEmail: 'alex.chen@university.edu',
    title: 'Water Leak Under Sink',
    description: 'Noticeable water pooling inside the lower cabinet of the student kitchen sink. Appears to be dripping from the PVC P-trap pipe joiner.',
    category: 'Plumbing',
    building: 'Student Union',
    room: 'Room 114 (Kitchenette)',
    priority: 'high',
    status: 'assigned',
    assignedTechnician: {
      id: 'tech-205',
      name: 'Dave Morrison',
      specialty: 'Master Plumber',
      phone: '(555) 781-9921'
    },
    attachments: [],
    comments: [
      {
        id: 'c-3',
        ticketId: 'T-1079',
        authorId: 'tech-205',
        authorName: 'Dave Morrison',
        authorRole: 'technician',
        content: 'Placed a catch basin under the sink temporarily. Will bring replacement pipe fittings today at 3:30 PM.',
        createdAt: '2026-10-23T14:10:00.000Z'
      }
    ],
    activities: [
      {
        id: 'act-4',
        ticketId: 'T-1079',
        type: 'STATUS_CHANGE',
        content: 'Reported by Alex Chen.',
        author: {
          id: 'u-1',
          name: 'Alex Chen',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-23T10:15:00.000Z'
      },
      {
        id: 'act-5',
        ticketId: 'T-1079',
        type: 'STATUS_CHANGE',
        content: 'Dispatched to Campus Facilities Plumbing Unit.',
        author: {
          id: 'u-1',
          name: 'Dispatcher Sarah',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-23T11:00:00.000Z'
      }
    ],
    additionalDetails: 'Temporary bucket was placed underneath.',
    createdAt: '2026-10-23T10:15:00.000Z',
    updatedAt: '2026-10-23T14:10:00.000Z'
  },
  {
    id: 'T-1071',
    reporterId: 'usr-reporter-101',
    reporterName: 'Alex Chen',
    reporterEmail: 'alex.chen@university.edu',
    title: 'Blown Ceiling Light Fixture',
    description: 'The primary ceiling fluorescent ballast tube in dorm room 204B blew out yesterday night. It buzzes loudly when switched on and does not ignite.',
    category: 'Electrical',
    building: 'North Residential Hall',
    room: 'Room 204B',
    priority: 'medium',
    status: 'new',
    attachments: [],
    comments: [],
    activities: [
      {
        id: 'act-6',
        ticketId: 'T-1071',
        type: 'STATUS_CHANGE',
        content: 'Submitted via FixMyCampus Reporter portal.',
        author: {
          id: 'u-1',
          name: 'Alex Chen',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-22T18:20:00.000Z'
      }
    ],
    additionalDetails: 'Resident will be in class until 4 PM.',
    createdAt: '2026-10-22T18:20:00.000Z',
    updatedAt: '2026-10-22T18:20:00.000Z'
  },
  {
    id: 'T-1065',
    reporterId: 'usr-reporter-101',
    reporterName: 'Alex Chen',
    reporterEmail: 'alex.chen@university.edu',
    title: 'Wi-Fi Signal Dropping Repeatedly',
    description: 'Eduroam and CampusGuest wireless signal is dropping constantly on the 2nd Floor study lounge corner near the window bays.',
    category: 'Network & Wi-Fi',
    building: 'University Library',
    room: '2nd Floor Study',
    priority: 'medium',
    status: 'resolved',
    assignedTechnician: {
      id: 'tech-209',
      name: 'Elena Rostova',
      specialty: 'Campus IT & Wireless Infrastructure'
    },
    attachments: [],
    comments: [
      {
        id: 'c-4',
        ticketId: 'T-1065',
        authorId: 'tech-209',
        authorName: 'Elena Rostova',
        authorRole: 'technician',
        content: 'Access point AP-LIB-2E had an overheating PoE port. Port was reset and firmware updated. Signal verified at 94 Mbps.',
        createdAt: '2026-10-19T16:00:00.000Z'
      }
    ],
    activities: [
      {
        id: 'act-7',
        ticketId: 'T-1065',
        type: 'STATUS_CHANGE',
        content: 'Reported by Alex Chen.',
        author: {
          id: 'u-1',
          name: 'Alex Chen',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-19T09:10:00.000Z'
      },
      {
        id: 'act-8',
        ticketId: 'T-1065',
        type: 'STATUS_CHANGE',
        content: 'Network Operations triage.',
        author: {
          id: 'u-1',
          name: 'IT Operations',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-19T10:00:00.000Z'
      },
      {
        id: 'act-9',
        ticketId: 'T-1065',
        type: 'STATUS_CHANGE',
        content: 'Remote telemetry and port testing conducted.',
        author: {
          id: 'u-1',
          name: 'Elena Rostova',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-19T14:30:00.000Z'
      },
      {
        id: 'act-10',
        ticketId: 'T-1065',
        type: 'STATUS_CHANGE',
        content: 'Firmware updated and verified with RF spectrum analyzer.',
        author: {
          id: 'u-1',
          name: 'Elena Rostova',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-19T16:15:00.000Z'
      }
    ],
    createdAt: '2026-10-19T09:10:00.000Z',
    updatedAt: '2026-10-19T16:15:00.000Z',
    resolvedAt: '2026-10-19T16:15:00.000Z'
  },
  {
    id: 'T-1058',
    reporterId: 'usr-reporter-101',
    reporterName: 'Alex Chen',
    reporterEmail: 'alex.chen@university.edu',
    title: 'Broken Desk Chair Armrest',
    description: 'Armrest on the wheeled seminar chair has broken off at the weld, exposing a sharp metal edge in Row 3.',
    category: 'Furniture',
    building: 'Engineering Annex',
    room: 'Lecture Hall A',
    priority: 'low',
    status: 'resolved',
    assignedTechnician: {
      id: 'tech-203',
      name: 'Carlos Mendez',
      specialty: 'Carpentry & Furniture'
    },
    attachments: [],
    comments: [
      {
        id: 'c-5',
        ticketId: 'T-1058',
        authorId: 'tech-203',
        authorName: 'Carlos Mendez',
        authorRole: 'technician',
        content: 'Damaged chair replaced with a standard ergonomic task chair from surplus inventory.',
        createdAt: '2026-10-15T15:20:00.000Z'
      }
    ],
    activities: [
      {
        id: 'act-11',
        ticketId: 'T-1058',
        type: 'STATUS_CHANGE',
        content: 'Reported by Alex Chen.',
        author: {
          id: 'u-1',
          name: 'Alex Chen',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-15T11:00:00.000Z'
      },
      {
        id: 'act-12',
        ticketId: 'T-1058',
        type: 'STATUS_CHANGE',
        content: 'Replaced with surplus inventory chair.',
        author: {
          id: 'u-1',
          name: 'Carlos Mendez',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-15T15:20:00.000Z'
      }
    ],
    createdAt: '2026-10-15T11:00:00.000Z',
    updatedAt: '2026-10-15T15:20:00.000Z',
    resolvedAt: '2026-10-15T15:20:00.000Z'
  },
  {
    id: 'T-1052',
    reporterId: 'usr-reporter-101',
    reporterName: 'Alex Chen',
    reporterEmail: 'alex.chen@university.edu',
    title: 'Heating Unit Making Loud Whistling Noise',
    description: 'The perimeter radiator register creates high-pitch steam pressure whistle when building boiler starts up at 6 AM.',
    category: 'HVAC / Climate',
    building: 'North Residential Hall',
    room: 'Room 204B',
    priority: 'medium',
    status: 'closed',
    assignedTechnician: {
      id: 'tech-207',
      name: 'Bill Thornton',
      specialty: 'HVAC & Boilers'
    },
    attachments: [],
    comments: [],
    activities: [
      {
        id: 'act-13',
        ticketId: 'T-1052',
        type: 'STATUS_CHANGE',
        content: 'Reported by Alex Chen.',
        author: {
          id: 'u-1',
          name: 'Alex Chen',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-10T07:15:00.000Z'
      },
      {
        id: 'act-14',
        ticketId: 'T-1052',
        type: 'STATUS_CHANGE',
        content: 'Radiator air vent bleed valve replaced.',
        author: {
          id: 'u-1',
          name: 'Bill Thornton',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-11T13:40:00.000Z'
      },
      {
        id: 'act-15',
        ticketId: 'T-1052',
        type: 'STATUS_CHANGE',
        content: 'Inspection verified by Alex Chen and automatically closed.',
        author: {
          id: 'u-1',
          name: 'System',
          role: 'SYSTEM'
        },
        timestamp: '2026-10-13T10:00:00.000Z'
      }
    ],
    createdAt: '2026-10-10T07:15:00.000Z',
    updatedAt: '2026-10-13T10:00:00.000Z',
    resolvedAt: '2026-10-11T13:40:00.000Z',
    closedAt: '2026-10-13T10:00:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userId: 'usr-reporter-101',
    title: 'Technician Assigned',
    message: 'Dave Morrison was assigned to your plumbing request #T-1079.',
    type: 'ticket_assigned',
    ticketId: 'T-1079',
    read: false,
    createdAt: '2026-10-23T11:00:00.000Z'
  },
  {
    id: 'notif-2',
    userId: 'usr-reporter-101',
    title: 'Status Updated: In Progress',
    message: 'Marcus Vance started diagnostic work on #T-1082 (Broken Projector Equipment).',
    type: 'status_changed',
    ticketId: 'T-1082',
    read: false,
    createdAt: '2026-10-24T11:15:00.000Z'
  },
  {
    id: 'notif-3',
    userId: 'usr-reporter-101',
    title: 'New Response on Ticket',
    message: 'Marcus Vance posted a comment on ticket #T-1082 regarding lamp arrival time.',
    type: 'new_comment',
    ticketId: 'T-1082',
    read: false,
    createdAt: '2026-10-24T11:30:00.000Z'
  },
  {
    id: 'notif-4',
    userId: 'usr-reporter-101',
    title: 'Ticket Resolved',
    message: 'Your request #T-1065 (Wi-Fi Signal Dropping) has been marked as resolved.',
    type: 'ticket_resolved',
    ticketId: 'T-1065',
    read: true,
    createdAt: '2026-10-19T16:15:00.000Z'
  },
  {
    id: 'notif-5',
    userId: 'usr-reporter-101',
    title: 'Ticket Submitted Successfully',
    message: 'Your issue #T-1071 (Blown Ceiling Light Fixture) was registered with Campus Operations.',
    type: 'ticket_created',
    ticketId: 'T-1071',
    read: true,
    createdAt: '2026-10-22T18:20:00.000Z'
  },
  {
    id: 'notif-6',
    userId: 'usr-reporter-101',
    title: 'Ticket Closed',
    message: 'Ticket #T-1052 (Heating Unit Whistling) has been officially closed.',
    type: 'ticket_closed',
    ticketId: 'T-1052',
    read: true,
    createdAt: '2026-10-13T10:00:00.000Z'
  }
];

export const CAMPUS_BUILDINGS: string[] = [
  'Science Building',
  'Student Union',
  'North Residential Hall',
  'South Residential Hall',
  'University Library',
  'Engineering Annex',
  'Health Sciences Center',
  'Athletics Complex',
  'Humanities Hall',
  'Dining Hall & Campus Center'
];

export const TICKET_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'HVAC / Climate',
  'Equipment',
  'Furniture',
  'Structural & Doors',
  'Network & Wi-Fi',
  'Cleaning & Grounds',
  'Safety & Locks',
  'Other'
] as const;
