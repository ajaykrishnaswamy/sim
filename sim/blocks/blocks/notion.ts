import { NotionIcon } from '@/components/icons'
import { NotionResponse } from '@/tools/notion/read'
import { BlockConfig } from '../types'

export const NotionBlock: BlockConfig<NotionResponse> = {
  type: 'notion',
  name: 'Notion',
  description: 'Read and write to Notion pages and databases',
  longDescription:
    'Integrate with Notion to read content from pages, write new content, or manage database records programmatically. Access and modify your Notion workspace directly from your workflow using the official API.',
  category: 'tools',
  bgColor: '#181C1E',
  icon: NotionIcon,
  subBlocks: [
    {
      id: 'operation',
      title: 'Operation',
      type: 'dropdown',
      layout: 'full',
      options: [
        { label: 'Read Page', id: 'read_notion' },
        { label: 'Write Page', id: 'write_notion' },
        { label: 'Read Database', id: 'read_database' },
        { label: 'Write Database', id: 'write_database' },
        { label: 'Update Database', id: 'update_database' },
      ],
    },
    {
      id: 'pageId',
      title: 'Page ID',
      type: 'short-input',
      layout: 'full',
      placeholder: 'Enter Notion page ID',
      condition: { field: 'operation', value: ['read_notion', 'write_notion'] },
    },
    {
      id: 'databaseId',
      title: 'Database ID',
      type: 'short-input',
      layout: 'full',
      placeholder: 'Enter Notion database ID',
      condition: {
        field: 'operation',
        value: ['read_database', 'write_database', 'update_database'],
      },
    },
    {
      id: 'content',
      title: 'Content',
      type: 'long-input',
      layout: 'full',
      placeholder: 'Enter content to write (for write operation)',
      condition: { field: 'operation', value: 'write_notion' },
    },
    {
      id: 'properties',
      title: 'Properties',
      type: 'long-input',
      layout: 'full',
      placeholder: 'Enter JSON properties for database operations',
      condition: { field: 'operation', value: ['write_database', 'update_database'] },
    },
    {
      id: 'filter',
      title: 'Filter',
      type: 'long-input',
      layout: 'full',
      placeholder: 'Enter JSON filter conditions for database query',
      condition: { field: 'operation', value: 'read_database' },
    },
    {
      id: 'sorts',
      title: 'Sorts',
      type: 'long-input',
      layout: 'full',
      placeholder: 'Enter JSON sort conditions for database query',
      condition: { field: 'operation', value: 'read_database' },
    },
    {
      id: 'pageSize',
      title: 'Page Size',
      type: 'number-input',
      layout: 'full',
      placeholder: 'Number of records to return (default: 100)',
      condition: { field: 'operation', value: 'read_database' },
    },
    {
      id: 'apiKey',
      title: 'API Key',
      type: 'short-input',
      layout: 'full',
      placeholder: 'Enter your Notion API key',
      password: true,
    },
  ],
  tools: {
    access: [
      'notion_read',
      'notion_write',
      'notion_database_read',
      'notion_database_write',
      'notion_database_update',
    ],
    config: {
      tool: (params) => {
        switch (params.operation) {
          case 'write_notion':
            return 'notion_write'
          case 'read_database':
            return 'notion_database_read'
          case 'write_database':
            return 'notion_database_write'
          case 'update_database':
            return 'notion_database_update'
          default:
            return 'notion_read'
        }
      },
    },
  },
  inputs: {
    pageId: { type: 'string', required: false },
    databaseId: { type: 'string', required: false },
    operation: { type: 'string', required: true },
    content: { type: 'string', required: false },
    properties: { type: 'string', required: false },
    filter: { type: 'string', required: false },
    sorts: { type: 'string', required: false },
    pageSize: { type: 'number', required: false },
    apiKey: { type: 'string', required: true },
  },
  outputs: {
    response: {
      type: {
        content: 'string',
        metadata: 'any',
        records: 'array',
        nextCursor: 'string',
        pageId: 'string',
        url: 'string',
      },
    },
  },
}
