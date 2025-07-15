"""update_formatted_script_to_json

Revision ID: b510d7cc7d31
Revises: a4f5b2c3d4e5
Create Date: 2025-07-13 18:53:13.317183

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b510d7cc7d31'
down_revision: Union[str, None] = 'a4f5b2c3d4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
