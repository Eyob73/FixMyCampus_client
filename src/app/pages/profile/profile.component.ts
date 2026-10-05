import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';
import { TicketStats } from '../../core/models/ticket.model';
import { PageContainerComponent } from '../../layout/page-container/page-container';
import { FormFieldComponent } from '../../components/form-field/form-field';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    PageContainerComponent,
    FormFieldComponent
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private ticketService = inject(TicketService);

  currentUser = this.authService.currentUser;
  stats = signal<TicketStats | null>(null);

  saving = signal<boolean>(false);
  saveSuccess = signal<string | null>(null);
  saveError = signal<string | null>(null);

  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(70)]],
    phone: [''],
    departmentOrHall: [''],
    affiliation: [''],
    emailNotifications: [true],
    statusNotifications: [true],
    commentNotifications: [true]
  });

  ngOnInit(): void {
    const user = this.currentUser();
    this.profileForm.patchValue({
      name: user.name,
      phone: user.phone || '',
      departmentOrHall: user.departmentOrHall || '',
      affiliation: user.affiliation || '',
      emailNotifications: user.notificationPreferences?.email ?? true,
      statusNotifications: user.notificationPreferences?.ticketStatusChanges ?? true,
      commentNotifications: user.notificationPreferences?.ticketComments ?? true
    });

    this.ticketService.getTicketStats().subscribe({
      next: (s) => this.stats.set(s)
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.saveSuccess.set(null);
    this.saveError.set(null);

    const val = this.profileForm.value;

    this.authService
      .updateProfile({
        name: val.name!,
        phone: val.phone || undefined,
        departmentOrHall: val.departmentOrHall || undefined,
        affiliation: val.affiliation || undefined,
        notificationPreferences: {
          email: !!val.emailNotifications,
          ticketStatusChanges: !!val.statusNotifications,
          ticketComments: !!val.commentNotifications,
          campusAlerts: false
        }
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saveSuccess.set('Your profile and contact preferences have been updated successfully.');
          setTimeout(() => this.saveSuccess.set(null), 4000);
        },
        error: () => {
          this.saving.set(false);
          this.saveError.set('Failed to update profile. Please try again.');
        }
      });
  }
}
