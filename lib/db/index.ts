import { sql } from '@vercel/postgres';
import { Dashboard, WidgetConfig, WidgetLayout } from '@/types';

// User operations
export async function createUser(id: string, email: string, name?: string) {
  const result = await sql`
    INSERT INTO users (id, email, name)
    VALUES (${id}, ${email}, ${name || null})
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name
    RETURNING *
  `;
  return result.rows[0];
}

export async function getUser(id: string) {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`;
  return result.rows[0] || null;
}

// Dashboard operations
export async function getDashboardsByUser(userId: string): Promise<Dashboard[]> {
  const result = await sql`
    SELECT d.*, 
      COALESCE(
        json_agg(
          json_build_object(
            'id', w.id::text,
            'type', w.type,
            'title', w.title,
            'dataSource', w.data_source,
            'dataSourceConfig', w.params_json,
            'chartConfig', w.chart_config_json
          ) ORDER BY w.created_at
        ) FILTER (WHERE w.id IS NOT NULL),
        '[]'::json
      ) as widgets
    FROM dashboards d
    LEFT JOIN widgets w ON w.dashboard_id = d.id
    WHERE d.user_id = ${userId}
    GROUP BY d.id
    ORDER BY d.updated_at DESC
  `;

  return result.rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.title,
    description: row.description,
    isPublic: row.is_public,
    widgets: row.widgets || [],
    layout: row.layout_json || [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

export async function getDashboardById(id: string): Promise<Dashboard | null> {
  const result = await sql`
    SELECT d.*, 
      COALESCE(
        json_agg(
          json_build_object(
            'id', w.id::text,
            'type', w.type,
            'title', w.title,
            'dataSource', w.data_source,
            'dataSourceConfig', w.params_json,
            'chartConfig', w.chart_config_json
          ) ORDER BY w.created_at
        ) FILTER (WHERE w.id IS NOT NULL),
        '[]'::json
      ) as widgets
    FROM dashboards d
    LEFT JOIN widgets w ON w.dashboard_id = d.id
    WHERE d.id = ${id}
    GROUP BY d.id
  `;

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    userId: row.user_id,
    name: row.title,
    description: row.description,
    isPublic: row.is_public,
    widgets: row.widgets || [],
    layout: row.layout_json || [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function createDashboard(
  userId: string,
  title: string,
  description?: string
): Promise<string> {
  const result = await sql`
    INSERT INTO dashboards (user_id, title, description, layout_json)
    VALUES (${userId}, ${title}, ${description || null}, '[]'::jsonb)
    RETURNING id
  `;
  return result.rows[0].id;
}

export async function updateDashboard(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    isPublic: boolean;
    layout: WidgetLayout[];
  }>
) {
  const setClause: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    setClause.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    setClause.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.isPublic !== undefined) {
    setClause.push(`is_public = $${paramIndex++}`);
    values.push(updates.isPublic);
  }
  if (updates.layout !== undefined) {
    setClause.push(`layout_json = $${paramIndex++}`);
    values.push(JSON.stringify(updates.layout));
  }

  if (setClause.length === 0) return;

  setClause.push(`updated_at = NOW()`);
  values.push(id);

  await sql.query(
    `UPDATE dashboards SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
    values
  );
}

export async function deleteDashboard(id: string) {
  await sql`DELETE FROM dashboards WHERE id = ${id}`;
}

// Widget operations
export async function createWidget(
  dashboardId: string,
  widget: WidgetConfig
): Promise<string> {
  const result = await sql`
    INSERT INTO widgets (
      dashboard_id, type, title, data_source, 
      params_json, chart_config_json
    )
    VALUES (
      ${dashboardId}, 
      ${widget.type}, 
      ${widget.title}, 
      ${widget.dataSource},
      ${JSON.stringify(widget.dataSourceConfig)},
      ${JSON.stringify(widget.chartConfig)}
    )
    RETURNING id
  `;
  
  // Update dashboard's updated_at timestamp
  await sql`UPDATE dashboards SET updated_at = NOW() WHERE id = ${dashboardId}`;
  
  return result.rows[0].id;
}

export async function updateWidget(
  id: string,
  widget: Partial<WidgetConfig>
) {
  const setClause: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (widget.type !== undefined) {
    setClause.push(`type = $${paramIndex++}`);
    values.push(widget.type);
  }
  if (widget.title !== undefined) {
    setClause.push(`title = $${paramIndex++}`);
    values.push(widget.title);
  }
  if (widget.dataSource !== undefined) {
    setClause.push(`data_source = $${paramIndex++}`);
    values.push(widget.dataSource);
  }
  if (widget.dataSourceConfig !== undefined) {
    setClause.push(`params_json = $${paramIndex++}`);
    values.push(JSON.stringify(widget.dataSourceConfig));
  }
  if (widget.chartConfig !== undefined) {
    setClause.push(`chart_config_json = $${paramIndex++}`);
    values.push(JSON.stringify(widget.chartConfig));
  }

  if (setClause.length === 0) return;

  values.push(id);

  await sql.query(
    `UPDATE widgets SET ${setClause.join(', ')} WHERE id = $${paramIndex}`,
    values
  );
}

export async function deleteWidget(id: string) {
  // Get dashboard_id first to update its timestamp
  const result = await sql`SELECT dashboard_id FROM widgets WHERE id = ${id}`;
  if (result.rows.length > 0) {
    const dashboardId = result.rows[0].dashboard_id;
    await sql`DELETE FROM widgets WHERE id = ${id}`;
    await sql`UPDATE dashboards SET updated_at = NOW() WHERE id = ${dashboardId}`;
  }
}

export async function updateDashboardWidgets(
  dashboardId: string,
  widgets: WidgetConfig[],
  layout: WidgetLayout[]
) {
  await sql`BEGIN`;
  
  try {
    // Delete existing widgets
    await sql`DELETE FROM widgets WHERE dashboard_id = ${dashboardId}`;
    
    // Insert new widgets with their IDs preserved
    for (const widget of widgets) {
      await sql`
        INSERT INTO widgets (
          id, dashboard_id, type, title, data_source, 
          params_json, chart_config_json
        )
        VALUES (
          ${widget.id}::uuid,
          ${dashboardId}, 
          ${widget.type}, 
          ${widget.title}, 
          ${widget.dataSource},
          ${JSON.stringify(widget.dataSourceConfig)},
          ${JSON.stringify(widget.chartConfig)}
        )
      `;
    }
    
    // Update layout and timestamp
    await sql`
      UPDATE dashboards 
      SET layout_json = ${JSON.stringify(layout)}, updated_at = NOW()
      WHERE id = ${dashboardId}
    `;
    
    await sql`COMMIT`;
  } catch (error) {
    await sql`ROLLBACK`;
    throw error;
  }
}
