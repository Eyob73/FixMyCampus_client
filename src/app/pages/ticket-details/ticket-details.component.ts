import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../core/services/ticket.service';
import { AuthService } from '../../core/services/auth.service';
import { Ticket, TicketAttachment } from '../../core/models/ticket.model';
import { StatusBadge } from '../../components/status-badge/status-badge';
import { TicketStatusTracker } from '../../components/ticket-status-tracker/ticket-status-tracker';
import { PageContainerComponent } from '../../layout/page-container/page-container';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    StatusBadge,
    TicketStatusTracker,
    PageContainerComponent
  ],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.css'
})
export class TicketDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private authService = inject(AuthService);

  ticket = signal<Ticket | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Comments
  newCommentText = signal<string>('');
  submittingComment = signal<boolean>(false);
  commentError = signal<string | null>(null);

  // Selected image for modal preview
  previewAttachment = signal<TicketAttachment | null>(null);

  currentUser = this.authService.currentUser;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadTicket(id);
      } else {
        this.error.set('No ticket ID specified.');
        this.loading.set(false);
      }
    });
  }

  loadTicket(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.ticketService.getTicketById(id).subscribe({
      next: (data) => {
        if (!data) {
          this.error.set(
            `Ticket #${id} could not be found or you do not have permission to access it.`
          );
        } else {
          this.ticket.set(data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to retrieve ticket information.');
        this.loading.set(false);
      }
    });
  }

  onAddComment(): void {
    const text = this.newCommentText().trim();
    const currentTicket = this.ticket();
    if (!text || !currentTicket) return;

    this.submittingComment.set(true);
    this.commentError.set(null);

    this.ticketService.addComment(currentTicket.id, text).subscribe({
      next: (comment) => {
        this.submittingComment.set(false);
        this.newCommentText.set('');

        // Update local ticket with new comment
        this.ticket.update((t) => {
          if (!t) return t;
          return {
            ...t,
            comments: [...t.comments, comment],
            updatedAt: new Date().toISOString()
          };
        });
      },
      error: () => {
        this.submittingComment.set(false);
        this.commentError.set('Could not send response. Please try again.');
      }
    });
  }

  openPreview(attachment: TicketAttachment): void {
    this.previewAttachment.set(attachment);
  }

  closePreview(): void {
    this.previewAttachment.set(null);
  }
}
