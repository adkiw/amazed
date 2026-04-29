from app.db.session import SessionLocal
from app.models.user import User


def run():
    db = SessionLocal()
    if not db.query(User).filter_by(email='demo@example.com').first():
        db.add(User(email='demo@example.com', name='Demo', password_hash='demo'))
        db.commit()
    db.close()


if __name__ == '__main__':
    run()
