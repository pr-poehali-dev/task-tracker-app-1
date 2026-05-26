"""Уведомления: список и отметка прочитанными."""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_by_token(conn, token: str):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT u.id FROM sessions s JOIN users u ON s.user_id = u.id
            WHERE s.token = %s AND s.expires_at > NOW()
        """, (token,))
        return cur.fetchone()

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    conn = get_conn()
    try:
        user = get_user_by_token(conn, token) if token else None
        if not user:
            return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Unauthorized'})}

        user_id = str(user['id'])

        # GET — список уведомлений
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT * FROM notifications
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                    LIMIT 100
                """, (user_id,))
                notifs = [dict(r) for r in cur.fetchall()]
            return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps(notifs, default=str)}

        if method == 'PUT':
            body = json.loads(event.get('body') or '{}')

            # all=true — прочитать все
            if body.get('all'):
                with conn.cursor() as cur:
                    cur.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = %s", (user_id,))
                    conn.commit()
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

            # id — прочитать одно
            notif_id = body.get('id')
            if notif_id:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE notifications SET is_read = TRUE WHERE id = %s AND user_id = %s",
                        (notif_id, user_id)
                    )
                    conn.commit()
                return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

            return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id or all required'})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()