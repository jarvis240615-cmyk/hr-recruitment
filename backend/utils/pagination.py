from pydantic import BaseModel
from typing import Generic, TypeVar, List
import math

T = TypeVar('T')


class PaginatedResponse(BaseModel):
    items: List = []
    total: int = 0
    page: int = 1
    limit: int = 50
    pages: int = 0

    @classmethod
    def create(cls, items: list, total: int, page: int, limit: int):
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=math.ceil(total / limit) if limit > 0 else 0,
        )
