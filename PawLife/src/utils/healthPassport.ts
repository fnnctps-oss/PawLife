import { Dog, Injection, VetAppointment } from '../types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getVaccinationStatus(nextDueDate: string): { label: string; className: string } {
  const now = new Date();
  const due = new Date(nextDueDate);
  const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Overdue', className: 'status-overdue' };
  if (diffDays <= 30) return { label: 'Upcoming', className: 'status-upcoming' };
  return { label: 'Current', className: 'status-current' };
}

function calculateAge(dateOfBirth: string): string {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const years = now.getFullYear() - dob.getFullYear();
  const months = now.getMonth() - dob.getMonth();
  const totalMonths = years * 12 + months;

  if (totalMonths < 12) return `${totalMonths} month${totalMonths !== 1 ? 's' : ''} old`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (m === 0) return `${y} year${y !== 1 ? 's' : ''} old`;
  return `${y} year${y !== 1 ? 's' : ''}, ${m} month${m !== 1 ? 's' : ''} old`;
}

export function generateHealthPassportHTML(
  dog: Dog,
  injections: Injection[],
  vetAppointments: VetAppointment[],
  allergies: string[],
): string {
  const generatedDate = formatDate(new Date().toISOString());
  const dogAge = calculateAge(dog.dateOfBirth);

  const allergyRows = allergies.length > 0
    ? allergies.map((a) => `<li>${a}</li>`).join('')
    : '<li class="none">No known allergies</li>';

  const vaccinationRows = injections.length > 0
    ? injections
        .sort((a, b) => new Date(b.dateGiven).getTime() - new Date(a.dateGiven).getTime())
        .map((inj, i) => {
          const status = getVaccinationStatus(inj.nextDueDate);
          return `
            <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
              <td>${inj.vaccineName}</td>
              <td>${formatDate(inj.dateGiven)}</td>
              <td>${formatDate(inj.nextDueDate)}</td>
              <td>${inj.vetName}</td>
              <td><span class="badge ${status.className}">${status.label}</span></td>
            </tr>`;
        })
        .join('')
    : `<tr><td colspan="5" class="empty">No vaccination records</td></tr>`;

  const appointmentRows = vetAppointments.length > 0
    ? vetAppointments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((appt, i) => {
          return `
            <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
              <td>${formatDate(appt.date)}</td>
              <td>${appt.vetName}</td>
              <td>${appt.clinicName}</td>
              <td>${appt.reason}</td>
              <td>${appt.notes || '\u2014'}</td>
            </tr>`;
        })
        .join('')
    : `<tr><td colspan="5" class="empty">No appointment records</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Health Passport \u2014 ${dog.name}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #2D2D2D;
      background: #FFFFFF;
      line-height: 1.5;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .container {
      max-width: 700px;
      margin: 0 auto;
      padding: 0;
    }

    /* Header */
    .header {
      text-align: center;
      padding-bottom: 24px;
      border-bottom: 3px solid #FF8C42;
      margin-bottom: 28px;
    }

    .header .logo {
      font-size: 36px;
      margin-bottom: 4px;
    }

    .header h1 {
      font-size: 26px;
      font-weight: 700;
      color: #2D2D2D;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }

    .header .subtitle {
      font-size: 13px;
      color: #8E8E93;
    }

    /* Section */
    .section {
      margin-bottom: 28px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #FF8C42;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #F0EBE3;
      letter-spacing: -0.3px;
    }

    /* Dog profile grid */
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 32px;
    }

    .profile-item {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #F2F2F7;
    }

    .profile-label {
      font-weight: 600;
      color: #4A4A4A;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .profile-value {
      color: #2D2D2D;
      font-weight: 500;
    }

    /* Allergies */
    .allergy-list {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .allergy-list li {
      background: #FFE5E5;
      color: #CC3333;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .allergy-list li.none {
      background: #F2F2F7;
      color: #8E8E93;
      font-weight: 400;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }

    thead th {
      background: #FF8C42;
      color: #FFFFFF;
      font-weight: 600;
      text-align: left;
      padding: 10px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    thead th:first-child {
      border-radius: 8px 0 0 0;
    }

    thead th:last-child {
      border-radius: 0 8px 0 0;
    }

    tbody td {
      padding: 9px 12px;
      border-bottom: 1px solid #F2F2F7;
      vertical-align: top;
    }

    tbody tr.even {
      background: #FFFFFF;
    }

    tbody tr.odd {
      background: #FFF8F0;
    }

    tbody td.empty {
      text-align: center;
      color: #8E8E93;
      padding: 20px;
      font-style: italic;
    }

    /* Status badges */
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
    }

    .status-current {
      background: #E8F8EA;
      color: #2D8F3E;
    }

    .status-upcoming {
      background: #FFF3E0;
      color: #CC6D10;
    }

    .status-overdue {
      background: #FFE5E5;
      color: #CC3333;
    }

    /* Footer */
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1.5px solid #F0EBE3;
      text-align: center;
      color: #8E8E93;
      font-size: 11px;
    }

    .footer .brand {
      font-weight: 600;
      color: #FF8C42;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">\uD83D\uDC3E</div>
      <h1>Health Passport</h1>
      <div class="subtitle">Generated on ${generatedDate}</div>
    </div>

    <div class="section">
      <div class="section-title">Dog Profile</div>
      <div class="profile-grid">
        <div class="profile-item">
          <span class="profile-label">Name</span>
          <span class="profile-value">${dog.name}</span>
        </div>
        <div class="profile-item">
          <span class="profile-label">Breed</span>
          <span class="profile-value">${dog.breed}</span>
        </div>
        <div class="profile-item">
          <span class="profile-label">Date of Birth</span>
          <span class="profile-value">${formatDate(dog.dateOfBirth)}</span>
        </div>
        <div class="profile-item">
          <span class="profile-label">Age</span>
          <span class="profile-value">${dogAge}</span>
        </div>
        <div class="profile-item">
          <span class="profile-label">Weight</span>
          <span class="profile-value">${dog.weight} kg</span>
        </div>
        <div class="profile-item">
          <span class="profile-label">Gender</span>
          <span class="profile-value">${dog.gender === 'male' ? 'Male' : 'Female'}</span>
        </div>
        <div class="profile-item">
          <span class="profile-label">Color</span>
          <span class="profile-value">${dog.color}</span>
        </div>
        <div class="profile-item">
          <span class="profile-label">Microchip ID</span>
          <span class="profile-value">${dog.microchipId || 'Not recorded'}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Allergies</div>
      <ul class="allergy-list">
        ${allergyRows}
      </ul>
    </div>

    <div class="section">
      <div class="section-title">Vaccination History</div>
      <table>
        <thead>
          <tr>
            <th>Vaccine</th>
            <th>Date Given</th>
            <th>Next Due</th>
            <th>Vet</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${vaccinationRows}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Vet Appointments</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vet</th>
            <th>Clinic</th>
            <th>Reason</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${appointmentRows}
        </tbody>
      </table>
    </div>

    <div class="footer">
      Generated by <span class="brand">PawLife</span> &mdash; pawlife.app<br />
      ${generatedDate}
    </div>
  </div>
</body>
</html>`;
}
