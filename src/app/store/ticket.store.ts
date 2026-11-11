import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, finalize, catchError, of } from 'rxjs';
import { TicketService } from '../services/ticket.service';
import { Ticket, TechnicianDashboardStats, TicketStatus, CreateTicketDto } from '../models/ticket.model';
import { computed } from '@angular/core';

export interface TicketState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  currentStats: TechnicianDashboardStats | null;
  isLoading: boolean;
  lastUpdated: Date;
}

const initialState: TicketState = {
  tickets: [],
  selectedTicket: null,
  currentStats: null,
  isLoading: false,
  lastUpdated: new Date()
};

export const TicketStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ tickets }) => ({
    openTicketsCount: computed(() => tickets().filter(t => t.status === 'NEW').length),
    inProgressTicketsCount: computed(() => tickets().filter(t => t.status === 'IN_PROGRESS').length),
    resolvedTicketsCount: computed(() => tickets().filter(t => t.status === 'RESOLVED').length),
  })),
  withMethods((store, ticketService = inject(TicketService)) => {
    const mergeUpdatedTicket = (state: TicketState, updatedTicket: Ticket): Ticket => {
      const existing = state.selectedTicket?.id === updatedTicket.id
        ? state.selectedTicket
        : state.tickets.find(t => t.id === updatedTicket.id);

      const activityLog = updatedTicket.activityLog && updatedTicket.activityLog.length > 0
        ? updatedTicket.activityLog
        : (existing?.activityLog ?? []);

      return {
        ...updatedTicket,
        activityLog
      };
    };

    return {
    // Load all tickets
    loadTickets: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => ticketService.getTickets().pipe(
          tap((tickets) => patchState(store, { 
            tickets, 
            isLoading: false, 
            lastUpdated: new Date() 
          })),
          catchError(() => {
            patchState(store, { isLoading: false });
            return of([]);
          })
        ))
      )
    ),
    
    // Load my tickets
    loadMyTickets: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => ticketService.getMyTickets().pipe(
          tap((tickets) => patchState(store, { 
            tickets, 
            isLoading: false, 
            lastUpdated: new Date() 
          })),
          catchError(() => {
            patchState(store, { isLoading: false });
            return of([]);
          })
        ))
      )
    ),

    // Load a specific ticket by id
    loadTicketById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, selectedTicket: null })),
        switchMap((id) => ticketService.getTicketById(id).pipe(
          tap((ticket) => patchState(store, { selectedTicket: ticket, isLoading: false })),
          catchError(() => {
            patchState(store, { isLoading: false });
            return of(null);
          })
        ))
      )
    ),

    // Load dashboard stats
    loadDashboardStats: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => ticketService.getDashboardStats().pipe(
          tap((stats) => patchState(store, { 
            currentStats: stats, 
            isLoading: false, 
            lastUpdated: new Date() 
          })),
          catchError(() => {
            patchState(store, { isLoading: false });
            return of(null);
          })
        ))
      )
    ),

    // Create ticket
    createTicket: rxMethod<CreateTicketDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((dto) => ticketService.createTicket(dto).pipe(
          tap((newTicket) => patchState(store, (state) => ({
            tickets: [newTicket, ...state.tickets],
            isLoading: false,
            lastUpdated: new Date()
          }))),
          catchError(() => {
            patchState(store, { isLoading: false });
            return of(null);
          })
        ))
      )
    ),

    // Update ticket status
    updateTicketStatus: rxMethod<{ id: string; status: TicketStatus; note?: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, status, note }) => ticketService.updateStatus(id, status, note).pipe(
          tap((updatedTicket) => patchState(store, (state) => ({
            tickets: state.tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t),
            selectedTicket: state.selectedTicket?.id === updatedTicket.id ? updatedTicket : state.selectedTicket,
            isLoading: false,
            lastUpdated: new Date()
          }))),
          catchError((err) => {
            console.error('Update status failed:', err);
            patchState(store, { isLoading: false });
            return of(null);
          })
        ))
      )
    ),

    // Update ticket priority
    updatePriority: rxMethod<{ id: string; priority: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, priority }) => ticketService.updatePriority(id, priority).pipe(
          tap((updatedTicket) => patchState(store, (state) => ({
            tickets: state.tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t),
            selectedTicket: state.selectedTicket?.id === updatedTicket.id ? updatedTicket : state.selectedTicket,
            isLoading: false,
            lastUpdated: new Date()
          }))),
          catchError((err) => {
            console.error('Update priority failed:', err);
            patchState(store, { isLoading: false });
            return of(null);
          })
        ))
      )
    ),

    // Load technician tickets
    loadTechnicianTickets: rxMethod<any>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((options) => ticketService.getTechnicianTickets(options).pipe(
          tap((response) => patchState(store, { 
            tickets: response.tickets, 
            isLoading: false, 
            lastUpdated: new Date() 
          })),
          catchError(() => {
            patchState(store, { isLoading: false });
            return of(null);
          })
        ))
      )
    ),

    // Load technician ticket by ID
    loadTechnicianTicketById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, selectedTicket: null })),
        switchMap((id) => ticketService.getTechnicianTicketById(id).pipe(
          tap((ticket) => patchState(store, { selectedTicket: ticket, isLoading: false })),
          catchError(() => {
            patchState(store, { isLoading: false });
            return of(null);
          })
        ))
      )
    ),

    // Add comment
    addComment: rxMethod<{ ticketId: string; content: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ ticketId, content }) => ticketService.addComment(ticketId, content).pipe(
          switchMap(() => ticketService.getTicketById(ticketId)),
          tap((updatedTicket) => patchState(store, (state) => ({
            tickets: state.tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t),
            selectedTicket: state.selectedTicket?.id === updatedTicket.id ? updatedTicket : state.selectedTicket,
            isLoading: false,
            lastUpdated: new Date()
          }))),
          catchError(() => {
            patchState(store, { isLoading: false });
            return of(null);
          })
        ))
      )
    ),

    // Add internal operations note (admin-only, returns Observable without toggling full-page isLoading)
    addInternalNote: (ticketId: string, note: string) =>
      ticketService.addInternalNote(ticketId, note).pipe(
        tap((updatedTicket) =>
          patchState(store, (state) => {
            const merged = mergeUpdatedTicket(state, updatedTicket);
            return {
              tickets: state.tickets.map(t => t.id === merged.id ? merged : t),
              selectedTicket: state.selectedTicket?.id === merged.id ? merged : state.selectedTicket,
              lastUpdated: new Date()
            };
          })
        )
      ),

    // Merge an updated ticket into store state while preserving loaded activityLog
    upsertTicket: (updatedTicket: Ticket) => {
      patchState(store, (state) => {
        const merged = mergeUpdatedTicket(state, updatedTicket);
        return {
          tickets: state.tickets.some(t => t.id === merged.id)
            ? state.tickets.map(t => t.id === merged.id ? merged : t)
            : state.tickets,
          selectedTicket: state.selectedTicket?.id === merged.id ? merged : state.selectedTicket,
          lastUpdated: new Date()
        };
      });
    },

    // Assign Technician
    assignTechnician: rxMethod<{ id: string; techId: string; techName: string; techSpecialty: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, techId, techName, techSpecialty }) => ticketService.assignTechnician(id, techId, techName, techSpecialty).pipe(
          tap((updatedTicket) => patchState(store, (state) => ({
            tickets: state.tickets.map(t => t.id === updatedTicket.id ? updatedTicket : t),
            selectedTicket: state.selectedTicket?.id === updatedTicket.id ? updatedTicket : state.selectedTicket,
            isLoading: false,
            lastUpdated: new Date()
          }))),
          catchError((err) => {
            console.error('Assign technician failed:', err);
            patchState(store, { isLoading: false });
            return of(null);
          })
        ))
      )
    ),

    // Remove ticket (e.g. on soft delete)
    removeTicket: (ticketId: string) => {
      patchState(store, (state) => ({
        tickets: state.tickets.filter(t => t.id !== ticketId && t.ticketNumber !== ticketId),
        selectedTicket: state.selectedTicket?.id === ticketId || state.selectedTicket?.ticketNumber === ticketId
          ? null
          : state.selectedTicket,
        lastUpdated: new Date()
      }));
    },
  };
  })
);
