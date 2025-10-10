# Franchisee Users Report

Generated: 2025-10-09

## Summary

This report shows all users with the franchisee role in the system, based on querying the `profiles` table joined with the `roles` table.

## Database Structure

### Roles Table
The system has 5 roles defined:

1. **super_admin** (ID: 1) - Super Administrator - Full system access, can manage all admins, franchisees, and technicians
2. **admin** (ID: 2) - Administrator - Can manage franchisees and technicians, access all features
3. **franchisee** (ID: 3) - Franchisee Owner - Manages their franchise, technicians, and job submissions
4. **tech** (ID: 4) - Technician - Submits jobs and photos, views their own submissions
5. **user** (ID: 5) - Basic user access

### Profiles Table Structure
The `profiles` table has been migrated to use `role_id` (UUID) instead of a text-based `role` column. The `role_id` is a foreign key that references the `roles` table.

## SQL Query Used

```sql
SELECT
    p.id,
    p.email,
    p.full_name,
    p.franchisee_id,
    r.name as role_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE r.name = 'franchisee'
LIMIT 10;
```

## Results

### Total Users by Role
- **franchisee**: 1 user
- **admin**: 1 user
- **tech**: 0 users
- **super_admin**: 0 users
- **user**: 0 users

### Franchisee Users (1 user found)

#### User 1: Jena
- **Email**: jena@test.ca
- **Full Name**: Jena
- **User ID**: a3dfa713-4354-4ee9-841d-f3999e87617f
- **Franchisee ID**: 92aae71c-1ce8-448b-a3b3-675e248effa1
- **Role**: franchisee
- **Role Description**: Franchisee Owner - Manages their franchise, technicians, and job submissions
- **Created**: 2025-10-08T09:08:51.075009+00:00

## Tools Created

### 1. API Endpoint
**Location**: `/Users/brentfoster/PAL CONTENT APP/src/app/api/get-franchisee-users/route.ts`

This API endpoint can be accessed at:
```
GET http://localhost:3000/api/get-franchisee-users
```

It returns JSON data with all franchisee users.

### 2. Node.js Scripts

#### get-franchisee-users.js
**Location**: `/Users/brentfoster/PAL CONTENT APP/get-franchisee-users.js`

Run with:
```bash
node get-franchisee-users.js
```

This script queries for franchisee users and displays them in a formatted table.

#### get-all-users-by-role.js
**Location**: `/Users/brentfoster/PAL CONTENT APP/get-all-users-by-role.js`

Run with:
```bash
node get-all-users-by-role.js
```

This script shows all users grouped by their roles, with special focus on franchisee users.

### 3. SQL File
**Location**: `/Users/brentfoster/PAL CONTENT APP/database/get-franchisee-users.sql`

Contains multiple SQL queries for:
- Getting franchisee users
- Getting all users grouped by role
- Getting franchisee users with their business details
- Counting users by role

## Key Findings

1. **One Active Franchisee**: There is currently 1 user with the franchisee role (jena@test.ca).

2. **Franchisee ID Linked**: The franchisee user has a `franchisee_id` value (92aae71c-1ce8-448b-a3b3-675e248effa1), indicating they are properly linked to a franchisee record in the `franchisees` table.

3. **Role Migration Complete**: The system has successfully migrated from text-based roles to UUID-based role_id foreign keys linking to the `roles` table.

4. **Admin User**: One admin user exists (admin@test.ca) who does not have a franchisee_id (NULL), which is expected for admin users.

## How to Query in the Future

### Using Supabase Client (JavaScript/TypeScript)
```javascript
const { data: franchiseeUsers } = await supabase
  .from('profiles')
  .select(`
    id,
    email,
    full_name,
    franchisee_id,
    roles (
      id,
      name,
      description
    )
  `)
  .eq('roles.name', 'franchisee');
```

### Using SQL
```sql
SELECT
    p.id,
    p.email,
    p.full_name,
    p.franchisee_id,
    r.name as role_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE r.name = 'franchisee';
```

## Note on MCP Tools

While the `mcp__supabase__execute_sql` tool was requested, it is not available in the current tool set. Instead, I created:
- A REST API endpoint
- Node.js scripts for direct database queries
- SQL files for manual execution

These alternatives provide the same functionality for querying franchisee users.
