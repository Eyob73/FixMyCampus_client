import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  slaCritical = 4;
  slaHigh = 12;
  slaMedium = 48;
  slaLow = 120;

  emailAlerts = true;
  smsAlerts = true;
  autoDispatch = false;

  constructor(private notificationService: NotificationService) {}

  saveSettings(): void {
    this.notificationService.success('Settings Saved', 'Operational SLA and notification parameters updated.');
  }
}
