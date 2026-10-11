/**
 * DynamoStorageService — AWS DynamoDB persistence for GlideTherm shift plans.
 *
 * Used exclusively when DYNAMODB_TABLE_NAME is set (i.e. in the Lambda deployment).
 * The local Express server continues to use StorageService (JSON file).
 *
 * Table schema:
 *   PK  planId  (String)       — partition key
 *   Attributes: name, createdAt, updatedAt, planData (full JSON blob)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { ShiftPlan } from '../types/index.js';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME as string;
const REGION = process.env.AWS_REGION || 'ap-south-1';

let _client: DynamoDBDocumentClient | null = null;

function getClient(): DynamoDBDocumentClient {
  if (!_client) {
    const raw = new DynamoDBClient({ region: REGION });
    _client = DynamoDBDocumentClient.from(raw, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }
  return _client;
}

export class DynamoStorageService {
  public static async getSavedPlans(): Promise<ShiftPlan[]> {
    const client = getClient();
    const result = await client.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        ProjectionExpression: 'planData',
      })
    );
    const items = result.Items || [];
    const plans: ShiftPlan[] = items
      .map((item) => {
        try {
          return typeof item.planData === 'string'
            ? JSON.parse(item.planData)
            : (item.planData as ShiftPlan);
        } catch {
          return null;
        }
      })
      .filter(Boolean) as ShiftPlan[];
    // Sort newest first
    return plans.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public static async getSavedPlanById(id: string): Promise<ShiftPlan | null> {
    const client = getClient();
    const result = await client.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { planId: id },
      })
    );
    if (!result.Item) return null;
    try {
      return typeof result.Item.planData === 'string'
        ? JSON.parse(result.Item.planData)
        : (result.Item.planData as ShiftPlan);
    } catch {
      return null;
    }
  }

  public static async savePlan(plan: ShiftPlan): Promise<ShiftPlan> {
    const client = getClient();
    const now = new Date().toISOString();
    const updated: ShiftPlan = { ...plan, updatedAt: now };
    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          planId: plan.id,
          name: plan.name,
          locationId: plan.location?.id || '',
          createdAt: plan.createdAt || now,
          updatedAt: now,
          planData: JSON.stringify(updated),
        },
      })
    );
    return updated;
  }

  public static async deletePlan(id: string): Promise<boolean> {
    const client = getClient();
    // Check it exists first
    const existing = await this.getSavedPlanById(id);
    if (!existing) return false;
    await client.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { planId: id },
      })
    );
    return true;
  }
}
