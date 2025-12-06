// src/courses/search.repository.ts

import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_POOL } from '../../database/database.module';

@Injectable()
export class SearchRepository {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findCourses(params: {
    whereSQL: string;
    orderBySQL: string;
    queryParams: any[];
    limitIndex: number;
    offsetIndex: number;
  }) {
    const { whereSQL, orderBySQL, queryParams, limitIndex, offsetIndex } = params;

    const query = `
      SELECT 
        id, title, slug, description, thumbnail_url,
        access_type, status, student_count, tag,
        updated_at, category_id, instructor_id
      FROM courses
      ${whereSQL}
      ${orderBySQL}
      LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses
      ${whereSQL}
    `;

    const client = await this.pool.connect();
    try {
      const [items, count] = await Promise.all([
        client.query(query, queryParams),
        client.query(countQuery, queryParams.slice(0, -2)),
      ]);

      return {
        items: items.rows,
        total: Number(count.rows[0]?.total || 0),
      };
    } finally {
      client.release();
    }
  }
}
