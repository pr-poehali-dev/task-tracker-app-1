"""CRUD задач: список, создание, обновление, удаление."""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-Task-Id',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_by_token(conn, token: str):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT u.id, u.name, u.email, u.role
            FROM sessions s JOIN users u ON s.user_id = u.id
            WHERE s.token = %s AND s.expires_at > NOW()
        """, (token,))
        return cur.fetchone()

def add_notification(conn, user_id: str, message: str, task_id: str = None):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO notifications (user_id, message, task_id) VALUES (%s, %s, %s)",
            (user_id, message, task_id)
        )

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    task_id_hdr = headers.get('X-Task-Id') or headers.get('x-task-id')

    conn = get_conn()
    try:
        user = get_user_by_token(conn, token) if token else None
        if not user:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}

        # GET /tasks — список всех задач
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT t.*, 
                        u1.name as assignee_name,
                        u2.name as created_by_name
                    FROM tasks t
                    LEFT JOIN users u1 ON t.assignee_id = u1.id
                    LEFT JOIN users u2 ON t.created_by_id = u2.id
                    ORDER BY t.created_at DESC
                """)
                tasks = [dict(r) for r in cur.fetchall()]
            return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps(tasks, default=str)}

        body = json.loads(event.get('body') or '{}')

        # POST /tasks — создать задачу
        if method == 'POST':
            title = (body.get('title') or '').strip()
            if not title:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Название обязательно'})}
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    INSERT INTO tasks (title, description, status, priority, assignee_id, created_by_id, tags)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                """, (
                    title,
                    body.get('description') or '',
                    body.get('status') or 'todo',
                    body.get('priority') or 'medium',
                    body.get('assignee_id') or None,
                    str(user['id']),
                    body.get('tags') or []
                ))
                task = dict(cur.fetchone())
                assignee_id = body.get('assignee_id')
                if assignee_id and assignee_id != str(user['id']):
                    add_notification(conn, assignee_id, f"Тебе назначена задача: «{title}»", str(task['id']))
                conn.commit()
            return {'statusCode': 201, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps(task, default=str)}

        # PUT — обновить задачу (id из заголовка X-Task-Id или body)
        if method == 'PUT':
            task_id = task_id_hdr or body.get('id')
            if not task_id:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'task id required'})}
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM tasks WHERE id = %s", (task_id,))
                existing = cur.fetchone()
                if not existing:
                    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Задача не найдена'})}

                fields = {}
                for f in ['title', 'description', 'status', 'priority', 'tags']:
                    if f in body:
                        fields[f] = body[f]
                if 'assignee_id' in body:
                    fields['assignee_id'] = body['assignee_id'] or None

                if not fields:
                    return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Нет полей для обновления'})}

                set_parts = ', '.join(f"{k} = %s" for k in fields)
                set_parts += ', updated_at = NOW()'
                vals = tuple(fields.values()) + (task_id,)
                cur.execute(f"UPDATE tasks SET {set_parts} WHERE id = %s RETURNING *", vals)
                task = dict(cur.fetchone())

                new_assignee = body.get('assignee_id')
                old_assignee = str(existing['assignee_id']) if existing['assignee_id'] else None
                if new_assignee and new_assignee != str(user['id']) and new_assignee != old_assignee:
                    add_notification(conn, new_assignee, f"Тебе переназначена задача: «{task['title']}»", task_id)
                if 'status' in body and existing['assignee_id'] and str(existing['assignee_id']) != str(user['id']):
                    status_map = {'todo': 'в очереди', 'inprogress': 'в работе', 'done': 'выполнена'}
                    label = status_map.get(body['status'], body['status'])
                    add_notification(conn, str(existing['assignee_id']),
                                     f"Статус задачи «{task['title']}» изменён: {label}", task_id)
                conn.commit()
            return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps(task, default=str)}

        # DELETE — удалить задачу (id из body)
        if method == 'DELETE':
            del_id = body.get('id') or task_id_hdr
            if not del_id:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id required'})}
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM tasks WHERE id = %s", (del_id,))
                if not cur.fetchone():
                    return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Задача не найдена'})}
                cur.execute("UPDATE notifications SET task_id = NULL WHERE task_id = %s", (del_id,))
                cur.execute("DELETE FROM tasks WHERE id = %s", (del_id,))
                conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()