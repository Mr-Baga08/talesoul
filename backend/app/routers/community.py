from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import User, CommunityGroup, CommunityPost, CommunityReply
from app.schemas import (
    CommunityGroupCreate, CommunityGroupResponse,
    CommunityPostCreate, CommunityPostUpdate, CommunityPostResponse,
    CommunityReplyCreate, CommunityReplyResponse,
    MessageResponse
)
from app.routers.auth import get_current_active_user

router = APIRouter()


# ===== Group Routes =====
@router.post("/groups", response_model=CommunityGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_group(
    group_data: CommunityGroupCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new community group"""
    group = CommunityGroup(
        name=group_data.name,
        description=group_data.description,
        is_private=group_data.is_private
    )

    db.add(group)
    db.commit()
    db.refresh(group)

    return group


@router.get("/groups", response_model=List[CommunityGroupResponse])
async def list_groups(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all public groups"""
    groups = db.query(CommunityGroup).filter(
        CommunityGroup.is_private == False
    ).offset(skip).limit(limit).all()

    return groups


@router.get("/groups/{group_id}", response_model=CommunityGroupResponse)
async def get_group(group_id: int, db: Session = Depends(get_db)):
    """Get specific group by ID"""
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()

    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )

    return group


# ===== Post Routes =====
@router.post("/posts", response_model=CommunityPostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: CommunityPostCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new post in a group"""
    # Verify group exists
    group = db.query(CommunityGroup).filter(CommunityGroup.id == post_data.group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )

    # Create post
    post = CommunityPost(
        group_id=post_data.group_id,
        author_id=current_user.id,
        title=post_data.title,
        content=post_data.content
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return post


@router.get("/posts", response_model=List[CommunityPostResponse])
async def list_posts(
    group_id: int = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List posts (optionally filtered by group)"""
    query = db.query(CommunityPost)

    if group_id:
        query = query.filter(CommunityPost.group_id == group_id)

    posts = query.order_by(CommunityPost.created_at.desc()).offset(skip).limit(limit).all()
    return posts


@router.get("/posts/{post_id}", response_model=CommunityPostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get specific post by ID"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    return post


@router.patch("/posts/{post_id}", response_model=CommunityPostResponse)
async def update_post(
    post_id: int,
    post_update: CommunityPostUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a post (author only)"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # Verify ownership
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this post"
        )

    # Update fields
    if post_update.title is not None:
        post.title = post_update.title
    if post_update.content is not None:
        post.content = post_update.content

    db.commit()
    db.refresh(post)

    return post


@router.delete("/posts/{post_id}", response_model=MessageResponse)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a post (author only)"""
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # Verify ownership
    if post.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this post"
        )

    db.delete(post)
    db.commit()

    return MessageResponse(message="Post deleted successfully")


# ===== Reply Routes =====
@router.post("/replies", response_model=CommunityReplyResponse, status_code=status.HTTP_201_CREATED)
async def create_reply(
    reply_data: CommunityReplyCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a reply to a post"""
    # Verify post exists
    post = db.query(CommunityPost).filter(CommunityPost.id == reply_data.post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # Create reply
    reply = CommunityReply(
        post_id=reply_data.post_id,
        author_id=current_user.id,
        content=reply_data.content
    )

    db.add(reply)
    db.commit()
    db.refresh(reply)

    return reply


@router.get("/posts/{post_id}/replies", response_model=List[CommunityReplyResponse])
async def list_post_replies(
    post_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all replies for a post"""
    # Verify post exists
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    replies = db.query(CommunityReply).filter(
        CommunityReply.post_id == post_id
    ).order_by(CommunityReply.created_at.asc()).offset(skip).limit(limit).all()

    return replies


@router.get("/replies/{reply_id}", response_model=CommunityReplyResponse)
async def get_reply(reply_id: int, db: Session = Depends(get_db)):
    """Get specific reply by ID"""
    reply = db.query(CommunityReply).filter(CommunityReply.id == reply_id).first()

    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )

    return reply


@router.delete("/replies/{reply_id}", response_model=MessageResponse)
async def delete_reply(
    reply_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a reply (author only)"""
    reply = db.query(CommunityReply).filter(CommunityReply.id == reply_id).first()

    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found"
        )

    # Verify ownership
    if reply.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this reply"
        )

    db.delete(reply)
    db.commit()

    return MessageResponse(message="Reply deleted successfully")
