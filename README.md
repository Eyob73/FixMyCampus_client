# FixMyCampus — Campus Maintenance Tracking

FixMyCampus is a comprehensive issue tracking platform designed to bridge the gap between students (reporters) and campus administration (admins). It streamlines the process of reporting, assigning, and resolving campus maintenance complaints such as Wi-Fi dropouts, broken plumbing, and lighting failures.

## Team Members & Responsibilities

- [Name] — Team Lead & Pitch
- [Name] — Frontend Developer
- [Name] — Backend Developer
- [Name] — Database & Full-Stack Developer
- [Name] — QA & Testing

## Features and Workflows

The application provides distinct interfaces and workflows for different user roles:

### Reporter (Student/Staff)
- **Dashboard**: View campus feed and personal ticket summary.
- **Report Issue**: Submit new maintenance tickets with location (Building, Room), category, and detailed descriptions.
- **Track Status**: Monitor the progress of submitted tickets (New -> Assigned -> In Progress -> Resolved).
- **View History**: Access previously reported issues and their resolutions.

### Administrator
- **Admin Dashboard**: Overview of all campus tickets with advanced filtering.
- **Manage Problems**: Review reported issues and update their statuses.
- **Assign Technician**: Assign specific maintenance staff or technicians to open tickets.
- **View History**: Track the lifecycle and history of all maintenance requests.

## Tech Stack Used

- **Frontend**: Angular 22
- **Backend**: ASP.NET Core Web API (.NET 10)
- **Database**: Entity Framework Core with PostgreSQL

## How to Run Locally

### Backend Setup

1. Navigate to the backend API directory:
   ```bash
   cd FixMyCampus_API/FixMyCampus.Api
   ```
2. Restore .NET dependencies:
   ```bash
   dotnet restore
   ```
3. Update the database (ensure PostgreSQL is running and connection strings in `appsettings.json` are correct):
   ```bash
   dotnet ef database update
   ```
4. Run the API:
   ```bash
   dotnet run
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd FixMyCampus_client
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   ng serve
   ```
   Navigate to `http://localhost:4200/` in your browser.

## Test Accounts & Demo Credentials

- **Admin / Staff User**: admin@hackathon.local / Admin123!
- **Standard User**: user@hackathon.local / User123!
- **Technician User**: tech@hackathon.local / Technician123!

## Working Features

- User Authentication (Login) for Admin and Reporters.
- Reporter Dashboard displaying the campus feed and user's tickets.
- Issue Reporting form with category, building, and room selection.
- Admin Dashboard for viewing and filtering all tickets.
- Ticket assignment and status lifecycle (New -> Assigned -> In Progress -> Resolved).

