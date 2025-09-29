import type { N8nWorkflow, N8nExecution } from "./n8n-api";

export const mockN8nWorkflows: N8nWorkflow[] = [
  {
    id: "1",
    name: "Lead Processing - Facebook Ads",
    active: true,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:22:00Z",
    versionId: "v1.2",
    tags: ["leads", "facebook", "crm"],
    nodes: [
      {
        id: "webhook-1",
        name: "Facebook Lead Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "validate-1",
        name: "Validate Lead Data",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "crm-1",
        name: "Send to CRM",
        type: "n8n-nodes-base.hubspot",
        typeVersion: 1,
        position: [650, 300]
      },
      {
        id: "notify-1",
        name: "Slack Notification",
        type: "n8n-nodes-base.slack",
        typeVersion: 1,
        position: [850, 300]
      }
    ]
  },
  {
    id: "2",
    name: "Email Marketing - Follow Up",
    active: true,
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
    versionId: "v2.0",
    tags: ["email", "automation", "marketing"],
    nodes: [
      {
        id: "schedule-1",
        name: "Daily Schedule",
        type: "n8n-nodes-base.cron",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "query-1",
        name: "Query Database",
        type: "n8n-nodes-base.postgres",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "email-1",
        name: "Send Follow-up Email",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 1,
        position: [650, 300]
      }
    ]
  },
  {
    id: "3",
    name: "Customer Support Ticket",
    active: false,
    createdAt: "2024-01-08T14:20:00Z",
    updatedAt: "2024-01-12T11:30:00Z",
    versionId: "v1.0",
    tags: ["support", "tickets"],
    nodes: [
      {
        id: "webhook-2",
        name: "Contact Form Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "ticket-1",
        name: "Create Ticket",
        type: "n8n-nodes-base.zendesk",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "assign-1",
        name: "Auto-assign Agent",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [650, 300]
      }
    ]
  },
  {
    id: "4",
    name: "Data Backup & Sync",
    active: true,
    createdAt: "2024-01-05T08:00:00Z",
    updatedAt: "2024-01-19T20:15:00Z",
    versionId: "v1.5",
    tags: ["backup", "sync", "data"],
    nodes: [
      {
        id: "schedule-2",
        name: "Hourly Backup",
        type: "n8n-nodes-base.cron",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "export-1",
        name: "Export Data",
        type: "n8n-nodes-base.postgres",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "upload-1",
        name: "Upload to Cloud",
        type: "n8n-nodes-base.googleDrive",
        typeVersion: 1,
        position: [650, 300]
      },
      {
        id: "cleanup-1",
        name: "Cleanup Old Files",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [850, 300]
      }
    ]
  },
  {
    id: "5",
    name: "Social Media Monitor",
    active: true,
    createdAt: "2024-01-12T12:45:00Z",
    updatedAt: "2024-01-21T09:30:00Z",
    versionId: "v1.1",
    tags: ["social", "monitoring", "alerts"],
    nodes: [
      {
        id: "twitter-1",
        name: "Twitter Monitor",
        type: "n8n-nodes-base.twitter",
        typeVersion: 1,
        position: [250, 200]
      },
      {
        id: "instagram-1",
        name: "Instagram Monitor",
        type: "n8n-nodes-base.instagram",
        typeVersion: 1,
        position: [250, 400]
      },
      {
        id: "filter-1",
        name: "Filter Mentions",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "alert-1",
        name: "Send Alert",
        type: "n8n-nodes-base.telegram",
        typeVersion: 1,
        position: [650, 300]
      }
    ]
  },
  {
    id: "6",
    name: "Order Processing Pipeline",
    active: true,
    createdAt: "2024-01-03T16:20:00Z",
    updatedAt: "2024-01-17T13:10:00Z",
    versionId: "v2.3",
    tags: ["orders", "payment", "fulfillment"],
    nodes: [
      {
        id: "webhook-3",
        name: "Order Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "payment-1",
        name: "Process Payment",
        type: "n8n-nodes-base.stripe",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "inventory-1",
        name: "Update Inventory",
        type: "n8n-nodes-base.airtable",
        typeVersion: 1,
        position: [650, 300]
      },
      {
        id: "shipping-1",
        name: "Create Shipping Label",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [850, 300]
      },
      {
        id: "notify-2",
        name: "Customer Notification",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 1,
        position: [1050, 300]
      }
    ]
  },
  {
    id: "7",
    name: "Survey Response Handler",
    active: false,
    createdAt: "2024-01-14T11:15:00Z",
    updatedAt: "2024-01-16T15:25:00Z",
    versionId: "v1.0",
    tags: ["survey", "feedback", "analysis"],
    nodes: [
      {
        id: "webhook-4",
        name: "Survey Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "analyze-1",
        name: "Analyze Response",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "store-1",
        name: "Store in Database",
        type: "n8n-nodes-base.postgres",
        typeVersion: 1,
        position: [650, 300]
      }
    ]
  },
  {
    id: "8",
    name: "Content Publishing Bot",
    active: true,
    createdAt: "2024-01-07T07:30:00Z",
    updatedAt: "2024-01-20T18:40:00Z",
    versionId: "v1.4",
    tags: ["content", "publishing", "automation"],
    nodes: [
      {
        id: "schedule-3",
        name: "Publishing Schedule",
        type: "n8n-nodes-base.cron",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "content-1",
        name: "Get Content",
        type: "n8n-nodes-base.notion",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "linkedin-1",
        name: "Post to LinkedIn",
        type: "n8n-nodes-base.linkedIn",
        typeVersion: 1,
        position: [650, 200]
      },
      {
        id: "twitter-2",
        name: "Post to Twitter",
        type: "n8n-nodes-base.twitter",
        typeVersion: 1,
        position: [650, 400]
      }
    ]
  },
  {
    id: "9",
    name: "Invoice Generation",
    active: true,
    createdAt: "2024-01-09T13:50:00Z",
    updatedAt: "2024-01-19T10:20:00Z",
    versionId: "v1.2",
    tags: ["invoicing", "billing", "accounting"],
    nodes: [
      {
        id: "trigger-1",
        name: "Monthly Trigger",
        type: "n8n-nodes-base.cron",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "clients-1",
        name: "Get Client Data",
        type: "n8n-nodes-base.postgres",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "invoice-1",
        name: "Generate Invoice",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [650, 300]
      },
      {
        id: "pdf-1",
        name: "Create PDF",
        type: "n8n-nodes-base.htmlToPdf",
        typeVersion: 1,
        position: [850, 300]
      },
      {
        id: "send-1",
        name: "Email Invoice",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 1,
        position: [1050, 300]
      }
    ]
  },
  {
    id: "10",
    name: "Website Health Monitor",
    active: true,
    createdAt: "2024-01-06T06:00:00Z",
    updatedAt: "2024-01-18T22:15:00Z",
    versionId: "v2.1",
    tags: ["monitoring", "uptime", "alerts"],
    nodes: [
      {
        id: "schedule-4",
        name: "Every 5 minutes",
        type: "n8n-nodes-base.cron",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "check-1",
        name: "Health Check",
        type: "n8n-nodes-base.httpRequest",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "condition-1",
        name: "Check Status",
        type: "n8n-nodes-base.if",
        typeVersion: 1,
        position: [650, 300]
      },
      {
        id: "alert-2",
        name: "Send Alert",
        type: "n8n-nodes-base.emailSend",
        typeVersion: 1,
        position: [850, 300]
      }
    ]
  },
  {
    id: "11",
    name: "Lead Scoring & Nurturing",
    active: false,
    createdAt: "2024-01-11T15:25:00Z",
    updatedAt: "2024-01-15T12:40:00Z",
    versionId: "v1.0",
    tags: ["scoring", "nurturing", "leads"],
    nodes: [
      {
        id: "webhook-5",
        name: "Lead Activity Webhook",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "score-1",
        name: "Calculate Score",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "segment-1",
        name: "Segment Lead",
        type: "n8n-nodes-base.switch",
        typeVersion: 1,
        position: [650, 300]
      },
      {
        id: "action-1",
        name: "Trigger Actions",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [850, 300]
      }
    ]
  },
  {
    id: "12",
    name: "Compliance & Audit Logger",
    active: true,
    createdAt: "2024-01-04T10:10:00Z",
    updatedAt: "2024-01-21T14:55:00Z",
    versionId: "v1.3",
    tags: ["compliance", "audit", "logging"],
    nodes: [
      {
        id: "webhook-6",
        name: "System Events",
        type: "n8n-nodes-base.webhook",
        typeVersion: 1,
        position: [250, 300]
      },
      {
        id: "validate-2",
        name: "Validate Event",
        type: "n8n-nodes-base.function",
        typeVersion: 1,
        position: [450, 300]
      },
      {
        id: "log-1",
        name: "Log to Audit Trail",
        type: "n8n-nodes-base.postgres",
        typeVersion: 1,
        position: [650, 300]
      },
      {
        id: "archive-1",
        name: "Archive to S3",
        type: "n8n-nodes-base.awsS3",
        typeVersion: 1,
        position: [850, 300]
      }
    ]
  }
];

export const mockN8nExecutions: Record<string, N8nExecution[]> = {
  "1": [
    {
      id: "exec-1-1",
      workflowId: "1",
      mode: "webhook",
      startedAt: "2024-01-21T10:15:00Z",
      stoppedAt: "2024-01-21T10:15:23Z",
      finished: true,
      status: "success"
    },
    {
      id: "exec-1-2",
      workflowId: "1",
      mode: "webhook",
      startedAt: "2024-01-21T09:45:00Z",
      stoppedAt: "2024-01-21T09:45:18Z",
      finished: true,
      status: "success"
    },
    {
      id: "exec-1-3",
      workflowId: "1",
      mode: "webhook",
      startedAt: "2024-01-21T09:12:00Z",
      stoppedAt: "2024-01-21T09:12:45Z",
      finished: true,
      status: "error"
    }
  ],
  "2": [
    {
      id: "exec-2-1",
      workflowId: "2",
      mode: "trigger",
      startedAt: "2024-01-21T08:00:00Z",
      stoppedAt: "2024-01-21T08:02:15Z",
      finished: true,
      status: "success"
    },
    {
      id: "exec-2-2",
      workflowId: "2",
      mode: "trigger",
      startedAt: "2024-01-20T08:00:00Z",
      stoppedAt: "2024-01-20T08:01:45Z",
      finished: true,
      status: "success"
    }
  ],
  // Add more mock executions as needed
};

export function getMockWorkflowStats(workflowId: string) {
  const executions = mockN8nExecutions[workflowId] || [];
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(e => e.status === 'success').length;
  const errorExecutions = executions.filter(e => e.status === 'error').length;
  const lastExecution = executions[0]?.startedAt;

  return {
    totalExecutions,
    successfulExecutions,
    errorExecutions,
    lastExecution
  };
}