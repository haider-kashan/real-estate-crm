import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendNaggingAlert(agentEmail: string, agentName: string, lead: any) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #dc2626;">🚨 OVERDUE ACTION REQUIRED</h2>
      <p>Hi ${agentName},</p>
      <p>Your scheduled follow-up with <strong>${lead.name}</strong> is completely overdue. You need to call them immediately.</p>
      <p style="background: #fee2e2; padding: 12px; border-radius: 6px; font-weight: bold; color: #991b1b;">
        Lead: ${lead.name} <br/>
        Phone: ${lead.phone} <br/>
        Due Date: ${new Date(lead.followUp).toLocaleDateString()}
      </p>
      <p>We will continue to send this alert until you update their status in the CRM.</p>
      <a href="${process.env.AUTH_URL}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"CRM Automations" <${process.env.SMTP_USER}>`,
    to: agentEmail,
    subject: `🚨 OVERDUE: Follow-up with ${lead.name}`,
    html,
  });
}

export async function sendHealthDropAlert(agentEmail: string, agentName: string, lead: any) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #ea580c;">📉 Lead Health Warning</h2>
      <p>Hi ${agentName},</p>
      <p>The lead <strong>${lead.name}</strong> has been sitting in your pipeline without any contact for over 7 days. Their engagement health is dropping.</p>
      <a href="${process.env.AUTH_URL}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Review Pipeline</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"CRM Automations" <${process.env.SMTP_USER}>`,
    to: agentEmail,
    subject: `📉 Lead Health Drop: ${lead.name}`,
    html,
  });
}

export async function sendFollowupReminder(agentEmail: string, agentName: string, lead: any) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #2563eb;">📅 Today's Follow-Up</h2>
      <p>Hi ${agentName},</p>
      <p>Just a reminder that you have a scheduled follow-up with <strong>${lead.name}</strong> today.</p>
      <p><strong>Phone:</strong> ${lead.phone}</p>
      <a href="${process.env.AUTH_URL}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Open Dashboard</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"CRM Automations" <${process.env.SMTP_USER}>`,
    to: agentEmail,
    subject: `📅 Reminder: Follow-up with ${lead.name} today`,
    html,
  });
}

export async function sendFollowupScheduledAlert(agentEmail: string, agentName: string, lead: any) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #10b981;">✅ Follow-Up Scheduled</h2>
      <p>Hi ${agentName},</p>
      <p>You have successfully scheduled a new follow-up for <strong>${lead.name}</strong>.</p>
      <p style="background: #ecfdf5; padding: 12px; border-radius: 6px; font-weight: bold; color: #065f46;">
        Lead: ${lead.name} <br/>
        Phone: ${lead.phone} <br/>
        Scheduled Date: ${new Date(lead.followUp).toLocaleString()}
      </p>
      <a href="${process.env.AUTH_URL}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">View Lead</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"CRM Automations" <${process.env.SMTP_USER}>`,
    to: agentEmail,
    subject: `✅ Follow-up Scheduled: ${lead.name}`,
    html,
  });
}

export async function sendDailyBriefing(agentEmail: string, agentName: string, todaysLeads: any[]) {
  if (todaysLeads.length === 0) return; // Don't send if nothing to do

  const leadItems = todaysLeads.map(l => `
    <li style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
      <strong>${l.name}</strong> (${l.type})<br/>
      <span style="color: #6b7280; font-size: 12px;">📞 ${l.phone}</span><br/>
      <span style="color: #6b7280; font-size: 12px;">⏰ Scheduled: ${new Date(l.followUp).toLocaleTimeString()}</span>
    </li>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #4f46e5;">🌅 Good Morning, ${agentName}!</h2>
      <p>Here is your daily briefing. You have <strong>${todaysLeads.length} follow-up(s)</strong> scheduled for today:</p>
      <ul style="list-style: none; padding: 0; margin: 20px 0;">
        ${leadItems}
      </ul>
      <a href="${process.env.AUTH_URL}" style="display: inline-block; background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Open CRM Dashboard</a>
    </div>
  `;

  await transporter.sendMail({
    from: `"CRM Automations" <${process.env.SMTP_USER}>`,
    to: agentEmail,
    subject: `🌅 Daily Briefing: ${todaysLeads.length} Follow-up(s) Today`,
    html,
  });
}
