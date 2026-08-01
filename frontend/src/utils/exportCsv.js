// Replace your existing exportCsv function with this:
export const exportCsv = (dataOverride = null) => {
  const data = dataOverride || {
    id: `EOD-${Date.now().toString().slice(-6)}`,
    cashierId: 'CASHIER-1',
    createdAt: new Date().toISOString(),
    totalCountedCash: typeof totalCountedCash !== 'undefined' ? totalCountedCash : 0,
    expectedSystemCash: typeof expectedSales !== 'undefined' ? expectedSales : 0,
    variance: typeof variance !== 'undefined' ? variance : 0,
    notes: 'End of Shift Audit',
  };

  const records = Array.isArray(data) ? data : [data];
  const reportDate = new Date().toLocaleDateString('en-PH', { dateStyle: 'medium' });
  const reportTime = new Date().toLocaleTimeString('en-PH', { timeStyle: 'short' });

  const htmlTable = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="text/vnd.ms-excel; charset=UTF-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; }
        .title { font-size: 18px; font-weight: bold; color: #1e293b; padding-bottom: 5px; }
        .subtitle { font-size: 12px; color: #64748b; margin-bottom: 15px; }
        
        table { border-collapse: collapse; width: 100%; font-size: 13px; }
        th { 
          background-color: #1e293b; 
          color: #ffffff; 
          font-weight: bold; 
          text-align: left; 
          padding: 10px 12px; 
          border: 1px solid #0f172a;
        }
        td { 
          padding: 8px 12px; 
          border: 1px solid #cbd5e1; 
          color: #334155;
          vertical-align: middle;
        }
        tr:nth-child(even) { background-color: #f8fafc; }
        .number { text-align: right; font-family: monospace; }
        .center { text-align: center; }
        
        .status-balanced { background-color: #dcfce7; color: #166534; font-weight: bold; text-align: center; }
        .status-shortage { background-color: #fee2e2; color: #991b1b; font-weight: bold; text-align: center; }
        .status-overage { background-color: #fef3c7; color: #92400e; font-weight: bold; text-align: center; }
      </style>
    </head>
    <body>
      <div class="title">End of Day Cash Reconciliation Report</div>
      <div class="subtitle">Generated on ${reportDate} at ${reportTime}</div>
      
      <table>
        <thead>
          <tr>
            <th>Audit ID</th>
            <th>Date</th>
            <th>Time</th>
            <th>Cashier ID</th>
            <th class="number">Counted Cash</th>
            <th class="number">Expected Cash</th>
            <th class="number">Variance</th>
            <th class="center">Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(r => {
            const varVal = r.variance ?? 0;
            const statusClass = varVal === 0 ? 'status-balanced' : varVal < 0 ? 'status-shortage' : 'status-overage';
            const statusText = varVal === 0 ? 'BALANCED' : varVal < 0 ? 'SHORTAGE' : 'OVERAGE';
            const itemDate = new Date(r.createdAt || Date.now());

            return `
              <tr>
                <td>${r.id || 'N/A'}</td>
                <td>${itemDate.toLocaleDateString('en-PH')}</td>
                <td>${itemDate.toLocaleTimeString('en-PH', { timeStyle: 'short' })}</td>
                <td>${r.cashierId || 'CASHIER-1'}</td>
                <td class="number">₱${(r.totalCountedCash ?? r.countedCash ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                <td class="number">₱${(r.expectedSystemCash ?? r.expectedCash ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                <td class="number" style="color: ${varVal < 0 ? '#dc2626' : varVal > 0 ? '#d97706' : '#16a34a'};">
                  ₱${varVal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </td>
                <td class="${statusClass}">${statusText}</td>
                <td>${r.notes || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  // File downloads as .xls so Excel/Sheets automatically displays full styling
  link.download = `Reconciliation_Report_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};