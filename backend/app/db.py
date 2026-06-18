import os
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# 시작 시 한 번만 커넥션 풀 생성 → 요청마다 재연결(~6초) 비용 제거
_pool = pool.ThreadedConnectionPool(
    minconn=1,
    maxconn=10,
    dsn=os.getenv("DATABASE_URL"),
)


def get_conn():
    """풀에서 커넥션을 빌려온다."""
    return _pool.getconn()


def put_conn(conn):
    """커넥션을 풀에 반납한다. 열린 트랜잭션이 있으면 정리."""
    if conn is None:
        return
    try:
        conn.rollback()  # SELECT 후 'idle in transaction' 상태 정리 (커밋된 쓰기에는 영향 없음)
    except Exception:
        pass
    try:
        _pool.putconn(conn)
    except Exception:
        pass
