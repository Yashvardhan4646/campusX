# Migration: Add Banner Field to User Schema

## Description
Adds a `banner` field to the User model to support profile banner images.

## Changes
- Added `banner` field (String, default: '') to User schema
- Field stores Cloudinary URL for user's profile banner image
- Follows same pattern as existing `avatar` field

## Files Modified
- `models/User.js` - Added banner field to schema

## API Endpoints Added
- `POST /api/users/banner` - Banner upload endpoint
- Updated `PATCH /api/users/[username]` to support banner field updates

## Frontend Updates
- Updated `EditProfileDrawer` with banner upload functionality
- Updated `ProfileClient` to display user banners
- Added default banner generation using picsum.photos API

## Database Impact
- No breaking changes - new field has default empty string
- Existing users will have empty banner field until they upload one
- New users can immediately use banner functionality
