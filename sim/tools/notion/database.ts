import { ToolConfig, ToolResponse } from '../types'

export interface NotionDatabaseReadParams {
  databaseId: string
  apiKey: string
  filter?: any
  sorts?: any[]
  pageSize?: number
}

export interface NotionDatabaseWriteParams {
  databaseId: string
  apiKey: string
  properties: Record<string, any>
}

export interface NotionDatabaseUpdateParams {
  databaseId: string
  apiKey: string
  pageId: string
  properties: Record<string, any>
}

export interface NotionDatabaseResponse extends ToolResponse {
  output: {
    records: any[]
    nextCursor?: string
  }
}

export const notionDatabaseReadTool: ToolConfig<NotionDatabaseReadParams, NotionDatabaseResponse> =
  {
    id: 'notion_database_read',
    name: 'Notion Database Reader',
    description: 'Read records from a Notion database',
    version: '1.0.0',

    params: {
      databaseId: {
        type: 'string',
        required: true,
        requiredForToolCall: true,
        description: 'The ID of the Notion database to read from',
      },
      apiKey: {
        type: 'string',
        required: true,
        requiredForToolCall: true,
        description: 'Your Notion API key',
      },
      filter: {
        type: 'object',
        required: false,
        description: 'Filter conditions for the database query',
      },
      sorts: {
        type: 'array',
        required: false,
        description: 'Sort conditions for the database query',
      },
      pageSize: {
        type: 'number',
        required: false,
        description: 'Number of records to return per page',
      },
    },

    request: {
      url: (params: NotionDatabaseReadParams) => {
        const formattedId = params.databaseId.replace(
          /(.{8})(.{4})(.{4})(.{4})(.{12})/,
          '$1-$2-$3-$4-$5'
        )
        return `https://api.notion.com/v1/databases/${formattedId}/query`
      },
      method: 'POST',
      headers: (params: NotionDatabaseReadParams) => ({
        Authorization: `Bearer ${params.apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      }),
      body: (params: NotionDatabaseReadParams) => ({
        filter: params.filter,
        sorts: params.sorts,
        page_size: params.pageSize || 100,
      }),
    },

    transformResponse: async (response: Response) => {
      const data = await response.json()
      return {
        success: response.ok,
        output: {
          records: data.results || [],
          nextCursor: data.next_cursor,
        },
      }
    },

    transformError: (error) => {
      return error instanceof Error ? error.message : 'Failed to read from Notion database'
    },
  }

export const notionDatabaseWriteTool: ToolConfig<NotionDatabaseWriteParams, ToolResponse> = {
  id: 'notion_database_write',
  name: 'Notion Database Writer',
  description: 'Add a new record to a Notion database',
  version: '1.0.0',

  params: {
    databaseId: {
      type: 'string',
      required: true,
      requiredForToolCall: true,
      description: 'The ID of the Notion database to write to',
    },
    apiKey: {
      type: 'string',
      required: true,
      requiredForToolCall: true,
      description: 'Your Notion API key',
    },
    properties: {
      type: 'object',
      required: true,
      description: 'The properties to write to the database record',
    },
  },

  request: {
    url: (params: NotionDatabaseWriteParams) => {
      const formattedId = params.databaseId.replace(
        /(.{8})(.{4})(.{4})(.{4})(.{12})/,
        '$1-$2-$3-$4-$5'
      )
      return `https://api.notion.com/v1/pages`
    },
    method: 'POST',
    headers: (params: NotionDatabaseWriteParams) => ({
      Authorization: `Bearer ${params.apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    }),
    body: (params: NotionDatabaseWriteParams) => ({
      parent: {
        database_id: params.databaseId,
      },
      properties: params.properties,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()
    return {
      success: response.ok,
      output: {
        pageId: data.id,
        url: data.url,
      },
    }
  },

  transformError: (error) => {
    return error instanceof Error ? error.message : 'Failed to write to Notion database'
  },
}

export const notionDatabaseUpdateTool: ToolConfig<NotionDatabaseUpdateParams, ToolResponse> = {
  id: 'notion_database_update',
  name: 'Notion Database Updater',
  description: 'Update an existing record in a Notion database',
  version: '1.0.0',

  params: {
    databaseId: {
      type: 'string',
      required: true,
      requiredForToolCall: true,
      description: 'The ID of the Notion database containing the record',
    },
    apiKey: {
      type: 'string',
      required: true,
      requiredForToolCall: true,
      description: 'Your Notion API key',
    },
    pageId: {
      type: 'string',
      required: true,
      requiredForToolCall: true,
      description: 'The ID of the page to update',
    },
    properties: {
      type: 'object',
      required: true,
      description: 'The properties to update in the database record',
    },
  },

  request: {
    url: (params: NotionDatabaseUpdateParams) => {
      const formattedId = params.pageId.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5')
      return `https://api.notion.com/v1/pages/${formattedId}`
    },
    method: 'PATCH',
    headers: (params: NotionDatabaseUpdateParams) => ({
      Authorization: `Bearer ${params.apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    }),
    body: (params: NotionDatabaseUpdateParams) => ({
      properties: params.properties,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()
    return {
      success: response.ok,
      output: {
        pageId: data.id,
        url: data.url,
      },
    }
  },

  transformError: (error) => {
    return error instanceof Error ? error.message : 'Failed to update Notion database record'
  },
}
