"""Авторизация: регистрация, вход, выход, получение текущего пользователя. Action передаётся в теле запроса."""
import json
import os
import hashlib
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_user_by_token(conn, token: str):
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT u.id, u.name, u.email, u.role, u.created_at
            FROM sessions s JOIN users u ON s.user_id = u.id
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
        # GET — получить текущего пользователя по токену
        if method == 'GET':
            if not token:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'No token'})}
            user = get_user_by_token(conn, token)
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Invalid token'})}
            return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps({'user': dict(user), 'token': token}, default=str)}

        # DELETE — выход
        if method == 'DELETE':
            if token:
                with conn.cursor() as cur:
                    cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
                    conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        if method != 'POST':
            return {'statusCode': 405, 'headers': CORS, 'body': json.dumps({'error': 'Method not allowed'})}

        body = json.loads(event.get('body') or '{}')
        action = body.get('action')

        # POST action=register
        if action == 'register':
            name = (body.get('name') or '').strip()
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            if not name or not email or not password:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Заполни все поля'})}
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cur.fetchone():
                    return {'statusCode': 409, 'headers': CORS, 'body': json.dumps({'error': 'Email уже зарегистрирован'})}
                cur.execute(
                    "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id, name, email, role, created_at",
                    (name, email, hash_password(password))
                )
                user = dict(cur.fetchone())
                token_val = secrets.token_hex(32)
                cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (user['id'], token_val))
                conn.commit()
            return {'statusCode': 201, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps({'user': user, 'token': token_val}, default=str)}

        # POST action=login
        if action == 'login':
            email = (body.get('email') or '').strip().lower()
            password = body.get('password') or ''
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, name, email, role, created_at FROM users WHERE email = %s AND password_hash = %s",
                    (email, hash_password(password))
                )
                user = cur.fetchone()
                if not user:
                    return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Неверный email или пароль'})}
                user = dict(user)
                token_val = secrets.token_hex(32)
                cur.execute("INSERT INTO sessions (user_id, token) VALUES (%s, %s)", (user['id'], token_val))
                conn.commit()
            return {'statusCode': 200, 'headers': {**CORS, 'Content-Type': 'application/json'},
                    'body': json.dumps({'user': user, 'token': token_val}, default=str)}

        return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Unknown action'})}

    finally:
        conn.close()
