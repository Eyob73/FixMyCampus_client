import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationStore } from '../../../store/notification.store';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  private notificationStore = inject(NotificationStore);

  slaCritical = 4;
  slaHigh = 12;
  slaMedium = 48;
  slaLow = 120;

  emailAlerts = true;
  smsAlerts = true;
  autoDispatch = false;

  saveSettings(): void {
    this.notificationStore.showToast({
      type: 'success',
      message: 'Operational SLA and notification parameters updated.'
    });
  }
}
