"""init

Revision ID: 0001
Revises:
Create Date: 2026-04-29
"""

from alembic import op
import sqlalchemy as sa

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_table('media_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('media_type', sa.String(length=32), nullable=False),
        sa.Column('source_url', sa.Text(), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('author_name', sa.String(length=255), nullable=True),
        sa.Column('file_hash', sa.String(length=64), nullable=False),
        sa.Column('perceptual_hash', sa.String(length=64), nullable=True),
        sa.Column('video_fingerprints', sa.JSON(), nullable=True),
        sa.Column('audio_fingerprint', sa.String(length=255), nullable=True),
        sa.Column('first_registered_at', sa.DateTime(), nullable=True),
        sa.Column('proof_slug', sa.String(length=64), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('proof_slug')
    )
    op.create_table('similarity_matches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('media_item_id', sa.Integer(), nullable=False),
        sa.Column('matched_media_item_id', sa.Integer(), nullable=False),
        sa.Column('similarity_score', sa.Integer(), nullable=False),
        sa.Column('match_type', sa.String(length=32), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['matched_media_item_id'], ['media_items.id']),
        sa.ForeignKeyConstraint(['media_item_id'], ['media_items.id']),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('similarity_matches')
    op.drop_table('media_items')
    op.drop_table('users')
